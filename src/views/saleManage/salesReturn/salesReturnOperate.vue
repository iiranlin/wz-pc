<template>
  <div class="app-container container_flex" v-loading="loading">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="newButton"></button-top>
    <div class="container_flex_form">

      <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
        active-text="隐藏非必填项">
      </el-switch>
      <VFormRender :class="{ 'formRender_view': queryType === 'view' }" ref="vFormRef" :form-data="formData"
        @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @treeSelectSelect="treeSelectSelect">
        <template slot="design_p1">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
        </template>
        <template slot="design_p2">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
        </template>
        <template slot="design_p3">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="合同信息" />合同信息</p>
        </template>
        <template slot="design_p4">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="客户信息" />客户信息</p>
        </template>
        <template slot="design_p5">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="收发信息" />收发信息</p>
        </template>
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="37" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="detailList">
          <detailedList ref="detailedList" :queryType="queryType" :tableType="tableType" @numberChange="countPrice"
            @asyncCodes="asyncCodes">
          </detailedList>
        </template>
      </VFormRender>
    </div>
    <choiceShipment ref="choiceShipment" @change="choiceShipmentChange" :propsFormData="propsFormData" />
    <selectReturnWarehouse ref="selectReturnWarehouse" @change="selectReturnWarehouseChange" :sourceCodeDisabled="true"
      rowKey="outDetailId" :propsFormData="propsFormDataOut" />
    <toBeReviewed ref="toBereview" />
  </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { returnSaveOrder, returnSaveSubmitOrder, returnOrderView, returnDetailView, returnSaveDetail } from '@/api/prodmgr-sa/return'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import attachmentTable from '@/views/components/attachmentTable'
import { generateUUID, uniqueArrByField } from '@/utils'
import indexMixin from '@/views/mixins'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import detailedList from './components/detailedList'
import choiceShipment from '@/views/components/choice-shipment'
import selectReturnWarehouse from '@/views/components/selectReturnWarehouse'
import VFormRender from '@/components/form-render/index'
import { getUnitTree } from '@/api/system/dept'

