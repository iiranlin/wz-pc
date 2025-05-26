<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :treeList="treeList" @searchFormTreeSelected="searchFormTreeSelected"
            :hideDrawerLabel="['outNumEqualsInFinishNumFlags', 'eqOriginalNum']"
            @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch" :searchArr="property.search || []"
            :formData="formData" @handleQuery="handleQuery" @handleResetField="handleResetField"
            @fieldClick="handleFieldClick">
            <template v-slot:unitName="{ data, i18nData, showDrawer }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" :appendToBody="!showDrawer" />
            </template>
            <template v-slot:accountingPeriodOrgName="{ data, i18nData, showDrawer }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" :appendToBody="!showDrawer" />
            </template>
            <template v-slot:warehouseId="{ data, i18nData, showDrawer }">
                <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data"
                    :appendToBody="!showDrawer" />
            </template>
            <template v-slot:inWarehouseId="{ data, i18nData, showDrawer }">
                <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data"
                    :appendToBody="!showDrawer" />
            </template>
            <template v-slot:outWarehouseId="{ data, i18nData, showDrawer }">
                <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data"
                    :appendToBody="!showDrawer" />
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
                <tableStatistics v-if="tableType != 'ledger'" :statistics="statistics[tableType]" />
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="pagination" />
            </el-col>
        </el-row>
        <orderDetail ref="orderDetailRef" />
        <choiceDuration ref="choiceDurationRef" singleMode @confirm="handleDurationConfirm" />
        <choice-material ref="choiceMaterial" singleMode @choiceMaterialClick="handleMaterialConfirm" />
        <selectProject ref="selectProject" singleMode @selections="handleProjectConfirm" />
        <selectQuote ref="selectQuoteRef" singleMode @selections="handleSourceConfirm" />
        <transferOrder ref="transferOrderRef" singleMode @orderRow="handleSourceConfirm" />
        <choiceAdjust ref="choiceAdjustRef" singleMode @confirm="handleAdjustConfirm" />
        <choiceRecallOrder ref="choiceRecallOrderRef" singleMode @confirm="handleRecallConfirm" />
        <choiceInOrder ref="choiceInOrderRef" singleMode @confirm="handleInConfirm" />
        <choiceOutOrder ref="choiceOutOrderRef" singleMode @confirm="handleOutConfirm" />

    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { ledgerInDetailList, ledgerInDetailExport, ledgerInDetailStatistics, ledgerOutDetailList, ledgerOutDetailStatistics, ledgerOutDetailExport, ledgerDetailExport, ledgerDetailList } from '@/api/calculateManagement/ledger'
