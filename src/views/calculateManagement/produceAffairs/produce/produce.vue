<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :treeList="treeList" @searchFormTreeSelected="searchFormTreeSelected"
            @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch" :searchArr="property.search || []"
            :formData="formData" @fieldClick="handleFieldClick" @handleQuery="handleQuery"
            @handleResetField="handleResetField">
            <template v-slot:accountingPeriodOrgName="{ data, i18nData, showDrawer }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" :appendToBody="!showDrawer" />
            </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :treeList="treeList" :formData="formDataClick"
                    :searchArr="property.search || []" :showSearch.sync="showSearch" :columns="property.fields"
                    @queryTable="handleQuery" :menuId="menuId" @handleCheckAllChange="handleCheckAllChange"
                    @clickReset="clickReset" @numberChange="numberChange" @cleanClick="cleanClick">
                    <template v-slot:tab>
                        <orderDetailType :value="tableType" @input="handleTableTypeChange" :options="tableOptions" />
                    </template>
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
                    @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                    <template slot="append">
                    </template>
                </table-index>
                <tableStatistics :statistics="statistics[tableType]" />
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="pagination" />
            </el-col>
        </el-row>
        <orderDetail ref="orderDetailRef" />
        <choice-material ref="choiceMaterial" singleMode @choiceMaterialClick="handleMaterialConfirm" />
        <selectProject ref="selectProject" singleMode @selections="handleProjectConfirm" />
        <choiceDuration ref="choiceDurationRef" singleMode @confirm="handleDurationConfirm" />
        <choice-production :propsFormData="propsFormData" :singleMode="true" ref="choiceProduction" type="AFFAIR"
            @change="handleProductionConfirm" :unitId="unitId" />
        <choice-demandQuoteList singleMode ref="choiceDemandQuoteList" @change="handleDemandConfirm" />
        <choice-plan ref="choicePlan" singleMode :isPlan="true" @change="handleConfirmPlan" :unitId="unitId" />
        <transfer-order ref="transferOrderRef" singleMode @orderRow="handleTransferConfirm" />
        <select-quote ref="selectQuote" @selections="handleQuoteConfirm" />
        <choice-produce-order singleMode ref="choiceProduceOrderRef" @confirm="handleProduceConfirm" />
        <choice-return-order singleMode ref="choiceReturnOrderRef" @confirm="handleReturnConfirm" />
        <choice-product singleMode ref="choiceProductRef" @change="handleProductConfirm" />

    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { inventoryCardInfoList, inventoryDetailList, inventoryCardInfoExport, inventoryCardInfoStatistics, inventoryDetailExport, inventoryDetailStatistics, } from '@/api/calculateManagement/produce'
import orderDetailType from '@/views/components/orderDetailType'
import orderDetail from '@/views/components/orderDetail'
import { menuConfig } from '@/utils'
import selectProject from "@/views/components/selectProject"
import choiceMaterial from '@/views/components/choice-material'
import tableStatistics from '@/views/components/table-statistics'
import choiceDuration from '@/views/components/choice-duration'
import choiceProduction from '@/views/components/choice-production'
import choiceDemandQuoteList from "@/views/components/choice-demandQuoteList"
import choicePlan from '@/views/components/choice-plan'
import transferOrder from '@/views/warehouseManage/outbound/outboundMaintenance/components/transferOrder'
import selectQuote from '@/views/warehouseManage/warehousing/inventoryMaintenance/components/selectQuote'
import choiceProduceOrder from '@/views/components/choice-produce-order'
import choiceReturnOrder from '@/views/components/choice-return-order'
import choiceProduct from '@/views/components/choice-product'
import FormUnitId from '@/views/components/form-unitId'
import { getUserInfo } from '@/utils/user-info'

