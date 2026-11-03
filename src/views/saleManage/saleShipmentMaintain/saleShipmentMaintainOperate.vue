<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
            @newButton="newButton"></button-top>
        <div class="container_flex_form">

            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
                active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" v-if="tableType == '1'" @formChange="handleFormChange" @selectChange="selectChange"
                :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
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
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="客户信息" />客户信息</p>
                </template>
                <template slot="design_p5">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="收发信息" />收发信息</p>
                </template>
                <div slot="fileList" style="display: flex;flex-direction: column;">
                    <attachmentTable ref="attachmentTable" businessType="02" :queryType="queryType" v-model="fileList">
                    </attachmentTable>
                </div>
                <div slot="detailedData">
                    <div class="detailed" v-if="tableType != '2' && queryType !== 'view'">
                        <button-top ref="buttonTopRef" :buttonTopData="detailedButtonTop"
                            @newButton="detailNewButton"></button-top>
                    </div>
                    <detailedList ref="detailedList" :dict="dict.type" :queryType="queryType" :tableType="tableType"
                        @numberChange="countPrice">
                    </detailedList>
                </div>
            </VFormRender>
            <detailedList v-else style="margin-top: 50px;" ref="detailedList" :dict="dict.type" :queryType="queryType"
                :tableType="tableType" @numberChange="countPrice"></detailedList>
        </div>
        <choiceDeliveryQuoteList ref="choiceDeliveryQuoteList" @selections="selections"
            :propsFormData="propsFormData" />
        <toBeReviewed ref="toBereview" />
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { deliverySaveOrder, deliveryOrderView, deliveryDetailView, deliverySaveDetail, deliverySaveSubmitOrder } from '@/api/prodmgr-sa/delivery';
import detailedList from './components/detailedList'
import choiceDeliveryQuoteList from "@/views/components/choice-deliveryQuoteList"
import { generateUUID } from '@/utils'
import attachmentTable from '@/views/components/attachmentTable'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import indexMixin from '@/views/mixins'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import { getUnitTree } from '@/api/system/dept'

