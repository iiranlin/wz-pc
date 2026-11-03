<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
            @newButton="newButton"></button-top>
        <div class="container_flex_form">

            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
                active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" @selectChange="selectChange"
                :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
                @buttonClick="handleButtonClick" @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect"
                @formChange="handleFormChange">
                <template slot="design_p1">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
                </template>
                <template slot="design_p2">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="18" :queryType="queryType"
                            v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <template slot="slotIcon">
                    <div class="detailed" v-if="tableType != '2' && queryType !== 'view' && !isPull">
                        <button-top ref="buttonTopRef" :buttonTopData="handleDetailedButtonTop"
                            :buttonShow="handleDetailedButtonShow" @newButton="HandleDetailedNewButton"></button-top>
                    </div>
                    <div>
                        <el-form :model="validateForm" ref="ruleForm">
                            <el-table border :data="validateForm.detailedForm" max-height="400px"
                                @selection-change="(data) => selectData = data" class="mt-20 saleOrderOperateEltable">
                                <el-table-column align="center" key="selectable" type="selection" width="50"
                                    fixed="left" v-if="queryType == 'create' || queryType == 'update'" />
                                <el-table-column type="index" width="50" align="left" label="序号" />
                                <el-table-column v-if="orderSourceType == 'damage'" label="来源单号" align="left" prop="damageCode"
                                    min-width="200"></el-table-column>
                                    <el-table-column v-else label="来源单号" align="left" prop="sourceCode"
                                    min-width="200"></el-table-column>
                                <el-table-column label="来源行号" align="left" prop="sourceRowNum"
                                    min-width="120"></el-table-column>
                                <el-table-column label="物料编码" align="left" prop="matlCode"
                                    min-width="150"></el-table-column>
                                <el-table-column label="物料名称" align="left" prop="matlName"
                                    min-width="240"></el-table-column>
                                <el-table-column label="规格型号" align="left" prop="matlType"
                                    min-width="120"></el-table-column>
                                <el-table-column label="计量单位" align="left" prop="matlUnit" min-width="120">
                                    <template slot-scope="scope">
                                        {{ scope.row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="需求数量" align="left" prop="demandNum" min-width="220">
                                    <template slot-scope="scope">
                                        <span v-if="queryType == 'view' || scope.row.sourceDetailId">{{
                                            scope.row.demandNum
                                        }}</span>
                                        <el-input-number style="width: 100%" v-else controls-position="right" :min="1"
                                            :max="1000000" v-model.trim="scope.row.demandNum"></el-input-number>
                                    </template>
                                </el-table-column>
                                <el-table-column label="库存数量" align="right" prop="inventoryNum" min-width="120"></el-table-column>
                                <el-table-column align="left" prop="purPlanQuoteNum" min-width="220">
                                    <template slot="header">
                                        <span>
                                            已生成采购计划数量(累计)
                                            <tooltip content="按已生成采购计划的数量累计" />
                                        </span>
                                    </template>
                                    <template slot-scope="scope">
                                      {{ queryType == 'view'?scope.row.purPlanQuoteNum + scope.row.planNum : scope.row.purPlanQuoteNum}}
                                    </template>
                                </el-table-column>
                                <el-table-column align="left" prop="planNum" min-width="220">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>本次计划采购数量<tooltip content="新增时，默认=需求数量-库存数量-已生成采购计划数量（累计）;<br>修改时，如果库存刷新了，需要人为确认本次计划采购数量" /></span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.planNum'"
                                            :rules="[{ required: true, message: '请输入采购数量', trigger: ['change', 'blur'] }, { trigger: ['change', 'blur'], validator: planPuNumValidator }]">
                                            <span v-if="queryType == 'view' || scope.row.sourceType == 3 || orderSourceType =='damage'">{{
                                                scope.row.planNum }}</span>
                                            <el-input-number v-else controls-position="right" :min="0"
                                                :max="!!scope.row.sourceCode ? (scope.row.demandNum || 0) - (scope.row.purPlanQuoteNum || 0) : 999999999"
                                                @change="(newVal, oldVal) => numberChange(scope)"
                                                v-model.trim="scope.row.planNum"></el-input-number>
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column label="期望到货日期" align="left" prop="arriveDate" min-width="300">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>期望到货日期</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.arriveDate'"
                                            :rules="[{ required: true, message: '请选择日期', trigger: ['change', 'blur'] }, { trigger: ['change', 'blur'], validator: planArriveDateValidator }]">
                                            <span v-if="queryType == 'view'">{{ parseTime(scope.row.arriveDate,
                                                '{y}-{m}-{d}') }}</span>
                                            <el-date-picker v-else v-columnFormat="{
                                                index: scope.$index,
                                                prop: 'arriveDate',
                                                list: validateForm.detailedForm
                                            }" value-format="timestamp" v-model="scope.row.arriveDate" type="date"
                                                placeholder="选择日期" style="width: 70%"></el-date-picker>
                                        </el-form-item>

                                    </template>
                                </el-table-column>
                                <el-table-column label="单价(不含税，单位：元)" align="left" min-width="150" prop="price">
                                    <template slot="header">
                                        <!-- <span style="color: red">*</span> -->
                                        <span>单价(不含税，单位：元)</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.price'">
                                            <span v-if="queryType == 'view'">{{ $textMethod.money(scope.row.price)
                                                }}</span>
                                            <!-- <money-input v-else v-model="scope.row.price"
                                                @change="() => numberChange(scope)"></money-input> -->
                                            <el-input v-else v-model="scope.row.price" v-number-input.float="2" @change="numberChange(scope)"/>
                                        </el-form-item>

                                    </template>
                                </el-table-column>
                                <el-table-column label="总金额(不含税)" align="left" min-width="150" prop="amount">
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.amount'">
                                            <!-- <money-input v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.amount"
                                                @change="numberChange(scope)"></money-input> -->
                                            <el-input v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.amount" v-number-input.float="2" @change="numberChange(scope)"/>
                                            <span v-else>{{ scope.row.amount }}</span>
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
                                            :rules="[{ required: true, message: '请选择税率', trigger: ['change', 'blur'] }]">
                                            <el-select v-columnFormat="{
                                                index: scope.$index,
                                                prop: 'taxRate',
                                                list: validateForm.detailedForm
                                            }" @change="(newVal, oldVal) => numberChange(scope)"
                                                v-if="queryType != 'view'" v-model="scope.row.taxRate" clearable>
                                                <el-option v-for="(item, key)  in dict.type.taxPre" :key="key"
                                                    :label="item.label" :value="item.value" />
                                            </el-select>
                                            <span v-else>{{ scope.row.taxRate | orderTypeFilter(dict.type.taxPre)
                                                }}</span>
                                        </el-form-item>

                                    </template>
                                </el-table-column>
                                <el-table-column label="单价(含税，单位：元)" align="right" min-width="150" prop="taxPrice">
                                    <template slot="header">
                                        <!-- <span style="color: red">*</span> -->
                                        <span>单价(含税，单位：元)</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.taxPrice'">
                                            <span>{{ scope.row.taxPrice }}</span>
                                        </el-form-item>

                                    </template>
                                </el-table-column>
                                <el-table-column label="总金额(含税)" align="left" min-width="150" prop="taxAmount">
                                    <!-- <template slot-scope="{row}">
                                        {{ $textMethod.money(row.taxAmount) }}
                                    </template> -->
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.taxAmount'">
                                            <!-- <money-input v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.taxAmount"
                                                @change="numberChange(scope)"></money-input> -->
                                            <el-input v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.taxAmount" v-number-input.float="2" @change="numberChange(scope)"/>
                                            <span v-else>{{ scope.row.taxAmount }}</span>
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column v-if="tableType != '2' && queryType !== 'view' && !isPull" label="操作"
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
        <choice-material ref="materialRef" :singleMode="singleMode" :isPurPlanQuote="true" @choiceMaterialClick="choiceMaterial"></choice-material>
        <choice-operate ref="operateRef" :projectEqually="true" :propsFormData="{...propsFormData, unitId: propsFormDataProject.unitId}"
            @choiceOperateClick="choiceOperateClick"></choice-operate>
        <choice-project ref="projectRef" @selections="selections" singleMode :propsFormData="propsFormDataProject"></choice-project>
        <choice-matlCodeDemand ref="choiceMatlCodeDemand" :propsFormData="{...propsFormData, unitId: propsFormDataProject.unitId}"
            @change="choiceMatlCodeDemandChange"></choice-matlCodeDemand>
        <choice-damage ref="damageRef" :propsFormData="{...propsFormData, unitId: propsFormDataProject.unitId}" :singleMode="false" @change="choiceDamage"></choice-damage>
        <choice-saleOrder ref="choiceSaleOrder" :propsFormData="{...propsFormDataSaleOrder, unitId: propsFormDataProject.unitId}" @change="choiceSaleOrderChange"></choice-saleOrder>
        <toBeReviewed ref="toBereview" />
        <Dialog title="批量修改" close-on-click-modal :visible.sync="branchEditVis" width="896px">
          <el-form :model="branchEditForm" label-width="100px">
              <el-row :gutter="20">
                  <el-col :span="12">
                      <el-form-item label="期望到货日期" label-width="120px">
                        <el-date-picker style="width: 100%;" v-model="branchEditForm.arriveDate" type="date" format="yyyy-MM-dd" value-format="timestamp"></el-date-picker>
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
import attachmentTable from '@/views/components/attachmentTable'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import { deptTree, getUnitTree } from '@/api/system/dept'
import ChoiceMaterial from '@/views/components/choice-material/index.vue'
import ChoiceOperate from '@/views/components/choice-operate/index.vue'
import choiceDamage from '@/views/components/choice-damage/index.vue'
import ChoiceProject from '@/views/components/selectProject/index.vue'
import choiceMatlCodeDemand from '@/views/components/choice-matlCodeDemand/index.vue'
import choiceSaleOrder from '@/views/components/choice-saleOrder/index.vue'
import { PuPlanCreate, PuPlanSaveSubmit, PuPlanDetail, PuPlanRawDetail, PuPlanRawModify } from '@/api/purchasingManagement/plan'
import { generateUUID } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { planQuoteList } from '@/api/prodmgr-mm/demandPlan'
import VFormRender from '@/components/form-render/index'
import indexMixin from '@/views/mixins'
import { purPlanQuoteList } from '@/api/projectManagement/productionDamage'
import { getUserInfo } from '@/utils/user-info'

