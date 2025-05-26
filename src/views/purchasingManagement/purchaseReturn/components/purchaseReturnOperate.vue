<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">

            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
                active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" @selectChange="selectChange" :class="{'formRender_view': queryType === 'view'}"
                @appendButtonClick="handleAppendButtonClick" @buttonClick="handleButtonClick" @formChange="formChange"
                @treeSelectSelect="treeSelectSelect">
                <template slot="design_p1">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />单号信息</p>
                </template>
                <template slot="design_p2">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
                </template>
                <template slot="design_p3">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="供应商信息" />供应商信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="18" :queryType="queryType"
                            v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <template slot="detail">
                    <div class="detailed" v-if="tableType != '2' && queryType !== 'view'">
                        <button-top :buttonTopData="handleDetailedButtonTop" :buttonShow="handleDetailedButtonShow"
                        :button-disable="handleTopButtonDisabled"   @newButton="HandleDetailedNewButton"></button-top>
                    </div>
                    <div>
                        <el-form :model="validateForm" ref="ruleForm">
                            <el-table border :data="validateForm.detailedForm" max-height="400px"
                                @selection-change="(data) => selectData = data" class="mt-20 saleOrderOperateEltable">
                                <el-table-column align="center" key="selectable" type="selection" width="50"
                                    fixed="left" v-if="queryType == 'create' || queryType == 'update'" />
                                <el-table-column type="index" width="50" align="left" label="序号" />
                                <el-table-column label="地区" align="left" prop="areaName"
                                    min-width="200"></el-table-column>
                                <el-table-column label="仓库" align="left" prop="warehouseName"
                                    min-width="120"></el-table-column>
                                <el-table-column label="货位" align="left" prop="placeName"
                                    min-width="120"></el-table-column>
                                <el-table-column label="批次号" align="left" prop="batchNo"
                                    min-width="120"></el-table-column>
                                <el-table-column label="物料编码" align="left" prop="matlCode"
                                    min-width="200"></el-table-column>
                                <el-table-column label="物料名称" align="left" prop="matlName"
                                    min-width="120"></el-table-column>
                                <el-table-column label="规格型号" align="left" prop="matlType"
                                    min-width="120"></el-table-column>
                                <el-table-column label="计量单位" align="left" prop="matlUnit" min-width="120">
                                    <template slot-scope="scope">
                                        {{ scope.row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="合格状态" align="center" prop="type"
                                    min-width="120">
                                    <template slot-scope="{row}">
                                <span>{{ row.type | orderTypeFilter(dict.type.inventoryType) }}</span>
                            </template>
                                </el-table-column>
                                <el-table-column label="效期状态" align="center" prop="expireStatus"
                                    min-width="120">
                                    <template slot-scope="{row}">
                                <span>{{ row.expireStatus | orderTypeFilter(dict.type.expireStatus) }}</span>
                            </template>
                                </el-table-column>
                                <el-table-column label="库存数量" align="left" prop="inventoryNum"
                                    min-width="120"></el-table-column>
                                <el-table-column align="left" prop="refundNum" min-width="220">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>退供数量</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.refundNum'"
                                            :rules="[{ required: true, message: '请输入退供数量', trigger: ['change', 'blur'] }, { trigger: ['change', 'blur'], validator: planPuNumValidator }]">
                                            <span v-if="queryType == 'view'">{{ scope.row.refundNum }}</span>
                                            <el-input-number v-else controls-position="right" :min="1" :max="refundReason == '2'?100000:scope.row.inventoryNum"
                                                @change="(newVal, oldVal) => countAmount(scope.row, scope.$index)"
                                                v-model.trim="scope.row.refundNum"></el-input-number>
                                        </el-form-item>
                                    </template>
                                </el-table-column>

                                <el-table-column label="" align="left" min-width="160" prop="price">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>退供单价(元/不含税)</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.price'"
                                            :rules="[{ required: true, message: '请输入退供单价', trigger: ['change', 'blur'] }]">
                                            <span v-if="queryType == 'view'">{{ $textMethod.money(scope.row.price) }}</span>
                                            <money-input v-else v-model="scope.row.price" @change="countAmount(scope.row, scope.$index)"></money-input>
                                        </el-form-item>

                                    </template>
                                </el-table-column>
                                <el-table-column label="税率" align="left" min-width="150" prop="taxRate">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>税率</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.taxRate'"
                                            :rules="[{ required: true, message: '请选择税率', trigger: ['change', 'blur'] }, { trigger: ['change', 'blur'] }]">
                                            <el-select
                                                v-columnFormat="{
                                                    index: scope.$index, 
                                                    prop: 'taxRate', 
                                                    list: validateForm.detailedForm
                                                }"
                                                @change="(newVal, oldVal) => countAmount(scope.row, scope.$index)"
                                                v-if="queryType != 'view'" v-model="scope.row.taxRate" clearable>
                                                <el-option v-for="(item, key)  in dict.type.taxPre" :key="key"
                                                    :label="item.label" :value="item.value" />
                                            </el-select>
                                            <span v-else>{{ scope.row.taxRate | orderTypeFilter(dict.type.taxPre)
                                                }}</span>
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column label="总金额(不含税)" align="left" min-width="120" prop="amount">
                                  <template slot-scope="scope">
                                    {{ $textMethod.money(scope.row.amount) }}
                                  </template>
                                </el-table-column>
                                <el-table-column label="总金额(含税)" align="left" min-width="120" prop="taxAmount">
                                  <template slot-scope="scope">
                                    {{ $textMethod.money(scope.row.taxAmount) }}
                                  </template>
                                </el-table-column>
                                <el-table-column v-if="tableType != '2' && queryType !== 'view'" label="操作"
                                    align="center" fixed="right">
                                    <template slot-scope="scope">
                                        <el-button type="text" @click="removeData(scope.$index)">删行</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form>
                    </div>
                </template>
            </VFormRender>
        </div>
        <choice-project ref="projectRef" @selections="selections" singleMode :propsFormData="propsFormData"/>
        <selectSupplier ref="selectSupplier" singleMode @selections="selectCustom" />
        <choiceInventory ref="choiceInventory" @selections="selectInv" />
        <toBeReviewed ref="toBereview" />
        <choice-saleOrderList ref="choiceSaleOrderList" :propsFormData="propsFormData" @change="choiceSaleOrderChange"></choice-saleOrderList>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import attachmentTable from '@/views/components/attachmentTable'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import { deptTree, getUnitTree } from '@/api/system/dept'
import ChoiceProject from '@/views/components/selectProject/index.vue'
import choiceInventory from '@/views/components/choice-inventory'
import { PuReturnSave, PuReturnSaveSubmit, PuReturnDetail, PuReturnRawDetail, PuReturnModify } from '@/api/purchasingManagement/return'
import { generateUUID } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import selectSupplier from "@/views/components/choice-supplier"
import { getUserInfo } from '@/utils/user-info'
import { userListAll } from '@/api/system/user'
import choiceSaleOrderList from "@/views/components/choice-saleOrderList"

export default {
    name: 'purchaseReturnOperate',
    dicts: ['taxPre', 'MeasureUnit', 'inventoryType', 'expireStatus'],
    mixins: [indexMixin],
    components: {
        ChoiceProject,
        attachmentTable,
        toBeReviewed,
        VFormRender,
        selectSupplier,
        choiceInventory,
        choiceSaleOrderList
    },
    data() {
        return {
            userInfo: getUserInfo(),
            loading: false,
            type: '',
            queryId: '',
            queryName: '',
            queryType: '',
            tableType: '',
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
                businessType: '18'
            },
            /*合同信息*/
            checked: false,
            validateForm: {
                detailedForm: []
            },
            checkedShow: true,
            handleDetailedButtonTop: [
                { buttonName: '选择库存', buttonCode: 'selectInv' },
                { buttonName: '删除', buttonCode: 'delete' }
            ],
            singleMode: false,
            selectData: [],
            fileList: [],
            status: '',
            propsFormData: {
              unitId: ''
            },
            isQuery: '',
            inNum: 0,
            totalNum: 0,
            refundReason: '',
            matlCode: '',
            purDetailId: '',
            totalDetailList: []
        }
    },
    filters: {
        orderTypeFilter(val, code) {
            for (let key of code) {
                if (key.value == val) {
                    return key.label
                }
            }
        }
    },
    created() {
        this.init()
    },
    methods: {
        handleTopButtonDisabled({buttonCode}) {
            const suId = this.$refs.vFormRef.getFieldValue("suId");
            if(buttonCode == 'selectInv' && !suId) {
                return true
            }
            if(buttonCode == 'delete' && !this.validateForm.detailedForm.length) {
                return true
            }
            return false
        },
        selectCustom(row) {
            this.$refs['vFormRef'].setFormData({ suId: row.suId, suCode: row.suCode, suName: row.suName });
            this.validateForm.detailedForm = []
        },
        planPuNumValidator(rule, value, callback) {
            if (value == '0') {
                callback(new Error('不能为0'));
            } else {
                callback();
            }
        },
        planArriveDateValidator(rule, value, callback) {
            if (!value) {
                callback(new Error(''));
            } else {
                callback();
            }
        },
        buttonShow(item) {
            if (['saveSubmit'].includes(item.buttonCode) && this.queryType == 'create') {
                return true
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.status)) {
                return false
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && this.queryName == 'toBeDeal') {
                return false
            }
            if(['saveSubmit'].includes(item.buttonCode) && (this.tableType == '2' || this.isQuery == 'query')) {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        async init() {
            let { type, name, id, auditArr, tableType, ids, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
            this.queryType = type || 'create'
            this.queryId = id || ''
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
            this.queryName = name || 'purchaseReturn'
            this.tableType = tableType || '1'
            this.isQuery = isQuery

            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm()
                await this.formFillInPage()
                await this.getDeptTreeData()
                await this.getUnitTree()
                if (this.queryType == 'create') {
                    const { deptId, deptName, nickName, id: nickId, unitId } = this.userInfo
                    await this.getUserListAll(deptId)
                    this.$refs['vFormRef'].setFieldValue('refundDeptId', deptId)
                    this.$refs['vFormRef'].setFieldValue('refundDeptName', deptName)
                    this.$refs['vFormRef'].setFieldValue('refundUserId', nickId)
                    this.$refs['vFormRef'].setFieldValue('refundUserName', nickName)
                    this.propsFormData.unitId = unitId
                    this.initUnitInfo()
                }
                if (this.queryType !== 'create') {
                    this.getOperateDetail()
                }
                if (this.queryType === 'view') {
                    this.$refs['vFormRef'].setReadMode(true)
                    this.checkedShow = false
                }
            })
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('purchaseReturnOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data)
                    resolve(true)
                })
            })
        },
        async getUnitTree() {
          const res = await getUnitTree({ status: 0 })
          this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' })
            this.$refs['vFormRef'].getWidgetRef('refundDeptId').loadOptions(res.data || [])
        },
        async getUserListAll(deptId) {
            const res = await userListAll({ deptId })
            this.$refs['vFormRef'].getWidgetRef('refundUserId').loadOptions(res.data.list || [])
        },
         getOperateDetail() {
            this.loading = true
            const widgets = ['card40990']
           
            if (this.tableType == '1') {
                PuReturnDetail(this.queryId).then(async ({ data }) => {
                    this.status = data.status
                    this.refundReason = data.refundReason
                    this.purDetailId = data.purDetailId
                    this.matlCode = data.matlCode
                    this.inNum = data.detailList[0] && data.detailList[0].inNum
                    this.propsFormData.unitId = data.unitId
                    this.$refs['vFormRef'].setFormData(data)
                    this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                    this.validateForm.detailedForm = this.formatDetailForm(data.detailList)
                    if (data.refundReason == '2') {
                      this.$refs.vFormRef.showWidgets('purCode')
                      this.purCodeClean(data.purCode, 'init')
                    } else {
                      this.$refs.vFormRef.hideWidgets('purCode')
                    }
                    if(data.refundDeptId) {
                        await this.getUserListAll(data.refundDeptId)
                    }
                }).finally((err) => {
                    this.loading = false
                })
            } else {
                this.$refs.vFormRef.hideWidgets(widgets)
                this.checkedShow = false
                const ids = this.queryId.split(',');
                PuReturnRawDetail({ids}).then(async ({ data }) => {
                    //调用主单获取明细总退供数量
                    const res = await PuReturnDetail(data[0].refundId)
                    this.totalDetailList = res.data.detailList
                    this.refundReason = res.data.refundReason
                    this.inNum = data[0] && data[0].inNum
                    this.validateForm.detailedForm = this.formatDetailForm(data)
                    const detailedFormIds = this.validateForm.detailedForm.map(item => item.id)
                    const list = this.totalDetailList.filter( item => !detailedFormIds.includes(item.id))
                    let totalNum = 0
                    list.map(item => {
                      totalNum += item.refundNum
                    })
                    this.totalNum = totalNum
                }).finally(() => {
                    this.loading = false
                })
            }
        },
        formatDetailForm(arr) {
            const nextArr = arr.map(item => {
                return {
                    ...item,
                    taxRate: item.taxRate || '13'
                }
            })
            return nextArr
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}
          if(name === 'purCode'){
            this.$refs.choiceSaleOrderList.init()
            return
          }
            if (name === 'projectCode') {
                const pId = this.$refs.vFormRef.getFieldValue("projectId");
                const unitId = this.$refs.vFormRef.getFieldValue("unitId")
                if(!unitId){
                  this.$modal.msgError('请先选择所属组织')
                  return
                }
                this.propsFormData.unitId = unitId
                this.$refs.projectRef.init(pId)
            } else if (name === 'suCode') {
                const sId = this.$refs.vFormRef.getFieldValue("suId");
                this.$refs.selectSupplier.open(sId)
            }
        },
        choiceSaleOrderChange (data) {
          this.$refs['vFormRef'].setFormData({
            'purCode': data.purCode,
            'purName': data.purName,
            'purId': data.purOrderId,
            'projectCode': data.projectCode,
            'projectName': data.projectName,
            'projectId': data.projectId,
            'suCode': data.suCode,
            'suName': data.suName,
            'suId': data.suId,
          })
          this.matlCode = data.matlCode
          this.purDetailId = data.id
          this.inNum = data.inNum
          this.purCodeClean(data.purCode)
        },
        formChange (fieldName, newValue) {
        },
        selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
          if(fieldName === 'purCode'){
            this.purCodeClean(newValue)
          }
          if(fieldName === 'refundReason'){
            this.refundReason = newValue
            if (newValue == '2') {
              this.$refs.vFormRef.showWidgets('purCode')
            } else {
              this.inNum = 0
              this.$refs.vFormRef.hideWidgets('purCode')
              this.$refs['vFormRef'].setFieldValue('purCode', '')
              this.purCodeClean('')
            }
            return
          }
            if (fieldName === 'projectCode' && !newValue) {
                this.$refs.vFormRef.setFormData({
                    projectCode: '',
                    projectName: '',
                    projectId: '',
                })
            } else if (fieldName === 'suCode' && !newValue) {
                this.$refs.vFormRef.setFormData({
                    suCode: '',
                    suName: '',
                    suId: '',
                })
                this.validateForm.detailedForm = []
            } else if (fieldName === 'refundUserId') {
                if (newValue) {
                    const optionLabel = this.$refs['vFormRef'].getWidgetRef('refundUserId').optionLabel

                    this.$refs['vFormRef'].setFieldValue('refundUserName', optionLabel)
                } else {
                    this.$refs['vFormRef'].setFieldValue('directorName', '')
                }
            }

        },
        purCodeClean(newValue, type) {
          const data = ['projectCode', 'suCode']
          if(newValue){
            this.$refs.vFormRef.disableWidgets(data)
          }else{
            this.$refs.vFormRef.enableWidgets(data)
            this.$refs['vFormRef'].setFormData({
              'purName': '',
              'purId': '',
              'projectCode': '',
              'projectName': '',
              'projectId': '',
              'suCode': '',
              'suName': '',
              'suId': ''
            })
            this.matlCode = ''
          }
          if(type === 'init'){
            return
          }
          this.validateForm.detailedForm = []
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}
        },
        newButton(buttonCode) {
            if (buttonCode === 'edit') {
                this.queryType = 'update';
                this.$refs['vFormRef'].setReadMode(false);
            } else if (buttonCode === 'cancel') {
                this.cancel(this.queryName)
            } else if (buttonCode === 'save') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'saveSubmit') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName)
            } else if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName)
            }
        },
        async handleSave(buttonCode) {
            try {
                if (this.tableType == '2') {
                    this.$refs.ruleForm.validate(valid => {
                        if (valid) {
                          let tNum = 0
                          this.validateForm.detailedForm.map(item => {
                            tNum += item.refundNum
                          })
                          const zNum = this.totalNum + tNum
                          if(this.refundReason == '2' && zNum > this.inNum){
                            this.$modal.msgError('退供数量之和<=该采购订单入库完成数量')
                            return
                          }
                            PuReturnModify(this.validateForm.detailedForm).then(({ message }) => {
                                this.$modal.msgSuccess(message)
                                this.cancel(this.queryName)
                            }).finally(() => {
                                this.loading = false
                            })
                        }
                    })
                } else {
                    let formValid1, formValid2
                    this.$refs.ruleForm.validate((valid) => {
                        formValid1 = valid
                    })
                    this.$refs.vFormRef.validateForm((valid) => {
                        formValid2 = valid
                    })
                    if (formValid1 && formValid2) {
                        if (!this.validateForm.detailedForm.length) {
                            this.$modal.msgError('产品明细不能为空')
                            return
                        }
                        const formData = await this.$refs.vFormRef.getFormData()
                        let param = {
                            ...this.formData,
                            ...formData,
                            id: this.queryId,
                            fileList: this.fileList,
                            detailList: this.validateForm.detailedForm
                        }
                        let totalNum = 0
                        param.detailList = param.detailList.map(item => {
                          totalNum += item.refundNum
                          return Object.assign({}, item, {purDetailId: this.purDetailId})
                        })

                        if(param.refundReason == '2' && totalNum > this.inNum){
                          this.$modal.msgError('退供数量之和<=该采购订单入库完成数量')
                          return
                        }

                        const saveObj = {
                              'save': () => { this.saveOrder(PuReturnSave, param) },
                              'saveSubmit': () => {
                                  this.$reviewerDialog({
                                      type: ACTIVITI_ASSUGNEE.PU_REFUND,
                                      multiple: false,
                                      success: (assignee) => {
                                          this.saveOrder(PuReturnSaveSubmit, param, assignee)
                                      }
                                  })
                              }
                          }
                          saveObj[buttonCode] && saveObj[buttonCode]()
                    } else {
                        this.$modal.msgError('表单数据校验失败');
                    }
                }
            } catch (err) {
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
            this.$tab.closeOpenPage({ name })
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name }
                }
            } = vm || {}
            if (name === 'refundDeptId') {
                this.$refs['vFormRef'].setFieldValue('refundUserId', '')
                this.$refs['vFormRef'].setFieldValue('refundUserName', '')
                this.$refs.vFormRef.setFieldValue('refundDeptName', node.deptName)
                this.getUserListAll(node.id)
            }
            if (name === 'unitId') {
              this.$refs.vFormRef.setFieldValue('unitName', node.deptName)
            }
        },

        checkoutStatus(flag) {
            const widgets = ['refundCode', 'refundName', 'refundDeptId', 'refundUserId', 'grid71039', 'grid23180', 'grid27599', 'design_p2', 'suName']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        handleDetailedButtonShow(item) {
            return true
        },
        HandleDetailedNewButton(buttonCode) {
            if (buttonCode === 'delete') {
                if (this.selectData.length > 0) {
                    this.$modal.confirm('您确定要删除吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let newData = this.validateForm.detailedForm.filter((a) => !this.selectData.some((b) => a.uid === b.uid));
                        
                        this.validateForm.detailedForm = newData;
                    })
                } else {
                    this.$modal.msgError('请选择数据')
                }
            } else if (buttonCode === 'selectInv') {
                const suId = this.$refs.vFormRef.getFieldValue("suId");
                const refundReason = this.$refs.vFormRef.getFieldValue("refundReason");
                const sourceCode = this.$refs.vFormRef.getFieldValue("purCode");
                const unitId = this.$refs.vFormRef.getFieldValue("unitId");
                const projectId = this.$refs.vFormRef.getFieldValue("projectId");
                const suCode = this.$refs.vFormRef.getFieldValue("suCode");
                const arr = this.validateForm.detailedForm.map( item => { return {id: item.inventoryId}})
                let param = { type: 'refund', suId: suId, refundReason, sourceCode, matlCode: this.matlCode, unitId, suCode, projectId}
                if(refundReason != '2'){
                  delete param.matlCode
                }
                this.$refs.choiceInventory.init(null, arr, [],  param)
            }
        },
        selections(row) {
            this.$refs.vFormRef.setFormData({
                projectCode: row.projectCode,
                projectName: row.projectName,
                projectId: row.id
            })
        },
        selectInv(rows) {
            const data = rows.map(item => {
                return { ...item,  inventoryId: item.id, uid: generateUUID() }
            })
            const nextData = this.formatDetailForm(data)
            this.validateForm.detailedForm.push(...nextData)
        },
        countAmount(row, index) {
            let refundNum = (row.refundNum && row.refundNum !== '') ? Number(row.refundNum) : ''
            let price = (row.price && row.price !== '') ? Number(row.price) : ''
            if (refundNum !== '' && price !== '') {
                this.count(row, index)
            }
        },
        count(row, index) {
            row.amount = (row.refundNum * row.price).toFixed(2)
            if (row.taxRate === '' || !row.taxRate) {
                row.taxAmount = (row.refundNum * row.price).toFixed(2)
            } else {
                row.taxAmount = (row.refundNum * (1 + row.taxRate / 100) * row.price).toFixed(2)
            }
            this.$set(this.validateForm.detailedForm, index, row)
        },
        removeData(i) {
            this.validateForm.detailedForm.splice(i, 1);
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

.ml-20 {
    margin-left: 20px !important;
}

.mt-20 {
    margin-top: 20px !important;
}
</style>
