<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项"/>
            <VFormRender ref="vFormRef" :form-data="formData" :class="{'formRender_view': queryType === 'view'}"
                @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @buttonClick="handleButtonClick"
                @treeSelectSelect="treeSelectSelect" @treeSelectInput="treeSelectInput"
                @operationButtonClick="operationButtonClick" @formChange="handleFormChange">
                <template slot="design_p1">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
                </template>
                <template slot="design_p2">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
                </template>
                <template slot="design_p3">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="合同信息" />报价信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="41" :queryType="queryType" v-model="fileList"/>
                    </div>
                </template>
                <template slot="preOrderDetail">
                    <div>
                        <el-form :model="validateForm" ref="ruleForm">
                            <el-table border :data="validateForm.detailedForm" max-height="400px"
                                @selection-change="(data) => selectData = data" class="mt-20 saleOrderOperateEltable">
                                <el-table-column align="center" key="selectable" type="selection" width="50"
                                    fixed="left" v-if="queryType == 'create' || queryType == 'update'" />
                                <el-table-column type="index" width="50" align="left" label="序号" />
                                <el-table-column label="物料编码" align="left" prop="matlCode" min-width="150"/>
                                <el-table-column label="物料名称" align="left" prop="matlName" min-width="240"/>
                                <el-table-column label="规格型号" align="left" prop="matlType" min-width="120"/>
                                <el-table-column label="计量单位" align="left" prop="matlUnit" min-width="120">
                                    <template slot-scope="scope">
                                        {{ scope.row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                                    </template>
                                </el-table-column>
                                <el-table-column label="数量" align="left" prop="matlNum" min-width="120"/>
                                <el-table-column label="单价（含税，单位：元）" align="left" prop="taxtaxPrice" min-width="200">
                                    <template slot-scope="scope">
                                        <span>{{ $textMethod.money(scope.row.taxPrice)}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="税率" align="left" prop="taxRate" min-width="120">
                                    <template slot-scope="scope">
                                        <span>{{ scope.row.taxRate | orderTypeFilter(dict.type.taxPre)}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="总金额(不含税，单位：元)" align="left" min-width="200" prop="unTaxAmount">
                                    <template slot-scope="scope">
                                        <span>{{ $textMethod.money(scope.row.unTaxAmount)}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="总金额(含税，单位：元)" align="left" min-width="200" prop="taxAmount">
                                    <template slot-scope="scope">
                                        <span>{{ $textMethod.money(scope.row.taxAmount)}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column v-if="tableType != '2' && queryType !== 'view'" label="操作" align="center" fixed="right">
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
        <customUser ref="customUser" :singleMode="true" @customUserClick="customUserClick"/>
        <selectProject ref="selectProject" :singleMode="true" @selections="projectSelections" />
        <choiceQuotation ref="choiceQuotation" :propsFormData="propsFormData" @selections="quotationSelections"/>
        <toBeReviewed ref="toBereview" />
    </div>
</template>
<script>
import { formFillInPage } from '@/api/form/form'
import indexMixin from '@/views/mixins'
import VFormRender from '@/components/form-render/index'
import attachmentTable from '@/views/components/attachmentTable'
import selectProject from "@/views/components/selectProject"
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import customUser from '@/views/components/custom-user'
import choiceQuotation from '@/views/components/choice-quotation/index.vue'
import { quotationDetailList } from '@/api/saleManage/quotation'
import {preOrderCreate,
preOrderModify,
preOrderCreateAndsubmit,
preOrderDetail} from '@/api/saleManage/preOrder'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import { getUserInfo } from '@/utils/user-info'
import dayjs from 'dayjs'
export default {
    name: 'preOperate',
    mixins: [indexMixin],
    components: {
        VFormRender,
        attachmentTable,
        toBeReviewed,
        customUser,
        selectProject,
        choiceQuotation,
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

            propsFormData: {
                quotationResult: 1,
            },

            formData:{
                preInformantName:'',
            },
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
            validateForm: {
                detailedForm: []
            },
        }
    },
    created() {
            this.init()
    },
    methods: {
        init(){
            let { type, name, id, auditArr, tableType = '1', isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
            this.queryType = type || 'create'
            this.queryId = id || ''
            this.queryName = name || 'preOrder'
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
            this.tableType = tableType
            this.isQuery = isQuery

            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();

                if(this.tableType == '2'){
                    this.$refs['vFormRef'].hideWidgets(['card112021'])
                }
                if (this.queryType === 'update' || this.queryType == 'view') {

                    this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
                    this.preDetail();
                }else {
                    const {nickName} = getUserInfo()
                    this.$refs.vFormRef.setFieldValue("preInformantName", nickName);
                    this.$refs.vFormRef.setFieldValue("preApplyDate", dayjs().format('YYYY-MM-DD'));
                }
            })
        },
        formFillInPage(){
            return new Promise((resolve) => {
                formFillInPage('preOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data)
                    resolve(true)
                })
            })
        },
        preDetail(){
            this.loading = true;

            preOrderDetail(this.queryId).then(({ data }) => {
                this.formData = data;

                data.arrivalDate = this.parseTime(data.arrivalDate,'{y}-{m}-{d}');
                data.preApplyDate = this.parseTime(data.preApplyDate,'{y}-{m}-{d}');
                data.expiryDate = this.parseTime(data.expiryDate,'{y}-{m}-{d}');
                this.validateForm.detailedForm = data.detailList;
                this.fileList = data.fileList;
                this.$refs['vFormRef'].setFormData(data);

                this.countTotal();
            }).catch((err) => {
                
            }).finally(() => {
                this.loading = false;
            });
        },
        checkoutStatus(){
            const arrId = ['grid26280', 'grid51735', 'grid96921', 'grid46207', 'grid18700', 'grid35362', 'grid78943', 'grid80902', 'quotationName', 'expiryDate', 'design_p1', 'design_p2']

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
        newButton(buttonCode){
          if (buttonCode === 'rollbackToPrevious') {
            this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
            return
          }
            if(buttonCode == 'cancel'){
                this.cancel(this.queryName)
            }else if(buttonCode == 'save'){
                this.handleSave();
            }else if(buttonCode == 'saveSubmit'){
                this.handleSaveSubmit();
            }else if (buttonCode === 'edit') {
                this.queryType = 'update'
                this.$refs['vFormRef'].setReadMode(false)
            }else if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName)
            }else if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName)
            }
        },
        handleAppendButtonClick(vm){
            let { field: { options: { name } } } = vm || {}

            if(name == 'preInformantName'){
                let preInformantCode = this.$refs.vFormRef.getFieldValue("preInformantCode");
                this.$refs.customUser.init(preInformantCode);
            }else if(name == 'projectCode'){
                let projectId = this.$refs.vFormRef.getFieldValue("projectId");
                this.$refs.selectProject.init(projectId);
            }else if(name == 'quotationCode'){
                let quotationId = this.$refs.vFormRef.getFieldValue("quotationId");
                this.$refs.choiceQuotation.init(quotationId);
            }
        },
        selectChange(name, node){
            
        },
        handleButtonClick(vm){
            let { field: { options: { name } } } = vm || {}
        },
        async treeSelectSelect(vm, node){
            let { field: { options: { name } } } = vm || {}

        },
        treeSelectInput(name, newVal){
         
        },
        operationButtonClick(dataTable, buttonName, rowIndex, row){

        },
        customUserClick(data){
            this.$refs.vFormRef.setFieldValue("preInformantName", data.nickName);
            this.$refs.vFormRef.setFieldValue("preInformantCode", data.id);
        },
        handleFormChange(fieldName, newValue, oldValue) {
            if(fieldName === 'projectCode' && !newValue) {
                this.$refs.vFormRef.setFieldValue("projectName", '');
                this.$refs.vFormRef.setFieldValue("projectId", '');
                this.$refs.vFormRef.setFieldValue("unitId", '');
                this.$refs.vFormRef.setFieldValue("unitName", '');
            }
        },
        projectSelections(data) {
            this.$refs.vFormRef.setFieldValue("projectCode", data.projectCode);
            this.$refs.vFormRef.setFieldValue("projectName", data.projectName);
            this.$refs.vFormRef.setFieldValue("projectId", data.id);
            this.$refs.vFormRef.setFieldValue("unitId", data.unitId);
            this.$refs.vFormRef.setFieldValue("unitName", data.unitName);
        },
        quotationSelections(row){
            this.$refs['vFormRef'].setFormData(
                { 
                    quotationCode: row.quotationCode, 
                    quotationName: row.theme, 
                    expiryDate: this.parseTime(row.expiryDate,'{y}-{m}-{d}'),
                    cuCode: row.cuCode,
                    cuName: row.cuName,
                    cuId: row.cuId,
                    industry: row.industry,
                    customerValue: row.customerValue,
                    creditRate: row.creditRate,
                    contacts: row.contacts,
                    phone: row.phone,
                    quotationId: row.quotationId,
                }
            );
            const theme = this.$refs.vFormRef.getFieldValue("theme");
            if(!theme) {
                this.$refs.vFormRef.setFieldValue("theme", row.theme);
            }
            this.getQuotationDetailList();
        },
        getQuotationDetailList(){
            this.loading = true;

            let params = {
                quotationCode:this.$refs.vFormRef.getFieldValue("quotationCode"),
                isQuote: '0',
            }
            quotationDetailList(params).then(({data}) => {
                data.list.forEach((item) => {
                    this.$set(item, 'quotationDetailId', item.detailId);
                    delete item.detailId;
                })
                this.validateForm.detailedForm = data.list;
                this.countTotal();
            }).catch((err) => {
                
            }).finally(() => {
                this.loading = false;
            })
        },
        countTotal(){
            let totalMatlNum = 0;
            let totalUnTaxAmount = 0;
            let totalTaxAmount = 0;

            this.validateForm.detailedForm.forEach((item) => {
                totalMatlNum += Number(item.matlNum || 0);
                totalUnTaxAmount += Number(item.unTaxAmount || 0);
                totalTaxAmount += Number(item.taxAmount || 0);
            })
            this.$refs['vFormRef'].setFieldValue('totalMatlNum',totalMatlNum);
            this.$refs['vFormRef'].setFieldValue('totalUnTaxAmount',totalUnTaxAmount);
            this.$refs['vFormRef'].setFieldValue('totalTaxAmount',totalTaxAmount);
        },
        removeData(index){
            this.validateForm.detailedForm.splice(index, 1);
            this.countTotal();
        },
        async handleSave(){
            if(this.tableType == '1'){
                let formValid1, formValid2
                this.$refs.ruleForm.validate((valid) => {
                    formValid1 = valid
                })
                this.$refs.vFormRef.validateForm((valid) => {
                    formValid2 = valid
                })
                if (formValid1 && formValid2) {
                    if (!this.validateForm.detailedForm.length) {
                        this.$modal.msgError('明细信息不能为空')
                        return
                    }
                    const formData = await this.$refs.vFormRef.getFormData()
                    const param = {
                        ...this.formData,
                        ...formData,
                        preOrderId: this.queryId,
                        fileList: this.fileList,
                        detailList: this.validateForm.detailedForm
                    }
                    if(this.queryType == 'create'){
                        preOrderCreate(param).then(({message}) => {
                            this.$modal.msgSuccess(message);
                            this.cancel(this.queryName);
                        }).catch((err) => {
                            
                        })
                    }else{
                        preOrderModify(param).then(({message}) => {
                            this.$modal.msgSuccess(message);
                            this.cancel(this.queryName);
                        }).catch((err) => {
                            
                        })
                    }
                }else {
                    this.$modal.msgError('表单数据校验失败');
                }
            }
        },
        async handleSaveSubmit(){
            let formValid1, formValid2
            this.$refs.ruleForm.validate((valid) => {
                formValid1 = valid
            })
            this.$refs.vFormRef.validateForm((valid) => {
                formValid2 = valid
            })
            if (formValid1 && formValid2) {
                if (!this.validateForm.detailedForm.length) {
                    this.$modal.msgError('明细信息不能为空')
                    return
                }
                const formData = await this.$refs.vFormRef.getFormData()
           
                this.$reviewerDialog({
                    type: ACTIVITI_ASSUGNEE.SA_YTDD,
                    multiple: false,
                    success: (assignee) => {
                        let params = {
                            assignee: assignee,
                            ...this.formData,
                            ...formData,
                            preOrderId: this.queryId,
                            fileList: this.fileList,
                            detailList: this.validateForm.detailedForm
                        }
                        preOrderCreateAndsubmit(params).then(({message}) => {
                            this.$modal.msgSuccess(message);
                            this.cancel(this.queryName)
                        }).catch((err) => {
                            
                        })
                    }
                })
            }else {
                this.$modal.msgError('表单数据校验失败');
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
