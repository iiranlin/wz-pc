<template>
  <div class="app-container container_flex">
    <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
      @newButton="newButton"></button-top>
    <div class="container_flex_form">

      <el-switch v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
      </el-switch>
      <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" :class="{'formRender_view': queryType === 'view'}"
        @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @buttonClick="handleButtonClick"
        @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect">
        <template slot="top" v-if="queryType === 'view'">
          <statistics :contract="formData"></statistics>
        </template>
        <template slot="fileList">
          <div style="display: flex;flex-direction: column;">
            <attachmentTable ref="attachmentTable" businessType="08" :queryType="queryType" v-model="fileList">
            </attachmentTable>
          </div>
        </template>
        <template slot="pay">
          <div class="pay" v-if="queryType !== 'view'">
            <el-button @click="addPayData" round plain type="primary" class="ml-20">新增收付费计划</el-button>
          </div>
          <div>
            <el-form :model="payFormValidate" ref="tableForm" class="payForm">
              <el-table border :data="payFormValidate.tableItem" max-height="400px"
                class="mt-20 saleOrderOperateEltable">
                <el-table-column type="index" width="50" align="left" label="序号" />
                <el-table-column prop="payAmount" align="left" min-width="200">
                  <template slot="header">
                    <span style="color: red">*</span>
                    <span>金额</span>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="'tableItem.' + scope.$index + '.payAmount'"
                      :rules="[{ required: true, message: '请输入金额', trigger: ['blur', 'change'] }]">
                      <span v-if="queryType == 'view'">{{ $textMethod.money(scope.row.payAmount) }}</span>
                      <el-input-number :precision="2" controls-position="right" :min="0.01" :max="999999999999" v-else
                        v-model.trim="scope.row.payAmount" @change="totalPay(scope, 'payAmount')"></el-input-number>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column align="center" prop="payDate" min-width="200">
                  <template slot="header">
                    <span style="color: red">*</span>
                    <span>时间</span>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="'tableItem.' + scope.$index + '.payDate'"
                      :rules="[{ required: true, message: '请选择时间', trigger: ['change', 'blur'] }]">
                      <span v-if="queryType == 'view'">{{ parseTime(scope.row.payDate, '{y}-{m}-{d}') }}</span>
                      <el-date-picker value-format="timestamp" v-else v-model="scope.row.payDate" type="date"
                        placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column align="left" prop="payPer" min-width="120">
                  <template slot="header">
                    <span style="color: red">*</span>
                    <span>比例(%)</span>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="'tableItem.' + scope.$index + '.payPer'"
                      :rules="[{ required: true, message: '请输入比例', trigger: 'blur' }]">
                      <span v-if="queryType == 'view'">{{ Number(scope.row.payPer) }}%</span>
                      <el-input v-number-input.float="2" v-else v-model="scope.row.payPer" @change="totalPay(scope, 'payPer')">
                        <span slot="suffix">%</span>
                      </el-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="备注" align="left" prop="notes" min-width="250">
                  <template slot="header">
                    <span>备注</span>
                  </template>
                  <template slot-scope="{ row }">
                    <span v-if="queryType !== 'view'" class="brush-content">
                      <el-input type="textarea" v-model="row.notes" maxlength="400"></el-input>
                    </span>
                    <span v-else>{{ row.notes }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="queryType !== 'view'" label="操作" align="center" fixed="right">
                  <template slot-scope="scope">
                    <i class="el-icon-delete" style="color:#1890ff;cursor: pointer"
                      @click="deletePay(scope.$index)"></i>
                  </template>
                </el-table-column>
              </el-table>
            </el-form>
          </div>
        </template>
        <template slot="detailed">
          <div class="detailed">
            <button-top v-if="queryType !== 'view'" :buttonTopData="handleDetailedButtonTop" @uploadOnSuccess="uploadOnSuccess"
              @uploadOnError="uploadOnError" @customUpload="customUpload"
              :buttonShow="handleDetailedButtonShow" @newButton="HandleDetailedNewButton"></button-top>
          </div>
          <div>
            <el-form :model="detailedFormValidate" ref="detailedForm" class="payForm">
              <el-table border :data="detailedFormValidate.tableItem" max-height="400px" @selection-change="(data) => selectData = data"
                class="mt-20 saleOrderOperateEltable">
                <el-table-column align="center" key="selectable" type="selection" width="50" fixed="left" v-if="queryType == 'create' || queryType == 'update'" />
                <el-table-column type="index" width="50" align="left" label="序号" />
                <el-table-column label="物资编号" align="left" prop="matlCode" min-width="190"></el-table-column>
                <el-table-column label="物资名称" align="left" prop="matlName" min-width="190"></el-table-column>
                <el-table-column label="规格型号" align="left" prop="matlType" min-width="190"></el-table-column>
                <el-table-column label="单位" align="left" prop="matlUnit">
                  <template slot-scope="{row}">
                    <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                  </template>
                </el-table-column>
                <el-table-column align="left" prop="num" min-width="170">
                  <template slot="header">
                    <span style="color: red">*</span>
                    <span>数量</span>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="'tableItem.' + scope.$index + '.num'"
                      :rules="[{ required: true, message: '请输入数量', trigger: ['change', 'blur']  }]">
                      <span v-if="queryType == 'view'">{{ scope.row.num }}</span>
                      <el-input v-number-input.float="2"
                        @blur="handleBlurInput('num', scope.row, 'tableItem.' + scope.$index + '.num', scope.$index)"
                        v-else v-model="scope.row.num"></el-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column align="left" prop="price" min-width="150">
                  <template slot="header">
                    <span>单价(不含税)</span>
                  </template>
                  <template slot-scope="scope">
                    <!-- <el-form-item :prop="'tableItem.' + scope.$index + '.price'"
                      :rules="[{ required: true, message: '请输入单价(不含税，单位：元)',trigger: ['change', 'blur']  }]">
                      <span v-if="queryType == 'view'">{{ $textMethod.money(scope.row.price) }}</span>
                      <money-input v-else v-model="scope.row.price" @blur="handleBlurInput('price', scope.row, 'tableItem.' + scope.$index + '.price', scope.$index)"></money-input>
                    </el-form-item> -->
                    <span>{{ $textMethod.money(scope.row.price) }}</span>
                  </template>
                </el-table-column>
                <el-table-column align="left" prop="taxPrice" min-width="150">
                  <template slot="header">
                    <span style="color: red">*</span>
                    <span>单价（含税）</span>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="'tableItem.' + scope.$index + '.taxPrice'"
                      :rules="[{ required: true, message: '请输入单价(不含税，单位：元)',trigger: ['change', 'blur']  }]">
                      <span v-if="queryType == 'view'">{{ $textMethod.money(scope.row.taxPrice) }}</span>
                      <money-input v-else v-model="scope.row.taxPrice" @blur="handleBlurInput('taxPrice', scope.row, 'tableItem.' + scope.$index + '.taxPrice', scope.$index)"></money-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column align="left" prop="taxPre" min-width="170">
                  <template slot="header">
                    <span style="color: red">*</span>
                    <span>税率(%)</span>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item :prop="'tableItem.' + scope.$index + '.taxPre'"
                      :rules="[{ required: true, message: '请选择税率', trigger: ['change', 'blur'] }, {}]">
                      <span v-if="queryType == 'view'">{{ scope.row.taxPre }}</span>
                      <el-select v-columnFormat="{
                        index: scope.$index,
                        prop: 'taxPre',
                        list: detailedFormValidate.tableItem
                      }" @change="(value) => taxrateChange(value, scope.row, scope.$index)" v-else
                        v-model="scope.row.taxPre">
                        <el-option value="13" label="13"></el-option>
                        <el-option value="10" label="10"></el-option>
                        <el-option value="6" label="6"></el-option>
                        <el-option value="3" label="3"></el-option>
                        <el-option value="0" label="0"></el-option>
                        <el-option value="9" label="9"></el-option>
                      </el-select>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="总金额(不含税)" align="left" prop="amount" min-width="190">
                  <template slot-scope="scope">
                    <!-- <el-form-item :prop="'tableItem.' + scope.$index + '.amount'"
                      > -->
                      <span>{{ $textMethod.money(Number(scope.row.amount || 0).toFixed(2)) }}</span>
                      <!-- <money-input v-else v-model="scope.row.amount" @blur="handleBlurInput('amount', scope.row, 'tableItem.' + scope.$index + '.amount', scope.$index)"></money-input> -->
                    <!-- </el-form-item> -->
                  </template>
                </el-table-column>
                <el-table-column label="总金额(含税)" align="left" prop="amountTax" min-width="190">
                  <template slot-scope="scope">
                    <el-form-item :prop="'tableItem.' + scope.$index + '.amountTax'"
                     >
                      <span v-if="queryType == 'view'">{{ $textMethod.money(Number(scope.row.amountTax).toFixed(2)) }}</span>
                      <money-input v-else v-model="scope.row.amountTax" @blur="handleBlurInput('amountTax', scope.row, 'tableItem.' + scope.$index + '.amountTax', scope.$index)"></money-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column v-if="queryType !== 'view'" label="操作" align="center" fixed="right">
                  <template slot-scope="scope">
                    <i class="el-icon-delete" style="color:#1890ff;cursor: pointer"
                      @click="deleteDetailed(scope.$index)"></i>
                  </template>
                </el-table-column>
              </el-table>
            </el-form>
          </div>
        </template>
      </VFormRender>
    </div>
    <choice-material ref="materialRef" @choiceMaterialClick="selectMaterial"></choice-material>
    <custom ref="custom" :singleMode="true" @selectCustom="selectCustom"></custom>
    <supplier ref="supplier" @selectSupplier="selectSupplier"></supplier>
    <toBeReviewed ref="toBereview" />
    <selectProject ref="selectProject" :propsFormData="propsFormDataProject" singleMode typeUrl="projectContactQuotePageList" @selections="selections" />
  </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import choiceMaterial from '@/views/components/choice-material'