import { selectAllocateOrderDetails, exportAllocateOrderDetailsList, selectAllocateOrderDetailsDataSum } from '@/api/prodmgr-inv/allocate'
import { exportAdjustDetailsList, selectAdjustDetailsList, selectAdjustDetailsStatistics } from '@/api/warehouseManage/inventorySheet'
import selectProject from "@/views/components/selectProject"
import orderDetailType from '@/views/components/orderDetailType'
import orderDetail from '@/views/components/orderDetail'
import choiceDuration from '@/views/components/choice-duration'
import choiceMaterial from '@/views/components/choice-material'
import selectQuote from '@/views/warehouseManage/warehousing/inventoryMaintenance/components/selectQuote/index.vue'
import tableStatistics from '@/views/components/table-statistics'
import transferOrder from '@/views/warehouseManage/outbound/outboundMaintenance/components/transferOrder.vue'
import choiceAdjust from '@/views/components/choice-adjust'
import choiceRecallOrder from '@/views/components/choiceRecallOrder'
import choiceInOrder from '@/views/components/choice-in-warehouse-order'
import choiceOutOrder from '@/views/components/choice-out-warehouse-order'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
import { menuConfig, getRouteByInsource, getRouteByOutsource, IDB } from '@/utils'
const MENU_TYPE = {
    ledger: 'ledger', // 主单
    storageDetail: 'storageDetail',  // 主单+明细
    outboundShipmentsDetail: 'outboundShipmentsDetail',
    allocateDetail: 'allocateDetail',
    inventoryDetail: 'inventoryDetail'
}
const SERVICE_API = {
    list: {
        ledger: ledgerDetailList,
        storageDetail: ledgerInDetailList,
        outboundShipmentsDetail: ledgerOutDetailList,
        allocateDetail: selectAllocateOrderDetails,
        inventoryDetail: selectAdjustDetailsList
    },
    statistics: {
        storageDetail: ledgerInDetailStatistics,
        outboundShipmentsDetail: ledgerOutDetailStatistics,
        allocateDetail: selectAllocateOrderDetailsDataSum,
        inventoryDetail: selectAdjustDetailsStatistics
    },
    export: {
        ledger: ledgerDetailExport,
        storageDetail: ledgerInDetailExport,
        outboundShipmentsDetail: ledgerOutDetailExport,
        allocateDetail: exportAllocateOrderDetailsList,
        inventoryDetail: exportAdjustDetailsList
    }
}
export default {
    name: "Ledger",
    mixins: [indexMixin],
    components: { FormWarehouseCode, FormUnitId, choiceInOrder, choiceOutOrder, choiceRecallOrder, choiceAdjust, transferOrder, selectQuote, orderDetailType, orderDetail, tableStatistics, choiceDuration, choiceMaterial, selectProject },
    props: {
        tableType: {
            type: String,
            default: MENU_TYPE.ledger
        },
        tabChange: {
            type: Function,
            default: null
        }
    },

    data() {
        return {
            statistics: {
                ledger: [],
                storageDetail: [
                    [{
                        key: 'totalOriginalNum',
                        label: '单据总数量',
                        value: '-'
                    },], [{
                        key: 'totalInNum',
                        label: '已入库完成总数量',
                        value: '-'
                    },], [{
                        key: 'totalInAmount',
                        label: '已入库完成总金额（不含税，单位：元）',
                        value: '-'
                    }]



                ],
                outboundShipmentsDetail: [
                    [{
                        key: 'totalOriginalNum',
                        label: '单据总数量',
                        value: '-'
                    },], [{
                        key: 'totalOutNum',
                        label: '已出库完成总数量',
                        value: '-'
                    },], [{
                        key: 'totalAmount',
                        label: '已出库完成总金额（不含税，单位：元）',
                        value: '-'
                    }]


                ],
                allocateDetail: [
                    [{
                        key: 'outNumSum',
                        label: '调出完成总数量',
                        value: '-'
                    },
                    {
                        key: 'outAmountSum',
                        label: '调出完成总金额（不含税，单位：元）',
                        value: '-'
                    },
                    ], [
                        {
                            key: 'inAmountSum',
                            label: '调入完成总数量',
                            value: '-'
                        },
                        {
                            key: 'inFinishNumSum',
                            label: '调入完成总金额（不含税，单位：元）',
                            value: '-'
                        },
                    ],



                ],
                inventoryDetail: [
                    [
                        {
                            key: 'winDiffNumSum',
                            label: '盘盈总数量',
                            value: '-'
                        },
                        {
                            key: 'winAmountSum',
                            label: '盘盈总金额（不含税，单位：元）',
                            value: '-'
                        },
                    ],
                    [{
                        key: 'lossDiffNumSum',
                        label: '盘亏总数量',
                        value: '-'
                    },
                    {
                        key: 'lossAmountSum',
                        label: '盘亏总金额（不含税，单位：元）',
                        value: '-'
                    },],
                    [
                        {
                            key: 'adjustNumSum',
                            label: '调整总数量',
                            value: '-'
                        },
                        {
                            key: 'adjustAmountSum',
                            label: '调整总金额（不含税，单位：元）',
                            value: '-'
                        },
                    ],
                ]
            },
            tableOptions: [
                { value: MENU_TYPE.ledger, label: '综合' },
                { value: MENU_TYPE.storageDetail, label: '入库明细' },
                { value: MENU_TYPE.outboundShipmentsDetail, label: '出库明细' },
                { value: MENU_TYPE.allocateDetail, label: '调拨明细' },
                { value: MENU_TYPE.inventoryDetail, label: '调整明细' },
            ],
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
            formData: {
               
            },
            formDataClick: {},
        };

    },
    created() {

        const query = this.$route.query || {}
        this.formData = query
        this.formDataClick = query
        this.menuProperty(this.tableType !== MENU_TYPE.ledger ? { storageDetail: menuConfig.MENU_INV_STORAGE, outboundShipmentsDetail: menuConfig.MENU_INV_OUT, allocateDetail: menuConfig.MENU_INV_ALLOCATE, inventoryDetail: menuConfig.MENU_INV_INVENT }[this.tableType] : '')
    },
    methods: {
        async pagination () {
          try {
            const menuId = this.tableType !== MENU_TYPE.ledger ? { storageDetail: menuConfig.MENU_INV_STORAGE, outboundShipmentsDetail: menuConfig.MENU_INV_OUT, allocateDetail: menuConfig.MENU_INV_ALLOCATE, inventoryDetail: menuConfig.MENU_INV_INVENT }[this.tableType] : ''
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
            if (key === 'accountingPeriodCode') {
                this.$refs.choiceDurationRef.init()
            }
            if (key === 'projectCode') {
                this._projectProp = { projectName: 'projectName', projectCode: 'projectCode', projectSource: 'projectSource', projectType: 'projectType' }
                this.$refs.selectProject.init()
            }
            if (key === 'outProjectCode') {
                this._projectProp = { projectName: 'outProjectName', projectCode: 'outProjectCode' }
                this.$refs.selectProject.init()
            }
            if (key === 'inProjectCode') {
                this._projectProp = { projectName: 'inProjectName', projectCode: 'inProjectCode' }
                this.$refs.selectProject.init()
            }
            if (key === 'matlCode') {
                this.$refs.choiceMaterial.init()
            }
            if (key === 'sourceCode') {
                if (this.tableType == 'storageDetail') {
                    if (!this.formData.inSource) {
                        this.$message.warning('请选择入库来源')
                        return

                    }
                    this.$refs.selectQuoteRef.open([], this.formData.inSource)
                }
                if (this.tableType == 'outboundShipmentsDetail') {
                    if (!this.formData.outSource) {
                        this.$message.warning('请选择出库来源')
                        return

                    }
                    this.$refs.transferOrderRef.init([], this.formData.outSource)
                }
            }
            if (key === 'inCode') {
                this.$refs.choiceInOrderRef.init()
            }
            if (key === 'outCode') {
                this.$refs.choiceOutOrderRef.init()
            }
            if (key === 'allocateCode') {
                this.$refs.choiceRecallOrderRef.init()
            }
            if (key === 'adjustCode') {
                this.$refs.choiceAdjustRef.init()
            }
        },
        handleInConfirm({ inCode }) {
            this.formData = Object.assign({}, this.formData, { inCode: inCode })

        },
        handleOutConfirm({ outCode }) {
            this.formData = Object.assign({}, this.formData, { outCode: outCode })
        },
        handleRecallConfirm({ allocateCode }) {
            this.formData = Object.assign({}, this.formData, {
                allocateCode
            })
        },
        handleAdjustConfirm({ adjustCode }) {
            this.formData = Object.assign({}, this.formData, { adjustCode: adjustCode })
        },
        handleSourceConfirm({ sourceCode }) {
            this.formData = Object.assign({}, this.formData, { sourceCode: sourceCode })
        },
        handleMaterialConfirm({ matlCode, matlName, matlType, matlUnit }) {
            this.formData = Object.assign({}, this.formData, { matlCode, matlName, matlType, matlUnit })
        },
        handleProjectConfirm(data) {
            const obj = {}
            for (let key in this._projectProp) {
                obj[this._projectProp[key]] = data[key]
            }
            this.formData = Object.assign({}, this.formData, obj)
            this._projectProp = undefined
        },
        handleDurationConfirm(row) {
            const { accountingOrgName, code, name,accountingOrgId, no } = row;
            this.formData = Object.assign({}, this.formData, { accountingPeriodOrgName: accountingOrgName, accountingPeriodOrgId: accountingOrgId, accountingPeriodCode: code, accountingPeriodName: name, accountingPeriodNo: no })
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
                    param.projectCode = this.formData.p
                    delete param.p
                }
                const stat = SERVICE_API.statistics[this.tableType]
                if (stat) {
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
                const formData = Object.assign({},param)
                delete formData.pageNum
                delete formData.pageSize
                await this.$IDB.setObjectStore('formData', this.menuId, formData)
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
            let sourceCodeRoute = {}
            if (['inAmount', 'inNum', 'outNum', 'outAmount', 'adjustNum', 'adjustAmount'].includes(code)) {
                const param = {
                    accountingPeriodCode: row.accountingPeriodCode,
                    projectCode: row.projectCode,
                    warehouseName: row.warehouseName,
                    matlCode: row.matlCode
                }
                if (!row.projectCode) {
                    param.p = 'P'
                }
                // for (let key in param) {
                //     this.$set(this.formData, key, param[key])
                // }
                const name = { inAmount: MENU_TYPE.storageDetail, inNum: MENU_TYPE.storageDetail, outNum: MENU_TYPE.outboundShipmentsDetail, outAmount: MENU_TYPE.outboundShipmentsDetail, adjustNum: MENU_TYPE.inventoryDetail, adjustAmount: MENU_TYPE.inventoryDetail }[code]
                const menuId = { storageDetail: menuConfig.MENU_INV_STORAGE, outboundShipmentsDetail: menuConfig.MENU_INV_OUT, allocateDetail: menuConfig.MENU_INV_ALLOCATE, inventoryDetail: menuConfig.MENU_INV_INVENT }[name]
                await this.$IDB.setObjectStore('formData', menuId, param)
                this.handleTableTypeChange(name)
                // this.$nextTick(() => {
                //     this.handleQuery()
                // })
                return
            }

            if (code === 'sourceCode') {
                if (this.tableType == 'storageDetail') {
                    const name = getRouteByInsource(row.inSource)
                    const obj = {}
                    if (['1'].includes(row.inSource)) {
                        obj.inSource = row.inSource
                    }
                    sourceCodeRoute = { name, query: { name: 'ledger', type: 'view', id: row.sourceDetailId, ...obj } }

                }
                if (this.tableType == 'outboundShipmentsDetail') {
                    const name = getRouteByOutsource(row.outSource)

                    sourceCodeRoute = { name, query: { name: 'ledger', type: 'view', id: row.sourceDetailId } }

                }
            }
            const linkConfig = {
                adjustCode: { name: 'inventoryAdjustDetail', query: { name: 'ledger', type: 'view', id: row.adjustId } },
                accountingPeriodCode: { name: 'accountantCycleOperate', query: { name: 'ledger', type: 'view', id: row.accountingPeriodId } },
                projectCode: { name: 'projectManagementOperate', query: { name: 'ledger', type: 'view', id: row.projectId } },
                inProjectCode: { name: 'projectManagementOperate', query: { name: 'ledger', type: 'view', id: row.inProjectId } },
                outProjectCode: { name: 'projectManagementOperate', query: { name: 'ledger', type: 'view', id: row.outProjectId } },
                matlCode: { name: 'materialArchivesOperate', query: { name: 'ledger', type: 'view', matlCode: row.matlCode } },
                sourceCode: sourceCodeRoute,
                inCode: { name: 'createInventoryMaintenance', query: { name: 'ledger', type: 'view', id: row.inId } },
                outCode: { name: 'outboundMaintenanceOperate', query: { name: 'ledger', type: 'view', id: row.outId } },
                allocateCode: { name: 'createTransferOutOrder', query: { name: 'ledger', type: 'view', id: row.allocateId, operateType: 'out' } },
                inNum: { name: 'createInventoryMaintenance', query: { name: 'ledger', type: 'view', id: row.inId } },
                inAmount: { name: 'createInventoryMaintenance', query: { name: 'ledger', type: 'view', id: row.inId } },
                outNum: { name: 'outboundMaintenanceOperate', query: { name: 'ledger', type: 'view', id: row.outId } },
                outAmount: { name: 'outboundMaintenanceOperate', query: { name: 'ledger', type: 'view', id: row.outId } },
                adjustNum: { name: '', query: { name: 'ledger', type: 'view', id: row.adjustId } },
                adjustAmount: { name: '', query: { name: 'ledger', type: 'view', id: row.adjustId } },
            }[code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    }
};
</script>

<style scoped lang="scss"></style>