export default {
    mixins: [indexMixin],
    name: 'purchasePlanOperate',
    dicts: ['taxPre', 'MeasureUnit'],
    components: {
        ChoiceMaterial,
        ChoiceOperate,
        ChoiceProject,
        attachmentTable,
        choiceMatlCodeDemand,
        toBeReviewed,
        VFormRender,
        choiceDamage,
        choiceSaleOrder,
        tooltip: () => import('@/components/tooltip')
    },
    data() {
        return {
            isPull: false,
            loading: false,
            type: '',
            queryId: '',
            queryName: '',
            queryType: '',
            tableType: '1',
            formJson: {},
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
                { buttonName: '选择物料需求', buttonCode: 'selectMaterial', options: "{\"prompt\":\"数据来源：物料需求计划工作台>计划属性=采购的计划订单\"}" },
                { buttonName: '选择生产制损', buttonCode: 'selectDamage', options: "{\"prompt\":\"数据来源：生产管理>审核通过的生产制损单\"}" },
                { buttonName: '选择销售订单', buttonCode: 'selectSaleOrder', options: "{\"prompt\":\"根据销售订单直接采买\"}" },
                { buttonName: '选择运营需求', buttonCode: 'selectOperate', options: "{\"prompt\":\"数据来源：运营管理>运营需求的需求计划\"}" },
                { buttonName: '选择物料', buttonCode: 'selectMatl' },
                { buttonName: '批改', buttonCode: 'correct', options: "{\"prompt\":\"批改可多选后批量维护\"}" },
                { buttonName: '删除', buttonCode: 'delete' }
            ],
            singleMode: false,
            selectData: [],
            fileList: [],
            status: '',
            propsFormData: {
                viewProjectId: '',
                isProjectQuery: 1
            },
            isQuery: '',
            userInfo: getUserInfo(),
            propsFormDataSaleOrder: {
              projectId: ''
            },
            propsFormDataProject: {
              unitId: ''
            },
            orderSourceType: '',
            rules: {
              price: [{ required: true, message: '请输入预算单价', trigger: ['change', 'blur'] },
                {trigger: ['change', 'blur'],
                  validator: (rule, value, callback) => {
                      if (value == '0') {
                          callback(
                              new Error(
                                  '预算单价不能为0'
                              )
                          )
                      } else {
                          callback()
                      }
                  }
                }
              ]
            },
            branchEditVis: false,
            branchEditForm: {
              arriveDate: ''
            }
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
        handleFormChange(fieldName) {
            if (fieldName == 'projectId') {
                this.validateForm.detailedForm = []
                this.numberAmount(this.validateForm.detailedForm)
            }
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
                callback(new Error('请选择日期'));
            } else {
                callback();
            }
        },
        buttonShow(item) {
          if (item.buttonCode === 'rollbackToPrevious') {
            const query = this.isDialog ? this.dialogQuery : this.$route.query
            return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
              && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
              && this.buttonShow({ ...item, buttonCode: 'reject' })
          }
            if (['saveSubmit'].includes(item.buttonCode) && this.queryType == 'create') {
                return true
            }
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
            let { sourceType = '',type, name, id, auditArr, tableType, ids, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create'
            this.isPull = false
            this.queryId = id || ''
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
            this.queryName = name || 'purchasePlan'
            this.tableType = tableType || '1'
            this.isQuery = isQuery
            if(sourceType === 'damage') {
                this.orderSourceType = sourceType
                this.handleDetailedButtonTop = this.handleDetailedButtonTop.filter(item => item.buttonCode !== 'selectDamage')
            }
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm()
                /*默认禁用销售负责人*/
                await this.formFillInPage()
                await this.getDeptTreeData()
                await this.getUnitTree()
                const func = { demandPlanWorkbench: this.demandPlanWorkbench, productionDamage: this.productionDamage }[this.queryName]
                if (ids && func) {
                    func(ids)
                }
                if (this.queryType !== 'create') {
                    this.saleOrderOperateDetail()
                }else{
                  const {deptId, deptName} = this.userInfo;
                  this.$refs['vFormRef'].setFieldValue("makeDeptId", deptId);
                  this.$refs['vFormRef'].setFieldValue("makeDeptName", deptName);
                  this.initUnitInfo()
                }
                if (this.queryType === 'view') {
                    this.$refs['vFormRef'].setReadMode(true)
                    this.checkedShow = false
                }
            })
        },
        async demandPlanWorkbench(ids) {
            const { data } = await planQuoteList({ planAttribute: '2', ids: ids.split(',') })
            if (Array.isArray(data.list) && data.list.length > 0) {
                this.isPull = true
                const { projectId, projectName, projectCode, unitId, unitName } = data.list[0]
                this.$refs.vFormRef.disableWidgets('projectCode')
                this.$refs.vFormRef.setFieldValue('projectId', projectId)
                this.$refs.vFormRef.setFieldValue('projectName', projectName)
                this.$refs.vFormRef.setFieldValue('projectCode', projectCode)
                this.$refs.vFormRef.disableWidgets('unitId')
                this.initUnitInfo()
                this.choiceMatlCodeDemandChange(data.list.map(item => ({ ...item, sourceType: 1 })) || [])
            }
        },
        async productionDamage(ids) {
            const { data } = await purPlanQuoteList({ ids: ids.split(',') })
            if (Array.isArray(data.list) && data.list.length > 0) {
                const { projectId, projectName, projectCode } = data.list[0]
                this.$refs.vFormRef.disableWidgets('projectCode')
                this.$refs.vFormRef.setFieldValue('projectId', projectId)
                this.$refs.vFormRef.setFieldValue('projectName', projectName)
                this.$refs.vFormRef.setFieldValue('projectCode', projectCode)
                this.choiceDamage(data.list)
            }
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('purchasePlanOperate').then(res => {
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
            this.$refs['vFormRef'].getWidgetRef('makeDeptId').loadOptions(res.data || [])
        },
        saleOrderOperateDetail() {
            this.loading = true
            const widgets = ['card1']
            if (this.tableType == '1') {
                PuPlanDetail(this.queryId).then(({ data }) => {
                    this.status = data.status
                    this.$refs['vFormRef'].setFormData(data)
                    this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                    this.validateForm.detailedForm = this.formatDetailForm(data.detailList)
                    this.numberAmount(this.validateForm.detailedForm)
                }).finally(() => {
                    this.loading = false
                })
            } else {
                const ids = this.queryId.split(',')
                this.$refs.vFormRef.hideWidgets(widgets)
                this.checkedShow = false
                PuPlanRawDetail({ ids }).then(({ data }) => {
                    this.validateForm.detailedForm = this.formatDetailForm(data)
                    this.numberAmount(this.validateForm.detailedForm)
                }).finally(() => {
                    this.loading = false
                })
            }
        },
        formatDetailForm(arr) {
            const nextArr = arr.map(item => {
                return {
                    ...item,
                    arriveDate: item.arriveDate || '',
                    taxRate: item.taxRate || '13',
                    amount: item.amount || '',
                    taxAmount: item.taxAmount || '',
                }
            })
            return nextArr
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}
            if (name === 'projectCode') {
                const unitId = this.$refs.vFormRef.getFieldValue("unitId");
                if(!unitId){
                  this.$modal.msgError('请先选择所属组织')
                  return
                }
                this.propsFormDataProject.unitId = unitId
                const pId = this.$refs.vFormRef.getFieldValue("projectId");
                this.$refs.projectRef.init(pId)
            }
        },
        selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
            if (fieldName === 'projectCode' && !newValue) {
                this.$refs.vFormRef.setFormData({
                    projectCode: '',
                    projectName: '',
                    projectId: '',
                })
            }

        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}
        },
        newButton(buttonCode) {
          if (buttonCode === 'rollbackToPrevious') {
            this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
            return
          }
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
                            PuPlanRawModify(this.validateForm.detailedForm).then(({ message }) => {
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
                        const param = {
                            ...this.formData,
                            ...formData,
                            id: this.queryId,
                            fileList: this.fileList,
                            detailList: this.validateForm.detailedForm
                        }
                        let api = PuPlanCreate
                        const saveObj = {
                            'save': () => { this.saveOrder(api, param) },
                            'saveSubmit': () => {
                                this.$reviewerDialog({
                                    type: ACTIVITI_ASSUGNEE.PU_PP,
                                    multiple: false,
                                    success: (assignee) => {
                                        this.saveOrder(PuPlanSaveSubmit, param, assignee)
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
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name }
                }
            } = vm || {}
            if (name === 'makeDeptId') {
                this.$refs.vFormRef.setFieldValue('makeDeptName', node.deptName)
            }
            if (name === 'unitId') {
                this.$refs.vFormRef.setFieldValue('unitName', node.deptName)
            }
        },
        treeSelectInput(vm, newVal) {
            let {
                field: {
                    options: { name }
                }
            } = vm || {}
        },
        checkoutStatus(flag) {
            const widgets = ['planName', 'makeDeptId', 'fileList', 'design_p2', 'grid27301', 'planCode', 'grid96921']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        handleDetailedButtonShow(item) {
            if (['selectMaterial'].includes(item.buttonCode) && this.queryName == 'demandPlanWorkbench') {
                return false
            }
            return true
        },
        HandleDetailedNewButton(buttonCode) {
          if(buttonCode === 'correct'){
            if(!this.selectData.length){
              this.$modal.msgError("请选择数据");
              return
            }
            this.branchEditVis = true
            return
          }
          const unitId = this.$refs.vFormRef.getFieldValue("unitId");
          if(!unitId){
            this.$modal.msgError('请先选择所属组织')
            return
          }
          this.propsFormDataProject.unitId = unitId
            if (buttonCode === 'selectMatl') {
                this.$refs.materialRef.init(null, [], this.validateForm.detailedForm)
            } else if (buttonCode === 'selectOperate') {
                this.propsFormData.viewProjectId = this.$refs.vFormRef.getFieldValue("projectId");
                this.$refs.operateRef.init(null, this.validateForm.detailedForm);
            } else if (buttonCode === 'delete') {
                if (this.selectData.length > 0) {
                    this.$modal.confirm('您确定要删除吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let newData = this.validateForm.detailedForm.filter((a) => !this.selectData.some((b) => a.uid === b.uid));
                        this.validateForm.detailedForm = this.formatDetailForm(newData);
                        this.numberAmount(this.validateForm.detailedForm)
                    })
                } else {
                    this.$modal.msgError('请选择数据')
                }
            } else if (buttonCode === 'selectMaterial') {
                this.propsFormData.viewProjectId = this.$refs.vFormRef.getFieldValue("projectId");
                this.$refs.choiceMatlCodeDemand.init(this.validateForm.detailedForm)
            } else if (buttonCode === 'selectDamage') {
                this.propsFormData.viewProjectId = this.$refs.vFormRef.getFieldValue("projectId");
                this.$refs.damageRef.init(null, [...this.validateForm.detailedForm])
            } else if (buttonCode === 'selectSaleOrder') {
              this.propsFormDataSaleOrder.projectId = this.$refs.vFormRef.getFieldValue("projectId");
              this.$refs.choiceSaleOrder.init(this.validateForm.detailedForm)
            }
        },
        selections(row) {  /*选择项目*/
            this.$refs.vFormRef.setFormData({
                projectCode: row.projectCode,
                projectName: row.projectName,
                projectId: row.id
            })
        },
        //制损单
        choiceDamage(arr) {
            const data = arr.map(item => {
                return {
                    ...item, sourceType: 3, expandCode: item.damageCode,
                    planNum: item.damageNum,
                    price: item.price || 0,
                    amount: item.amount || 0,
                    taxAmount: item.taxAmount || 0,
                    sourceDetailId: item.id,
                    sourceId: item.id,
                    sourceRowNum: item.rowNum,
                    sourceCode: item.damageCode,
                    demandNum: item.damageNum,
                    rawNo: item.rowNum,
                    uid: generateUUID(),
                    inventoryNum: item.inventoryNum || 0
                }
            })
            const nextArrRow = this.formatDetailForm(data)
            this.updateMatlInvByUnit(this.propsFormDataProject.unitId, nextArrRow)
            this.validateForm.detailedForm.push(...nextArrRow)
            this.numberAmount(this.validateForm.detailedForm)
        },
        choiceMaterial(MaterialRows) {  /*选择物料*/
            const data = MaterialRows.map(item => {
                return { ...item, uid: generateUUID() }
            })
            const nextData = this.formatDetailForm(data)
            this.updateMatlInvByUnit(this.propsFormDataProject.unitId, nextData)
            this.validateForm.detailedForm.push(...nextData)
            this.numberAmount(this.validateForm.detailedForm)
        },
        // 运营需求计划
        choiceOperateClick(OperateRows) {
            const arrRows = OperateRows.map(item => {
                return { ...item, inventoryNum: item.inventoryNum || 0, arriveDate: item.demandDate, sourceType: 2, sourceId: item.planId, demandNum: item.demandNum, sourceDetailId: item.id, rawNo: item.rowNum, sourceRowNum: item.rowNum, sourceCode: item.demandCode, purPlanQuoteNum: item.purPlanQuoteNum, planNum: item.demandNum - item.purPlanQuoteNum, uid: generateUUID() }
            })
            const nextArrRows = this.formatDetailForm(arrRows)
            this.updateMatlInvByUnit(this.propsFormDataProject.unitId, nextArrRows)
            this.validateForm.detailedForm.push(...nextArrRows)
            // const data = this.validateForm.detailedForm[0] || {}
            // this.$refs.vFormRef.setFormData({
            //     projectCode: data.projectCode || '',
            //     projectName: data.projectName || '',
            //     projectId: data.projectId || ''
            // })
            this.numberAmount(this.validateForm.detailedForm)
        },
        // 物料需求计划
        choiceMatlCodeDemandChange(data) {
            const arrRow = data.map(item => {
                return {
                    ...item,
                    sourceDetailId: item.id,
                    sourceId: item.planId,
                    sourceRowNum: '1',
                    demandNum: item.planNum,
                    planNum: item.planNum,
                    rawNo: item.rowNum,
                    needDate: item.demandDate,
                    purPlanQuoteNum: item.quoteNum,
                    sourceType: 1,
                    arriveDate: item.planStartDate,
                    sourceCode: item.detailCode,
                    uid: generateUUID()
                }
            })
            const nextArrRow = this.formatDetailForm(arrRow)
            this.updateMatlInvByUnit(this.propsFormDataProject.unitId, nextArrRow)
            this.validateForm.detailedForm.push(...nextArrRow)
            this.numberAmount(this.validateForm.detailedForm)
        },
        //引用销售订单
        choiceSaleOrderChange (data) {
          const arrRow = data.map(item => {
              return Object.assign({}, item, {sourceRowNum: item.rowNum, uid: generateUUID(), sourceType: 4, inventoryNum: item.inventoryNum || 0})
            })
            const nextArrRow = this.formatDetailForm(arrRow)
            this.updateMatlInvByUnit(this.propsFormDataProject.unitId, nextArrRow)
            this.validateForm.detailedForm.push(...nextArrRow)
            this.numberAmount(this.validateForm.detailedForm)
        },
        numberChange(scope) {
            const property = scope.column.property
            const taxRate = Number(scope.row.taxRate || 0);
            const num = Number(scope.row.planNum || 0);
            const price = Number(scope.row.price || 0);
            const taxAmount = Number(scope.row.taxAmount || 0);
            const amount = Number(scope.row.amount || 0);
            if (['planNum', 'taxRate', 'price'].includes(property)) {
                 // 单价 数量 税率 改变
                scope.row.taxAmount = (num * price * (1 + taxRate / 100)).toFixed(2)
                scope.row.amount = (num * price).toFixed(2);
                scope.row.taxPrice = Number(price *(1 + taxRate / 100)).toFixed(2);
            } else if (['taxAmount'].includes(property)) {
                 //含税总金额  改变
                const tempAmount = (taxAmount / (1 + taxRate / 100))
                scope.row.amount = (tempAmount).toFixed(2);
                scope.row.price = Number(tempAmount / num || 0).toFixed(2) == 'Infinity'?0:Number(tempAmount / num || 0).toFixed(2);
                scope.row.taxPrice = Number((scope.row.price || 0) *(1 + taxRate / 100)).toFixed(2) == 'Infinity'?0:Number((scope.row.price || 0) *(1 + taxRate / 100)).toFixed(2);
            } else if (['amount'].includes(property)) {
                 //总金额  改变
                scope.row.price = Number(amount / num || 0).toFixed(2) == 'Infinity'?0:Number(amount / num || 0).toFixed(2);
                scope.row.taxPrice = Number((scope.row.price || 0) *(1 + taxRate / 100)).toFixed(2) == 'Infinity'?0:Number((scope.row.price || 0) *(1 + taxRate / 100)).toFixed(2);
                scope.row.taxAmount = (amount * (1 + taxRate / 100)).toFixed(2)
            }
            this.numberAmount(this.validateForm.detailedForm)
        },
        numberAmount(data) {
            let amount = 0, amountTax = 0;
            data.forEach(item => {
                amount += Number(item.amount || 0);
                amountTax += Number(item.taxAmount || 0);
            });
            this.$nextTick(() => {
                this.$refs['vFormRef'] && this.$refs['vFormRef'].setFieldValue("amount", amount);
                this.$refs['vFormRef'] && this.$refs['vFormRef'].setFieldValue("amountTax", amountTax);
            })
        },

        removeData(i) {
            this.validateForm.detailedForm.splice(i, 1);
            this.numberAmount(this.validateForm.detailedForm)
        },
        submitForm() {
          this.validateForm.detailedForm.map(item => {
            this.selectData.map(ele => {
              if (item.uid === ele.uid) {
                item.arriveDate = this.branchEditForm.arriveDate
              }
            })
          })
          this.branchEditVis = false
          this.branchEditForm.arriveDate = ''
        },
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
