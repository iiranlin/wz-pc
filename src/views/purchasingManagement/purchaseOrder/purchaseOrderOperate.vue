<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
            @newButton="newButton"></button-top>
        <div class="container_flex_form">

            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
                active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" v-if="tableType != '2'"
                :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
                @buttonClick="handleButtonClick" @selectChange="selectChange" @treeSelectInput="treeSelectInput"
                @treeSelectSelect="treeSelectSelect" @formChange="handleFormChange">
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
                        <attachmentTable ref="attachmentTable" businessType="13" :queryType="queryType"
                            v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <div slot="detailedData">
                    <button-top :buttonTopData="purchaseListButtonTop" :buttonShow="buttonShow"
                        @customUpload="customUpload" @newButton="newButton" @uploadOnSuccess="uploadOnSuccess"
                        @uploadOnError="uploadOnError"></button-top>
                    <purchaseList ref="purchaseList" :dict="dict.type" :queryType="queryType" :tableType="tableType"
                        @numberChange="numberChange"></purchaseList>
                </div>
            </VFormRender>
            <purchaseList style="margin-top: 50px;" ref="purchaseList" v-else :dict="dict.type" :queryType="queryType"
                :tableType="tableType" @numberChange="numberChange"></purchaseList>
        </div>
        <selectProject ref="selectProject" singleMode @selections="selections" :propsFormData="propsFormDataProject" />
        <choice-material ref="choiceMaterial" @choiceMaterialClick="handleConfirmMaterial" />
        <selectContract ref="contract" singleMode
            :filterCondition="{ ...filterCondition, unitId: propsFormDataProject.unitId }"
            @selections="handleContract" />
        <choice-bom ref="choiceBom" @change="(data) => choiceClick(data, 'choiceBom')"
            :propsFormData="propsFormDataProject" />
        <selectSupplier ref="selectSupplier" singleMode @selections="selectCustom" />
        <toBeReviewed ref="toBereview" />
        <Dialog title="批量修改" close-on-click-modal :visible.sync="branchEditVis" width="896px">
            <el-form :model="branchEditForm" label-width="100px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="期望到货日期" label-width="120px">
                            <el-date-picker style="width: 100%;" v-model="branchEditForm.arriveDate" type="date"
                                format="yyyy-MM-dd" value-format="timestamp"></el-date-picker>
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
import { OrderSaveSubmit, OrderCreateCreate, OrderDetail, OrderRawLists, OrderRawModifyAll, orderImportExcel } from '@/api/prodmgr-pu/order';
import purchaseList from './components/purchaseList'
import { deptTree, getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getToken } from '@/utils/auth'
import { PurOrderRawList } from '@/api/projectManagement/contractManagement'
import { bomPurchaseOrderQuote } from '@/api/prodmgr-mm/bom'
import selectProject from "@/views/components/selectProject"
import selectContract from '@/views/components/selectContract'
import choiceMaterial from '@/views/components/choice-material'
import { getUserInfo } from '@/utils/user-info'
import { generateUUID } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import indexMixin from '@/views/mixins'
import VFormRender from '@/components/form-render/index'
import choiceBom from "@/views/components/choice-bom"
import { minioDownload } from '@/api/minio'
import selectSupplier from "@/views/components/choice-supplier"
export default {
    mixins: [indexMixin],
    name: "purchaseOrderOperate",
    components: { choiceBom, VFormRender, toBeReviewed, purchaseList, selectProject, selectContract, attachmentTable, choiceMaterial, selectSupplier },
    dicts: ['MeasureUnit', 'taxPre'],
    data() {
        return {
            purchaseListButtonTop: [
                { buttonName: '选择BOM', buttonCode: 'addBom', type: 'create, update' },
                { buttonName: '选择物料', buttonCode: 'addMaterial', type: 'create, update' },
                { buttonName: '模版下载', buttonCode: 'downloadtemplate', type: 'create, update' },
                { buttonName: '导入', buttonCode: 'import', type: 'create, update' },
                { buttonName: '批改', buttonCode: 'correct', options: "{\"prompt\":\"批改可多选后批量维护\"}", type: 'create, update' },
                { buttonName: '删除', buttonCode: 'delete', type: 'create, update' }
            ],

            loading: false,
            queryType: '',
            queryId: '',
            queryName: '',
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
                businessType: '13',
            },
            userInfo: getUserInfo(),
            status: '',
            filterCondition: {
                ctType: '1',
                bizStatus: '0,1',
                status: '3',
                projectId: ''
            },
            tableType: '1',
            fileList: [],
            checked: false,
            isQuery: '',
            propsFormDataProject: {
                unitId: ''
            },
            uploadUrl: orderImportExcel,
            branchEditVis: false,
            branchEditForm: {
                arriveDate: ''
            }
        }
    },
    created() {
        this.init();
    },
    methods: {
        handleFormChange(key, val) {
            if (key == 'ctCode') {
                if (val) {
                    this.purchaseListButtonTop = [

                        { buttonName: '删除', buttonCode: 'delete', type: 'create, update' }
                    ]
                } else {
                    this.purchaseListButtonTop = [
                        { buttonName: '选择BOM', buttonCode: 'addBom', type: 'create, update' },
                        { buttonName: '选择物料', buttonCode: 'addMaterial', type: 'create, update' },
                        { buttonName: '模版下载', buttonCode: 'downloadtemplate', type: 'create, update' },
                        { buttonName: '导入', buttonCode: 'import', type: 'create, update' },
                        { buttonName: '批改', buttonCode: 'correct', options: "{\"prompt\":\"批改可多选后批量维护\"}", type: 'create, update' },
                        { buttonName: '删除', buttonCode: 'delete', type: 'create, update' }
                    ]
                }

            }
        },
        handleConfirmMaterial(data = []) {
            let amount = 0, amountTax = 0, arr = []
            const purchaseList = this.$refs['purchaseList'];
            const params = purchaseList.tableData.detailsList || []
            const detailList = params.concat(data.map(item => ({ ...item, sourceType: 2 })))
            const nextRawList = detailList.map(item => {
                amount += Number(item.amount || 0);
                amountTax += Number(item.amountTax || 0);
                return Object.assign({}, item, {
                    amount: item.amount || 0,
                    uid: item.uid || generateUUID(),
                    amountTax: item.amountTax || 0,
                    orginNum: item.orginNum || 0,
                    orginUseNum: item.orginUseNum || 0,
                    num: item.num || 1,
                    price: item.price || 1,
                    taxPre: item.taxPre || '13',
                    wantArriveDate: item.wantArriveDate || undefined
                })
            })
            this.$refs.purchaseList.init(nextRawList);
            this.$refs['vFormRef'].setFieldValue("amount", amount);
            this.$refs['vFormRef'].setFieldValue("amountTax", amountTax);
        },
        checkoutStatus(flag) {
            const widgets = ['purCode', 'purName', 'purType', 'purDeptId', 'purUserId', 'receiptDate', 'remarks', 'fileList', 'design_p2', 'grid18700', 'design_p3', 'grid78943']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
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
        init() {
            let { type, name, id, auditArr, tableType, isQuery } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'purchaseOrder';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.tableType = tableType || '1';
            this.isQuery = isQuery
            this.$nextTick(async () => {
                if (this.queryType != 'create' && tableType === '2') {
                    this.OrderDetail();
                    return
                }
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                await this.getDeptTreeData();
                await this.getUnitTree()
                if (this.queryName == 'qualityTesting') {
                    this.$refs['vFormRef'].hideWidgets(['amount', 'amountTax'])
                }
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                }
                if (this.queryType != 'create') {
                    this.$refs['vFormRef'].disableWidgets('ctCode');
                    this.OrderDetail();
                } else {
                    this.$refs['vFormRef'].setFieldValue("bizDate", new Date().getTime());
                    const { deptId, deptName, nickName, id: nickId } = this.userInfo;
                    this.getUserListAll(deptId);
                    this.initUnitInfo()
                    this.$refs['vFormRef'].setFieldValue("purDeptId", deptId);
                    this.$refs['vFormRef'].setFieldValue("purDeptName", deptName);
                    this.$refs['vFormRef'].setFieldValue("purUserId", nickId);
                    this.$refs['vFormRef'].setFieldValue("purUserName", nickName);
                }
            })
        },
        async getUnitTree() {
            const res = await getUnitTree({ status: 0 })
            this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('purDeptId').loadOptions(res.data || []);
        },
        async getUserListAll(deptId) {
            const res = await userListAll({ deptId });
            this.$refs['vFormRef'].getWidgetRef('purUserId').loadOptions(res.data.list || []);
        },
        OrderDetail() {
            this.loading = true;
            if (this.tableType == '1') {
                OrderDetail(this.queryId).then(({ data }) => {
                    this.status = data.status;
                    const list = data.detailList.map((item) => ({ ...item, uid: generateUUID() }))
                    this.$refs.purchaseList.init(list);
                    this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                    this.numberChange(list)
                    delete data.detailList;
                    if (data.purDeptId) {
                        this.getUserListAll(data.purDeptId);
                    } else {
                        data.purDeptId = undefined;
                    }
                    if (data.ctCode) {
                        this.$refs['vFormRef'].disableWidgets("suCode");
                    }
                    this.$refs["vFormRef"].setFormData(data);
                }).finally(() => {
                    this.loading = false;
                });
            } else {
                const ids = this.queryId.split(',');
                OrderRawLists({ ids }).then(({ data }) => {
                    const list = data.map((item) => ({ ...item, uid: generateUUID() }))
                    this.$refs.purchaseList.init(list);
                }).finally(() => {
                    this.loading = false;
                });
            }
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('purchaseOrderOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
            if (fieldName === 'purUserId') {
                if (newValue) {
                    const optionLabel = this.$refs['vFormRef'].getWidgetRef('purUserId').optionLabel;
                    this.$refs['vFormRef'].setFieldValue("purUserName", optionLabel);
                } else {
                    this.$refs['vFormRef'].setFieldValue("purUserName", "");
                }
                return
            }
            if (fieldName === 'projectCode') {
                this.$refs['vFormRef'].setFormData({
                    projectId: '',
                    projectCode: '',
                    projectName: '',
                    ctCode: '',
                    ctName: '',
                    ctId: '',
                    suCode: '',
                    suName: '',
                    suId: '',
                });
                this.filterCondition.projectId = ''
                this.$refs.purchaseList.init([])
                this.$refs['vFormRef'].setFieldValue("amount", 0);
                this.$refs['vFormRef'].setFieldValue("amountTax", 0);
                this.$refs['vFormRef'].enableWidgets("suCode");
                return
            }
            if (fieldName === 'ctCode') {
                this.$refs['vFormRef'].setFormData({
                    ctCode: '',
                    ctName: '',
                    ctId: '',
                    suCode: '',
                    suName: '',
                    suId: '',
                });
                this.$refs.purchaseList.init([])
                this.$refs['vFormRef'].enableWidgets("suCode");
                return
            }
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "purDeptId") {
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
                    options: { name },
                },
            } = vm || {};
            if (name === "purDeptId") {
                if (!newVal) {
                    this.$refs['vFormRef'].setFieldValue("purUserId", "");
                    this.$refs['vFormRef'].setFieldValue("purUserName", "");
                    this.$refs['vFormRef'].getWidgetRef('purDeptId').loadOptions([]);
                }
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            const unitId = this.$refs.vFormRef.getFieldValue("unitId");
            if (!unitId) {
                this.$modal.msgError('请先选择所属组织')
                return
            }
            this.propsFormDataProject.unitId = unitId
            if (name === 'projectCode') {
                const pId = this.$refs['vFormRef'].getFieldValue("projectId");
                this.$refs.selectProject.init(pId);
                return
            }
            if (name === 'ctCode') {
                const cId = this.$refs['vFormRef'].getFieldValue("ctId");
                this.$refs.contract.init(cId);
                return
            }
            if (name === 'suCode') {
                const sId = this.$refs.vFormRef.getFieldValue("suId");
                this.$refs.selectSupplier.open(sId)
                return
            }
        },
        selectCustom(row) {
            this.$refs['vFormRef'].setFormData({ suId: row.suId, suCode: row.suCode, suName: row.suName })
            this.$refs['purchaseList'].tableData.detailsList = []
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        /*选择项目信息*/
        selections(row) {
            const projectId = row.id
            delete row.id
            this.filterCondition.projectId = projectId
            this.$refs['vFormRef'].setFormData({
                ...row,
                projectId: projectId,
                ctCode: '',
                ctName: '',
                ctId: '',
                suCode: '',
                suName: '',
                suId: '',
            });
            this.$refs.purchaseList.init([]);
            this.$refs['vFormRef'].setFieldValue("amount", 0);
            this.$refs['vFormRef'].setFieldValue("amountTax", 0);
        },
        /*选择合同信息*/
        handleContract(row) {
            const { ctCode, ctName, ctId, relativeCode, relativeName, relativeId, projectCode, projectName, projectId } = row;
            this.$refs['vFormRef'].setFormData({
                ctCode: ctCode,
                ctName: ctName,
                ctId: ctId,
                suCode: relativeCode,
                suName: relativeName,
                suId: relativeId,
                projectCode,
                projectName,
                projectId
            });
            this.filterCondition.projectId = projectId || ''
            this.PuCtDetail(row.ctId);
            if (ctCode) {
                this.$refs['vFormRef'].disableWidgets("suCode");
            }
        },
        PuCtDetail(id) {
            this.loading = true;
            PurOrderRawList(id).then(({ data }) => {
                let amount = 0, amountTax = 0, arr = [];
                if (data && data.length) {
                    data.forEach(item => {
                        if (item.bizStatus != '2') {
                            // const taxRate = Number(item.taxRate || 0);
                            // const num = Number(item.purNum || 0);
                            // const price = Number(item.price || 0);
                            // const taxAmount = (num * price * (1 + taxRate / 100))
                            // item.taxAmount = taxAmount.toFixed(2)
                            amount += Number(item.amount);
                            amountTax += Number(item.taxAmount);
                            arr.push(item);
                        }
                    });
                    this.$refs.purchaseList.init(arr);
                    this.$refs['vFormRef'].setFieldValue("amount", amount);
                    this.$refs['vFormRef'].setFieldValue("amountTax", amountTax);
                }

            }).finally(() => {
                this.loading = false;
            });
        },
        numberChange(data) {
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
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        newButton(buttonCode) {
          if (buttonCode === 'rollbackToPrevious') {
            this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
            return
          }
            if (buttonCode === 'correct') {
                const detailedList = this.$refs['purchaseList']
                if (!detailedList.selectData.length) {
                    this.$modal.msgError("请选择数据");
                    return
                }
                this.branchEditVis = true
                return
            }
            if (buttonCode === 'delete') {
                const purchaseList = this.$refs['purchaseList']
                if (purchaseList.selectData.length > 0) {
                    this.$modal.confirm('您确定要删除吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let newData = purchaseList.tableData.detailsList.filter((a) => !purchaseList.selectData.some((b) => a.uid === b.uid));
                        purchaseList.tableData.detailsList = newData
                        this.numberChange(newData)
                    })
                } else {
                    this.$modal.msgError('请选择数据')
                }
                return
            }
            if (buttonCode === 'edit') {
                this.queryType = 'update';
                this.$refs['vFormRef'].setReadMode(false);
                this.$refs['vFormRef'].showWidgets('detailsAdd');
                this.$refs['vFormRef'].showWidgets('replaceAdd');

            } else if (buttonCode == 'addMaterial') {
                const purchaseList = this.$refs['purchaseList'];
                const arr = purchaseList.tableData.detailsList || []
                this.$refs.choiceMaterial.init(null, [], arr);
            } else if (buttonCode == 'addBom') {
                const unitId = this.$refs.vFormRef.getFieldValue("unitId");
                if (!unitId) {
                    this.$modal.msgError('请先选择所属组织')
                    return
                }
                this.propsFormDataProject.unitId = unitId
                const purchaseList = this.$refs['purchaseList'];
                const arr = purchaseList.tableData.detailsList || []
                this.$refs.choiceBom.init(null, arr)
            } else if (buttonCode === 'cancel') {
                this.cancel(this.queryName);
            } else if (buttonCode === 'save') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'saveSubmit') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
            } else if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
            } else if (buttonCode === 'downloadtemplate') {
                this.$download.fileUrl(`${minioDownload}?filePath=${encodeURI('templates/采购订单明细模板.xls')}&fileName=${encodeURI('采购订单明细模板.xls')}`, null, 'get');
                return
            }
        },
        submitForm() {
            const purchaseList = this.$refs['purchaseList']
            purchaseList.tableData.detailsList.map(item => {
                purchaseList.selectData.map(ele => {
                    if (item.uid === ele.uid) {
                        item.arriveDate = this.branchEditForm.arriveDate
                    }
                })
            })
            this.branchEditVis = false
            this.branchEditForm.arriveDate = ''
        },
        async choiceClick(data) {
            let dataArr = data.map(item => item.id)
            const res = await bomPurchaseOrderQuote(dataArr)
            res.data = res.data.map(item => { return { ...item, sourceType: 2 } })
            this.handleConfirmMaterial(res.data)
        },
        async handleSave(buttonCode) {
            try {
                const purchaseList = this.$refs['purchaseList'];
                if (this.tableType == '2') {
                    purchaseList.$refs.elForm.validate(valid => {
                        if (valid) {
                            OrderRawModifyAll(purchaseList.tableData.detailsList).then(({ message }) => {
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
                    return purchaseList.$refs.elForm.validate(valid => {
                        if (valid) {
                            resolve(purchaseList.tableData.detailsList)
                        } else {
                            reject()
                        }
                    })
                })
                if (!purchaseList.tableData.detailsList.length) {
                    this.$modal.msgError('产品明细不能为空')
                    return
                }
                const data = await Promise.all([vFormRefData, pList])
                let api = OrderCreateCreate;

                const param = { ...data[0], detailList: data[1], fileList: this.fileList }
                // 保存的时候重新计算
                param.detailList.forEach(item => {
                    item.amount = Number(item.amount || 0);
                    item.amountTax = Number(item.taxAmount || 0);
                });

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
            if (!this.resOk) {
                const res = await url({ ...param, assignee })
                res.success && this.$modal.msgSuccess(`${res.message}`)
                this.resOk = true
                this.cancel(this.queryName)
            }
        },
        uploadOnSuccess(code, data, message) {
            if (code === 0) {
                const detailList = data.dataList.map(item => ({ ...item, sourceType: 2 }))
                let matlArray = this.$refs.purchaseList.tableData.detailsList.concat(detailList).filter((item, index, self) =>
                    index === self.findIndex((t) => (
                        t.matlCode === item.matlCode
                    ))
                );
                this.$refs.purchaseList.tableData.detailsList = matlArray
                if (data.msg) {
                    this.$modal.alertWarning(data.msg, 'alertWarningClass')
                } else {
                    this.$modal.msgSuccess(message)
                }
            } else {
                this.$modal.msgError('导入失败')
            }
        },
        uploadOnError(err, file, fileList) {
            this.$modal.msgError('导入失败')
        },
        customUpload(option) {
            if (option.file) {
                this.$download.fileUpload(this.uploadUrl, { file: option.file }).then(({ code, data, message }) => {
                    this.uploadOnSuccess(code, data, message)
                })
            }
        },
    }
};
</script>
<style lang="scss" scoped></style>
