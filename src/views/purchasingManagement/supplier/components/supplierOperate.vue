<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="newButton"></button-top>
    <div class="container_flex_form">
     
      <el-switch  v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" :class="{'formRender_view': queryType === 'view'}"
        @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @buttonClick="handleButtonClick"
        @operationButtonClick="operationButtonClick">
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="11" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
      </VFormRender>
    </div>
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import attachmentTable from '@/views/components/attachmentTable'
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { PuSuCreate, PuSuModify, PuSuDetail, PuSuSaveSubmit } from '@/api/purchasingManagement/supplier'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { generateUUID } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import VFormRender from '@/components/form-render/index'
export default {
  name: "supplierOperate",
  mixins: [indexMixin],
  components: {
    toBeReviewed,
    attachmentTable,
    VFormRender
  },
  data() {
    return {
      loading: false,
      queryType: '',
      queryId: '',
      queryName: '',
      formJson: {},
      formData: {},
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update' }
      ],
      queryAuditArr: null,
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01',
      },
      /*合同信息*/
      filterCondition: {
        paymentType: '0',
        projectId: '',
        status: '3',
        isComplete: '0'
      },
      managerData: [],
      fileList: [],
      checked: false,
      isQuery: ''
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
      const widgets = ['suBizType', 'creditLevel', 'suFoundingDate', 'suRegisterAccount', 'suRegisterAddress', 'suBizContent', 'fileList', 'card44213', 'card87360', 'card74348', 'suCode', 'suBizCodeExpire', 'suSimpleName']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    buttonShow(item) {
      if (['saveSubmit'].includes(item.buttonCode) && this.queryType == 'create') {
        return true
      }
      if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)) {
        return false
      }
      if (['saveSubmit', 'edit'].includes(item.buttonCode) && (this.queryName == 'toBeDeal' || this.isQuery == 'query')) {
        return false
      }
      if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
        return true
      } else {
        return false
      }
    },
    init() {
      let { type, name, id, auditArr, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
      this.queryType = type || 'create';
      this.queryId = id || '';
      this.queryName = name || 'supplier';
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
      this.isQuery = isQuery

      this.$nextTick(async () => {
        this.$refs['vFormRef'].resetForm();
        /*默认禁用销售负责人*/
        await this.formFillInPage();
        if (this.queryType === 'update') {
          this.$refs['vFormRef'].setReadMode(false);
          this.PuSuOperateDetail()
        } else if (this.queryType === 'view') {
          this.$refs['vFormRef'].setReadMode(true);
          this.PuSuOperateDetail()
        } else {
          this.$refs['vFormRef'].setReadMode(false);
        }
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('supplierOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data);
          resolve(true);
        })
      })
    },
    PuSuOperateDetail() {
      this.loading = true;
      PuSuDetail(this.queryId).then(({ data }) => {
        let showData = { ...data }
        this.formData = showData
        this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        this.$refs["vFormRef"].setFormData(Object.assign({}, this.formData, {
          suBizCodeExpire: this.parseTime(showData.suBizCodeExpire, '{y}-{m}-{d}'),
          suFoundingDate: this.parseTime(showData.suFoundingDate, '{y}-{m}-{d}')
        }))
      }).finally(() => {
        this.loading = false;
      });
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {};
    },
    handleButtonClick(vm) {
      let { field: { options: { name } } } = vm || {};
    },
    cleanUp(name) {  /*清空表单里的数据*/
      let getContainerWidgets = this.$refs['vFormRef'].getContainerWidgets();
      getContainerWidgets.forEach((item) => {
        if (name.includes(item.name)) {
          item.container.widgetList[0].cols.forEach((val) => {
            this.$refs['vFormRef'].setFieldValue(val.widgetList[0].options.name, '');
          })
        }
      })
    },
    newButton(buttonCode) {
      if (buttonCode === 'cancel') {
        this.cancel(this.queryName)
      } else if (buttonCode === 'save') {
        this.handleSave(buttonCode)
      } else if (buttonCode === 'edit') {
        this.queryType = 'update';
        this.$refs['vFormRef'].setReadMode(false);
      } else if (buttonCode === 'saveSubmit') {
        this.handleSave(buttonCode)
      } else if (buttonCode === 'pass') {
        this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
      } else if (buttonCode === 'reject') {
        this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
      }
    },
    async handleSave(buttonCode) {
      try {
        const formData = await this.$refs.vFormRef.getFormData()
        let api = PuSuCreate;
        if (this.queryType === 'update') {
          api = PuSuModify
        }
        const param = { ...this.formData, ...formData, fileList: this.fileList }
        if (this.queryId) {
          param.id = this.queryId
        }
        const saveObj = {
          'save': () => { this.saveOrder(api, param) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.PU_SU,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(PuSuSaveSubmit, param, assignee)
              }
            })
          }
        }
        saveObj[buttonCode] && saveObj[buttonCode]()

      } catch (err) {
        this.$modal.msgError('表单数据校验失败');
        console.error(err)
      }
    },
    async saveOrder(url, param, assignee) {
      if(!this.resOk) {
      const res = await url({ ...param, assignee })
      res.success && this.$modal.msgSuccess(`${res.message}`)
      this.resOk = true
      this.cancel(this.queryName)
      }
    },
    cancel(name) {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name });
    },
    operationButtonClick(dataTable, buttonName, rowIndex, row) {
      if (buttonName == 'delete') {
        this.$modal.confirm('是否确认删除?').then(() => {
          let detailedList = JSON.parse(JSON.stringify(this.$refs['vFormRef'].getWidgetRef('saleOrderDetails').getTableData()));
          detailedList.splice(rowIndex, 1);
          let tableRef = this.$refs['vFormRef'].getWidgetRef('saleOrderDetails');
          tableRef?.setTableData(detailedList);
          /*这里需要重新计算金额*/
        })
      }
    },
    selectChange(name, node) {
      if (name === "saleId") {
        if (node !== "") {
        }
      }
    },
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
