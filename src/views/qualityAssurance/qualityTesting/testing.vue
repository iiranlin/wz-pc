<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :menuId="menuId" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick">
            <template v-slot:tab>
                <orderDetailType :value="tableType" @input="handleTableTypeChange" />
            </template>
        </right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
            @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
            @emitAblFilter="emitAblFilter" @clickLink="clickLink">
            <template slot="status" slot-scope="scope">
                <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}
            </template>
            <template slot="qiStatus" slot-scope="scope">
                <span :class="'qiStatus-' + scope.value">{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}</span>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <qualityTestingFillIn ref="qualityTestingFillIn" @qualityTestingFillInSuccess="qualityTestSuccess">
        </qualityTestingFillIn>
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <purchaseOrderShipping ref="purchaseOrderShipping"></purchaseOrderShipping>
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
        <unqualifiedNumList ref="unqualifiedNumList"></unqualifiedNumList>
        <normalDelivery ref="normalDelivery" @normalDeliverySuccess="getList"></normalDelivery>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { qiOrderList, qiDetailList, qiRemoveOrder, qiRemoveDetail, qiBatchQualified, qiSubmit, exportDetailList } from '@/api/prodmgr-inv/qi'
import qualityTestingFillIn from './components/qualityTestingFillIn';
import purchaseOrderShipping from '@/views/purchasingManagement/purchaseOrder/components/purchaseOrderShipping';
import { download } from '@/utils/request'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import unqualifiedNumList from './components/unqualifiedNumList';
import normalDelivery from '@/views/warehouseManage/warehousing/arrivedGoodsConfirm/components/normalDelivery'
import FormUnitId from '@/views/components/form-unitId'
export default {
    name: "qualityTesting",
    mixins: [indexMixin],
    props: {
        tableType: {
            type: String,
            default: '2'
        },
        tabChange: {
            type: Function,
            default: null
        }
    },
    components: { workFlowView, qualityTestingFillIn, purchaseOrderShipping, orderDetailType, activitiAssignee, unqualifiedNumList, normalDelivery, FormUnitId },
    data() {
        return {
            // 遮罩层
            loading: false,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 表格数据
            list: [],
            //列表选中数据
            selection: [],
            // 表格序号是否展示
            numberShow: false,
            // 页面属性
            property: {},
            total: 0,
            // 查询参数
            listQuery: {
                pageNum: 1,
                pageSize:  30,
            },
            // 表单参数
            formData: {},
            formDataClick: {},
            workFlowViewVisible: false,
            selectedRow: null,
            menuId: ''
        };

    },
    created() {
        this.menuProperty({ '1': '', '2': menuConfig.MENU_ZJDWH_BRANCH }[this.tableType])
    },
    methods: {
        qualityTestSuccess() {
            this.getList()
            this.refreshChange(this.refName)
        },
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                if (this.tableType == '2') {
                    data.buttonTop.forEach(item => {
                        if (item.buttonCode === 'qualityTesting') {
                            item.children = [
                                {
                                    "buttonCode": "artificial",
                                    "buttonName": "人工填报",
                                    "buttonType": "primary",
                                    "buttonMode": '2',
                                    "status": 0,
                                },
                                {
                                    "buttonCode": "qualified",
                                    "buttonName": "批量合格",
                                    "buttonType": "primary",
                                    "buttonMode": '2',
                                    "status": 0,
                                }
                            ]
                        }
                    });
                }
                this.property = data;
            });
        },
        handleTopButtonDisabled(button) {
            if(['print'].includes(button.buttonCode)) {
                return !this.selection.length
            }
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (['withdraw'].includes(button.buttonCode)) {
                return row.status != '2'
            }
            if (['warehousing'].includes(button.buttonCode) && !['4', '5'].includes(row.qiStatus)) {
                return true
            }
            if (['artificial', 'qualified'].includes(button.buttonCode) && row.qiStatus != '1') {
                return true
            }
            if (['submit'].includes(button.buttonCode) && (row.qiStatus != '3' || !['0', '1'].includes(row.status))) {
                return true
            }
            if (['update'].includes(button.buttonCode) && !(row.qiStatus == '1' && ['0', '1'].includes(row.status))) {
                return true
            }
            if (['update', 'submit', 'flowSee'].includes(button.buttonCode) && this.tableType == '2') {
                return true
            }
            if (['hTesting'].includes(button.buttonCode) && row.qiStatus != '1') {
                return true
            }
            if (['updateTesting'].includes(button.buttonCode) && (row.qiStatus == '1' || !['0', '1'].includes(row.status))) {
                return true
            }
            if (['viewTesting'].includes(button.buttonCode) && row.qiStatus == '1') {
                return true
            }
            if (['artificial', 'qualified', 'hTesting', 'updateTesting', 'viewTesting'].includes(button.buttonCode) && this.tableType == '1') {
                return true
            }
            return false
        },
        numberChange(val) {
            this.numberShow = val;
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns);
        },
        clickReset() {
            this.handleQuery();
        },
        //选择框回调
        selectChange(row) {
            let { formData, isWatch } = row;
            if (!isWatch) {
                this.handleQuery(formData);
            } else {
                this.formData = Object.assign({}, this.formData, formData);
            }
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = selection
        },
        handleResetField() {
        },
        handleButton(buttonCode, idArr, rowArr, {buttonData}) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode === 'update') {
                this.$router.push({ name: 'qualityTestingOperate', query: { type: buttonCode, id: idArr[0] } })
            } else if (buttonCode === 'delete') {
                this.handleDelete(idArr);
            } else if (buttonCode === 'create') {
                this.$router.push({ name: 'qualityTestingOperate', query: { type: buttonCode } })
            } else if (buttonCode == 'submit') {
                this.ids = idArr
                this.handleSubmit(ACTIVITI_ASSUGNEE.INV_ZJD)
            } else if (buttonCode === 'flowSee') {
                this.workFlowViewVisible = true;
                this.selectedRow = { businessId: idArr[0] };
            } else if (buttonCode === 'artificial') {
                this.$refs.qualityTestingFillIn.init(rowArr);
            } else if (buttonCode === 'qualified') {
                this.qiBatchQualified(idArr);
            } else if (buttonCode === 'hTesting') {
                this.$refs.qualityTestingFillIn.init(rowArr);
            } else if (buttonCode === 'updateTesting') {
                this.$refs.qualityTestingFillIn.init(rowArr, 'updateTesting');
            } else if (buttonCode === 'viewTesting') {
                this.$refs.qualityTestingFillIn.init(rowArr, 'view');
            } else if (buttonCode === 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
            } else if (buttonCode === 'warehousing') {
                const isSource = rowArr.every((item, index, arr) => {
                    return item.qiSource == arr[0].qiSource
                })
                if (isSource) {
                    const isUnit = rowArr.every((item, index, arrs) => {
                      return item.unitId == arrs[0].unitId
                    })
                    if (!isUnit) {
                      this.$modal.msgError('只能选相同所属组织的数据')
                      return
                    }
                    this.$router.push({ name: 'createInventoryMaintenance', query: { name: 'qualityTesting', inSource: rowArr[0].qiSource, type: 'create', ids: idArr.join(',') } });
                } else {
                    this.$modal.msgError('请选择同一个质检来源')
                }
            } else if (buttonCode === 'withdraw') {
                this.handleWithdraw({ businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.INV_ZJD, })
            }
            //  else if(buttonCode === 'print') {
                
            //     const isCode = rowArr.every((item, index, arr) => {
            //         return item.qiCode == arr[0].qiCode
            //     })
            //     if (!isCode) {
            //       this.$modal.msgError('请选择同一个质检单号')
            //       return
            //     }
            //     const tmpls = buttonData.printTemplateId.split(',')
            //     this.handlePrint(tmpls, rowArr)
            // }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            if (this.tableType == '1') {
                qiOrderList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list;
                    this.total = data.total;
                }).finally(() => {
                    this.loading = false;
                })
            } else {
                qiDetailList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list;
                    this.total = data.total;
                }).finally(() => {
                    this.loading = false;
                })
            }
        },
        handleDelete(ids) {
            this.$modal.confirm("是否确认删除?").then(() => {
                return this.tableType == '1' ? qiRemoveOrder({ ids }) : qiRemoveDetail({ ids });
            }).then(() => {
                if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                    this.listQuery.pageNum -= 1
                }
                this.getList();
                this.refreshChange(this.refName)
                this.$modal.msgSuccess("删除成功");
            })
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            qiSubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
                if (success) {
                    this.$modal.msgSuccess('提交成功')
                    this.getList()
                    this.refreshChange(this.refName)
                } else {
                    this.$modal.msgError(message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        clickLink(row, name) {
            if (name === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'qualityTesting' } });
            } else if (name === 'sourceCode') {
                const qiSourceObj = {
                    '1': { name: 'purchaseOrderOperate', query: { type: 'view', id: row.sourceId, name: 'qualityTesting' } },
                    '2': { name: 'salesReturnOperate', query: { type: 'view', id: row.sourceId, name: 'qualityTesting' } },
                    '3': { name: 'createTransferOutOrder', query: { type: 'view', id: row.sourceId, name: 'qualityTesting' } },
                    '4': { name: 'lendReturnOrder', query: { type: 'view', id: row.sourceId, name: 'qualityTesting' } },
                    '7': { name: 'productionRejectedOperate', query: { type: 'view', id: row.sourceId, name: 'qualityTesting' } },
                }
                const qiSource = qiSourceObj[row.qiSource]
                qiSource && this.$router.push(qiSource)
            } else if (name === 'batchNo') {
                this.$refs.normalDelivery.init('listDetails', row)
            } else if (name === 'unqualifiedNum') {
                this.$refs.unqualifiedNumList.init(row.id)
            } else if (name === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'qualityTesting', type: 'view', id: row.projectId } })
            } else if (name === 'suCode') {
                this.$router.push({ name: 'supplierOperate', query: { type: "view", id: row.suId, name: 'qualityTesting' } })
            } else {
                if (this.tableType == '1') {
                    this.$router.push({ name: 'qualityTestingOperate', query: { type: "view", id: row.id, tableType: this.tableType } })
                } else {
                    this.$router.push({ name: 'qualityTestingOperate', query: { type: "view", id: row.qiOrderId, tableType: this.tableType } })
                }
            }
        },
        qiBatchQualified(ids) {
            this.$modal.confirm("本次所选数据将批量全部合格，是否确定？").then(() => {
                return qiBatchQualified({ ids });
            }).then(({ message }) => {
                this.getList();
                this.refreshChange(this.refName)
                this.$modal.msgSuccess(message);
            })
        }
    }
};
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
    margin-left: 20px;
    margin-top: 16px;
}
</style>