export default {
    name: "saleShipmentMaintainOperate",
    mixins: [indexMixin],
    components: { VFormRender, detailedList, choiceDeliveryQuoteList, attachmentTable, toBeReviewed },
    dicts: ['MeasureUnit'],
    data() {
        return {
            loading: false,
            queryType: '',
            queryId: '',
            queryName: '',
            formJson: {},
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
            status: '',
            tableType: '1',
            checked: false,
            fileList: [],
            isQuery: '',
            propsFormData: {
                unitId: ''
            },
            detailedButtonTop: [
                { buttonName: '删除', buttonCode: 'delete' },
            ],
        }
    },
    computed: {
        ...mapGetters(['infoData']),
    },
    created() {
        this.init();
    },
    methods: {
        buttonShow(item) {
          if (item.buttonCode === 'rollbackToPrevious') {
            const query = this.isDialog ? this.dialogQuery : this.$route.query
            return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
              && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
              && this.buttonShow({ ...item, buttonCode: 'reject' })
          }
            if (['saveSubmit'].includes(item.buttonCode) && this.queryType === 'create') {
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
            let { type, name, id, auditArr, tableType, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'saleShipmentMaintain';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.tableType = tableType || '1';
            this.isQuery = isQuery
            this.$nextTick(async () => {
                if (this.queryType != 'create' && tableType === '2') {
                    this.deliveryOrderView();
                    return
                }
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                await this.getUnitTree()
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                    this.$refs['vFormRef'].hideWidgets(['addButton', 'deleteButton']);
                }
                if (this.queryType != 'create') {
                    this.deliveryOrderView();
                }
                this.queryType == 'create' && this.initUnitInfo()
            })
        },
        async getUnitTree() {
            const res = await getUnitTree({ status: 0 })
            this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let { field: { options: { name } } } = vm || {}

            // if (name === 'unitId') {
            //     this.$refs['vFormRef'].setFieldValue('unitName', node.deptName);
            //     this.$refs['vFormRef'].setFieldValue('saleOrderId', '')   
            //     this.$refs['vFormRef'].setFieldValue('saleOrderCode', '')
            //     this.$refs['vFormRef'].setFieldValue('projectId', '')
            //     this.$refs['vFormRef'].setFieldValue('projectCode', '')
            //     this.$refs['vFormRef'].setFieldValue('projectName', '')
            //     this.$refs['vFormRef'].setFieldValue('ctCode', '')
            //     this.$refs['vFormRef'].setFieldValue('ctName', '')
            //     this.$refs['vFormRef'].setFieldValue('ctId', '')
            //     this.$refs['vFormRef'].setFieldValue('cuCode', '')
            //     this.$refs['vFormRef'].setFieldValue('cuId', '')
            //     this.$refs['vFormRef'].setFieldValue('cuName', '')
            //     this.$refs.detailedList.init([], true);
            // }
        },
        deliveryOrderView() {
            this.loading = true;
            if (this.tableType == '1') {
                deliveryOrderView(this.queryId).then(({ data }) => {
                    this.status = data.status;
                    this.$refs.detailedList.init(data.detailList);
                    this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                    delete data.detailList;
                    this.$refs["vFormRef"].setFormData(data);
                }).finally(() => {
                    this.loading = false;
                });
            } else {
                const ids = this.queryId.split(',');
                deliveryDetailView({ ids }).then(({ data }) => {
                    this.$refs.detailedList.init(data);
                }).finally(() => {
                    this.loading = false;
                });
            }
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('saleShipmentMaintainOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        checkoutStatus() {
            const arrId = ['remarks', 'fileList', 'logisticsOddNumber', 'deliveryCode', 'design_p2', 'grid18700', 'design_p3', 'grid78943', 'design_p4', 'grid53608', 'logisticsOddNumber', 'deliveryName']
            if (this.checked) {
                this.$refs['vFormRef'].hideWidgets(arrId);
            } else {
                this.$refs['vFormRef'].showWidgets(arrId);
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            if (name === 'saleOrderCode') {
                let unitId = this.$refs['vFormRef'].getFieldValue("unitId");
                if (!unitId) {
                    this.$modal.msgError('请先选择所属组织')
                    return
                }
                this.propsFormData.unitId = unitId;
                const arr = JSON.parse(JSON.stringify(this.$refs['detailedList'].tableData.detailsList))
                this.$refs.choiceDeliveryQuoteList.init(arr);
                return
            }
        },
        handleFormChange(fieldName, newValue, oldValue,) {
            if(fieldName == 'unitId' && !newValue && newValue != oldValue) {
                this.$refs['vFormRef'].setFormData(Object.assign({}, {
                    saleOrderCode: '',
                    saleOrderId: '',
                    projectId: '',
                    projectCode: '',
                    projectName: '',
                    ctCode: '',
                    ctName: '',
                    ctId: '',
                    cuCode: '',
                    cuId: '',
                    cuName: '',
                }))
                this.$refs.detailedList.init([], true);
            }
        },
        async selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
            if (fieldName == 'saleOrderCode') {
                this.$refs['vFormRef'].setFormData(Object.assign({}, {
                    saleOrderCode: '',
                    saleOrderId: '',
                    projectId: '',
                    projectCode: '',
                    projectName: '',
                    ctCode: '',
                    ctName: '',
                    ctId: '',
                    cuCode: '',
                    cuId: '',
                    cuName: '',
                }))
                this.$refs.detailedList.init([], true);
            }
        },
        /*选择订单信息*/
        selections(data) {

            this.$refs['detailedList'].init(data);
            const form = data[0]
            delete form.deliveryName
            this.$refs['vFormRef'].setFormData(form);
        },
        countPrice(saleOrderList = []) {
            let numTotal = 0
            let amount = 0
            let amountTax = 0
            saleOrderList.forEach(item => {
                numTotal += Number(item.deliveryNum || 0)
                amount += Number(item.unTaxAmount || 0)
                amountTax += Number(item.taxAmount || 0)
            })
            this.$refs['vFormRef'].setFormData({
                totalMatlNum: numTotal,
                totalTaxAmount: (amountTax).toFixed(2),
                totalUnTaxAmount: (amount).toFixed(2)
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
            if (buttonCode === 'edit') {
                this.queryType = 'update';
                this.$refs['vFormRef'].setReadMode(false);
                this.$refs['vFormRef'].showWidgets('addButton');
                this.$refs['vFormRef'].showWidgets('deleteButton');
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
                return
            }
        },
        async handleSave(buttonCode) {
            try {
                const detailedList = this.$refs['detailedList'];
                if (this.tableType == '2') {
                    if (!detailedList.tableData.detailsList.length) {
                        this.$modal.msgError("产品明细不能为空");
                        return
                    }
                    detailedList.$refs.elForm.validate(valid => {
                        if (valid) {
                            this.loading = true;
                            deliverySaveDetail(detailedList.tableData.detailsList).then(({ message }) => {
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
                    if (!detailedList.tableData.detailsList.length) {
                        this.$modal.msgError("产品明细不能为空");
                        return
                    }
                    let flag = true
                    detailedList.$refs.elForm.validate(valid => {
                        flag = valid
                    })
                    if (!flag) {
                        return
                    }
                    const param = { ...formData, detailList: detailedList.tableData.detailsList, fileList: this.fileList }
                    if (this.queryId) {
                        param.id = this.queryId
                    }
                    const saveObj = {
                        'save': () => { this.saveOrder(deliverySaveOrder, param) },
                        'saveSubmit': () => {
                            this.$reviewerDialog({
                                type: ACTIVITI_ASSUGNEE.SA_CHD,
                                multiple: false,
                                success: (assignee) => {
                                    this.saveOrder(deliverySaveSubmitOrder, param, assignee)
                                }
                            })
                        }
                    }
                    saveObj[buttonCode] && saveObj[buttonCode]()
                }).catch(err => {
                    this.$modal.msgError('表单数据校验失败');
                })
            } catch (err) {
                this.$message.error(err.message)
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
        detailNewButton(buttonCode){
            if (buttonCode == 'delete') {
                this.$refs.detailedList.batchRemoveData();
            }
        }
    }
};
</script>
<style lang="scss" scoped>
::v-deep .custom_button {
    .el-button {
        transform: translateY(-1px);
        background: #ffffff !important;
        border-radius: 50px;
        font-size: 12px;
        text-align: center;
        height: 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 5px 30px 5px 30px;
        position: relative;
        min-width: 100px;
        margin-right: 6px;
        border: 1px solid #1890ff;
        box-sizing: border-box;
        line-height: 22px;
    }
}
</style>