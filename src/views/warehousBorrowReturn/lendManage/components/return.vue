<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
    <div class="container_flex_form">
       
        <el-switch  v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
        </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" :class="{'formRender_view': queryType === 'view'}"
        @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @buttonClick="handleButtonClick"
        @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect">
        <template slot="dividerOut">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
        </template>
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="22" :queryType="queryType"  v-model="fileList"></attachmentTable>
          </div>
        </template>
        <template slot="detail">
          <div style="height: 400px;display: flex;flex-direction: column;">
            <table-index numberShow ref="tableIndex" :visibleAction="queryType != 'view'"
              :styles="{ width: '100%', height: '360px', margin: '0', 'overflow-y': 'auto' }" :tableData="detailList"
              :property="datailProperty" @handleSelectionChange="handleSelectionChange" @clickLink="clickLink"
              @handleButton="handleButton" @selectChange="selectTableChange">
              <template slot="returnNum" slot-scope="scope">
                <el-input-number v-if="queryType != 'view'" style="width: 100%;" :value="scope.data.returnNum"
                  @change="(currentValue, oldValue) => lendNumChange(currentValue, oldValue, scope)" controls-position="right"
                  :min="1" :max="scope.data.outNum"></el-input-number>
                  <span v-else>{{ scope.data.returnNum }}</span>
              </template>
              <template slot="totalReturnNum" slot-scope="scope">
                <span>{{ queryType == 'update' && scope.data.id ? ((scope.data.totalReturnNum || 0 ) - (scope.data.returnNumA || 0)) : scope.data.totalReturnNum}}</span>
              </template>
            </table-index>
          </div>
        </template>
      </VFormRender>
    </div>
    <selectProject ref="selectProject" singleMode @selections="confirmProject" />
    <selectLend ref="selectLend" @selections="handleConfirmLend" :oneLendCode="true" />
    <selectReturnWarehouse ref="selectReturnWarehouse" @change="selectReturnWarehouseChange" :propsFormData="{sourceId: lendId}" />
    <toBeReviewed ref="toBereview"/>
    
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { deptTree, getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getUserInfo } from '@/utils/user-info'

