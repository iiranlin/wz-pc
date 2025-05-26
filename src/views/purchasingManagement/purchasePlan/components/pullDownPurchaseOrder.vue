<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">

            <el-switch v-if="checkedShow" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" :class="{'formRender_view': queryType === 'view'}"
                @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange"
                @buttonClick="handleButtonClick" @treeSelectInput="treeSelectInput"
                @treeSelectSelect="treeSelectSelect">
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
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="供应商信息" />供应商信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable businessType="32" ref="attachmentTable" :queryType="queryType" v-model="fileList">
                        </attachmentTable>
                    </div>
                </template>
                <template slot="slotIcon">
                    <div>
                        <el-form :model="detailedFormValidate" ref="detailedForm" class="payForm">
                            <el-table border :data="detailedFormValidate.tableItem" height="400px"
                                class="mt-20 saleOrderOperateEltable">
                                <el-table-column type="index" width="50" align="left" label="序号" />
                                <el-table-column label="物资编号" align="left" prop="matlCode"
                                    min-width="120"></el-table-column>
                                <el-table-column label="物资名称" align="left" prop="matlName"
                                    min-width="120"></el-table-column>
                                <el-table-column label="规格型号" align="left" prop="matlType"
                                    min-width="120"></el-table-column>
                                <el-table-column label="计量单位" align="left" prop="matlUnit">
                                    <template slot-scope="{row}">
                                        <span>{{ row.matlUnit | reviewMethodFilter(dict.type.MeasureUnit) }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column align="left" label="采购数量" prop="purNum" show-overflow-tooltip width="220">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>采购数量</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.purNum }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="期望到货日期" align="center" prop="arriveDate" min-width="300">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>期望到货日期</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'tableItem.' + scope.$index + '.arriveDate'"
                                            :rules="[{ required: true, message: '请选择期望到货日期', trigger: ['change', 'blur'] }, { trigger: ['change', 'blur'], validator: planArriveDateValidator }]">
                                            <span v-if="queryType == 'view'">{{ parseTime(scope.row.arriveDate,
                                                '{y}-{m}-{d}') }}</span>
                                            <el-date-picker v-else value-format="timestamp"
                                                v-model="scope.row.arriveDate" type="date" placeholder="选择日期"
                                                style="width: 70%"></el-date-picker>
                                        </el-form-item>

                                    </template>
                                </el-table-column>
                                <el-table-column align="left" label="单价(不含税)" prop="price" show-overflow-tooltip width="200">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>单价(不含税)</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'tableItem.' + scope.$index + '.price'" :rules="detailedFormValidate.rules.price">
                                            <el-input v-number-input.float="2" v-model="scope.row.price" @change="priceChange(scope)"></el-input>
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column align="left" label="税率(%)" prop="taxRate" show-overflow-tooltip width="200">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>税率(%)</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'tableItem.' + scope.$index + '.taxRate'" :rules="detailedFormValidate.rules.taxRate">
                                            <el-select v-model="scope.row.taxRate" clearable @change="priceChange(scope)">
                                                <el-option v-for="(item, key)  in dict.type.taxPre" :key="key" :label="item.label" :value="item.value" />
                                            </el-select>
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column align="left" label="单价(含税)" prop="taxPrice" show-overflow-tooltip width="120">
                                  <template slot-scope="{row}">
                                    <span>{{ $textMethod.money(row.taxPrice) }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column label="总金额(不含税)" align="left" prop="amount" min-width="120">
                                  <template slot-scope="{row}">
                                    <span>{{ $textMethod.money(row.amount) }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column label="总金额(含税)" align="left" prop="taxAmount" min-width="120">
                                  <template slot-scope="{row}">
                                    <span>{{ $textMethod.money(row.taxAmount) }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column v-if="queryType !== 'view'" label="操作" align="center" fixed="right">
                                    <template slot-scope="scope">
                                        <el-button type="text" @click="deleteDetailed(scope.$index)">删行</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form>
                    </div>
                </template>
            </VFormRender>
        </div>
        <choice-project ref="projectRef" singleMode @selections="selections"></choice-project>
        <choice-supplier ref="supplierRef" @selections="selectionsSupplier"></choice-supplier>
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { deptTree, getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getUserInfo } from '@/utils/user-info'
import ChoiceProject from '@/views/components/selectProject/index.vue'
import ChoiceSupplier from '@/views/components/choice-supplier/index.vue'
import { purOrderQuoteList } from '@/api/purchasingManagement/plan'
import { OrderCreateCreate, OrderSaveSubmit } from '@/api/prodmgr-pu/order';
import attachmentTable from '@/views/components/attachmentTable'
import VFormRender from '@/components/form-render/index'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import indexMixin from '@/views/mixins'
export default {
    mixins: [indexMixin],
    name: 'pullDownPurchaseOrder',
    dicts:['MeasureUnit', 'taxPre'],
    components: {
        ChoiceProject,
        ChoiceSupplier,
        attachmentTable,
        VFormRender
    },
    data() {
        return {
            loading: false,
            type: '',
            queryId: '',
            queryName: '',
            queryType: '',
            fileList: [],
            formJson: {},
            formData: {},
            // 菜单按钮、字段等数据
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'push' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'push' },
                { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'push' }
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
            singleMode: false,
            detailedFormValidate: {
                tableItem: [],
                rules: {
                    purNum: [{ required: true, message: '请输入数量', trigger: 'blur' }],
                    price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
                    taxRate: [{ required: true, message: '请选择税率', trigger: 'change' }],
                }
            },
        }
    },
    filters: {
        reviewMethodFilter(val, code) {
            for (let key of code) {
                if (key.value == val) {
                    return key.label
                }
            }
        }
    },
    computed: {
        ...mapGetters(['infoData'])
    },
    created() {
        this.init()
    },
    methods: {
        planArriveDateValidator(rule, value, callback) {
            if (!value) {
                callback(new Error('请选择期望到货日期'));
            } else {
                callback();
            }
        },
        buttonShow(item) {
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        async init() {
            let { type, name, id, auditArr } = this.$route.query
            this.queryType = type || 'create'
            this.queryId = id || ''
            this.queryName = name || 'purchasePlan'

            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm()
                await this.formFillInPage()
                await this.getDeptTreeData()
                await this.getUnitTree()
                this.saleOrderOperateDetail()
                this.$refs['vFormRef'].setFieldValue("bizDate", new Date().getTime());
                const { deptId, deptName, nickName, id: nickId } = this.userInfo;
                this.getUserListAll(deptId);
                this.$refs['vFormRef'].setFieldValue("purDeptId", deptId);
                this.$refs['vFormRef'].setFieldValue("purDeptName", deptName);
                this.$refs['vFormRef'].setFieldValue("purUserId", nickId);
                this.$refs['vFormRef'].setFieldValue("purUserName", nickName);
            })
        },
        async getUnitTree() {
          const res = await getUnitTree({ status: 0 })
          this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
        },
        async getUserListAll(deptId) {
          const res = await userListAll({ deptId });
          this.$refs['vFormRef'].getWidgetRef('purUserId').loadOptions(res.data.list || []);
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('pullDownPurchaseOrder').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data)
                    resolve(true)
                })
            })
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' })
            this.$refs['vFormRef'].getWidgetRef('purDeptId').loadOptions(res.data || [])
        },
        saleOrderOperateDetail() {
            this.loading = true
            const ids = this.queryId.split(',')
            purOrderQuoteList({ids}).then(({ data }) => {
                this.detailedFormValidate.tableItem = data.map((item) => {
                    return {...item}
                })
                this.totalValue()

                this.$refs.vFormRef.setFormData({
                    projectCode: data[0].projectCode,
                    projectName: data[0].projectName,
                    projectId: data[0].projectId,
                    suName: data[0].suName,
                    suCode: data[0].suCode,
                    suId: data[0].suId,
                    unitId: data[0].unitId,
                    unitName: data[0].unitName,
                })
            }).finally(() => {
                this.loading = false
            })
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}
            if (name === 'projectCode') {
                const pId= this.$refs.vFormRef.getFieldValue("projectId");
                this.$refs.projectRef.init(pId)
            } else if (name === 'suCode') {
                this.$refs.supplierRef.open()
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}
        },
        selectChange(fieldName, newValue) {
          if (fieldName === 'purUserId') {
            if (newValue) {
              const optionLabel = this.$refs['vFormRef'].getWidgetRef('purUserId').optionLabel;
              this.$refs['vFormRef'].setFieldValue("purUserName", optionLabel);
            } else {
              this.$refs['vFormRef'].setFieldValue("purUserName", "");
            }
          }
        },
        /*选择项目信息*/
        selections(row) {
            this.$refs['vFormRef'].setFormData({...row, projectId: row.id});
        },
        selectionsSupplier(row) {
            this.$refs['vFormRef'].setFormData(row);
        },
        newButton(buttonCode) {
            if (buttonCode === 'cancel') {
                this.cancel(this.queryName)
            } else if (buttonCode === 'save') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'saveSubmit') {
                this.handleSave(buttonCode)
            }
        },
        async handleSave (buttonCode) {
            try {
                const vFormRefData = new Promise( (resolve, reject) => {
                    return this.$refs.vFormRef.getFormData().then(formData => {
                        resolve(formData)
                    }).catch(error => {
                        reject()
                    })
                })

                const pList = new Promise( (resolve, reject) => {
                    return this.$refs.detailedForm.validate( valid => {
                        if(valid){
                            resolve(this.detailedFormValidate.tableItem)
                        }else{
                            reject()
                        }
                    })
                })
                const data = await Promise.all([vFormRefData, pList])
                if (!this.detailedFormValidate.tableItem.length) {
                    this.$modal.msgError('产品明细不能为空')
                    return
                }
                let api = OrderCreateCreate;
                const param = { ...data[0], detailList: data[1], fileList: this.fileList }
                const saveObj = {
                    'save': () => { this.saveOrder(api, param) },
                    'saveSubmit': () => {
                        this.$reviewerDialog({
                            type: ACTIVITI_ASSUGNEE.PU_OR,
                            multiple: false,
                            success: (assignee) => {
                                this.saveOrder(OrderSaveSubmit, param, assignee)
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
            this.$tab.closeOpenPage({ name })
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name }
                }
            } = vm || {}
            if (name === 'purDeptId') {
                this.$refs['vFormRef'].setFieldValue("purUserId", "");
                this.$refs['vFormRef'].setFieldValue("purUserName", "");
                this.$refs.vFormRef.setFieldValue("purDeptName", node.deptName);
                this.getUserListAll(node.id);
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
            const widgets = ['purName', 'purType', 'purCode', 'suName', 'grid47512', 'grid96921', 'grid63517', 'design_p2', 'grid27301', 'design_p3', 'grid61195', 'grid61195']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        handleDetailedButtonShow() {
            return true
        },
        deleteDetailed(index) {
            this.detailedFormValidate.tableItem.splice(index, 1)
            this.totalValue()
        },
        priceChange (scope) {
            const price = Number(scope.row.price);
            const taxPre = Number(scope.row.taxRate);
            const num = Number(scope.row.purNum);
            scope.row.amount = (num * price).toFixed(2);
            if(taxPre == 0){
                scope.row.taxAmount = (num * price).toFixed(2);
            }else{
                scope.row.taxAmount = (num * price * (1 + taxPre / 100)).toFixed(2)
            }
            scope.row.taxPrice = (price *(1 + taxPre / 100)).toFixed(2)
            this.totalValue()
        },
        totalValue() {
            this.formData.amount = 0
            this.formData.amountTax = 0
            this.detailedFormValidate.tableItem.forEach(item => {
                if (Number(item.purNum) > 0 && Number(item.amount) && Number(item.taxAmount)) {
                    this.formData.amount += Number(item.amount)
                    this.formData.amountTax += Number(item.taxAmount)
                }
            })
            this.$refs.vFormRef.setFormData({
                amount: this.formData.amount,
                amountTax: this.formData.amountTax,
            })
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