import Custom from './custom.vue'
import Supplier from './supplier.vue'
import { deptTree,getUnitTree } from '@/api/system/dept'
import indexMixin from '@/views/mixins'
import { PuCtCreate, PuCtModify, PuCtDetail, getPuSuSubmit, PuCtSaveSubmit, CtImportExcel } from '@/api/projectManagement/contractManagement'
import attachmentTable from '@/views/components/attachmentTable'
import { generateUUID } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import { getUserInfo } from '@/utils/user-info'
import { minioDownload } from '@/api/minio'
import selectProject from "@/views/components/selectProject"
import statistics from './statistics.vue'
export default {
  name: 'contractManagementOperate',
  dicts: ['MeasureUnit'],
  mixins: [indexMixin],
  components: {
    Supplier,
    choiceMaterial,
    Custom,
    attachmentTable,
    toBeReviewed,
    VFormRender,
    selectProject,
    statistics
  },
  data() {
    return {
      loading: false,
      type: '',
      queryId: '',
      queryName: '',
      queryType: '',
      formJson: {},
      formData: {
        totalNum: 0,
        ctSumCount: 0,
        ctSumCountTax: 0,
        resDeptName: '',
        taxPer: ''
      },
      // 菜单按钮、字段等数据
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
        { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
        { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update' }
      ],
      queryAuditArr: null,
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: '01'
      },
      payFormValidate: {  /*只处理表单的校验*/
        tableItem: []
      },
      detailedFormValidate: {
        tableItem: []
      },
      handleDetailedButtonTop: [
        { buttonName: '新增明细', buttonCode: 'addDetailed' },
        { buttonName: '模版下载', buttonCode: 'downloadtemplate' },
        { buttonName: '导入', buttonCode: 'import', type: 'view' },
        { buttonName: '删除', buttonCode: 'delete', type: 'view' }
      ],
      // currentSelectRow: [],
      deptArr: [],
      fileList: [],
      checked: false,
      isQuery: '',
      userInfo: getUserInfo(),
      uploadUrl: CtImportExcel,
      propsFormDataProject: {
        unitId: ''
      },
      selectData: []
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
      const arrId = ['amountType', 'resWorker', 'resPhone', 'qaRequire', 'mysideName', 'grid31587', 'ctCode', 'total2','defaultResponsibility','conflictResolveMethod']
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
      if(item.buttonCode === 'saveSubmit' && this.formData.isProject === '1' && !this.formData.projectId){
        return false
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
      let { type, name, id, auditArr, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
      this.queryType = type || 'create'
      this.queryId = id || ''
      this.queryName = name || 'contractManagement'
      this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
      this.isQuery = isQuery
     
      this.$nextTick(async () => {
       
        /*默认禁用销售负责人*/
        await this.formFillInPage()
        
        const sciDom = this.$refs.vFormRef.getWidgetRef("statictext69381").$el;
        sciDom.style.height= '38px'
        sciDom.style['line-height']= '38px'
        this.$refs['vFormRef'].resetForm()
        await this.getDeptData()
        await this.getUnitTree()
        this.$refs['vFormRef'].disableWidgets('saleId')
        if (this.queryType === 'update') {
          this.$refs['vFormRef'].setReadMode(false)
          this.saleOrderOperateDetail()
          // this.$refs['vFormRef'].enableWidgets('total2')
        } else if (this.queryType === 'view') {
          this.$refs['vFormRef'].showWidgets(['grid32850']);
          this.$refs['vFormRef'].setReadMode(true)
          this.saleOrderOperateDetail()
          const FONT_COLOR = '#6224ff'
          const DOM = ['label[for="ctType"]', 'label[for="payCurrency"]', 'label[for="amountType"]', 'label[for="total2"]', 'label[for="bizBond"]']
          for(let i=0; i< DOM.length; i++) {
            const dom = document.querySelector(DOM[i]).nextSibling;
            dom.style.color = FONT_COLOR
          }
        } else {
          const { deptId, deptName } = this.userInfo
          this.initUnitInfo()
          this.$refs.vFormRef.setFieldValue("resDeptId", deptId);
          this.formData.resDeptName = deptName
          if (this.$refs.vFormRef.getFieldValue('payCurrency') === '001') {
            this.$refs.vFormRef.findWidgetAndSetHidden('taxPer', true)
            this.$refs.vFormRef.setFormData({
              taxPer: 0
            })
          }
          this.$refs['vFormRef'].setReadMode(false)
         
          
        }
      })
    },
    formFillInPage() {
      return new Promise((resolve) => {
        formFillInPage('contractManagementOperate').then(res => {
          this.$refs['vFormRef'].setFormJson(res.data)
          resolve(true)
        })
      })
    },
    saleOrderOperateDetail() {
      this.loading = true
      PuCtDetail(this.queryId).then(({ data }) => {
        let showData = { ...data }
        this.formData = Object.assign({}, this.formData, showData)
        this.$set(this.formData, 'total2', this.formData.ctSumCountTax)
        this.$refs.vFormRef.setFormData(this.formData)
        this.payFormValidate.tableItem = showData.payPlanList
        this.detailedFormValidate.tableItem = !!showData.rawList.length ? showData.rawList.map(f => ({ ...f, uid: generateUUID() })) : []
        // this.currentSelectRow = showData.rawList
        this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
        this.totalValue()
        if (showData.payCurrency === '001') {
          this.$refs.vFormRef.findWidgetAndSetHidden('taxPer', true)
        }
        if (showData.isProject == '1' ) {
          this.$refs.vFormRef.showWidgets('card61378');
        } else {
          this.$refs.vFormRef.hideWidgets('card61378');
        }
        this.totalPay()
      }).finally(() => {
        this.loading = false
      })
    },
    handleAppendButtonClick(vm) {
      let { field: { options: { name } } } = vm || {}
      if (name === 'relativeName') {  /*点击相对方名称*/
        const ctType = this.$refs.vFormRef.getFieldValue('ctType')
        const relativeCode = this.$refs.vFormRef.getFieldValue('relativeCode')
        if (ctType === '1') {
          const relativeId = this.$refs.vFormRef.getFieldValue('relativeId')
          this.$refs.supplier.init(relativeId)
        } else {
         
          this.$refs.custom.init(relativeCode)
        }
        return
      }
      if (name === 'projectCode') {  /*点击项目编码*/
        const unitId = this.$refs.vFormRef.getFieldValue("unitId");
        if(!unitId){
          this.$modal.msgError('请先选择所属组织')
          return
        }
        this.propsFormDataProject.unitId = unitId
        const pId = this.$refs.vFormRef.getFieldValue("projectId");
        this.$refs.selectProject.init(pId)
        return
      }
    },
    selectCustom(row) {
      this.$refs.vFormRef.setFormData({
        relativeName: row.cuName,
        relativeCode: row.cuCode,
        relativeId: row.id
      })
    },
    selectSupplier(row) {
      this.$refs.vFormRef.setFormData({
        relativeName: row.suName,
        relativeCode: row.suCode,
        relativeId: row.suId
      })
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
        this.$refs['vFormRef'].hideWidgets(['grid32850']);
        this.$refs['vFormRef'].setReadMode(false)
      } else if (buttonCode === 'saveSubmit') {
        this.handleSave(buttonCode)
      } else if (buttonCode === 'pass') {
        this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName)
      } else if (buttonCode === 'reject') {
        this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName)
      }
    },
    handleSave(buttonCode) {
      try {
        let formValid1, formValid2, formValid3
        this.$refs.vFormRef.validateForm((validate) => {
          formValid1 = validate
        })
        this.$refs.tableForm.validate((valid) => {
          formValid2 = valid
        })
        this.$refs.detailedForm.validate((valid) => {
          formValid3 = valid
        })
        if (!this.detailedFormValidate.tableItem.length) {
          this.$modal.msgError('合同明细不能为空')
          return
        }
        if (formValid1 && formValid2 && formValid3) {
          this.$refs.vFormRef.getFormData().then(formData => {
            if(this.payFormValidate.tableItem.length){
              let payAmountTotal = this.$refs['vFormRef'].getFieldValue('payAmountTotal'), payPerTotal = this.$refs['vFormRef'].getFieldValue('payPerTotal')
              if(Number((this.formData.ctSumCountTax).toFixed(2)) != Number(payAmountTotal)){
                this.$modal.msgError('收/付费计划【金额合计】与【合同总金额】不一样');
                return
              }
              if(Number(payPerTotal) != 100){
                this.$modal.msgError('收/付费计划【比例合计】必须是100%');
                return
              }
            }
            let type = 'create'
            let api = PuCtCreate
            if (this.queryType == 'update') {
              type = 'modify'
              api = PuCtModify
            }
            this.loading = true
            const param = {
              ...this.formData, ...formData,
              id: this.queryId,
              payPlanList: this.payFormValidate.tableItem,
              rawList: this.detailedFormValidate.tableItem,
              fileList: this.fileList
            }
            const t = this.detailedFormValidate.tableItem.reduce((a, b) => {
              return Number(b.amountTax) + Number(a)
            }, 0).toFixed(2)
            //判断合同总金额是否一致
            if(!param.total2){
              param.total2 = t;
            }else{
              if(Number(param.total2) != t) {
                this.$modal.msgError('总金额合计不一致');
                return
              }
            }
            const saveObj = {
              'save': () => { this.saveOrder(api, param) },
              'saveSubmit': () => {
                this.$reviewerDialog({
                  type: ACTIVITI_ASSUGNEE.PU_CT,
                  multiple: false,
                  success: (assignee) => {
                    this.saveOrder(PuCtSaveSubmit, param, assignee)
                  }
                })
              }
            }
            saveObj[buttonCode] && saveObj[buttonCode]()
          })
        }else {
          this.$modal.msgError('表单数据校验失败');
        }
      } catch (err) {
        console.error(err)
      }
    },
    async saveOrder(url, param, assignee) {
      if (!this.resOk) {
        const res = await url({ ...param, assignee })
        res.success && this.$modal.msgSuccess(`${res.message}`)
        this.resOk = true
        this.cancel(this.queryName)
      }
    },
    cancel(name) {
      // 关闭当前tabs
      this.$tab.closeOpenPage({ name })
    },
    selectChange(name, node) {
      if(name === 'isProject'){
        this.formData.isProject = node
        if (node == '1' ) {
          this.$refs.vFormRef.showWidgets('card61378');
        } else {
          this.$refs.vFormRef.hideWidgets('card61378');
          this.$refs.vFormRef.setFieldValue("projectCode", '');
          this.$refs.vFormRef.setFieldValue("projectName", '');
          this.$refs.vFormRef.setFieldValue("projectId", '');
        }
        return
      }
      if (name === 'ctType') {
        if (node == '1' || node == '2') {
          this.$refs.vFormRef.setFieldValue("payMethod", node == '1' ? '1' : '0');
          this.$refs.vFormRef.disableWidgets('payMethod');
        } else {
          this.$refs.vFormRef.enableWidgets('payMethod');
        }
      }
      if (['ctType', 'relativeName'].includes(name)) {
        this.$refs.vFormRef.setFormData({
          relativeName: '',
          relativeCode: '',
          relativeId: ''
        })
      }
      if (name === 'resDeptId') {
        if (node !== '') {
          this.formData.resDeptName = this.deptArr.find(item => item.id === node).deptName || ''
        }
      } else if (name === 'payCurrency') {
        if (node === '001') {
          this.$refs.vFormRef.findWidgetAndSetHidden('taxPer', true)
          this.$refs.vFormRef.setFormData({
            taxPer: 0
          })
        } else {
          this.$refs.vFormRef.setFormData({
            taxPer: ''
          })
          this.$refs.vFormRef.findWidgetAndSetHidden('taxPer', false)
        }
      }
    },
    treeSelectInput() {

    },
    // tree组件选择事件
    async treeSelectSelect(vm, node) {
      let {
        field: {
          options: { name }
        }
      } = vm || {}
      if (name === 'unitId') {
        this.$refs.vFormRef.setFieldValue('unitName', node.deptName);

        this.$refs['vFormRef'].setFieldValue('projectId', '')
        this.$refs['vFormRef'].setFieldValue('projectCode', '')
        this.$refs['vFormRef'].setFieldValue('projectName', '')
      }
    },
    /*选择项目信息*/
    selections(row) {
      this.$refs['vFormRef'].setFormData({ projectId: row.id, projectCode: row.projectCode, projectName: row.projectName });
    },
    //提交
    submitList() {
      const ids = this.formData.id /*去重*/
      const data = {
        businessId: ids,
        businessType: ACTIVITI_ASSUGNEE.SA_XSD
      }
      getPuSuSubmit({
        ...data
      }).then(res => {
        if (res.success) {
          this.$modal.msgSuccess('提交成功')
          this.cancel(this.queryName)
        } else {
          this.$modal.msgError(res.message)
        }
      })
    },
    addPayData() {
      const ctSumCountTax = this.$refs['vFormRef'].getFieldValue('ctSumCountTax')
      if(!ctSumCountTax || Number(ctSumCountTax) == 0){
        this.$modal.msgError('请先选择合同明细且合同总金额不等于0')
        return
      }
      const payAmountTotal = this.$refs['vFormRef'].getFieldValue('payAmountTotal')
      let payAmount = 0.01
      if(ctSumCountTax > payAmountTotal){
        payAmount = ctSumCountTax - payAmountTotal
      }
      const payPer = (((payAmount || 0) / (ctSumCountTax || 0))*100).toFixed(2)
      this.payFormValidate.tableItem.push({
        payAmount: payAmount,  /* 金额 */
        payDate: '',    /*时间*/
        payPer,     /*比例*/
        notes: ''      /*备注*/
      })
      this.totalPay()
    },
    handleDetailedButtonShow() {
      return true
    },
    HandleDetailedNewButton(buttonCode) {
      if (buttonCode === 'addDetailed') {
        this.$refs.materialRef.init(null, [], this.detailedFormValidate.tableItem)
        return
      }
      if (buttonCode === 'downloadtemplate') {
        this.$download.fileUrl(`${minioDownload}?filePath=${encodeURI('templates/合同明细模板.xls')}&fileName=${encodeURI('合同明细模板.xls')}`, null, 'get');
        return
      }
      if(buttonCode === 'delete'){
        if (this.selectData.length > 0) {
          this.$modal.confirm('您确定要删除吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let newData = this.detailedFormValidate.tableItem.filter((a) => !this.selectData.some((b) => a.uid === b.uid));
            this.detailedFormValidate.tableItem = newData;
            this.totalPay()
          })
        } else {
          this.$modal.msgError('请选择数据')
        }
        return
      }
    },
    selectMaterial(row) {
      row = row.map(item => { return Object.assign({}, item, {uid: generateUUID(), taxPre: '13'})})
      // this.currentSelectRow = [...this.currentSelectRow, ...row]
      this.detailedFormValidate.tableItem = [...this.detailedFormValidate.tableItem, ...row]
      // this.detailedFormValidate.tableItem = this.detailedFormValidate.tableItem.map(item => {
      //   //item.taxPre = '13'
      //   this.$set(item, 'taxPre', )  /*不能直接赋值丢失响应式*/
      //   return item
      // })
    },
    // 含税总金额
    handleAmountTaxBlurInput(field, row, validateKey, index) {
       const reg = /^[1-9]\d*$/
      const regPrice = /^\d+(\.\d{1,2})?$/
      if(field === 'amountTax' && row[field] && regPrice.test(Number(row[field]))) {
        row[field] = Number(row[field]).toFixed(2)
      }

    },
    handleBlurInput(field, row, validateKey, index) {
      const reg = /^[1-9]\d*$/
      const regPrice = /^\d+(\.\d{1,2})?$/
      if (field !== 'taxPrice' && row[field] && reg.test(Number(row[field]))) {
        row[field] = Number(row[field]).toFixed(2)
      } else if ((field === 'taxPrice' ||  field === 'amountTax') && row[field] && regPrice.test(Number(row[field]))) {
        row[field] = Number(row[field]).toFixed(2)
      } else {
        this.$set(row, field, '')
        setTimeout(() => {
          this.$refs.detailedForm.validateField(validateKey)
        })
      }
      this.countPrice(row, index, field)
    },
    deletePay(index) {
      this.payFormValidate.tableItem.splice(index, 1)
      this.totalPay()
    },
    deleteDetailed(index) {
      this.detailedFormValidate.tableItem.splice(index, 1)
      /*注意:新增的时候this.currentSelectRow数组是0,需要手动删除下选中的数据,修改不能执行,会多删除一条数据*/
      // if (this.queryType === 'create') {
      //   this.currentSelectRow.splice(index, 1)
      // }
      //this.currentSelectRow.splice(index, 1)
      this.totalValue()
    },
    countPrice(row, index, field) {
      if(field === 'num' || field === 'taxPrice' || field === 'taxPre'){
        row = this.amountAmountTaxTotal(row)
      }
     
      if(field === 'amountTax'){
        row = this.amountTaxTotal(row)
      }
      this.$set(this.detailedFormValidate.tableItem, index, row)
      this.totalValue(row)
    },
    amountTotal (row) {
      let num = Number(row.num || 0)
      let amount = Number(row.amount || 0)
      let taxPre = Number(row.taxPre || 0)
      row.price = num == 0 ? 0 : (amount / num).toFixed(2)
      row.amountTax = (amount * (1 + taxPre / 100)).toFixed(2)
      return row
    },
    amountTaxTotal (row) {
      let num = Number(row.num || 0)
      let amountTax = Number(row.amountTax || 0)
      let taxPre = Number(row.taxPre || 0)
      row.amount = ((amountTax * 100) / (100 + taxPre)).toFixed(2)
      row.taxPrice = (amountTax / num).toFixed(2)
      row.price =  ((amountTax * 100) / (100 + taxPre) / num).toFixed(2)
      return row
    },
    amountAmountTaxTotal (row) {
      let num = Number(row.num || 0)
      let taxPrice = Number(row.taxPrice || 0) // 税价
      let taxPre = Number(row.taxPre || 0) // 税率

      row.amountTax = ((taxPrice) * (num)).toFixed(2)
      row.amount = ((taxPrice * num * 100) / (100 + taxPre)).toFixed(2)
      row.price = ((taxPrice * num * 100) / (100 + taxPre) / num).toFixed(2)
     
     
      return row
    },
    taxrateChange(value, row, index) {
      row.taxPre = value
      this.$set(row, 'taxPre', value)
      if (row.num && row.price) {
        this.countPrice(row, index, 'taxPre')
      }
    },
    totalValue() {
      this.formData.totalNum = 0
      this.formData.ctSumCount = 0
      this.formData.ctSumCountTax = 0
      this.detailedFormValidate.tableItem.forEach(item => {
        this.formData.totalNum += Number(item.num || 0)
        this.formData.ctSumCount += Number(item.amount || 0)
        this.formData.ctSumCountTax += Number(item.amountTax || 0)
      })
      this.$refs.vFormRef.setFormData({
        totalNum: this.formData.totalNum,
        ctSumCount: (this.formData.ctSumCount).toFixed(2),
        ctSumCountTax: (this.formData.ctSumCountTax).toFixed(2),
        // total2: (this.formData.ctSumCountTax).toFixed(2)
      })
      if(!this.formData.ctSumCountTax || Number((this.formData.ctSumCountTax).toFixed(2)) == 0){
        this.payFormValidate.tableItem = []
        this.$refs.vFormRef.setFieldValue('payAmountTotal', 0)
        this.$refs.vFormRef.setFieldValue('payPerTotal', 0)
      }
    },
    getDeptData() {
      deptTree({ status: 0 }).then(res => {
        if (res.success) {
          this.$nextTick(() => {
            this.deptArr = res.data[0].children
            this.$refs['vFormRef'].getWidgetRef('resDeptId').loadOptions(res.data[0].children || [])
          })
        } else {
          this.$modal.msgError(res.message)
        }
      })
    },
    async getUnitTree() {
      const res = await getUnitTree({ status: 0 })
      this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
    },
    totalPay (scope, code) {
      const ctSumCountTax = this.$refs['vFormRef'].getFieldValue('ctSumCountTax');
      if(code === 'payAmount'){
        const {payAmount} = scope.row;
        scope.row.payPer = (((payAmount || 0) / (ctSumCountTax || 0))*100).toFixed(2)
      }
      if(code === 'payPer'){
        const {payPer} = scope.row;
        scope.row.payAmount = ((ctSumCountTax || 0) * ((payPer || 0)/100)).toFixed(2)
      }
      let payAmountTotal = 0, payPerTotal = 0
      this.payFormValidate.tableItem.forEach(item => {
        payAmountTotal += Number(item.payAmount || 0)
        payPerTotal += Number(item.payPer || 0)
      })
      this.$refs.vFormRef.setFieldValue('payAmountTotal', (payAmountTotal).toFixed(2))
      this.$refs.vFormRef.setFieldValue('payPerTotal', (payPerTotal).toFixed(2))
    },
    uploadOnSuccess(code, data, message) {
      if(code === 0){
        data.dataList = data.dataList.map(item => {
          return {...item, uid: generateUUID()}
        })
        data.dataList.forEach((item)=>{
          let index = this.detailedFormValidate.tableItem.findIndex(e=>
            e.matlCode == item.matlCode
          )
          if(index>-1){
            this.$set(this.detailedFormValidate.tableItem, index, item)
          }else{
            this.detailedFormValidate.tableItem.push(item)
          }
        })
        this.totalValue()
        if(data.msg){
          this.$modal.alertWarning(data.msg, 'alertWarningClass')
        }else{
          this.$modal.msgSuccess(message)
        }
      }else{
        this.$modal.msgError('导入失败')
      }
    },
    uploadOnError(err, file, fileList) {
      this.$modal.msgError('导入失败')
    },
    customUpload (option) {
      if(option.file){
        this.$download.fileUpload(this.uploadUrl, {file: option.file}).then(({code, data, message}) => {
          this.uploadOnSuccess(code, data, message)
        })
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.ml-20 {
  margin-left: 20px !important;
}

.mt-20 {
  margin-top: 20px !important;
}
</style>
