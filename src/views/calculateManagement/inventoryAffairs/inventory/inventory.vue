<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :treeList="treeList" @searchFormTreeSelected="searchFormTreeSelected"
            @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch" :searchArr="property.search || []"
            :formData="formData" @fieldClick="handleFieldClick" @handleQuery="handleQuery"
            @handleResetField="handleResetField">
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
            <template v-slot:warehouseId="{ data, i18nData }">
                <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <collapse :collapse="false">
                <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <el-tree class="drawer-tree" node-key="matlClassifyId" :indent="0" :data="dataOptions"
                            :props="defaultProps" :expand-on-click-node="false" ref="tree" :highlight-current="true"
                            :filter-node-method="filterNode" @node-click="handleNodeClick" />
                    </div>
                </el-col>
            </collapse>
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
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { inventoryCardInfoList, inventoryDetailList, inventoryCardInfoExport, inventoryCardInfoStatistics, inventoryDetailExport, inventoryDetailStatistics, } from '@/api/calculateManagement/inventory'
import orderDetailType from '@/views/components/orderDetailType'
import orderDetail from '@/views/components/orderDetail'
import { menuConfig } from '@/utils'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import collapse from '@/components/Collapse'
import selectProject from "@/views/components/selectProject"
import choiceMaterial from '@/views/components/choice-material'
import tableStatistics from '@/views/components/table-statistics'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
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
    name: "Inventory",
    mixins: [indexMixin],
    components: { FormUnitId, tableStatistics, selectProject, choiceMaterial, orderDetailType, orderDetail, collapse, FormWarehouseCode },
    props: {
        tableType: {
            type: String,
            default: MENU_TYPE.MASTER
        },
        tabChange: {
            type: Function,
            default: null
        }
    },

    data() {
        return {
            statistics: {
                MASTER: [
                    [{
                        key: 'totalNum',
                        label: '当前查询的存货总数量',
                        value: '-'
                    },],
                    [{
                        key: 'totalAmount',
                        label: '当前查询的存货总金额（不含税，单位：元）',
                        value: '-'
                    },]


                ],
                BRANCH: [
                    [
                        {
                            key: 'totalInventoryNum',
                            label: '当前查询的存货总数量',
                            value: '-'
                        },
                    ], [
                        {
                            key: 'totalAmount',
                            label: '当前查询的存货总金额（不含税，单位：元）',
                            value: '-'
                        },
                    ]


                ],
            },
            filterText: "",
            dataOptions: undefined,
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
            treeCurrentKey: '',
            treeLoading: false,
            tableOptions: [
                { value: MENU_TYPE.MASTER, label: '综合' },
                { value: MENU_TYPE.BRANCH, label: '明细' },
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
            formData: {},
            formDataClick: {},
        };

    },
    created() {
        const query = this.$route.query || {}
        this.formData = query
        this.formDataClick = query
        this.classTree();
        this.menuProperty(this.tableType != MENU_TYPE.MASTER ? menuConfig.MENU_INV_DETAIL : '')
    },
    methods: {
        async pagination () {
          try {
            const menuId = this.tableType != MENU_TYPE.MASTER ? menuConfig.MENU_INV_DETAIL : ''
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
            }
            if (key === 'matlCode') {
                this.$refs.choiceMaterial.init()
            }
        },
        handleProjectConfirm(data) {
            const obj = {}
            for (let key in this._projectProp) {
                obj[this._projectProp[key]] = data[key]
            }
            this.formData = Object.assign({}, this.formData, obj)
            this._projectProp = undefined
        },
        handleMaterialConfirm({ matlCode, matlName, matlType, matlUnit }) {
            this.formData = Object.assign({}, this.formData, { matlCode, matlName, matlType, matlUnit })
        },
        handleNodeClick(data) {
            if (data.matlClassifyId === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.matlClassifyId = null;
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
                // this.formDataClick.matlClassifyId = '全部';
            } else {
                this.treeCurrentKey = data.matlClassifyId;
                this.formData.matlClassifyId = data.matlClassifyId;
                // this.formDataClick.matlClassifyId = data.matlClassifyName;
            }
            this.getList();
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
        },
        classTree() {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.dataOptions = data || [];
                this.treeLoading = false;
            }).finally(() => {
                this.treeLoading = false;
            })
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
                if (param.matlClassifyId == '全部') {
                    delete param.matlClassifyId
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
            if (['amount', 'num'].includes(code)) {
                const param = {
                    unitName: row.unitName,
                    projectCode: row.projectCode,
                    matlCode: row.matlCode,
                    warehouseName: row.warehouseName
                }
                if (!row.projectCode) {
                    param.p = 'P'
                }
                // for (let key in param) {
                //     this.$set(this.formData, key, param[key])
                // }
                const menuId = menuConfig.MENU_INV_DETAIL
                await this.$IDB.setObjectStore('formData', menuId, param)
                this.handleTableTypeChange(MENU_TYPE.BRANCH)
                this.$nextTick(() => {
                    this.handleQuery()
                })

                return
            }
            const linkConfig = {
                batchNo: { name: 'batchNoDetail', query: { type: "view", id: row.batchNo, name: 'scrapApplyQuery' } },
                projectCode: { name: 'projectManagementOperate', query: { name: 'ledger', type: 'view', id: row.projectId } },
                matlCode: { name: 'materialArchivesOperate', query: { name: 'ledger', type: 'view', matlCode: row.matlCode } },
            }[code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    }
};
</script>

<style scoped lang="scss"></style>
