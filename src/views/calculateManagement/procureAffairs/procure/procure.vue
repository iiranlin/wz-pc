<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :treeList="treeList" @searchFormTreeSelected="searchFormTreeSelected"
            :hideDrawerLabel="['otherFlags']" @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch"
            :searchArr="property.search || []" :formData="formData" @fieldClick="handleFieldClick"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
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
        <selectContract ref="contractRef" :singleMode="true" :filterCondition="filterCondition"
            @selections="handleContractConfirm" />
        <choiceInOrder ref="choiceInOrderRef" singleMode @confirm="handleInConfirm" />
        <choicePurchaseOrder ref="choicePurchaseRef" singleMode :propsFormData="propsFormData"
            @selections="handlePurchaseConfirm" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { inventoryCardInfoList, inventoryDetailList, inventoryCardInfoExport, inventoryCardInfoStatistics, inventoryDetailExport, inventoryDetailStatistics, } from '@/api/calculateManagement/procure'
import orderDetailType from '@/views/components/orderDetailType'
import orderDetail from '@/views/components/orderDetail'
import { menuConfig } from '@/utils'
import { getUserInfo } from '@/utils/user-info'
import selectProject from "@/views/components/selectProject"
import choiceMaterial from '@/views/components/choice-material'
import tableStatistics from '@/views/components/table-statistics'
import choiceDuration from '@/views/components/choice-duration'
import selectContract from '@/views/components/selectContract'
import choiceInOrder from '@/views/components/choice-in-warehouse-order'
import choicePurchaseOrder from '@/views/components/choice-purchase-order'
import FormUnitId from '@/views/components/form-unitId'
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
    name: "Procure",
    mixins: [indexMixin],
    components: { FormUnitId, choicePurchaseOrder, choiceInOrder, selectContract, choiceDuration, tableStatistics, selectProject, choiceMaterial, orderDetailType, orderDetail },
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
            appendToBody: true,
            propsFormData: {
                bizStatus: 0
            },
            tableOptions: [
                { value: MENU_TYPE.MASTER, label: '综合' },
                { value: MENU_TYPE.BRANCH, label: '明细' },
            ],
            statistics: {
                MASTER: [
                    [
                        {
                            key: 'pcrNumSum',
                            label: '合同总数量',
                            value: '-'
                        },
                        {
                            key: 'pcrAmountSum',
                            label: '合同总金额（不含税，单位：元）',
                            value: '-'
                        },
                        {
                            key: 'pcrAmountTaxSum',
                            label: '合同总金额（含税，单位：元）',
                            value: '-'
                        },
                    ],
                    [
                        {
                            key: 'pcrUseNumSum',
                            label: '已生成采购订单总数量',
                            value: '-'
                        },
                        {
                            key: 'purOrderAmountSum',
                            label: '已生成采购订单总金额（不含税，单位：元）',
                            value: '-'
                        },
                        {
                            key: 'purOrderTaxAmountSum',
                            label: '已生成采购订单总金额（含税，单位：元）',
                            value: '-'
                        },
                    ],
                    [
                        {
                            key: 'inNumSum',
                            label: '入库完成总数量',
                            value: '-'
                        }, {
                            key: 'inAmountSum',
                            label: '入库金额（不含税，单位：元）',
                            value: '-'
                        },

                    ]




                ],
                BRANCH: [
                    [
                        {
                            key: 'pcrNumSum',
                            label: '合同总数量',
                            value: '-'
                        },
                        {
                            key: 'pcrAmountSum',
                            label: '合同总金额（不含税，单位：元）',
                            value: '-'
                        },
                        {
                            key: 'pcrAmountTaxSum',
                            label: '合同总金额（含税，单位：元）',
                            value: '-'
                        },
                    ],
                    [
                        {
                            key: 'pcrUseNumSum',

                            label: '已生成采购订单总数量',
                            value: '-'
                        },
                        {
                            key: 'purOrderAmountSum',
                            label: '已生成采购订单总金额（不含税，单位：元）',
                            value: '-'
                        },
                        {
                            key: 'purOrderTaxAmountSum',
                            label: '已生成采购订单总金额（含税，单位：元）',
                            value: '-'
                        },
                    ],
                    [
                        {
                            key: 'inNumSum',
                            label: '入库完成总数量',
                            value: '-'
                        },
                        {
                            key: 'inAmountSum',
                            label: '入库金额（不含税，单位：元）',
                            value: '-'
                        },

                    ],




                ],
            },
            menuId: '',
            treeList: {
                deptId: [],
            },
            filterCondition: {
                isProject: '1',
                status: '3',
                ctType: '1',
                unitId: userInfo.unitId,
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
        this.menuProperty(this.tableType != MENU_TYPE.MASTER ? menuConfig.MENU_PROCURE_DETAIL : '')

        if(this.tableType != MENU_TYPE.MASTER){
            this.formData.isContractPur ='1';
        }else{
            this.formData.pcIsProject = '1';
            this.formData.pcStatus = '3'
        }
    },
    methods: {
        async pagination () {
          try {
            const menuId = this.tableType != MENU_TYPE.MASTER ? menuConfig.MENU_PROCURE_DETAIL : ''
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
            if (key === 'projectCode') {
                this._projectProp = { projectName: 'projectName', projectCode: 'projectCode', projectSource: 'projectSource', projectType: 'projectType' }
                this.$refs.selectProject.init()
            } else if (key === 'pcrMatlCode') {
                this.$refs.choiceMaterial.init()
            } else if (key === 'accountingPeriodCode') {
                this.$refs.choiceDurationRef.init(this.formData.accountingPeriodOrgId, this.formData.accountingPeriodOrgName);
            } else if (key === 'pcCtCode') {
                this.$refs.contractRef.init(null, []);
            } else if (key === 'ppoPurCode') {
                this.$refs.choicePurchaseRef.init();
            } else if (key === 'inCode') {
                this.$refs.choiceInOrderRef.init()
            }
        },
        handlePurchaseConfirm(data) {
            this.formData = Object.assign({}, this.formData, { ppoPurCode: data.purCode, ppoPurName: data.purName || '', ppoSourceType: data.sourceType || '', ppoPurType: data.purType || '', isContractPur: data.hasCt || '', purUserName: data.purUserName || '', ppoStatus: data.status, ppoCreateDate: data.createDate })
        },
        handleInConfirm({ inCode, }) {
            this.formData = Object.assign({}, this.formData, { inCode: inCode })

        },
        handleContractConfirm({ ctCode, ctName }) {
            this.formData = Object.assign({}, this.formData, { pcCtCode: ctCode, pcCtName: ctName })
        },
        handleDurationConfirm(row) {
            const { accountingOrgName, code, name, no , accountingOrgId} = row
            let formData = Object.assign({}, this.formData, { accountingPeriodOrgName: accountingOrgName, accountingPeriodOrgId:accountingOrgId,  accountingPeriodCode: code, accountingPeriodName: name, accountingPeriodNo: no })
            if (row.startDate) {
                formData.accountingPeriodStartDate = [new Date(row.startDate), new Date(row.startDate)]
            }
            if (row.endDate) {
                formData.accountingPeriodEndDate = [new Date(row.endDate), new Date(row.endDate)]
            }
            this.formData = formData
        },
        handleProjectConfirm(data) {
            const obj = {}
            for (let key in this._projectProp) {
                obj[this._projectProp[key]] = data[key]
            }
            this.formData = Object.assign({}, this.formData, obj)
            this._projectProp = undefined
        },
        handleMaterialConfirm({ matlCode, matlName, matlType }) {
            this.formData = Object.assign({}, this.formData, { pcrMatlCode: matlCode, pcrMatlName: matlName, pcrMatlType: matlType })
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
                    param.produceCode = this.formData.p
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
                        this.statistics[this.tableType] = this.statistics[this.tableType].map(arr => arr.map(item => {
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
            if (['pcrUseNum', 'purOrderAmount', 'purOrderTaxAmount', 'pcrInNum', 'totalInAmount'].includes(code)) {
                const param = {
                    // accountingPeriodOrgName: row.accountingPeriodOrgName,
                    // pcrMatlName
                    accountingPeriodCode: row.accountingPeriodCode,
                    projectCode: row.projectCode,
                    pcCtCode: row.pcCtCode,
                    pcrMatlCode: row.pcrMatlCode

                }
                if (!row.projectCode) {
                    param.p = 'P'
                }
                // for (let key in param) {
                //     this.$set(this.formData, key, param[key])
                // }
                const menuId = menuConfig.MENU_PROCURE_DETAIL
                await this.$IDB.setObjectStore('formData', menuId, param)
                this.handleTableTypeChange(MENU_TYPE.BRANCH)
                this.$nextTick(() => {
                    this.handleQuery()
                })
                return
            }
            const linkConfig = {
                accountingPeriodCode: { name: 'accountantCycleOperate', query: { name: 'procure', type: 'view', id: row.accountingPeriodId } },
                projectCode: { name: 'projectManagementOperate', query: { name: 'procure', type: 'view', id: row.projectId } },
                pcCtCode: { name: 'contractManagementOperate', query: { name: 'procure', type: 'view', id: row.pcCtId } },
                pcRelativeCode: { name: 'supplierOperate', query: { type: "view", id: row.pcRelativeId, name: 'procure', isQuery: 'query' } },
                pcrMatlCode: { name: 'materialArchivesOperate', query: { name: 'procure', type: 'view', matlCode: row.pcrMatlCode } },
                orderCode: { name: 'productionOrderOperate', query: { name: 'procure', type: 'view', id: row.orderId } },
                produceCode: { name: 'materialArchivesOperate', query: { name: 'procure', type: 'view', matlCode: row.produceCode } },
                orderRawCode: { name: 'productionOrderOperate', query: { name: 'procure', type: 'view', id: row.orderRawId, tableType: 2 } },
                ppoPurCode: { name: 'purchaseOrderOperate', query: { type: "view", id: row.ppoPurId, isQuery: 'query' } },
                inCode: { name: 'createInventoryMaintenance', query: { type: 'view', id: row.inId } }
            }[code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    }
};
</script>

<style scoped lang="scss"></style>
