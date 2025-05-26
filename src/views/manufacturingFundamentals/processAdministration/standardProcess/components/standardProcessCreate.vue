<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
    <div class="container_flex_form">
       
        <el-switch  v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
        </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" @appendButtonClick="handleAppendButtonClick" :class="{'formRender_view': queryType === 'view'}"
        @buttonClick="handleButtonClick" @operationButtonClick="operationButtonClick"
        @treeSelectSelect="treeSelectSelect">
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="29" :queryType="queryType" v-model="fileList"></attachmentTable>
          </div>
        </template>
      </VFormRender>
    </div>
  </div>
</template>

<script>
import attachmentTable from '@/views/components/attachmentTable'
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { save, detail, classTree } from '@/api/prodmgr-mm/standardProcess'

import { deptTree } from '@/api/system/dept'
import { getUserInfo } from '@/utils/user-info'
import { generateUUID } from '@/utils'
import indexMixin from '@/views/mixins'
import VFormRender from '@/components/form-render/index'
export default {
  name: "standardProcessCreate",
  components: { attachmentTable, VFormRender },
  mixins: [indexMixin],
  data() {
    return {
      loading: false,
      queryType: '',
      queryId: '',
      formJson: {},
      formData: {},
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update, view' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
      ],
      openDataScope: false,
      queryAuditArr: null,
      userInfo: getUserInfo(),
      fileList: [],
        checked: false
    }
  },
  computed: {
    ...mapGetters(['infoData']),
  },
  created() {
    this.init();
  },
  methods: {
    checkoutStatus(flag) {
        const widgets = ['processStdTime', 'grid35220', 'grid104529', 'grid88284', 'grid91052', 'processStdCost']
        if (flag) {
            this.$refs.vFormRef.hideWidgets(widgets)
        } else {
            this.$refs.vFormRef.showWidgets(widgets)
        }
    },
    buttonShow(item) {
      if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
        return true
      } else {
        return false
      }
    },
    init() {
      let { type, name, id, auditArr, pc = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
      this.queryType = type || 'create';
      this.queryId = id || '';
      this.queryName = name || 'standardProcess';
      this._pc = pc
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
      this.$nextTick(async () => {
        this.$refs['vFormRef'].resetForm();
        await this.formFillInPage();
        await this.loadClassTree()
        if(!!this._pc) {
        this.$refs['vFormRef'].setFieldValue('processClassify', this._pc)
      }
        await this.getDeptTreeData()
        if (this.queryType === 'update' || this.queryType == 'view') {
          this.loadDetail(id)
          this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        } else {
          const { deptId, deptName } = this.userInfo
          this.$refs['vFormRef'].setFieldValue('processDeptCode', deptId)
          this.$refs['vFormRef'].setFieldValue('processDeptName', deptName)
        }
      })
    },
    async loadDetail(id) {
      try {
        const { data: { fileList, ...form } } = await detail(id)
        this.fileList = fileList.map(file => ({ ...file, uid: generateUUID }))
        this.$refs['vFormRef'].setFormData(form)
      } catch (err) {
        console.error(err)
      }
    },
    async loadClassTree() {
      const { data } = await classTree()
      this.$refs['vFormRef'].getWidgetRef('processClassify').loadOptions(data || [])
      
    },
    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('processDeptCode').loadOptions(res.data || [])
    },
    // tree组件改变事件
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'processDeptCode') {
        this.$refs.vFormRef.setFieldValue('processDeptName', node.deptName)
      }
      if (name === 'processClassify') {
        this.$refs.vFormRef.setFieldValue('processClassifyName', node.matlClassifyName)
      }
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('standardProcessCreate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data);

          resolve(true);
        })
      })
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {};
    },
    handleButtonClick(vm) {
      let { field: { options: { name } } } = vm || {};
    },
    cancel(name) {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name });
    },
    newButton(buttonCode) {
      if (buttonCode === 'cancel') {
        this.cancel(this.queryName);
      } else if (buttonCode === 'save') {
        this.$refs['vFormRef'].validateForm((valid) => {
          if (valid) {
            this.$refs.vFormRef.getFormData().then(formData => {
              let type = 'create';
              if (this.queryType == 'update') {
                type = 'modify'
              }
              this.loading = true;
              save({ ...formData, saleOrderId: this.queryId, fileList: this.fileList }, type).then(({ message }) => {
                this.$modal.msgSuccess(message);
                this.cancel(this.queryName);
              }).finally(() => {
                this.loading = false;
              });
            })
          } else {
            this.$message.error(`表单数据验证失败`)
          }

        })
      } else if (buttonCode === 'submit') {
      } else if (buttonCode === 'edit') {
        this.queryType = 'update';
        this.$refs['vFormRef'].setReadMode(false);
      }
    },
    operationButtonClick(dataTable, buttonName, rowIndex, row) {
      if (buttonName == 'delete') {
        this.$modal.confirm('是否确认删除?').then(() => {
          let detailedList = JSON.parse(JSON.stringify(this.$refs['vFormRef'].getWidgetRef('detailedList').getTableData()));
          detailedList.splice(rowIndex, 1);
          let tableRef = this.$refs['vFormRef'].getWidgetRef('detailedList');
          tableRef?.setTableData(detailedList);
        })
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
  position: absolute;
  right: 20px;
  top: 34px;
  color: #1890ff;
  z-index: 10;
}

.slotIcon-color-content {
  color: red;
}
</style>