import attachmentTable from '@/views/components/attachmentTable'
import selectProject from "@/views/components/selectProject"
import selectLend from '@/views/components/selectLend'
import selectReturnWarehouse from '@/views/components/selectReturnWarehouse'
import dialogWrapper from "@/views/components/dialogWrapper"
import lendPage from "../lendOrder/index.vue"
import { menuConfig, uniqueArrByField } from '@/utils'
import {
  getDetailOrder,
  returnQuoteList,
} from '@/api/warehouseManage/lendManage'
import {
  saveOrder,
  getOrderView,
  returnSaveSubmit
} from '@/api/warehouseManage/returnManage'
import { generateUUID } from '@/utils'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
export default {
  name: 'lendReturnOrder',
  components: {
    selectProject,
    dialogWrapper,
    lendPage,
    selectLend,
    selectReturnWarehouse,
    attachmentTable,
    toBeReviewed,
    VFormRender
  },
  mixins: [indexMixin],
  data() {
    return {
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
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update, create' }
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
      detailList: [],
      fileList: [],
        checked: false,
      status: '1',
      isQuery: '',
      lendId: ''
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  created() {
    this.init()
  },
  methods: {
   
    newTableButton(buttonCode, _1, _2, _3, row) {
      if (buttonCode === 'create') {
        const detailsList = []
      } else if (buttonCode === 'delete ') {
      }
    },
    confirmProject(row) {
      delete row.comments
      this.$refs['vFormRef'].setFormData({ ...row, projectId: row.id });
    },
    selectTableChange(row) {

    },
    emitAblFilter(listQuery) {

    },
    clickLink() {

    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    handleSelectionChange(ids, single, multiple, row) {

    },
    handleButtonDisable(button, row) {
      return false
    },
    handleButton(code, _a, _b, _c) {
      if (code === 'delRow') {
        this.detailList = this.detailList.filter((item) => item.id !== _b[0].id)
      }
    },
    async menuProperty() {
      this.datailProperty = await this.$store.dispatch('menuProperty', menuConfig.MENU_LEND_RETURN)
      this.datailProperty.fields.forEach((field) => {
        if (field.fieldCode === 'returnNum') {
          field.listSlot = true
          field.required = true
        }
      })
      this.$nextTick(() => {
        this.$refs['tableIndex'].init(this.datailProperty.fields)
      })
    },
    buttonShow(item) {
      if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.status)) {
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
    async init() {
      let { type, name, id, ids='', auditArr, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryIdArr = ids.split(',') || []
      this.queryName = name
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
      this.isQuery = isQuery
    
      this.$nextTick(async () => {
        await this.formFillInPage()
        await this.getUnitTree()
        this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
        this.$refs['vFormRef'].resetForm()
       
        if(!this.queryIdArr.length) {
          // this.$refs['vFormRef'].disableWidgets('lendCode')
         
        }
        this.menuProperty();
        await this.getDeptTreeData()
        if(this.queryType === 'create'){
          const { deptId, deptName, nickName, id: nickId } = this.userInfo
          await this.getUserListAll(deptId)
          // this.$refs['vFormRef'].setFieldValue("returnDeptId", deptId)
          // this.$refs['vFormRef'].setFieldValue("returnDeptName", deptName)
          // this.$refs['vFormRef'].setFieldValue("returnUserId", nickId)
          // this.$refs['vFormRef'].setFieldValue("returnUserName", nickName)
        }
        if (['update', 'view'].includes(this.queryType)) {
          this.$refs['vFormRef'].enableWidgets('lendCode')
          this.$refs['vFormRef'].enableWidgets('outCode')
          this.getOrderOperateDetail(id)
        } else {
          !!this.queryIdArr.length && this.loadReturnQuoteList(this.queryIdArr)
        }
      })
    },
    async loadReturnQuoteList(ids = []) {
      try {
        const { data: { list } } = await returnQuoteList({ ids: ids })
        const codeArr = uniqueArrByField(list, 'lendCode')
        const lendCodes = codeArr.join(',')
        this.$refs['vFormRef'].setFieldValue('lendCode', lendCodes)
        this.detailList = list
        this.$refs['vFormRef'].enableWidgets('lendCode')
        this.$refs['vFormRef'].enableWidgets('outCode')
        this.$refs['vFormRef'].enableWidgets('unitId')
        this.$refs['vFormRef'].enableWidgets('projectCode')

      } catch (err) {
        console.error(err)
      }
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('lendReturnOrder').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('returnDeptId').loadOptions(res.data || [])
    },
    async getUserListAll(deptId) {
      const res = await userListAll({ deptId })
      this.$refs['vFormRef'].getWidgetRef('returnUserId').loadOptions(res.data.list || [])
    },

    async getOrderOperateDetail(id) {
      try {
        this._id = id
       const {data: {detailList,fileList,...formData}} = await getOrderView(id)
       !!formData.returnDeptId && await this.getUserListAll(formData.returnDeptId)
        this.status = formData.status
       this.$refs['vFormRef'].setFormData(formData)

       this.detailList = detailList.map(item => {return {...item, returnNumA: item.returnNum}})
       if(!!this.detailList.length) {
        this.lendId = this.detailList[0].lendId
       }
       this.fileList = !!fileList.length ? fileList.map(f => ({ ...f, uid: generateUUID() })) : []
      }catch(err) {
        console.error(err)
      }
   
    },
    lendNumChange(cur, old, row) {
      row.data.returnNum = cur
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'projectCode') {
        const pId = this.$refs['vFormRef'].getFieldValue('projectId')
        this.$refs.selectProject.init(pId);
      } else if (name === 'lendCode') {
        const lendCode = this.$refs['vFormRef'].getFieldValue('lendCode')
        this.$refs.selectLend.open('',lendCode)
      }else if(name === 'outCode'){
        if(!this.lendId){
          this.$modal.msgError('请先选择借出单')
          return
        }
        this.$refs.selectReturnWarehouse.init([...this.detailList])
      }
    },
    
    async handleConfirmLend(arr) {
      try {
        if(!arr.length){
          return
        }
        const codes =  uniqueArrByField(arr, 'lendCode')
        this.$refs['vFormRef'].setFieldValue('lendCode', codes.join(','))
        this.lendId = arr[0].lendId
        const formData = {
          unitId: '',
          unitName: '',
          projectCode: '',
          projectId: '',
          projectName: '',
          outCode: '',
        }
        // if(arr[0].borrowDeptId && arr[0].borrowUserId) {
        //   formData.returnDeptId = arr[0].borrowDeptId
        //   formData.returnDeptName = arr[0].returnDeptName
        //   formData.returnUserId = arr[0].returnUserId
        //   formData.returnUserName = arr[0].returnUserName
        //   await this.getUserListAll(arr[0].borrowDeptId)
        //   this.$refs['vFormRef'].disableWidgets('returnDeptId')
        //   this.$refs['vFormRef'].disableWidgets('returnUserId')
        // }
        this.$refs['vFormRef'].setFormData(formData)
        this.detailList = []

      } catch (err) {
        console.error(err)
      }

    },
    selectReturnWarehouseChange (arr) {
      const codes =  uniqueArrByField(arr, 'outCode')
      this.$refs['vFormRef'].setFormData({
        unitId: arr[0].unitId,
        unitName: arr[0].unitName,
        projectCode: arr[0].projectCode,
        projectId: arr[0].projectId,
        projectName: arr[0].projectName,
        outCode: codes.join(','),
      })
      this.detailList = arr
    },
    handleButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
    },
    selectChange(fieldName, newValue) {
      if (fieldName === 'returnUserId') {
        if (newValue) {
          const optionLabel = this.$refs['vFormRef'].getWidgetRef('returnUserId').optionLabel
          this.$refs['vFormRef'].setFieldValue('returnUserName', optionLabel)
        } else {
          this.$refs['vFormRef'].setFieldValue('returnUserName', '')
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
    async save(buttonCode) {
      try {
        const formValid = await this.validateForm('vFormRef')
        if (!formValid) {
          this.$modal.msgError('基本信息字段不能为空')
          return
        }
        let flag = ''
        if (!this.detailList.length) {
         flag = '明细信息不能为空'
        }
        
       
        for(let i=0; i< this.detailList.length; i++) {
          const {returnNum} = this.detailList[i]
          if(!returnNum) {
            flag = '本次归还数量不能为空'
            break
          }
        }
        if(flag) {
          this.$modal.msgError(flag)
          return
        }

        this.loading = true
        const formData = await this.$refs.vFormRef.getFormData()
        const param = {
          ...formData,
          fileList: this.fileList,
          detailList: this.detailList
        }
        if(this._id) {
          param.id = this._id
        }
        const saveObj = {
          'save': () => { this.saveOrder(saveOrder, param) },
          'saveSubmit': () => { 
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.INV_GHD,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(returnSaveSubmit, param, assignee)
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
    async saveOrder (url, param, assignee) {
      if(!this.resOk) {
      const res = await url({...param, assignee})
      res.success && this.$modal.msgSuccess(`${res.message}`)
      this.resOk = true
      this.cancel()
      }
    },
    newButton(buttonCode) {
      switch (buttonCode) {
        case 'cancel':
          this.cancel()
          break;
        case 'save':
          this.save(buttonCode)
          break;
        case 'saveSubmit':
          this.save(buttonCode)
          break;
        case 'pass':
          this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
          break;
        case 'reject':
          this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
          break;
        case 'edit':
          this.queryType = 'update';
          this.$refs['vFormRef'].setReadMode(false);
          break;
        default:
      }
    },
    cancel(name) {
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
      if (name === 'returnDeptId') {
        this.$refs['vFormRef'].setFieldValue('returnUserId', '')
        this.$refs['vFormRef'].setFieldValue('returnUserName', '')
        this.$refs.vFormRef.setFieldValue('returnDeptName', node.deptName)
        this.getUserListAll(node.id)
      }
    },
    treeSelectInput(vm, newVal) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'returnDeptId') {
        if (!newVal) {
          this.$refs['vFormRef'].setFieldValue('returnUserId', '')
          this.$refs['vFormRef'].setFieldValue('returnUserName', '')
          this.$refs['vFormRef'].setFieldValue('returnDeptName', '')
          this.$refs['vFormRef'].getWidgetRef('returnUserId').loadOptions([])
        }
      }
    },
    checkoutStatus(flag) {
      //'returnDeptId', 'returnUserId', 
      const widgets = ['grid27037', 'grid39626',  'returnCode', 'projectName', 'returnDeptId', 'returnUserId', 'projectCode']
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