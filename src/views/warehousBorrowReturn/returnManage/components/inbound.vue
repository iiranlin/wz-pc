<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
    <div class="container_flex_form">
      
      <el-switch v-if="checkedShow" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
        @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @buttonClick="handleButtonClick"
        @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect">
        <template slot="detail">
          <div>
            <table-index ref="tableIndex" :tableData="detailList" :property="datailProperty"
              @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
              @selectChange="selectTableChange">
              <!-- 合格品入库仓库 -->
              <template slot="quWarehouseId" slot-scope="scope">
                <selectTree style="width: 100%" :value="scope.data.quWarehouseId" :options="warehouseOptions"
                  @getValue="(obj, treeIndex, valueId) => getWarehouseName(scope.data, { quWarehouseId: obj.id, quWarehouseName: obj.name, quWarehouseCode: obj.code })"
                  :props="warehouseOptionsProps" :disabledFun="(node) => node.level !== 1" />
              </template>
              <!-- 不良品入库仓库 -->
              <template slot="unquWarehouseId" slot-scope="scope">
                <selectTree style="width: 100%" :value="scope.data.unquWarehouseId" :options="warehouseOptions"
                  @getValue="(obj, treeIndex, valueId) => getWarehouseName(scope.data, { unquWarehouseId: obj.id, unquWarehouseName: obj.name, unquWarehouseCode: obj.code })"
                  :props="warehouseOptionsProps" :disabledFun="(node) => node.level !== 1" />
              </template>
              <!-- 入库日期 -->
              <template slot="inDate" slot-scope="scope">
                <el-date-picker style="width: 100%" format="yyyy-MM-dd" v-model="scope.data.inDate" type="date"
                  placeholder="入库日期">
                </el-date-picker>
              </template>
              <!-- 失效日期 -->
              <template slot="expireDate" slot-scope="scope">
                <el-date-picker style="width: 100%" format="yyyy-MM-dd" v-model="scope.data.expireDate" type="date"
                  placeholder="失效日期">
                </el-date-picker>
              </template>
            </table-index>
          </div>
        </template>
      </VFormRender>
    </div>
    <!-- <transfer-order ref="transferOrderRef" @orderRow="orderRow"></transfer-order> -->
  </div>
</template>

