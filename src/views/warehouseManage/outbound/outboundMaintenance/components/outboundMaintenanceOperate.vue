<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="newButton"></button-top>
    <div class="container_flex_form">

      <el-switch v-if="checkedShow" v-model="checked" @change="checkoutStatus" class="checkbox_required"
        active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
        :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
        @selectChange="selectChange" @buttonClick="handleButtonClick" @treeSelectInput="treeSelectInput"
        @treeSelectSelect="treeSelectSelect">
        <template slot="design_p1">
          <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
        </template>
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="16" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="slotIcon">
          <div>
            <el-form :model="formValidate" ref="ruleForm">
              <el-table border :data="formValidate.detailedForm" height="400px" class="mt-20 saleOrderOperateEltable">
                <el-table-column type="index" width="50" align="center" label="序号" />
                <el-table-column label="来源单号" align="center" prop="sourceCode" min-width="120"></el-table-column>
                <el-table-column label="来源行号" align="center" prop="sourceRowNum" width="80"></el-table-column>
                <el-table-column label="物料编码" align="center" prop="matlCode" min-width="120"></el-table-column>
                <el-table-column label="物料名称" align="left" prop="matlName" min-width="240"
                  show-overflow-tooltip></el-table-column>
                <el-table-column label="规格型号" align="left" prop="matlType" min-width="120"></el-table-column>
                <el-table-column label="计量单位" align="center" prop="matlUnit" min-width="80">
                  <template slot-scope="{row}">
                    <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                  </template>
                </el-table-column>
                <el-table-column align="left" width="150" label="所属组织" prop="unitName"></el-table-column>
                <el-table-column label="单据原量" align="right" prop="originalNum" min-width="80"></el-table-column>
                <el-table-column align="right" prop="totalOutNum" min-width="210">
                  <template slot="header">
                    <span>
                      已生成出库单数量(累计)
                      <tooltip content="以来源行号的维度,按任务量累计，不是按入库完成累计" />
                    </span>
                  </template>
                  <template slot-scope="{row}">
                    {{ queryType != 'update' ? row.totalOutNum : row.totalOutNum - row.outNumA }}
                  </template>
                </el-table-column>
                <el-table-column label="出库仓库" min-width="200" align="left" prop="warehouseId">
                  <template slot="header">
                    <span style="color: red" v-if="isOrLendStatus && queryType !== 'view'">*</span>
                    <span>出库仓库</span>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="`detailedForm.${scope.$index}.warehouseId`"
                      v-if="isOrLendStatus && queryType !== 'view'"
                      :rules="[{ required: true, message: '请选择出库仓库', trigger: ['blur', 'change'] }]">
                      <selectTree :value="scope.row.warehouseId" :options="scope.row.warehouseTree"
                        :props="optionsProps" :disabledFun="disabledFun"
                        @getValue="(obj, treeIndex, valueId) => getWarehouseName(obj, scope.row, scope.$index)" />
                    </el-form-item>
                    <span v-else>
                      {{ scope.row.warehouseName }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column align="right" prop="inventoryNum" min-width="120">
                  <template slot="header">
                    <span>
                      库存数量
                      <tooltip content="按仓库维度的合格数量累计" />
                    </span>
                  </template>
                  <template slot-scope="{row}">
                    {{row.inventoryNum}}
                  </template>
                </el-table-column>
                <el-table-column align="right" prop="outNum" min-width="220">
                  <template slot="header">
                    <span style="color: red">*</span>
                    <span>本次出库数量</span>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="`detailedForm.${scope.$index}.outNum`"
                      :rules="[{ required: true, message: '请输入本次出库数量', trigger: ['blur', 'change'] }]">
                      <span v-if="queryType === 'view'">{{ scope.row.outNum }}</span>
                      <el-input-number v-else controls-position="right" :min="0" :precision="2"
                        :max="getRowMax(scope.row)" v-model.number="scope.row.outNum"></el-input-number>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="项目编码" align="center" min-width="120" prop="projectCode"></el-table-column>
                <el-table-column label="项目名称" align="left" min-width="120" prop="projectName"></el-table-column>
                <el-table-column v-if="queryType !== 'view'" label="操作" align="center" fixed="right">
                  <template slot-scope="scope">
                    <el-button v-if="isOrLendStatus" type="text" @click="copyRow(scope.row, scope.$index)">复制行
                    </el-button>
                    <el-button type="text" @click="deleteRow(scope.$index)">删行</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form>
          </div>
        </template>
      </VFormRender>
    </div>
    <!-- <transfer-order ref="transferOrderRef" title="选择数据"  @orderRow="orderRow"></transfer-order> -->
    <choice-source ref="choiceSource"  @choiceSource="choiceSourceSelected"></choice-source>
  </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { deptTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getUserInfo } from '@/utils/user-info'
import TransferOrder from './transferOrder.vue'
import ChoiceSource from './choiceSource.vue'
import {
  warehouseSaveOrder,
  warehouseOrderViewDetail,
  warehouseOrderUpdate,
  warehouseOrderAllViewDetail,
  warehouseGetOutWarehouse
} from '@/api/warehouseManage/outboundMaintenance'
import selectTree from '@/components/selectTree/index.vue'
import { MaRawBatchWhiListById } from '@/api/prodmgr-pu/Ma';
import { handleOutQuoteList } from '@/api/prodmgr-inv/scrapHandle'
import { uniqueArrByField } from '@/utils'
import {
  getOutQuoteList,
} from '@/api/warehouseManage/lendManage'
import { getRefundoutQuoteList } from '@/api/purchasingManagement/return'
import { getOrderOutQuoteList } from '@/api/projectManagement/productionOrder'
import { pickingOutQuoteList } from '@/api/projectManagement/productionReview'
import attachmentTable from '@/views/components/attachmentTable'
import { generateUUID } from '@/utils'
import { deliveryOutQuoteList } from '@/api/prodmgr-sa/delivery';
import VFormRender from '@/components/form-render/index'
import { detail } from '@/api/projectManagement/productionParams'
import indexMixin from '@/views/mixins'
export default {
  mixins: [indexMixin],
  name: 'outboundMaintenanceOperate',
  dicts: ['MeasureUnit', 'outSource'],
  components: {
    TransferOrder,
    selectTree,
    attachmentTable,
    VFormRender,
    ChoiceSource,
    tooltip: () => import('@/components/tooltip')
  },
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
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update, outbound, receive' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update, outbound, receive' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        // { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        // { buttonName: '提交', buttonCode: 'submit', buttonIcon: 'Blue-Submit', type: 'view, update' }
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
      dataOptions: [],
      optionsProps: {
        children: 'children',
        label: 'name',
        value: 'id',
        disabled: (node, data) => {
          return data.level == 1
        }
      },
      fileList: [],
    }
  },
  computed: {
    ...mapGetters(['infoData'])
  },
  created() {
    this.init()
  },
  methods: {
    async loadParams() {
      const { data } = await detail()
      this.options = this.$refs.vFormRef.getWidgetRef('outSource').$options.propsData.field.options.optionItems
      // 是
      if (data.isCreatePicking == '1') {
        this.$refs.vFormRef.getWidgetRef('outSource').$options.propsData.field.options.optionItems = this.options.filter(opt => opt.code != '7')
      } else {
        this.$refs.vFormRef.getWidgetRef('outSource').$options.propsData.field.options.optionItems = this.options.filter(opt => opt.code != '10')
      }
    },
    disabledFun(node) {
      return node.level !== 2
    },
    buttonShow(item) {
      if (['submit', 'edit'].includes(item.buttonCode) && ['3'].includes(this.formData.outStatus)) {
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
      let { type, name, id, ids = '', outSource = '' } = this.isDialog ? this.dialogQuery : this.$route.query

      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name || 'outboundMaintenance'
      const idArr = !!ids ? ids.split(',') : []
      this.$nextTick(async () => {
        await this.formFillInPage()
        this.$refs['vFormRef'].resetForm()
        /*默认禁用销售负责人*/
        await this.loadParams()
        if (!!outSource) {
          this.$refs['vFormRef'].setFieldValue('outSource', outSource)
          this.$refs.vFormRef.disableWidgets(['outSource', 'sourceCode']);
          this.$refs.vFormRef.getWidgetRef('sourceCode').setAppendButtonVisible(false);
          if (outSource == '9') {
            this.isOrLendStatus = true;
            this.loadReview(idArr)
          } else if (outSource == '8') {
            this.loadReFund(idArr)
          } else if (outSource == '7') {
            this.isOrLendStatus = true;
            this.$refs.vFormRef.getWidgetRef('card74348').$options.propsData.widget.options.label = '备料明细'
            this.loadReceive(idArr);
          } else if (outSource == '6') {
            this.isOrLendStatus = true;
            this.MaRawBatchWhiListById(idArr);
          } else if (outSource == '5') {
            this.isOrLendStatus = true;
            this.getOutQuoteList(idArr);
          } else if (outSource == '4') {
            this.isOrLendStatus = true;
            this.deliveryOutQuoteList(idArr);
          } else {
            !!idArr.length && this.handleOutQuoteList(idArr)
          }
        }
        await this.getDeptTreeData()
        if (this.queryType === 'update') {
          this.$refs['vFormRef'].setReadMode(false)
          this.saleOrderOperateDetail()
        } else if (this.queryType === 'view') {
          this.checkedShow = false
          this.$refs['vFormRef'].setReadMode(true)
          this.saleOrderOperateDetail()
        } else {
          const { deptId, deptName, unitName, nickName, id: nickId } = this.userInfo
          this.getUserListAll(deptId)
          this.$refs['vFormRef'].setFieldValue('outDeptId', deptId)
          this.$refs['vFormRef'].setFieldValue('outDeptName', deptName)
          this.$refs['vFormRef'].setFieldValue('outUserId', nickId)
          this.$refs['vFormRef'].setFieldValue('outUserName', nickName)
          this.$refs['vFormRef'].setReadMode(false)
          /*添加的时候来源单号和出库来源是联动的*/
          // this.$refs['vFormRef'].disableWidgets('sourceCode')
        }
      })
    },
    async loadReFund(ids = []) {
      const { data: { list } } = await getRefundoutQuoteList({ ids })
      if (!!list.length) {
        // const res = await warehouseGetOutWarehouse(list)
        // const nextList = res.data || []
        const codes = uniqueArrByField(list, 'sourceCode')
        const idArr = uniqueArrByField(list, 'sourceId')
        this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
        this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
        this.$nextTick(() => {
          this.formValidate.detailedForm = list
        })
      }
    },
    async loadReview(ids = []) {
      const { data: { list } } = await pickingOutQuoteList({ ids })
      if (!!list.length) {
        const res = await warehouseGetOutWarehouse(list)
        const nextList = res.data || []
        const codes = uniqueArrByField(nextList, 'sourceCode')
        const idArr = uniqueArrByField(nextList, 'sourceId')
        this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
        this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
        this.$nextTick(() => {
          this.formValidate.detailedForm = nextList
        })
      }
    },
    async loadReceive(ids) {
      const { data: { list } } = await getOrderOutQuoteList({ ids })
      if (!!list.length) {
        const res = await warehouseGetOutWarehouse(list)
        const nextList = res.data || []
        const codes = uniqueArrByField(nextList, 'sourceCode')
        const idArr = uniqueArrByField(nextList, 'sourceId')
        this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
        this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
        this.$nextTick(() => {
          this.formValidate.detailedForm = nextList.map(item => ({ ...item, outNumA: item.outNum || 0 }))
        })
      }
    },
    async getOutQuoteList(ids = []) {
      const { data: { list } } = await getOutQuoteList({ ids: ids })
      if (!!list.length) {
        const res = await warehouseGetOutWarehouse(list)
        const nextList = res.data || []
        const codes = uniqueArrByField(nextList, 'sourceCode')
        const idArr = uniqueArrByField(nextList, 'sourceId')
        this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
        this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
        this.$nextTick(() => {
          this.formValidate.detailedForm = nextList
        })
      }

    },
    async handleOutQuoteList(ids = []) {
      const { data: { list } } = await handleOutQuoteList({ ids: ids })
      const codes = uniqueArrByField(list, 'sourceCode')
      const idArr = uniqueArrByField(list, 'sourceId')
      this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
      this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
      this.$nextTick(() => {
        // this.detailedForm = list
        this.formValidate.detailedForm = list
      })

    },
    async deliveryOutQuoteList(ids = []) {
      const { data: { list } } = await deliveryOutQuoteList({ ids: ids })
      if (!!list.length) {
        const res = await warehouseGetOutWarehouse(list)
        const nextList = res.data || []
        const codes = uniqueArrByField(nextList, 'sourceCode')
        const idArr = uniqueArrByField(nextList, 'sourceId')
        this.$refs['vFormRef'].setFieldValue('sourceCode', codes.join(','))
        this.$refs['vFormRef'].setFieldValue('sourceId', idArr.join(','))
        this.$nextTick(() => {
          this.formValidate.detailedForm = nextList
        })
      }

    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('outboundMaintenanceOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    async getDeptTreeData() {
      const res = await deptTree({ bizStatus: '1' })
      this.$refs['vFormRef'].getWidgetRef('outDeptId').loadOptions(res.data || [])
    },
    async getUserListAll(deptId) {
      const res = await userListAll({ deptId })
      this.$refs['vFormRef'].getWidgetRef('outUserId').loadOptions(res.data.list || [])
    },
   async MaRawBatchWhiListById(ids = []) {
      const {data: {list}} = await MaRawBatchWhiListById({ ids })
      this.isOrLendStatus = true;
      if(!!list.length) {
        const res = await warehouseGetOutWarehouse(list)
        const nextList = res.data || []
        this.$nextTick(() => {
          this.orderRow(nextList || []);
        })
      }
     
     
    },
    saleOrderOperateDetail() {
      const widgets = ['card1', 'card26996']
      this.loading = true
      if (this.queryType === 'update') {
        warehouseOrderViewDetail({
          ids: this.queryId.split(',')
        }).then(({ data }) => {
          this.$refs.vFormRef.hideWidgets(widgets)
          this.checkedShow = false
          // this.detailedForm = data
          this.fileList = !!data.fileList && !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
          this.formValidate.detailedForm = data.map(item => {
            return { ...item, outNumA: item.outNum || 0 }
          })
        }).finally(() => {
          this.loading = false
        })
      } else if (this.queryType === 'view') {
        warehouseOrderAllViewDetail(this.queryId)
          .then(({ data }) => {
            let showData = { ...data }
            if (showData.outDeptId) {
              this.getUserListAll(showData.outDeptId)
            } else {
              showData.outDeptId = undefined;
            }
            this.fileList = !!data.fileList && !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
            this.formData = Object.assign({}, this.formData, showData)
            this.$refs.vFormRef.setFormData(this.formData)
            // this.detailedForm = showData.detailList
            this.formValidate.detailedForm = showData.detailList
          })
      }
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'sourceCode') {
        const outSource = this.$refs['vFormRef'].getFieldValue('outSource')
        if (!outSource) {
          this.$modal.msgError('请先选择出库来源')
          return
        }
        // this.$refs.transferOrderRef.init(this.formValidate.detailedForm, outSource)
        this.$refs.choiceSource.init(this.formValidate.detailedForm, outSource)
      }
    },
    handleButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
    },
    selectChange(fieldName, newValue) {
      if (fieldName === 'outUserId') {
        if (newValue) {
          const optionLabel = this.$refs['vFormRef'].getWidgetRef('outUserId').optionLabel
          this.$refs['vFormRef'].setFieldValue('outUserName', optionLabel)
        } else {
          this.$refs['vFormRef'].setFieldValue('outUserName', '')
        }
      } else if (fieldName === 'outSource') {
        if (this.oldOutSourceValue === newValue) {
          this.oldOutSourceValue = newValue
          return
        }
        this.oldOutSourceValue = newValue  /*清空选中的数据*/
        // this.detailedForm = []
        this.formValidate.detailedForm = []
        this.$refs['vFormRef'].setFieldValue('sourceCode', '')
        this.$refs['vFormRef'].setFieldValue('sourceId', '')
        // if (['1'].includes(newValue)) {
        //   this.$refs['vFormRef'].disableWidgets('sourceCode')
        //   return
        // }
        // this.$refs['vFormRef'].enableWidgets('sourceCode')
        if (['4', '5', '6', '7', '9'].includes(newValue)) {
          this.isOrLendStatus = true
        } else {
          this.isOrLendStatus = false
        }
      }
      if (fieldName === 'sourceCode') {
        if (!newValue) {
          this.formValidate.detailedForm = []
        }
      }
    },
    newButton(buttonCode) {
      if (buttonCode === 'cancel') {
        this.cancel(this.queryName)
      } else if (buttonCode === 'save') {
        if (this.queryType === 'update') {
          if (!this.formValidate.detailedForm.length) {
            this.$modal.msgError('产品明细列表不能为空')
            return
          }
          if (this.formValidate.detailedForm.some(item => parseFloat(item.outNum) <= 0)) {
            this.$modal.msgError('本次出库数量不能为0')
            return
          }
          this.$refs.ruleForm.validate((valid) => {
            if (valid) {
              if (this.validateTotalNum()) {
                warehouseOrderUpdate([...this.formValidate.detailedForm]).then(({ success, message }) => {
                  if (success) {
                    this.$modal.msgSuccess(message)
                    this.cancel(this.queryName)
                  } else {
                    this.$modal.msgError(message)
                  }
                })
              }
            } else {
              this.$modal.msgError('表单验证失败')
            }
          })
        } else if (['create', 'outbound', 'receive'].includes(this.queryType)) {
          let formValid1, formValid2, formValid3
          if (!this.formValidate.detailedForm.length) {
            this.$modal.msgError('产品明细列表不能为空')
            return
          }
          if (this.formValidate.detailedForm.some(item => parseFloat(item.outNum) <= 0)) {
            this.$modal.msgError('本次出库数量不能为0')
            return
          }
          if (this.isOrLendStatus && this.queryType !== 'view' && this.formValidate.detailedForm.some(item => !item.warehouseId)) {
            this.$modal.msgError('产品明细列表出库仓库不能为空')
            return
          }
          this.$refs.ruleForm.validate((valid) => {
            formValid1 = valid
          })
          this.$refs.vFormRef.validateForm((valid) => {
            formValid2 = valid
          })
          formValid3 = this.validateTotalNum()  /*校验单据总数*/
          if (formValid1 && formValid2) {
            if (!formValid3) {
              return
            }
            this.$refs.vFormRef.getFormData().then(formData => {
              this.loading = true
              warehouseSaveOrder({
                ...this.formData, ...formData,
                id: this.queryType === 'outbound' ? null : this.queryId,
                detailList: this.formValidate.detailedForm,
                fileList: this.fileList
              }).then(({ success, message }) => {
                if (success) {
                  this.$modal.msgSuccess(message)
                  this.cancel(this.queryName)
                } else {
                  this.$modal.msgError(message)
                }
              }).finally(() => {
                this.loading = false
              })
            }).catch(err => {
              this.$modal.msgError('表单数据校验失败');
            })
          } else {
            this.$modal.msgError('表单验证失败')
          }
        }
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
    cancel(name) {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name })
    },
    // 部门树选择
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'outDeptId') {
        this.$refs['vFormRef'].setFieldValue('outUserId', '')
        this.$refs['vFormRef'].setFieldValue('outUserName', '')
        this.$refs.vFormRef.setFieldValue('outDeptName', node.deptName)
        this.getUserListAll(node.id)
      }
    },
    treeSelectInput(vm, newVal) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'outUserId') {
        if (!newVal) {
          this.$refs['vFormRef'].setFieldValue('outUserId', '')
          this.$refs['vFormRef'].setFieldValue('outUserName', '')
          this.$refs['vFormRef'].getWidgetRef('outUserId').loadOptions([])
        }
      }
    },
    checkoutStatus(flag) {
      const widgets = ['outDeptId', 'outUserId', 'comments', 'fileList', 'outCode']
      if (flag) {
        this.$refs.vFormRef.hideWidgets(widgets)
      } else {
        this.$refs.vFormRef.showWidgets(widgets)
      }
    },
    choiceSourceSelected(rows){
      if(rows.length > 0 && !rows[0].warehouseId){
        warehouseGetOutWarehouse(rows).then(({ data }) => {
          this.orderRow(data)
        })
      }else{
        this.orderRow(rows)
      }
    },
    orderRow(rows) {
      const detailedForm = [...this.formValidate.detailedForm, ...rows]
      this.formValidate.detailedForm = JSON.parse(JSON.stringify(detailedForm))
      let sourceAllCode = detailedForm.map(item => item.sourceCode)
      let _sourceAllCode = Array.from(new Set(sourceAllCode))
      let _sourceAllCodeStr = _sourceAllCode.length > 1 ? _sourceAllCode.join(',') : _sourceAllCode[0]
      this.$refs['vFormRef'].setFieldValue('sourceCode', _sourceAllCodeStr)
      let sourceAllId = detailedForm.map(item => item.sourceId)
      let _sourceAllId = Array.from(new Set(sourceAllId))
      let _sourceAllIdStr = _sourceAllId.length > 1 ? _sourceAllId.join(',') : _sourceAllId[0]
      this.$refs['vFormRef'].setFieldValue('sourceId', _sourceAllIdStr)
    },
    selectable(row, index) {
      const selectRowIdGroup = this.selectRow.map(item => item.matlCode)
      return !selectRowIdGroup.includes(row.matlCode)
    },
    deleteRow(index) {
      // this.detailedForm.splice(index, 1)
      this.formValidate.detailedForm = this.formValidate.detailedForm.filter((item, idx) => idx != index)
      let sourceAllCode = this.formValidate.detailedForm.map(item => item.sourceCode)
      let _sourceAllCode = Array.from(new Set(sourceAllCode))
      let _sourceAllCodeStr = _sourceAllCode.length > 1 ? _sourceAllCode.join(',') : _sourceAllCode[0]
      this.$refs['vFormRef'].setFieldValue('sourceCode', _sourceAllCodeStr)
      let sourceAllId = this.formValidate.detailedForm.map(item => item.sourceId)
      let _sourceAllId = Array.from(new Set(sourceAllId))
      let _sourceAllIdStr = _sourceAllId.length > 1 ? _sourceAllId.join(',') : _sourceAllId[0]
      this.$refs['vFormRef'].setFieldValue('sourceId', _sourceAllIdStr)
    },
    copyRow(row, index) {
      this.formValidate.detailedForm.splice(index, 0, row)
      this.$set(this.formValidate.detailedForm, index + 1, { ...row, outNum: '' })
      // this.formValidate.detailedForm = this.detailedForm
    },
    getWarehouseName(obj, row, index) {
      row.inventoryNum = obj.inventoryNum;
      row.warehouseId = obj.id;
      row.warehouseName = obj.name;
      row.warehouseCode = obj.code;
      row.detailMode = obj.warehouseMode;
      row.warehouseMode = obj.warehouseMode;
    },
    getRowMax(row) {
      // if(this.queryType === 'update') {
      //   return row.originalNum - row.totalOutNum + row.outNumA
      // }
      return row.maxOutNum //Math.min(Number(row.maxOutNum), Number(row.inventoryNum))
    },
    validateTotalNum() {
      if (!this.isOrLendStatus) {
        return true
      }
      const obj = {}
      this.formValidate.detailedForm.forEach((item) => {
        const on = Number(item.outNum)
        if (obj[item.matlCode]) {
          obj.count = obj.count + on
        } else {
          obj[item.matlCode] = { name: item.matlName, code: item.matlCode, maxOutNum: item.maxOutNum, count: on }
        }
      })
      const arr = Object.values(obj)
      let flag = true
      for (let i = 0; i < arr.length; i++) {
        const { count, maxOutNum, name } = arr[i]
        if (count > maxOutNum) {
          this.$modal.msgError(`物料${name}的出库数量超过单据上限`)
          flag = false
          break;
        }
      }
      return flag
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
