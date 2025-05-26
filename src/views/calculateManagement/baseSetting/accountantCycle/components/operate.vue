<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="handleButton"></button-top>
    <div class="container_flex_form">
      <el-switch v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :class="{ 'formRender_view': queryType === 'view' }"
        @treeSelectSelect="treeSelectSelect" @selectChange="selectChange">
      </VFormRender>
    </div>
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'
import { deptTree, getUnitTree } from '@/api/system/dept'
import { create, modify, saveSubmit, detail, getStartDateByLastEndDate } from '@/api/calculateManagement/accounting'

import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { getUserInfo } from '@/utils/user-info'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import VFormRender from '@/components/form-render/index'
export default {
  name: 'accountantCycleOperate',
  components: {
    toBeReviewed,
    VFormRender
  },
  mixins: [indexMixin],
  data() {
    return {
      loading: false,
      queryId: '',
      queryName: '',
      queryType: '',
      formJson: {},
      formData: {},
      queryAuditArr: null,
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        // { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update' }
      ],
      userInfo: getUserInfo(),
      selection: [],
      status: '',
      checked: false,
      isQuery: ''
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  async created() {
    this.init()
  },
  methods: {

    checkoutStatus(flag) {
      const widgets = ['code', 'madeOrgId', 'remark', 'no', 'type']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    // 表单按钮权限设置
    buttonShow({ buttonCode, type }) {
      if (['saveSubmit'].includes(buttonCode) && this.queryType == 'create') {
        return true
      }
      if (['edit', 'saveSubmit'].includes(buttonCode) && (!['0', '1'].includes(this.status) || this.isQuery == 'query')) {
        return false
      }
      if (type.includes(this.queryType)) {
        return true
      }
      if (type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(buttonCode))) {
        return true
      }

      return false
    },
    // 加载初始化数据
    async init() {
      let { type, name, id, auditArr, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.queryName = name
      this.isQuery = isQuery

      await this.formFillInPage()
      this.$nextTick(async () => {
        await this.getDeptTreeData()
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        this.$refs['vFormRef'].resetForm()
        if (['update', 'view'].includes(this.queryType)) {
          this.getOperateDetail(id)
        } else {
          const { deptId, deptName, unitId, unitName } = this.userInfo
          this.$refs['vFormRef'].setFieldValue('madeOrgId', deptId)
          this.$refs['vFormRef'].setFieldValue('madeOrgName', deptName)
          this.$refs['vFormRef'].setFieldValue('accountingOrgId', unitId)
          this.$refs['vFormRef'].setFieldValue('accountingOrgName', unitName)
          const { data } = await getStartDateByLastEndDate({ accountingOrgId: unitId })
          if(data) {
            this.$refs['vFormRef'].setFieldValue('startDate', data)
            this.initEndDatePickerOptions();
          }
        }
      })
    },
    selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId){
      if(fieldName == 'startDate'){
        this.$refs['vFormRef'].setFieldValue('endDate', '')
        this.initEndDatePickerOptions();
      }
    },
    initEndDatePickerOptions(){
      let startDate = this.$refs['vFormRef'].getFieldValue('startDate')
      let el = this.$refs.vFormRef.getWidgetRef('endDate');

      let pickerOptions = {
        disabledDate(time) {
          return time.getTime() < startDate || new Date(time.getTime()).getMonth() > (new Date(startDate).getMonth() + 1); 
        },
        defaultTime:'23:59:59'
      }
      el.pickerOptions = pickerOptions;
    },
    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('madeOrgId').loadOptions(res.data || [])
      const unitRes = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('accountingOrgId').loadOptions(unitRes.data || [])
    },
    // 加载表单配置项
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('accountantCycleOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },


    // 加载详情数据
    async getOperateDetail(id) {
      try {
        this.loading = true
        const { data } = await detail(id)
        this.status = data.status;

        this.$refs['vFormRef'].setFormData(data);
        if (data.updateAmountAdjustment == '0') {
          this.buttonTop = [
            { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
          ]
          this.$refs['vFormRef'].setReadMode(true);
        }
        this.$nextTick(() => {
          this.initEndDatePickerOptions();
        })
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    // 顶部按钮事件处理器
    handleButton(buttonCode) {
      switch (buttonCode) {
        case 'edit':
          this.queryType = 'update';
          this.$refs['vFormRef'].setReadMode(false);
          break;
        case 'cancel':
          this.handleCancel()
          break;
        case 'pass':
        case 'reject':
          this.$refs.toBereview.init(buttonCode, this.queryAuditArr, this.queryName)
          break;
        case 'save':
        case 'saveSubmit':
          this.handleSave(buttonCode)
          break;
        default:
      }
    },
    // 取消事件处理器
    handleCancel() {
      this.$tab.closeOpenPage({ name: this.queryName })
    },
    validateForm(formRef) {
      return new Promise((resolve) => {
        this.$refs[formRef].validateForm((valid) => {
          resolve(valid)
        })
      })
    },
    // 保存事件处理器
    async handleSave(buttonCode) {
      try {
        const formValid = await this.validateForm('vFormRef')
        if (!formValid) {
          this.$modal.msgError(`表单数据验证失败`)
          return
        }
        const formData = await this.$refs.vFormRef.getFormData()
        this.loading = true

        const saveObj = {
          'save': async () => {
            this.saveOrder(formData.id ? modify : create, formData)
          },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.FA_KJQJ,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(saveSubmit, formData, assignee)
              }
            })
          }
        }
        saveObj[buttonCode] && saveObj[buttonCode]()

      } catch (err) {
        this.$modal.msgError(`${err.message}`)
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async saveOrder(url, param, assignee) {
      if (!this.resOk) {
        const res = await url({ ...param, assignee })
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.resOk = true
        this.handleCancel()
      }
    },
    // tree组件改变事件
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'accountingOrgId') {
        this.$refs.vFormRef.setFieldValue('accountingOrgName', node.deptName)
        this.setAccount(node.id)
      }
      if (name === 'madeOrgId') {
        this.$refs.vFormRef.setFieldValue('madeOrgName', node.deptName)
      }
    },
    async setAccount(id) {
      const { data } = await getStartDateByLastEndDate({ accountingOrgId: id })
      if (data) {
        this.$refs.vFormRef.setFieldValue('startDate', data.startDate)
        this.$refs.vFormRef.setFieldValue('endDate', data.endDate)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.container_flex_form {
  position: relative;

  .checkbox {
    position: absolute;
    z-index: 1000;
    left: 160px;
    color: #fff;
    top: 16px
  }

  ::v-deep .el-checkbox__input.is-checked+.el-checkbox__label {
    color: #fff
  }
}

.slotIcon-color-content {
  color: red
}

.slotIcon-color {
  color: #1890ff;
}
</style>