const MENU_TYPE = {
    MASTER: 'MASTER', // 主单
    BRANCH: 'BRANCH'  // 主单+明细
}
const SERVICE_API = {
    list: {
        MASTER: inventoryCardInfoList,
        BRANCH: inventoryDetailList,
    },
    statistics: {
        MASTER: inventoryCardInfoStatistics,
        BRANCH: inventoryDetailStatistics,
    },
    export: {
        MASTER: inventoryCardInfoExport,
        BRANCH: inventoryDetailExport,
    }
}
export default {
    name: "Produce",
    mixins: [indexMixin],
    components: { choiceProduct, FormUnitId, choiceProduceOrder, choiceReturnOrder, selectQuote, transferOrder, choicePlan, choiceDemandQuoteList, choiceProduction, choiceDuration, tableStatistics, selectProject, choiceMaterial, orderDetailType, orderDetail },
    props: {
        tableType: {
            type: String,
            default: 'MASTER'
        },
        tabChange: {
            type: Function,
            default: null
        }
    },

    data() {
        const userInfo = getUserInfo()
        return {
            propsFormData: {
                isOverPicking: '0',
                produceDeptId: userInfo.deptId,
            },
            unitId: userInfo.unitId,
            tableOptions: [
                { value: MENU_TYPE.MASTER, label: '产品入库' },
                { value: MENU_TYPE.BRANCH, label: '耗材明细' },
            ],
            statistics: {
                MASTER: [
                    [
                        {
                            key: 'totalInNum',
                            label: '生产入库完成总数量',
                            value: '-'
                        },
                        {
                            key: 'totalInAmount',
                            label: '生产入库总金额（不含税，单位：元）',
                            value: '-'
                        },
                        {
                            key: 'avgInAmount',
                            label: '生产入库单价（不含税，单位：元）',
                            value: '-'
                        },
                    ], [
                        {
                            key: 'totalPickingAmount',
                            label: '领料出库总金额（不含税，单位：元）',
                            value: '-'
                        },
                    ], [
                        {
                            key: 'totalReturnAmount',
                            label: '退料入库总金额（不含税，单位：元）',
                            value: '-'
                        },
                    ]
                ],
                BRANCH: [
                    [{
                        key: 'totalInNum',
                        label: '生产入库完成总数量',
                        value: '-'
                    }, {
                        key: 'totalInAmount',
                        label: '生产入库总金额（不含税，单位：元）',
                        value: '-'
                    }, {
                        key: 'avgInAmount',
                        label: '生产入库单价（不含税，单位：元）',
                        value: '-'
                    },], [{
                        key: 'totalPickingNum',
                        label: '领料出库总数量',
                        value: '-'
                    }, {
                        key: 'totalPickingAmount',
                        label: '领料出库总金额（不含税，单位：元）',
                        value: '-'
                    },], [{
                        key: 'totalReturnNum',
                        label: '退料入库总数量',
                        value: '-'
                    }, {
                        key: 'totalReturnAmount',
                        label: '退料入库总金额（不含税，单位：元）',
                        value: '-'
                    },]

                ],
            },
            menuId: '',
            treeList: {
                deptId: [],
            },
            // 遮罩层
            loading: false,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            dataOptions: undefined,
            treeLoading: false,
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
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
                pageSize: 30,
            },
            // 表单参数
            formData: {},
            formDataClick: {},
        };

    },
    created() {
        const query = this.$route.query || {}
        this.formData = query
        this.formDataClick = query
        this.menuProperty(this.tableType != MENU_TYPE.MASTER ? menuConfig.MENU_PRODUCE_BRANCH : '')
    },
    methods: {
        async pagination () {
          try {
            const menuId = this.tableType != MENU_TYPE.MASTER ? menuConfig.MENU_PRODUCE_BRANCH : ''
            const formDataMenuId = await this.$IDB.getObjectStore('formData', menuId || this.$route.meta.id) || {}
            this.formData = Object.assign({}, this.formData, formDataMenuId)
            this.formDataClick = Object.assign({}, this.formData, formDataMenuId)
          } catch (error) {
            console.error(error)
          }
          this.getList()
        },
        handleFieldClick(key, value) {
            this._projectProp = undefined
            this._materialProp = undefined
            if (key === 'accountingPeriodCode') {
                this.$refs.choiceDurationRef.init()
            } else if (key === 'sourceProjectCode') {
                this._projectProp = { projectName: 'sourceProjectName', projectCode: 'sourceProjectCode' }
                this.$refs.selectProject.init()
            } else if (key === 'matlCode') {
                this._materialProp = { matlCode: 'matlCode', matlName: 'matlName', matlType: 'matlType', matlUnit: 'matlUnit' }
                this.$refs.choiceMaterial.init()
            } else if (key === 'pickingMatlCode') {
                this._materialProp = { matlCode: 'pickingMatlCode', matlName: 'pickingMatlName', matlType: 'pickingMatlType', matlUnit: 'pickingMatlUnit' }
                this.$refs.choiceMaterial.init()
            } else if (['orderRawCode', 'rawNo'].includes(key)) {
                this.$refs.choiceProduction.init(null, []);
            } else if (key === 'sourceCode') {
                this.$refs.choiceDemandQuoteList.init([], this.unitId)
            } else if (key === 'sourcePlanCode') {
                this.$refs.choicePlan.init(null, [], []);
            } else if (key === 'pickingCode') {
                this.$refs.choiceProduceOrderRef.init(null, [], [])
            } else if (key === 'pickingOutCode') {
                this.$refs.transferOrderRef.init([], '7')
            } else if (key === 'returnCode') {
                this.$refs.choiceReturnOrderRef.init(null, [], [])
            } else if (key === 'returnInCode') {
                this.$refs.selectQuote.open([], '7');
            } else if (key === 'orderCode') {
                this.$refs.choiceProductRef.init(null, []);
            }
        },
        handleProductConfirm({ orderCode }) {
            this.formData = Object.assign({}, this.formData, { orderCode: orderCode })
        },
        handleProduceConfirm({ pickingCode }) {
            this.formData = Object.assign({}, this.formData, { pickingCode: pickingCode })
        },
        handleReturnConfirm({ returnCode }) {
            this.formData = Object.assign({}, this.formData, { returnCode: returnCode })
        },
        handleQuoteConfirm({ sourceCode }) {
            this.formData = Object.assign({}, this.formData, { returnInCode: sourceCode })
        },
        handleTransferConfirm({ sourceCode }) {
            this.formData = Object.assign({}, this.formData, { pickingOutCode: sourceCode })
        },
        handleConfirmPlan({ sourcePlanCode }) {
            this.formData = Object.assign({}, this.formData, { sourcePlanCode: sourcePlanCode })
        },
        handleDemandConfirm({ sourceType, sourceCode }) {
            this.formData = Object.assign({}, this.formData, { sourceCode: sourceCode, sourceType: sourceType })
        },
        handleProductionConfirm({ orderRawCode }) {
            this.formData = Object.assign({}, this.formData, { orderRawCode: orderRawCode })
        },
        handleDurationConfirm({ accountingOrgName, code, name, no, accountingOrgId }) {
            this.formData = Object.assign({}, this.formData, { accountingPeriodOrgName: accountingOrgName, accountingPeriodOrgId:accountingOrgId, accountingPeriodCode: code, accountingPeriodName: name, accountingPeriodNo: no })
        },
        handleProjectConfirm(data) {
            const obj = {}
            for (let key in this._projectProp) {
                obj[this._projectProp[key]] = data[key]
            }
            this.formData = Object.assign({}, this.formData, obj)
            this._projectProp = undefined
        },
        handleMaterialConfirm(data) {
            const obj = {}
            for (let key in this._materialProp) {
                obj[this._materialProp[key]] = data[key]
            }
            this.formData = Object.assign({}, this.formData, obj)
            this._materialProp = undefined
        },
        async searchFormTreeSelected(node, fieldCode) {
        },
        searchFormTreeCleared(fieldCode = "") {
        },
        async menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            const property = await this.$store.dispatch('menuProperty', this.menuId)
            this.listQuery.pageSize = property.defaultPageSize || 30
            this.property = property

            // ...query,
        },
        async getList() {
            try {
                this.loading = true

                const param = {
                    ...this.listQuery,
                    ...this.formData,

                }
                if (this.formData.p) {
                    param.sourceProjectCode = this.formData.p
                    delete param.p
                }
                const stat = SERVICE_API.statistics[this.tableType]
                if (stat) {
                    const formData = Object.assign({},param)
                    delete formData.pageNum
                    delete formData.pageSize
                    await this.$IDB.setObjectStore('formData', this.menuId, formData)
                    const res = await stat(param)
                    if (res.data) {
                        this.statistics[this.tableType] = this.statistics[this.tableType].map(sub => sub.map(item => {
                            return {
                                ...item,
                                value: res.data[item.key]
                            }
                        }))
                    }
                }
                const api = SERVICE_API.list[this.tableType]
                const { data: { list = [], total = 0 } } = await api(param)
                this.list = list;
                this.total = total;
            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false;
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

        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, { status, bizStatus }) {
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
        selectChange(row) {
            let { formData, isWatch } = row;
            if (!isWatch) {
                this.handleQuery(formData);
            } else {
                this.formData = Object.assign({}, this.formData, formData);
            }
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
        handleSelectionChange(ids, single, multiple, row) {
            this.ids = row.map(item => item.saleOrderId)
            this.single = single
            this.multiple = multiple
            this.selection = row

        },
        handleResetField() {
            for (let key in this.formData) {
                delete this.formData[key]
            }
            this.$nextTick(() => {
                this.handleQuery()
            })
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const ids = rowArr.map(({ returnId }) => returnId)
            const buttonActions = {
                export: () => {
                    this.handleExport()
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                const api = SERVICE_API.export[this.tableType]
                await api(param)
            } catch (err) {
                console.error(err)
            }
        },
        async clickLink(row, code) {
            if (['totalInNum'].includes(code)) {
                const query = {
                    accountingPeriodId: row.accountingPeriodId,
                    inOutStatus: row.inOutStatus,
                    orderRawId: row.orderRawId,
                }
                this.$refs.orderDetailRef.init(query, {
                    totalInNum: 'totalInNum',
                }[code])
                return
            }
            if (['inCount', 'inFinishNum'].includes(code)) {
                const query = {
                    accountingPeriodId: row.accountingPeriodId,
                    inOutStatus: row.inOutStatus,
                    orderRawId: row.orderRawId,
                }
                this.$refs.orderDetailRef.init(query, {
                    inCount: 'inCount',
                    inFinishNum: 'inFinishNum',
                }[code])
                return
            }
            if (['totalPickingAmount', 'totalReturnAmount'].includes(code)) {
                const param = {
                    accountingPeriodCode: row.accountingPeriodCode,
                    sourceProjectCode: row.sourceProjectCode,
                    orderCode: row.orderCode,
                    matlCode: row.matlCode
                }
                if (!row.sourceProjectCode) {
                    param.p = 'P'
                }
                // for (let key in param) {
                //     this.$set(this.formData, key, param[key])
                // }
                const menuId = menuConfig.MENU_PRODUCE_BRANCH
                await this.$IDB.setObjectStore('formData', menuId, param)
                this.handleTableTypeChange(MENU_TYPE.BRANCH)
                this.$nextTick(() => {
                    this.handleQuery()
                })
                return
            }
            const linkConfig = {
                sourceCode: { name: { 1: 'saleOrderOperate', 2: 'preOperate', 3: 'selfResearchDemandOperate' }[row.sourceType], query: { name: 'produce', type: "view", id: row.sourceId } },
                sourceProjectCode: { name: 'projectManagementOperate', query: { name: 'produce', type: 'view', id: row.sourceProjectId } },
                accountingPeriodCode: { name: 'accountantCycleOperate', query: { name: 'produce', type: 'view', id: row.accountingPeriodId } },
                orderCode: { name: 'productionOrderOperate', query: { name: 'produce', type: 'view', id: row.orderId } },
                rawNo: { name: 'productionOrderOperate', query: { name: 'produce', type: 'view', id: row.rawId, tableType: 2 } },
                produceCode: { name: 'materialArchivesOperate', query: { name: 'produce', type: 'view', matlCode: row.produceCode } },
                matlName: { name: 'materialArchivesOperate', query: { name: 'produce', type: 'view', matlCode: row.matlCode } },
                matlCode: { name: 'materialArchivesOperate', query: { name: 'produce', type: 'view', matlCode: row.matlCode } },
                pickingMatlCode: { name: 'materialArchivesOperate', query: { name: 'produce', type: 'view', matlCode: row.matlCode } },
                sourcePlanCode: { name: 'demandPlanWorkbenchOperate', query: { name: 'produce', type: 'view', id: row.sourcePlanId } },
                cuCode: { name: 'customerProfileAdd', query: { type: "view", id: row.cuId, name: 'produce', isQuery: 'query' } },
                pickingCode: { name: 'productionReceiveOperate', query: { name: 'produce', type: 'view', id: row.pickingId } },
                pickingOutCode: { name: 'outboundMaintenanceOperate', query: { name: 'produce', type: 'view', id: row.pickingOutId } }


            }[code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    }
};
</script>

<style scoped lang="scss"></style>