export default {
  name: 'salesReturnOperate',
  mixins: [indexMixin],
  components: {
    toBeReviewed,
    attachmentTable,
    detailedList,
    choiceShipment,
    VFormRender,
    selectReturnWarehouse
  },
  data() {
    return {
      loading: false,
      queryType: '',
      queryId: '',
      queryName: '',
      tableType: '1',
      formData: {
        status: '1'
      },
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
      fileList: [],
      checked: false,
      isQuery: '',
      propsFormData: {
        unitId: ''
      },
      propsFormDataOut: {
        sourceCode: '',
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    buttonShow(item) {
      if (['saveSubmit', 'edit'].includes(item.buttonCode) && (!['0', '1'].includes(this.formData.status) || this.queryName == 'toBeDeal' || this.tableType === '2' || this.isQuery == 'query')) {
        return false
      }
      if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
        return true
      } else {
        return false
      }
    },
    init() {
      let { type, name, id, auditArr, tableType = '1', isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name || 'saleOrder'
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.tableType = tableType
      this.isQuery = isQuery
      this.$nextTick(async () => {
        this.$refs['vFormRef'].resetForm()
        await this.formFillInPage()
        await this.getUnitTree()
        if (this.tableType != '1') {
          this.$refs['vFormRef'].hideWidgets(['card112021'])
        }
        this.$refs['vFormRef'].disableWidgets('saleId')
        if (this.queryType === 'update') {
          this.$refs['vFormRef'].setReadMode(false)
          this.salesReturnOperateDetail()
        } else if (this.queryType === 'view') {
          this.$refs['vFormRef'].setReadMode(true)
          this.salesReturnOperateDetail()
          // this.$refs['vFormRef'].getWidgetRef('saleOrderDetails').setWidgetOption('showButtonsColumn', false)

        } else {
          this.$refs['vFormRef'].setReadMode(false)
          this.initUnitInfo()
          // this.$refs['vFormRef'].disableWidgets('contractCode')
        }
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('salesReturnOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    checkoutStatus() {
      const arrId = ['grid96921', 'grid39259', 'design_p2', 'grid18700', 'design_p3', 'grid78943', 'design_p4', 'grid53608', 'gridCol69665', 'returnCode', 'logisticsOddNumber']
      if (this.checked) {
        this.$refs['vFormRef'].hideWidgets(arrId);
      } else {
        this.$refs['vFormRef'].showWidgets(arrId);
      }
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    async treeSelectSelect(vm, node) {
      let { field: { options: { name } } } = vm || {}

      if (name === 'unitId') {
        this.$refs['vFormRef'].setFieldValue('unitName', node.deptName);

        this.$refs['detailedList'].tableData.detailsList = []
        this.$refs.vFormRef.setFormData({
          projectCode: '', projectName: '', projectId: '', ctCode: '', ctName: '', ctName: '', ctId: '',
          cuCode: '', cuName: '', cuId: '', deliveryUser: '', deliveryTel: '', receiveUser: '', receiveTel: '', deliveryCode: '',
        })
        this.countPrice()
      }
    },
    salesReturnOperateDetail() {
      const req = this.tableType == '1' ? returnOrderView : returnDetailView
      this.loading = true
      const queryId = this.tableType == '1' ? this.queryId : { ids: this.queryId.split(',') }
      req(queryId).then(({ data }) => {
        if (this.tableType == '1') {
          this.formData = data
          this.$refs['vFormRef'].setFormData(data)
          this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
          this.$refs.detailedList.init(data.detailList || [])
        } else {
          this.$refs.detailedList.init(data || [])
        }
      }).finally(() => {
        this.loading = false
      })
    },
    selectChange(fieldName, newValue) {
      if (fieldName === 'deliveryCode' && newValue == '') {
        this.$refs['detailedList'].tableData.detailsList = []
        this.$refs.vFormRef.setFormData({
          projectCode: '', projectName: '', projectId: '', ctCode: '', ctName: '', ctName: '', ctId: '',
          cuCode: '', cuName: '', cuId: '', deliveryUser: '', deliveryTel: '', receiveUser: '', receiveTel: '', deliveryCode: '',
        })
        this.countPrice()
      }
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'deliveryCode') {
        let unitId = this.$refs['vFormRef'].getFieldValue("unitId");
        if (!unitId) {
          this.$modal.msgError('请先选择所属组织')
          return
        }
        this.propsFormData.unitId = unitId;

        this.$refs.choiceShipment.init()
      } else if (name === 'outCode') {
        let deliveryCode = this.$refs['vFormRef'].getFieldValue("deliveryCode");
        if (!deliveryCode) {
          this.$modal.msgError('请先选择出货单号')
          return
        }

        this.propsFormDataOut.sourceCode = deliveryCode;
        const arr = JSON.parse(JSON.stringify(this.$refs.detailedList.tableData.detailsList))
        this.$refs.selectReturnWarehouse.init(arr)
      }
    },

    choiceShipmentChange(data) {
      const { sourceCode, projectCode, projectName, projectId, ctCode, ctName, ctId, cuCode, cuName, cuId, deliveryUser, deliveryTel, receiveUser, receiveTel } = data[0]
      this.$refs['vFormRef'].setFormData({
        projectCode, projectName, projectId, ctCode, ctName, ctId, cuCode, cuName, cuId,
        deliveryUser: receiveUser,
        deliveryTel: receiveTel,
        receiveUser: deliveryUser,
        receiveTel: deliveryTel,
        deliveryCode: sourceCode
      })
      this.$refs.detailedList.tableData.detailsList = [];
    },
    selectReturnWarehouseChange(data) {
      const codes = uniqueArrByField(data, 'outCode')
      const ids = uniqueArrByField(data, 'outId')
      this.$refs['vFormRef'].setFieldValue('outCode', codes.join(','));
      this.$refs['vFormRef'].setFieldValue('outId', ids.join(','));

      const list = data.map((item, idx) => {
        let taxRate = item.taxRate || '13';
        let returnNum = item.outNum - (item.saReturnNum || 0);

        return {
          ...item,
          taxRate: taxRate,
          returnNum: returnNum,
          amount: (item.price * returnNum).toFixed(2),
          taxAmount: (item.price * returnNum * (1 + taxRate / 100)).toFixed(2),
          sourceDetailId: item.outDetailId,
          originalNum: item.outNum,
          rowNum: idx + 1
        }
      })
      this.$refs.detailedList.init(list)
    },
    newButton(buttonCode) {
      if (buttonCode === 'edit') {
        this.queryType = 'update'
        this.$refs['vFormRef'].setReadMode(false)
        return
      }
      if (buttonCode === 'cancel') {
        this.cancel(this.queryName)
        return
      } else if (buttonCode === 'save' || buttonCode === 'saveSubmit') {
        this.handleSave(buttonCode)
        return
      }
      if (buttonCode === 'pass') {
        this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName)
        return
      }
      if (buttonCode === 'reject') {
        this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName)
        return
      }
    },
    handleSave(buttonCode) {
      const detailedList = this.$refs['detailedList'];
      if (this.tableType == '2') {
        detailedList.$refs.elForm.validate(valid => {
          if (valid) {
            this.loading = true;
            returnSaveDetail(detailedList.tableData.detailsList).then(({ message }) => {
              this.$modal.msgSuccess(message);
              this.cancel(this.queryName);
            }).finally(() => {
              this.loading = false;
            });
          }
        })
        return
      }
      const vFormRefData = new Promise((resolve, reject) => {
        return this.$refs.vFormRef.getFormData().then(formData => {
          resolve(formData)
        }).catch(error => {
          reject()
        })
      })
      const pList = new Promise((resolve, reject) => {
        return detailedList.$refs.elForm.validate(valid => {
          if (valid) {
            resolve(detailedList.tableData.detailsList)
          } else {
            reject()
          }
        })
      })
      Promise.all([vFormRefData, pList]).then((data) => {
        const formData = { ...data[0], fileList: this.fileList, detailList: data[1] }
        const saveObj = {
          'save': () => { this.saveOrder(returnSaveOrder, formData) },
          'saveSubmit': () => {
            this.$reviewerDialog({
              type: ACTIVITI_ASSUGNEE.SA_THD,
              multiple: false,
              success: (assignee) => {
                this.saveOrder(returnSaveSubmitOrder, formData, assignee)
              }
            })
          }
        }
        saveObj[buttonCode] && saveObj[buttonCode]()
      }).catch((error) => {
        this.$modal.msgError('表单数据校验失败');
      })
    },
    async saveOrder(url, param, assignee) {
      if (!this.resOk) {
        const res = await url({ ...param, id: this.queryId, assignee })
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.resOk = true
        this.cancel(this.queryName)
      }
    },
    cancel(name) {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name })
    },
    countPrice(saleOrderList = []) {
      let numTotal = 0
      let amount = 0
      let amountTax = 0
      saleOrderList.forEach(item => {
        numTotal += Number(item.returnNum || 0)
        amount += Number(item.amount || 0)
        amountTax += Number(item.taxAmount || 0)
      })
      this.$refs['vFormRef'].setFormData({
        numTotal,
        amountTax: (amountTax).toFixed(2),
        amount: (amount).toFixed(2)
      })
    },
    asyncCodes(arr = []) {
      const codes = uniqueArrByField(arr, 'outCode')
      const ids = uniqueArrByField(arr, 'outId')

      if (!!codes.length) {
        this.$refs.vFormRef.setFieldValue('outCode', codes.join(','));
      } else {
        this.$refs.vFormRef.setFieldValue('outCode', '');
      }
      if (!!ids.length) {
        this.$refs.vFormRef.setFieldValue('outId', ids.join(','));
      } else {
        this.$refs.vFormRef.setFieldValue('outId', '');
      }
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
