<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
            @newButton="newButton"></button-top>
        <div class="container_flex_form">
            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
                active-text="隐藏非必填项" />
            <VFormRender ref="vFormRef" :form-data="formData" :class="{ 'formRender_view': queryType === 'view' }"
                @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange"
                @buttonClick="handleButtonClick" @treeSelectSelect="treeSelectSelect" @treeSelectInput="treeSelectInput"
                @operationButtonClick="operationButtonClick">
                <template slot="design_p1">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
                </template>
                <template slot="design_p2">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="客户信息" />客户信息</p>
                </template>
                <template slot="design_p3">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />付款信息</p>
                </template>
                <template slot="design_p4">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="合同信息" />交货信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="40" :queryType="queryType"
                            v-model="fileList" />
                    </div>
                </template>
                <template slot="quotationOrderDetail">
                    <div class="detailed" v-if="tableType != '2' && queryType !== 'view'">
                        <button-top ref="buttonTopRef" :buttonTopData="detailedButtonTop"
                            @newButton="detailNewButton"></button-top>
                        <el-upload ref="uploadRef" :action="uploadUrl" accept=".xlsx, .xls" :show-file-list="false"
                            :auto-upload="true" :headers="uploadHeaders" :on-success="uploadSuccess"
                            :on-error="uploadOnError" :before-upload="beforeUpload">
                        </el-upload>
                    </div>
                    <div>
                        <el-form :model="validateForm" ref="ruleForm">
                            <el-table border :data="validateForm.detailedForm" max-height="400px"
                                @selection-change="(data) => selectData = data" class="mt-20 saleOrderOperateEltable">
                                <el-table-column align="center" key="selectable" type="selection" width="50"
                                    fixed="left" v-if="queryType == 'create' || queryType == 'update'" />
                                <el-table-column type="index" width="50" align="left" label="序号" />
                                <el-table-column label="物料编码" align="left" prop="matlCode" min-width="150" />
                                <el-table-column label="物料名称" align="left" prop="matlName" min-width="240" />
                                <el-table-column label="规格型号" align="left" prop="matlType" min-width="120" />
                                <el-table-column label="计量单位" align="left" prop="matlUnit" min-width="120">
                                    <template slot-scope="scope">
                                        {{ scope.row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="数量" align="left" prop="matlNum" min-width="200">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>数量</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.matlNum'"
                                            :rules="[{ required: true, message: '请输入数量', trigger: ['change', 'blur'] }]">
                                            <span v-if="queryType == 'view'">{{ scope.row.matlNum.toFixed(2) }}</span>
                                            <el-input-number style="width: 100%" v-else controls-position="right"
                                                :min="1" :precision="4" :max="1000000" v-model.trim="scope.row.matlNum"
                                                @change="() => numberChange(scope.row)" />
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column label="单价（含税，单位：元）" align="left" min-width="200" prop="taxtaxPrice">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>单价（含税，单位：元）</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.taxPrice'"
                                            :rules="[{ required: true, message: '请输入单价', trigger: ['change', 'blur'] }]">
                                            <span v-if="queryType == 'view'">{{
                                                $textMethod.money(scope.row.taxPrice) }}</span>
                                            <money-input v-else v-model="scope.row.taxPrice"
                                                @change="() => numberChange(scope.row)" />
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column label="税率" align="left" min-width="140" prop="taxRate">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>税率</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.taxRate'"
                                            :rules="[{ required: true, message: '请选择税率', trigger: ['change', 'blur'] }]">
                                            <span v-if="queryType == 'view'">{{ scope.row.taxRate |
                                                orderTypeFilter(dict.type.taxPre) }}</span>
                                            <el-select v-columnFormat="{
                                                index: scope.$index,
                                                prop: 'taxRate',
                                                list: validateForm.detailedForm
                                            }" @change="(newVal, oldVal) => numberChange(scope.row)" v-else
                                                v-model="scope.row.taxRate" clearable>
                                                <el-option v-for="(item, key) in dict.type.taxPre" :key="key"
                                                    :label="item.label" :value="item.value" />
                                            </el-select>
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column label="总金额(不含税，单位：元)" align="left" min-width="200" prop="unTaxAmount">
                                    <template slot-scope="scope">
                                        <span>{{ $textMethod.money(scope.row.unTaxAmount) }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="总金额(含税，单位：元)" align="left" min-width="200" prop="taxAmount">
                                    <template slot-scope="scope">
                                        <span>{{ $textMethod.money(scope.row.taxAmount) }}</span>
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
        <selectCustomer ref="selectCustomer" :singleMode="true" @selectCustom="selectCustom" />
        <choice-material ref="choiceMaterial" @choiceMaterialClick="choiceMaterial" />
        <toBeReviewed ref="toBereview" />
    </div>
</template>
<script>
import { formFillInPage } from '@/api/form/form'
import indexMixin from '@/views/mixins'
import VFormRender from '@/components/form-render/index'
import attachmentTable from '@/views/components/attachmentTable'
import selectCustomer from "@/views/components/selectCustomer"
import choiceMaterial from '@/views/components/choice-material/index.vue'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import { deptTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { generateUUID } from '@/utils'
import {
    quotationImportUrl,
    quotationCreate,
    quotationQuotationView,
    quotationModify,
    quotationSaveSubmit,
    quotationQuotationDetailView,
    quotationModifyDetail
} from '@/api/saleManage/quotation'
import { minioDownload } from '@/api/minio'
import { uploadHeaders } from '@/utils/auth'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import { getUserInfo } from '@/utils/user-info'

export default {
    name: 'quotationOperate',
    mixins: [indexMixin],
    components: {
        VFormRender,
        attachmentTable,
        selectCustomer,
        choiceMaterial,
        toBeReviewed,
    },
    dicts: ['taxPre', 'MeasureUnit'],

    data() {
        return {
            loading: false,
            queryType: '',
            queryId: '',
            queryName: '',
            queryAuditArr: null,
            tableType: '1',
            isQuery: '',
            fileList: [],
            checked: false,

            formData: {
                deptName: '',
                bidderName: '',
            },
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
                { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
                { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
                { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update, create' }
            ],
            detailedButtonTop: [
                { buttonName: '选择物料', buttonCode: 'selectMaterial' },
                {
                    buttonName: '导入', buttonCode: 'dropdown', children: [
                        {
                            buttonCode: 'import',
                            buttonName: '导入',
                            buttonMode: '',
                        },
                        {
                            buttonCode: 'download',
                            buttonName: '下载模板',
                            buttonMode: ''
                        },
                    ]
                },
            ],
            validateForm: {
                detailedForm: []
            },
            userListOptions: [],

            uploadUrl: quotationImportUrl,
            uploadHeaders: uploadHeaders(),
            userInfo: getUserInfo(),
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            let { type, name, id, auditArr, tableType = '1', isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
            this.queryType = type || 'create'
            this.queryId = id || ''
            this.queryName = name || 'quotationOrder'
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
            this.tableType = tableType
            this.isQuery = isQuery

            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                await this.getDeptTreeData();

                if (this.tableType == '2') {
                    this.$refs['vFormRef'].hideWidgets(['card112021'])
                }
                if (this.queryType === 'update' || this.queryType == 'view') {

                    this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
                    this.quotationDetail();
                } else {
                    const { deptId, deptName } = this.userInfo;
                    this.$refs['vFormRef'].setFieldValue("deptId", deptId);
                    this.formData.deptName = deptName

                    let res = await userListAll({ deptId })
                    this.userListOptions = res.data.list || [];
                    this.$refs['vFormRef'].getWidgetRef('bidder').loadOptions(this.userListOptions)
                }
            })
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('quotationOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data)
                    resolve(true)
                })
            })
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' })
            this.$refs['vFormRef'].getWidgetRef('deptId').loadOptions(res.data || [])
        },
        quotationDetail() {
            this.loading = true;

            if (this.tableType == '1') {
                quotationQuotationView(this.queryId).then(({ data }) => {
                    this.formData = data;

                    data.expiryDate = this.parseTime(data.expiryDate, '{y}-{m}-{d}');
                    data.payDate = this.parseTime(data.payDate, '{y}-{m}-{d}');
                    data.deliveryDate = this.parseTime(data.deliveryDate, '{y}-{m}-{d}');
                    this.validateForm.detailedForm = data.detailList;
                    this.fileList = data.quotationPublicFiles;
                    this.$refs['vFormRef'].setFormData(data);

                    this.treeSelectSelect(this.$refs['vFormRef'].getWidgetRef('deptId'),
                        {
                            id: data.deptId,
                            deptName: data.deptName
                        });
                    this.countTotal();
                }).catch((err) => {

                }).finally(() => {
                    this.loading = false;
                });
            } else {
                this.validateForm.detailedForm = [];

                quotationQuotationDetailView(this.queryId).then(({ data }) => {
                    this.validateForm.detailedForm.push(data);
                    this.countTotal();
                }).catch((err) => {

                }).finally(() => {
                    this.loading = false;
                })
            }
        },
        checkoutStatus() {
            const arrId = ['quotationCode', 'theme', 'deptId', 'bidder', 'notes', 'fileList', 'design_p2',
                'cuCode', 'cuName', 'industry', 'customerValue', 'creditRate', 'contacts', 'phone', 'design_p3',
                'payMethod', 'payDate', 'design_p4', 'deliveryMethod', 'deliveryDate', 'deliveryAddress']

            if (this.checked) {
                this.$refs['vFormRef'].hideWidgets(arrId);
            } else {
                this.$refs['vFormRef'].showWidgets(arrId);
            }
        },
        buttonShow(item) {
            if (['saveSubmit'].includes(item.buttonCode) && this.queryType == 'create') {
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
        newButton(buttonCode) {
            if (buttonCode == 'cancel') {
                this.cancel(this.queryName)
            } else if (buttonCode == 'save') {
                this.handleSave();
            } else if (buttonCode == 'saveSubmit') {
                this.handleSaveSubmit();
            } else if (buttonCode === 'edit') {
                this.queryType = 'update'
                this.$refs['vFormRef'].setReadMode(false)
            } else if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName)
            } else if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName)
            }
        },
        detailNewButton(buttonCode) {
            if (buttonCode == 'selectMaterial') {
                this.$refs.choiceMaterial.init(null, [], this.validateForm.detailedForm)
            } else if (buttonCode == 'import') {
                this.$refs.uploadRef.$refs["upload-inner"].handleClick();
            } else if (buttonCode == 'download') {
                this.$download.fileUrl(`${minioDownload}?filePath=${encodeURI('templates/报价单明细模板.xls')}&fileName=${encodeURI('报价单明细模板.xls')}`, null, 'get');
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}

            if (name == 'cuCode') {
                let cId = this.$refs.vFormRef.getFieldValue("cuId");
                this.$refs.selectCustomer.init(cId);
            }
        },
        selectChange(name, node) {
            if (name == 'bidder') {
                if (node !== '') {
                    this.formData.bidderName = this.userListOptions.find(item => item.id == node).nickName
                }
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}
        },
        async treeSelectSelect(vm, node) {
            let { field: { options: { name } } } = vm || {}

            if (name === 'deptId') {
                if (node.id) {
                    this.formData.deptName = node.deptName
                    let res = await userListAll({ deptId: node.id })
                    this.userListOptions = res.data.list || [];
                    this.$refs['vFormRef'].getWidgetRef('bidder').loadOptions(this.userListOptions)
                }
            }
        },
        treeSelectInput(name, newVal) {

        },
        operationButtonClick(dataTable, buttonName, rowIndex, row) {

        },
        selectCustom(row) {
            this.$refs['vFormRef'].setFormData(
                {
                    cuId: row.id,
                    cuCode: row.cuCode,
                    cuName: row.cuName,
                    industry: row.industry,
                    customerValue: row.customerValue,
                    creditRate: row.creditRate,
                    contacts: row.contacts,
                    phone: row.phone,
                }
            );
        },
        choiceMaterial(matlList) {
            const data = matlList.map(item => {
                return { ...item, uid: generateUUID() }
            })
            const nextData = this.formatDetailForm(data)
            this.validateForm.detailedForm.push(...nextData)
        },
        uploadSuccess({ data, message }) {
            if (data && data.dataList) {
                if (data.msg) {
                    // 英文逗号导致html识别换行问题
                    const msg = ((data.msg.replace(/,/g, '，')).replace(/:/g, '：')).replace(/\n/g, '')
                    this.$modal.msgError(msg)
                } else {
                    this.$modal.msgSuccess('上传成功！')
                }
                this.validateForm.detailedForm = data.dataList;
                this.countTotal();
            } else {
                this.$modal.msgError(message)
            }
        },
        uploadOnError(err, file, fileList) {
            this.$modal.msgError('上传失败')
        },
        beforeUpload(file) {

        },
        numberChange(row) {
            const matlNum = Number(row.matlNum || 0);
            const taxPrice = Number(row.taxPrice || 0);
            const taxRate = Number(row.taxRate || 0);

            row.taxAmount = (matlNum * taxPrice).toFixed(2);
            row.unTaxAmount = (matlNum * (taxPrice / (1 + taxRate / 100))).toFixed(2);

            this.countTotal();
        },
        countTotal() {
            let totalMatlNum = 0;
            let totalUnTaxAmount = 0;
            let totalTaxAmount = 0;

            this.validateForm.detailedForm.forEach((item) => {
                totalMatlNum += Number(item.matlNum || 0);
                totalUnTaxAmount += Number(item.unTaxAmount || 0);
                totalTaxAmount += Number(item.taxAmount || 0);
            })
            this.$refs['vFormRef'].setFieldValue('totalMatlNum', totalMatlNum);
            this.$refs['vFormRef'].setFieldValue('totalUnTaxAmount', totalUnTaxAmount);
            this.$refs['vFormRef'].setFieldValue('totalTaxAmount', totalTaxAmount);
        },
        formatDetailForm(arr) {
            const nextArr = arr.map(item => {
                return {
                    ...item,
                    taxRate: item.taxRate || '13',
                    taxPrice: item.taxPrice || '',
                    unTaxAmount: item.unTaxAmount || '',
                    taxAmount: item.taxAmount || '',
                }
            })
            return nextArr
        },
        removeData(index) {
            this.validateForm.detailedForm.splice(index, 1);
            this.countTotal();
        },
        async handleSave() {
            if (this.tableType == '1') {
                let formValid1, formValid2
                this.$refs.ruleForm.validate((valid) => {
                    formValid1 = valid
                })
                this.$refs.vFormRef.validateForm((valid) => {
                    formValid2 = valid
                })
                if (formValid1 && formValid2) {
                    if (!this.validateForm.detailedForm.length) {
                        this.$modal.msgError('报价明细不能为空')
                        return
                    }
                    const formData = await this.$refs.vFormRef.getFormData()
                    const param = {
                        ...this.formData,
                        ...formData,
                        quotationId: this.queryId,
                        quotationPublicFiles: this.fileList,
                        detailList: this.validateForm.detailedForm
                    }
                    if (this.queryType == 'create') {
                        quotationCreate(param).then(({ message }) => {
                            this.$modal.msgSuccess(message);
                            this.cancel(this.queryName);
                        }).catch((err) => {

                        })
                    } else {
                        quotationModify(param).then(({ message }) => {
                            this.$modal.msgSuccess(message);
                            this.cancel(this.queryName);
                        }).catch((err) => {

                        })
                    }
                } else {
                    this.$modal.msgError('表单数据校验失败');
                }
            } else {
                this.$refs.ruleForm.validate((valid) => {
                    if (valid) {
                        quotationModifyDetail(this.validateForm.detailedForm).then(({ message }) => {
                            this.$modal.msgSuccess(message);
                            this.cancel(this.queryName);
                        }).catch((err) => {

                        })
                    } else {
                        this.$modal.msgError('表单数据校验失败');
                    }
                })
            }
        },
        async handleSaveSubmit() {
            let formValid1, formValid2
            this.$refs.ruleForm.validate((valid) => {
                formValid1 = valid
            })
            this.$refs.vFormRef.validateForm((valid) => {
                formValid2 = valid
            })
            if (formValid1 && formValid2) {
                if (!this.validateForm.detailedForm.length) {
                    this.$modal.msgError('报价明细不能为空')
                    return
                }
                const formData = await this.$refs.vFormRef.getFormData()

                this.$reviewerDialog({
                    type: ACTIVITI_ASSUGNEE.SA_BJD,
                    multiple: false,
                    success: (assignee) => {
                        let params = {
                            assignee: assignee,
                            ...this.formData,
                            ...formData,
                            quotationId: this.queryId,
                            quotationPublicFiles: this.fileList,
                            detailList: this.validateForm.detailedForm
                        }
                        quotationSaveSubmit(params).then(({ message }) => {
                            this.$modal.msgSuccess(message);
                            this.cancel(this.queryName)
                        }).catch((err) => {

                        })
                    }
                })
            }
        },
        cancel(name) {
            this.$tab.closeOpenPage({ name })
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