<script>
import selectTree from '@/components/selectTree/index.vue'
import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { deptTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getUserInfo } from '@/utils/user-info'
import { getWarehouseTree } from '@/api/warehouseManage/inventoryMaintenance'
import { getInQuoteList } from '@/api/warehouseManage/returnManage'
import { menuConfig, uniqueArrByField } from '@/utils'
import { inMaintenanceSave } from '@/api/warehouseManage/inventoryMaintenance'
import moment from 'moment';
import VFormRender from '@/components/form-render/index'
export default {
  name: 'inbound',
  components: {
    selectTree,
    VFormRender
  },
  mixins: [indexMixin],
  data() {
    return {
      warehouseOptions: [],
      warehouseOptionsProps: {
        children: "children",
        label: "name",
        value: "id",
        disabled: (node, data) => {
          return data.level == 1;
        },
      },
      loading: false,
      type: '',
      queryId: '',
      queryName: '',
      queryType: '',
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
        { buttonName: '提交', buttonCode: 'submit', buttonIcon: 'Blue-Submit', type: 'view, update' }
      ],
      queryAuditArr: null,
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      /*合同信息*/
      checked: false,
      detailedForm: [],
      userInfo: getUserInfo(),
      checkedShow: true,
      formValidate: {
        detailedForm: []
      },
      oldOutSourceValue: '',  /*记录下上一次出库来源选择的值*/
      isOrLendStatus: false,
      datailProperty: {},
      detailList: []
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  created() {

    this.init()
  },
  methods: {
    getWarehouseName(row, obj) {
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        row[key] = obj[key]
      }
    },
    async loadWarehouseTree() {
      const { data } = await getWarehouseTree()
      this.warehouseOptions = data
    },
    selectTableChange(row) {

    },
    emitAblFilter(listQuery) {

    },
    clickLink() {

    },
    handleSelectionChange(ids, single, multiple, row) {

    },
    handleButtonDisable(button, row) {
      return false
    },
    handleButton() {

    },
    async menuProperty() {
      this.datailProperty = await this.$store.dispatch('menuProperty', menuConfig.MENU_LEND_INBOUND)
     
      this.datailProperty.fields.forEach((field) => {
        if (['unquWarehouseId', 'quWarehouseId', 'inDate', 'expireDate'].includes(field.fieldCode)) {
          field.listSlot = true
          field.required = true
        }
      })
      this.$nextTick(() => {
        this.$refs['tableIndex'].init(this.datailProperty.fields)
      })

    },
    buttonShow(item) {
      if (['submit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)) {
        return false
      }
      if (['submit', 'edit'].includes(item.buttonCode) && this.queryName == 'toBeDeal') {
        return false
      }
      if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
        return true
      } else {
        return false
      }
    },
    async init() {
      let { type, name, id, ids='' } = this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryIds = ids.split(',') || []
      this.queryName = name
      this.loadWarehouseTree()
      this.$nextTick(async () => {
        this.$refs['vFormRef'].resetForm()
        /*默认禁用销售负责人*/
        await this.formFillInPage()
        this.menuProperty();
        await this.getDeptTreeData()
        const { deptId, deptName, nickName, id: nickId } = this.userInfo
        this.getUserListAll(deptId)
          this.$refs['vFormRef'].setFieldValue('inDeptId', deptId)
          this.$refs['vFormRef'].setFieldValue('inDeptName', deptName)
          this.$refs['vFormRef'].setFieldValue('inUserId', nickId)
          this.$refs['vFormRef'].setFieldValue('inUserName', nickName)

        if (['update', 'view'].includes(this.queryType)) {
          this.loadInQuoteList(this.queryIds)
        } else {
          this.$refs['vFormRef'].disableWidgets('sourceCode')
        }
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('lendInboundOrder').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    async loadInQuoteList(ids) {
      try {
        const { data } = await getInQuoteList({ ids: ids })
        const codeArr = uniqueArrByField(data, 'sourceCode')
        const codes = codeArr.join(',')
        this.$refs['vFormRef'].setFieldValue('sourceCode', codes)

        this.detailList = data
      } catch (err) {
        console.error(err)
      }
    },
    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('inDeptId').loadOptions(res.data || [])
    },
    async getUserListAll(deptId) {
      const res = await userListAll({ deptId })
      this.$refs['vFormRef'].getWidgetRef('inUserId').loadOptions(res.data.list || [])
    },

    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'sourceCode') {
        this.$refs.transferOrderRef.init(this.detailedForm, this.isOrLendStatus)
      }
    },
    handleButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
    },
    selectChange(fieldName, newValue) {
      if (fieldName === 'inUserId') {
        if (newValue) {
          const optionLabel = this.$refs['vFormRef'].getWidgetRef('inUserId').optionLabel
          this.$refs['vFormRef'].setFieldValue('inUserName', optionLabel)
        } else {
          this.$refs['vFormRef'].setFieldValue('inUserName', '')
        }
      } else if (fieldName === 'outSource') {
        if (this.oldOutSourceValue === newValue) {
          this.oldOutSourceValue = newValue
          return
        }
        this.oldOutSourceValue = newValue  /*清空选中的数据*/
        this.detailedForm = []
        this.formValidate.detailedForm = []
        this.$refs['vFormRef'].setFieldValue('sourceCode', '')
        if (newValue === '') {
          this.$refs['vFormRef'].disableWidgets('sourceCode')
          return
        }
        this.$refs['vFormRef'].enableWidgets('sourceCode')
        if (newValue === '5') {
          this.isOrLendStatus = true
        } else {
          this.isOrLendStatus = false
        }
      }
    },
    validateForm(formRef) {
      return new Promise((resolve) => {
        this.$refs[formRef].validateForm((valid) => {
          resolve(valid)
        })
      })
    },
    async handleSave() {
      try {
        const formValid = await this.validateForm('vFormRef')
        if (!formValid) {
          this.$modal.msgError('基本信息字段不能为空')
          return
        }
        if (!this.detailList.length) {
          this.$modal.msgError('明细信息不能为空')
          return
        }
        let flag = false
        for (let i = 0; i < this.detailList.length; i++) {
          const { expireDate, inDate, quWarehouseId, unquWarehouseId } = this.detailList[i]
          if (!expireDate || !inDate || !quWarehouseId || !unquWarehouseId) {
            flag = true
            break
          }
        }
        if (flag) {
          this.$modal.msgError('明细信息字段不能为空')
          return
        }
        this.loading = true
        const formData = await this.$refs.vFormRef.getFormData()
        const param = {
          ...formData,
          detailList: this.detailList.map(item => ({
            ...item,
            inDate: moment(item.inDate).format('YYYY-MM-DD'),
            expireDate: moment(item.expireDate).format('YYYY-MM-DD'),

          }))
        }
        if (!!this._id) {
          param.id = this._id
        }
        const res = await inMaintenanceSave(param)
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.cancel()
      } catch (err) {
        this.$modal.msgError(`${err.message}`)
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    newButton(buttonCode) {
      switch (buttonCode) {
        case 'cancel':
          this.cancel()
          break;
        case 'save':
          this.handleSave()
          break;
        default:
      }
      // if (buttonCode === 'cancel') {
      //   this.cancel(this.queryName)
      // } else if (buttonCode === 'save') {
      //   if (this.queryType === 'update') {
      //     if (!this.detailedForm.length) {
      //       this.$modal.msgError('产品明细列表不能为空')
      //       return
      //     }
      //     this.$refs.ruleForm.validate((valid) => {
      //       if (valid) {
      //         warehouseOrderUpdate(this.detailedForm).then(({ success, message }) => {
      //           if (success) {
      //             this.$modal.msgSuccess(message)
      //             this.cancel(this.queryName)
      //           } else {
      //             this.$modal.msgError(message)
      //           }
      //         })
      //       } else {
      //         this.$modal.msgError('表单验证失败')
      //       }
      //     })
      //   } else if (this.queryType === 'create') {
      //     let formValid1, formValid2
      //     if (!this.detailedForm.length) {
      //       this.$modal.msgError('产品明细列表不能为空')
      //       return
      //     }
      //     this.$refs.ruleForm.validate((valid) => {
      //       formValid1 = valid
      //     })
      //     this.$refs.vFormRef.validateForm((valid) => {
      //       formValid2 = valid
      //     })
      //     if (formValid1 && formValid2) {
      //       this.$refs.vFormRef.getFormData().then(formData => {
      //         this.loading = true
      //         warehouseSaveOrder({
      //           ...this.formData, ...formData,
      //           id: this.queryId,
      //           detailList: this.detailedForm
      //         }).then(({ success, message }) => {
      //           if (success) {
      //             this.$modal.msgSuccess(message)
      //             this.cancel(this.queryName)
      //           } else {
      //             this.$modal.msgError(message)
      //           }
      //         }).finally(() => {
      //           this.loading = false
      //         })
      //       })
      //     } else {
      //       this.$modal.msgError('表单验证失败')
      //     }
      //   }
      // }
      // if (buttonCode === 'pass') {
      //   this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName)
      //   return
      // }
      // if (buttonCode === 'reject') {
      //   this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName)
      //   return
      // }
    },
    cancel() {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name: this.queryName })
    },
    // 部门树选择
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'inDeptId') {
        this.$refs['vFormRef'].setFieldValue('inUserId', '')
        this.$refs['vFormRef'].setFieldValue('inUserName', '')
        this.$refs.vFormRef.setFieldValue('inDeptName', node.deptName)
        this.getUserListAll(node.id)
      }
    },
    treeSelectInput(vm, newVal) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'inUserId') {
        if (!newVal) {
          this.$refs['vFormRef'].setFieldValue('inUserId', '')
          this.$refs['vFormRef'].setFieldValue('inUserName', '')
          // this.$refs['vFormRef'].getWidgetRef('outUserId').loadOptions([])
        }
      }
    },
    checkoutStatus(flag) {
      const widgets = ['outDeptId', 'inUserId', 'comments', 'fileList', 'outCode']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    orderRow(row) {
      this.detailedForm = [...this.detailedForm, ...row]
      this.formValidate.detailedForm = this.detailedForm
      let sourceAllCode = this.detailedForm.map(item => item.sourceCode)
      let _sourceAllCode = Array.from(new Set(sourceAllCode))
      let _sourceAllCodeStr = _sourceAllCode.length > 1 ? _sourceAllCode.join(',') : _sourceAllCode[0]
      this.$refs['vFormRef'].setFieldValue('sourceCode', _sourceAllCodeStr)
    },
    selectable(row, index) {
      const selectRowIdGroup = this.selectRow.map(item => item.matlCode)
      return !selectRowIdGroup.includes(row.matlCode)
    },
    deleteRow(index) {
      this.detailedForm.splice(index, 1)
      this.formValidate.detailedForm = this.detailedForm
      let sourceAllCode = this.detailedForm.map(item => item.sourceCode)
      let _sourceAllCode = Array.from(new Set(sourceAllCode))
      let _sourceAllCodeStr = _sourceAllCode.length > 1 ? _sourceAllCode.join(',') : _sourceAllCode[0]
      this.$refs['vFormRef'].setFieldValue('sourceCode', _sourceAllCodeStr)
    },
    copyRow(row, index) {
      this.detailedForm.splice(index, 0, row)
      this.$set(this.detailedForm, index + 1, { ...row, outNum: '' })
      this.formValidate.detailedForm = this.detailedForm
    }
  }
}
</script>
<style lang="scss" scoped>
.slotIcon-color-content {
  color: red
}

.slotIcon-color {
  color: #1890ff;
}
</style>