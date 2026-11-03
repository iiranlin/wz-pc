<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="newButton"></button-top>
    <div class="container_flex_form">
     
      <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" :class="{'formRender_view': queryType === 'view'}"
        @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @buttonClick="handleButtonClick"
        @treeSelectSelect="treeSelectSelect" @treeSelectInput="treeSelectInput"
        @operationButtonClick="operationButtonClick">
        <template slot="design_p1">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
        </template>
        <template slot="design_p2">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
        </template>
        <template slot="design_p3" v-if="this.createMethod == '1'">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="合同信息" />合同信息</p>
        </template>
        <template slot="design_p5" v-if="this.createMethod == '2'">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="合同信息" />预投信息</p>
        </template>
        <template slot="design_p4">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="客户信息" />客户信息</p>
        </template>
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="01" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="saleOrderDetails">
          <div class="detailed">
            <button-top ref="buttonTopRef" :buttonTopData="handleDetailedButtonTop" :buttonShow="handleDetailedButtonShow" @newButton="HandleDetailedNewButton"></button-top>
          </div>
          <saleOrderDetails ref="saleOrderDetails" :queryType="queryType" :tableType="tableType" @removeData="removeData"></saleOrderDetails>
        </template>
        <tooltip content="如果误删可以重新选择合同" v-if="queryType !== 'view'" />
      </VFormRender>
      <!-- <saleOrderDetails v-else ref="saleOrderDetails" :queryType="queryType" :tableType="tableType"></saleOrderDetails> -->
    </div>
    <selectProject :singleMode="true" ref="selectProject" @selections="selections" :propsFormData="propsFormDataProject" />
    <selectContract :singleMode="true" :projectId="projectId" :filterCondition="{...filterCondition, unitId: propsFormDataProject.unitId}" ref="contract" @selections="handleContract"/>
    <toBeReviewed ref="toBereview" />
    <choicePreOrder ref="choicePreOrder" :propsFormData="{...propsFormData, unitId: propsFormDataProject.unitId}" @selections="preOrderSelections"/>
    
    <Dialog title="批量修改" close-on-click-modal :visible.sync="branchEditVis" width="896px">
      <el-form :model="branchEditForm" label-width="100px">
          <el-row :gutter="20">
              <el-col :span="12">
                  <el-form-item label="需求日期" label-width="120px">
                    <el-date-picker style="width: 100%;" v-model="branchEditForm.requiredDate" type="date" format="yyyy-MM-dd" value-format="timestamp"></el-date-picker>
                  </el-form-item>
              </el-col>
          </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="un-quilt-btn confirm" type="primary" @click="submitForm">确 定</el-button>
        <el-button class="un-quilt-btn cancel" @click="branchEditVis = false">取 消</el-button>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { deptTree,getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import selectProject from '@/views/components/selectProject'
import selectContract from '@/views/components/selectContract'
import { saleOrderSave, saleOrderSaveSubmit, saleOrderOrderView, saleOrderDetailView, saleOrderSaveDetail } from '@/api/saleManage/saleOrder'
import { getProfileSubmit } from '@/api/saleManage/customerProfile'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { PuCtDetailUnused } from '@/api/projectManagement/contractManagement'
import attachmentTable from '@/views/components/attachmentTable'
import { generateUUID } from '@/utils'
import indexMixin from '@/views/mixins'
import saleOrderDetails from './components/index.vue'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import VFormRender from '@/components/form-render/index'
import choicePreOrder from '@/views/components/choice-preOrder/index.vue'
import {preOrderDetailList} from '@/api/saleManage/preOrder'
import { getUserInfo } from '@/utils/user-info'

export default {
  name: 'saleOrderOperate',
  mixins: [indexMixin],
  components: {
    selectProject,
    selectContract,
    toBeReviewed,
    attachmentTable,
    saleOrderDetails,
    VFormRender,
    choicePreOrder,
    tooltip: () => import('@/components/tooltip')
  },
  data() {
    return {
      projectId: '',
      loading: false,
      queryType: '',
      queryId: '',
      queryName: '',
      formJson: {},
      tableType: '1',
      formData: {},
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update, create' }
      ],
      handleDetailedButtonTop: [
        { buttonName: '批改', buttonCode: 'correct', options: "{\"prompt\":\"批改可多选后批量维护\"}" },
      ],
      branchEditForm: {
        requiredDate: ''
      },
      queryAuditArr: null,
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      openDataScope: false,
      /*合同信息*/
      filterCondition: {
        bizStatus: '0,1',
        ctType: '2'
      },
      managerData: [],
      fileList: [],
      checked: false,
      isQuery: '',
      propsFormDataProject: {
        unitId: ''
      },
      createMethod: '1',
      propsFormData:{
        status: 3,
        projectId:'',
      },
      userInfo: getUserInfo(),
      branchEditVis: false
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  created() {
    this.init()
  },
  methods: {
    checkoutStatus() {
      const arrId = ['gridCol31570','saleOrderName', 'contractName', 'design_p4', 'grid53608', 'saleDeptId', 'saleId', 'receiptDate', 'notes', 'fileList', 'saleOrderCode',  'grid51735', 'grid96921', 'grid46207', 'design_p2', 'grid18700', 'divider36154']
      if (this.checked) {
        this.$refs['vFormRef'].hideWidgets(arrId);
      } else {
        this.$refs['vFormRef'].showWidgets(arrId);
      } 
    },
    buttonShow(item) {
      if (item.buttonCode === 'rollbackToPrevious') {
        const query = this.isDialog ? this.dialogQuery : this.$route.query
        return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
          && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
          && this.buttonShow({ ...item, buttonCode: 'reject' })
      }
      if(['saveSubmit'].includes(item.buttonCode) && this.queryType == 'create') {
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
      let { type, name, id, auditArr, tableType = '1', isQuery = '' ,createMethod = '1'} = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name || 'saleOrder'
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.tableType = tableType
      this.isQuery = isQuery
      this.createMethod = createMethod;
      this.$nextTick(async () => {
       
        /*默认禁用销售负责人*/
        await this.formFillInPage()
        this.$refs['vFormRef'].resetForm()

        if (this.tableType != '1') {
          this.$refs['vFormRef'].hideWidgets(['card112021'])
        }
        await this.getDeptTreeData()
        await this.getUnitTree()
        this.$refs['vFormRef'].disableWidgets('saleId')
        if (this.queryType === 'update') {
          this.$refs['vFormRef'].setReadMode(false)
          this.saleOrderOperateDetail()
        } else if (this.queryType === 'view') {
          this.$refs['vFormRef'].setReadMode(true)
          this.saleOrderOperateDetail()
          // this.$refs['vFormRef'].getWidgetRef('saleOrderDetails').setWidgetOption('showButtonsColumn', false)

        } else {
          this.$refs['vFormRef'].setReadMode(false)
          // this.$refs['vFormRef'].disableWidgets('contractCode')
          this.initUnitInfo()
          const {deptId,deptName} = this.userInfo;
          this.$refs['vFormRef'].setFieldValue("saleDeptId", deptId);
          this.formData.saleDeptName = deptName

          const managerData = await userListAll({ deptId })  /*获取部门负责人下拉列表数据*/
          this.$refs['vFormRef'].enableWidgets('saleId')
          this.$refs['vFormRef'].getWidgetRef('saleId').loadOptions(managerData.data.list || [])
          this.managerData = managerData.data.list || []
        }
        if(this.createMethod == '1'){
          this.$refs['vFormRef'].hideWidgets('grid76333');
          this.$refs['vFormRef'].showWidgets('grid78943');
        }else if(this.createMethod == '2'){
          this.$refs['vFormRef'].showWidgets('grid76333');
          this.$refs['vFormRef'].hideWidgets('grid78943');
        }
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('saleOrderOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    saleOrderOperateDetail() {
      this.loading = true
      let req = saleOrderOrderView, ids = this.queryId
      if(this.tableType == '2'){
        req = saleOrderDetailView
        ids = this.queryId.split(',')
      }
      req(this.tableType == '1'?ids: {ids}).then(({ data }) => {
        this.createMethod = data.createMethod;

        if(this.createMethod == '1'){
          this.$refs['vFormRef'].hideWidgets('grid76333');
          this.$refs['vFormRef'].showWidgets('grid78943');
        }else if(this.createMethod == '2'){
          this.$refs['vFormRef'].showWidgets('grid76333');
          this.$refs['vFormRef'].hideWidgets('grid78943');
        }

        if(this.tableType == '2'){
          this.$refs.saleOrderDetails.init(data || [])
          this.countPrice(data)
          return
        }
        let showData = { ...data }

        this.treeSelectSelect(this.$refs['vFormRef'].getWidgetRef('saleDeptId'),
          {
            id: showData.saleDeptId,
            deptName: showData.deptName
          })
        this.formData = showData
        this.$refs['vFormRef'].setFormData(Object.assign(showData, {
          receiptDate: this.parseTime(showData.receiptDate, '{y}-{m}-{d}')
        }))
        this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        // const tableData = showData.saleOrderDetails.map(item => {
        //   item.num = item.rowNumber
        //   item.taxPre = item.taxRate
        //   item.amount = item.unTaxAmount
        //   item.amountTax = item.taxAmount
        //   return item
        // })
        // this.$refs['vFormRef'].getWidgetRef('saleOrderDetails').setTableData(tableData || [])
        this.$refs.saleOrderDetails.init(showData.saleOrderDetails || [])
        this.countPrice(showData.saleOrderDetails)
      }).finally(() => {
        this.loading = false
      })
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('saleDeptId').loadOptions(res.data || [])
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      const unitId = this.$refs.vFormRef.getFieldValue("unitId");
      if(!unitId){
        this.$modal.msgError('请先选择所属组织')
        return
      }
      this.propsFormDataProject.unitId = unitId;

      if (name === 'projectCode') {
        const pId = this.$refs.vFormRef.getFieldValue("projectId");
        this.$refs.selectProject.init(pId)
      } else if (name === 'contractCode') {
        this.projectId = this.$refs.vFormRef.getFieldValue("projectId");
        let contractId = this.$refs['vFormRef'].getFieldValue('contractId')
        this.$refs.contract.init(contractId)
      } else if(name == 'preOrderCode'){
        this.propsFormData.projectId = this.$refs['vFormRef'].getFieldValue('projectId');
        let preOrderId = this.$refs['vFormRef'].getFieldValue('preOrderId');
        this.$refs.choicePreOrder.init(preOrderId);
      }
    },
    handleButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
    },
    cleanUp(name) {  /*清空表单里的数据*/
      let getContainerWidgets = this.$refs['vFormRef'].getContainerWidgets()
      getContainerWidgets.forEach((item) => {
        if (name.includes(item.name)) {
          item.container.widgetList[0].cols.forEach((val) => {
            this.$refs['vFormRef'].setFieldValue(val.widgetList[0].options.name, '')
          })
        }
      })
    },
    newButton(buttonCode) {
      if (buttonCode === 'rollbackToPrevious') {
        this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
        return
      }
      if (buttonCode === 'cancel') {
        this.cancel(this.queryName)
      } else if (buttonCode === 'save') {
        this.handleSave(buttonCode)
      } else if (buttonCode === 'edit') {
        this.queryType = 'update'
        this.$refs['vFormRef'].setReadMode(false)
      } else if (buttonCode === 'saveSubmit') {
        this.handleSave(buttonCode)
      } else if (buttonCode === 'pass') {
        this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName)
      } else if (buttonCode === 'reject') {
        this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName)
      }
    },
    handleDetailedButtonShow(item) {
      return true
    },
    HandleDetailedNewButton(buttonCode) {
      if(buttonCode === 'correct'){
        const detailedList = this.$refs['saleOrderDetails']
        if(!detailedList.selectData.length){
          this.$modal.msgError("请选择数据");
          return
        }
        this.branchEditVis = true
      }
    },
    submitForm() {
      const detailedList = this.$refs['saleOrderDetails']
      detailedList.tableData.detailsList.map(item => {
        detailedList.selectData.map(ele => {
          if (item.matlId === ele.matlId) {
            item.requiredDate = this.branchEditForm.requiredDate
          }
        })
      })
      this.branchEditVis = false
      this.branchEditForm.requiredDate = ''
    },
    handleSave(buttonCode) {
      try {
        const detailedList = this.$refs['saleOrderDetails'];
        if (this.tableType == '2') {
            detailedList.$refs.elForm.validate(valid => {
                if (valid) {
                    this.loading = true;
                    saleOrderSaveDetail(detailedList.tableData.detailsList).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.cancel(this.queryName);
                    }).finally(() => {
                        this.loading = false;
                    });
                }
            })
            return
        }
        this.$refs.vFormRef.getFormData().then(formData => {

          let tableData = []
          if(!detailedList.tableData.detailsList.length) {
            this.$modal.msgError("产品明细不能为空");
            return
          }
          let flag = true
          detailedList.$refs.elForm.validate(valid => {
            if (valid) {
              tableData = detailedList.tableData.detailsList
            }else {
              flag = false
            }
          })
          if(!flag) {
            return
          }
          const param = Object.assign({}, this.formData, formData)
          let id = this.queryId
          if (this.tableType != '1') {
            id = this.formData.id
          }

          const args = {
            ...param,
            id: id,
            saleOrderDetails: tableData,
            fileList: this.fileList,
            createMethod: this.createMethod,
          }

          const saveObj = {
            'save': () => { this.saveOrder(saleOrderSave, args) },
            'saveSubmit': () => {
              this.$reviewerDialog({
                type: ACTIVITI_ASSUGNEE.SA_XSD,
                multiple: false,
                success: (assignee) => {
                  this.saveOrder(saleOrderSaveSubmit, args, assignee)
                }
              })
            }
          }
          saveObj[buttonCode] && saveObj[buttonCode]()
        }).catch((err) => {
          this.$modal.msgError(err);
        })
      } catch (err) {
        console.error(err)
      }
    },
    async saveOrder(url, param, assignee) {
      if(!this.resOk) {
        this.loading = true
        const res = await url({ ...param, assignee })
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.resOk = true
        this.loading = false
        this.cancel(this.queryName)
      }
    },
    cancel(name) {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name })
    },
    operationButtonClick(dataTable, buttonName, rowIndex, row) {
      if (buttonName == 'delete') {
        let detailedList = JSON.parse(JSON.stringify(this.$refs['vFormRef'].getWidgetRef('saleOrderDetails').getTableData()))
        detailedList.splice(rowIndex, 1)
        let tableRef = this.$refs['vFormRef'].getWidgetRef('saleOrderDetails')
        tableRef?.setTableData(detailedList)
        /*这里需要重新计算金额*/
        this.countPrice(detailedList)
      }
    },
    removeData (data) {
      this.countPrice(data)
    },
    countPrice(saleOrderList = []) {
      this.formData.totalMatlNum = 0
      this.formData.totalUnTaxAmount = 0
      this.formData.totalTaxAmount = 0
      saleOrderList.forEach(item => {
        this.formData.totalMatlNum += Number(item.matlNum)
        this.formData.totalUnTaxAmount += Number(item.unTaxAmount)
        this.formData.totalTaxAmount += Number(item.taxAmount)
      })
      this.$refs['vFormRef'].setFormData({
        totalMatlNum: (this.formData.totalMatlNum).toFixed(2),
        totalTaxAmount: (this.formData.totalTaxAmount).toFixed(2),
        totalUnTaxAmount: (this.formData.totalUnTaxAmount).toFixed(2)
      })
    },
    // 部门树选择
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'saleDeptId') {
        if (node.id) {
          const managerData = await userListAll({ deptId: node.id })  /*获取部门负责人下拉列表数据*/
          this.formData.saleDeptName = node.deptName
          this.$refs['vFormRef'].enableWidgets('saleId')
          this.$refs['vFormRef'].getWidgetRef('saleId').loadOptions(managerData.data.list || [])
          this.managerData = managerData.data.list || []
        }
      }
      if (name === 'unitId') {
        this.$refs.vFormRef.setFieldValue('unitName', node.deptName);

        this.resetProjectData();
        this.resetContractData()
        this.resetPreOrderData()
      }
    },
    treeSelectInput(name, newVal) {
      if (!newVal) {
        this.$refs['vFormRef'].setFieldValue('saleId', '')
        this.$refs['vFormRef'].disableWidgets('saleId')
      }
    },
    selectChange(name, node) {
      if (name === 'saleId') {
        if (node !== '') {
          this.formData.saleName = this.managerData.find(item => item.id == node).nickName
        }
      } else if (name === 'receiptDate') {
        this.$refs['vFormRef'].setFormData({
          [name]: this.parseTime(node, '{y}-{m}-{d}')
        })
      } else if (name === 'projectCode') {
        this.$refs['vFormRef'].setFormData({
          projectCode: '',
          projectName: '',
          projectId: '',
          contractName: '',
          contractCode: '',
          contractId: '',
          cuCode: '',
          cuName: '',
          cuId: '',
        })
        // this.$refs['vFormRef'].getWidgetRef('saleOrderDetails').setTableData([])
        this.$refs.saleOrderDetails.init([])
      } else if (name === 'contractCode') {
        this.$refs['vFormRef'].setFormData({
          contractName: '',
          contractCode: '',
          contractId: '',
          cuCode: '',
          cuName: '',
          cuId: '',
        })
        this.$refs.saleOrderDetails.init([])
        // this.$refs['vFormRef'].getWidgetRef('saleOrderDetails').setTableData([])
      }
    },
    /*选择项目信息*/
    selections(row) {
      this.$refs['vFormRef'].setFormData(row)
      this.$refs['vFormRef'].setFieldValue('projectId', row.id)
      this.resetContractData()
      this.resetPreOrderData()
      // this.$refs['vFormRef'].enableWidgets('contractCode')
    },
    // 初始化合同&客户&产品明细相关信息
    resetContractData() {
      this.$refs['vFormRef'].setFieldValue('cuCode', '')
      this.$refs['vFormRef'].setFieldValue('cuId', '')
      this.$refs['vFormRef'].setFieldValue('cuName', '')
      this.$refs['vFormRef'].setFieldValue('contractName', '')
      this.$refs['vFormRef'].setFieldValue('contractCode', '')
      this.$refs['vFormRef'].setFieldValue('contractId', '')
      this.$refs['vFormRef'].setFieldValue('saleOrderName', '')
     
      this.$refs.saleOrderDetails.init([])
      this.countPrice([])
    },
    resetPreOrderData(){
      this.$refs['vFormRef'].setFieldValue('cuCode', '')
      this.$refs['vFormRef'].setFieldValue('cuId', '')
      this.$refs['vFormRef'].setFieldValue('cuName', '')
      this.$refs['vFormRef'].setFieldValue('preOrderName', '')
      this.$refs['vFormRef'].setFieldValue('preOrderCode', '')
      this.$refs['vFormRef'].setFieldValue('preOrderId', '')
      this.$refs['vFormRef'].setFieldValue('saleOrderName', '')

      this.$refs.saleOrderDetails.init([])
      this.countPrice([])
    },
    resetProjectData(){
      this.$refs['vFormRef'].setFieldValue('projectId', '')
      this.$refs['vFormRef'].setFieldValue('projectCode', '')
      this.$refs['vFormRef'].setFieldValue('projectName', '')
    },
    /*选择合同信息*/
    handleContract(row) {
      this.cleanUp(['preOrder', 'su'])
      this.$refs['vFormRef'].setFormData(
        {
          ...row,
          cuCode: row.relativeCode,
          cuId: row.relativeId,
          cuName: row.relativeName,
          contractName: row.ctName,
          contractCode: row.ctCode,
          contractId: row.ctId,
          saleOrderName: row.ctName,
        })
      this.contractDetail(row.ctId)
      //let contractMtId = this.$refs['vFormRef'].getFieldValue('contractMtId');
    },
    contractDetail(id) {
      this.loading = true
      PuCtDetailUnused(id).then(({ data }) => {
        // this.$refs['vFormRef'].getWidgetRef('saleOrderDetails').setTableData(data.rawList)
        const tableData = data.rawList.map(item => {
          return Object.assign( {}, item, {matlNum: item.num, taxRate: item.taxPre, taxAmount: item.amountTax, unTaxAmount: item.amount})
        })
        this.$refs.saleOrderDetails.init(tableData)
        this.countPrice(tableData)
      }).finally(() => {
        this.loading = false
      })
    },
    //选择预投信息
    preOrderSelections(row){
       this.$refs['vFormRef'].setFormData(
        {
          cuCode: row.cuCode,
          cuId: row.cuId,
          cuName: row.cuName,
          preOrderName: row.theme,
          preOrderCode: row.preOrderCode,
          preOrderId: row.preOrderId,
          projectId: row.projectId,
          projectCode: row.projectCode,
          projectName: row.projectName,
          saleOrderName: row.theme,
        })
      this.preOrderDetail(row.preOrderCode,row.arrivalDate)
    },
    preOrderDetail(preOrderCode,requiredDate){
      this.loading = true
      let params = {
        preOrderCode:preOrderCode,
      }
      preOrderDetailList(params).then(({data}) => {
        let tableData = data.list;
        tableData.forEach((item) => {
          item.requiredDate = requiredDate;
        })
        this.$refs.saleOrderDetails.init(tableData)
        this.countPrice(tableData)
      }).catch((err) => {
        
      }).finally(() => {
        this.loading = false
      })
    },
    //提交
    submitList() {
      const ids = this.formData.id /*去重*/
      const data = {
        businessId: ids,
        businessType: ACTIVITI_ASSUGNEE.SA_XSD
      }
      getProfileSubmit({
        ...data
      }).then(res => {
        if (res.success) {
          this.$modal.msgSuccess('提交成功')
          this.cancel(this.queryName)
        } else {
          this.$modal.msgError(res.message)
        }
      })
    }
  }
}
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
