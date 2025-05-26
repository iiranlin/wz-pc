<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
            <template slot="matlClassifyId">
                <el-input :disabled="true" v-model="formDataClick.matlClassifyId"></el-input>
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
                        <span class="ov_head_title">物料分类</span>
                        <el-tree class="drawer-tree" node-key="matlClassifyId" :indent="0" :data="dataOptions"
                            :props="defaultProps" :expand-on-click-node="false" ref="tree" :highlight-current="true"
                            :filter-node-method="filterNode" @node-click="handleNodeClick" />
                    </div>
                </el-col>
            </collapse>

            <!--用户数据-->
            <el-col :span="20" :xs="24" class="container_flex">
                <orderDetailType styleObj="padding-top: 16px;" :value="tableType" @input="handleTableTypeChange"
                    :options="tableOptions" />
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :menuId="menuId" :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick">
                    <!-- <template v-slot:tab>
                        <orderDetailType :value="tableType" @input="handleTableTypeChange" :options="tableOptions" />
                    </template> -->
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" idName="matlId" :tableIndexs="tableIndex"
                    :menuId="menuId" :tableData="list" :buttonDisable="handleButtonDisable" :property="property"
                    :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @clickLink="clickLink"
                    @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <selectPlace ref="selectPlace"></selectPlace>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { inventoryBatchlist, exportBatchlist, getInventoryGroupList, exportGroupList, exportProjcetList, getInventoryProjectList } from '@/api/warehouseManage/inventoryManage'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import { download } from '@/utils/request'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import selectPlace from '@/views/components/selectPlace'
import collapse from '@/components/Collapse'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
const MENU_TYPE = {
    MASTER: 'MASTER', // 主单
    PROJECT: 'PROJECT',
    BRANCH: 'BRANCH'  // 主单+明细
}
export default {
    name: "inventoryQuery",
    mixins: [indexMixin],
    components: { FormUnitId, orderDetailType, selectPlace, collapse, FormWarehouseCode },
    props: {
        tableType: {
            type: String,
            default: 'MASTER'
        },
        tabChange: {
            type: Function,
            default: null
        },
    },
    data() {
        return {
            // 遮罩层
            loading: false,
            selectedRow: null,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            filterText: "",
            dataOptions: undefined,
            treeLoading: false,
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
            tableOptions: [
                { value: MENU_TYPE.MASTER, label: '综合库存' },
                { value: MENU_TYPE.PROJECT, label: '项目库存' },
                { value: MENU_TYPE.BRANCH, label: '批次库存' },
            ],
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
            formDataClick: {
                matlClassifyId: '全部'
            },
            selectedRow: null,
            menuId: ''
        };

    },
    created() {

        this.menuProperty({ MASTER: menuConfig.MENU_QUERY_MASTER, BRANCH: menuConfig.MENU_QUERY_BRANCH, PROJECT: menuConfig.MENU_QUERY_PROJECT }[this.tableType]);
        this.getTreeList()
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    methods: {
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
        },
        handleNodeClick(data) {
            if (data.matlClassifyId === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.matlClassifyId = null;
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
                this.formDataClick.matlClassifyId = '全部';
            } else {
                this.treeCurrentKey = data.matlClassifyId;
                this.formData.matlClassifyId = data.matlClassifyId;
                this.formDataClick.matlClassifyId = data.matlClassifyName;
            }
            this.getList()
        },
        getTreeList() {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.dataOptions = data || [];
            }).finally(() => {
                this.treeLoading = false;
            })
        },
        menuProperty(id) {
            this.menuId = id || this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                for (let i = 0; i < data.search.length; i++) {
                    if (["matlClassifyId"].includes(data.search[i].fieldCode)) {
                        data.search[i]['clear'] = true
                        break
                    }
                }
                this.property = data;
            });
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
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
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            if (!this.formDataClick.matlClassifyId) {
                this.formDataClick.matlClassifyId = '全部'
            } else {
                const node = this.$refs.tree.getCurrentNode()
                if (node && node.matlClassifyName) {
                    this.formDataClick.matlClassifyId = node.matlClassifyName
                }

            }
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
            this.formData.matlClassifyId = null;
            this.$refs.tree.setCurrentKey(null);
            this.treeCurrentKey = "";
            this.formDataClick.matlClassifyId = '全部';
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const buttonActions = {
                update: () => { this.$router.push({ name: 'createTransferOutOrder', query: { type: 'update', id: idArr[0], operateType: 'out' } }); },
                delete: () => { this.handleDelete(idArr); },
                create: () => { this.$router.push({ name: 'createTransferOutOrder', query: { type: 'create', operateType: 'out' } }); },
                submit: () => { this.handleSubmit(idArr); },
                export: () => {
                    const exportApi = { [MENU_TYPE.MASTER]: exportGroupList, [MENU_TYPE.BRANCH]: exportBatchlist, [MENU_TYPE.PROJECT]: exportProjcetList }[this.tableType]
                    const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                    download(`${exportApi}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        getList() {
            this.loading = true;
            const api = { [MENU_TYPE.MASTER]: getInventoryGroupList, [MENU_TYPE.BRANCH]: inventoryBatchlist, [MENU_TYPE.PROJECT]: getInventoryProjectList }[this.tableType]
            if (this.formData.matlClassifyId == '全部') {
                delete this.formData.matlClassifyId
            }
            api(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list;
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        clickLink(row, code) {
            if (code === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'inventoryQuery' } });
            } else if (code == 'batchNo') {
                this.$router.push({ name: 'batchNoDetail', query: { id: row.batchNo, type: 'view', name: 'inventoryQuery' } })
            } else if (code == 'inventoryNum') {
                delete row.createDate
                this.$refs.selectPlace.init(row)
            } else if (code == 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'inventoryQuery', type: 'view', id: row.projectId, isQuery: 'query' } })
            }
        },
    }
};
</script>

<style scoped lang="scss">
.ov_head_title {
    color: #555555;
    font-size: 14px;
    margin-left: 15px;
}
</style>
