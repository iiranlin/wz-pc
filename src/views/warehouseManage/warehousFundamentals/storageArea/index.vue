<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField"></form-data>

        <el-row type="flex" class="container_h">
            <collapse>
                <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <el-tree class="drawer-tree" node-key="id" :indent="0" :data="dataOptions" :props="defaultProps"
                            :expand-on-click-node="false" ref="tree" :highlight-current="true"
                            :filter-node-method="filterNode" @node-click="handleNodeClick" />
                    </div>
                </el-col>
            </collapse>

            <!--用户数据-->
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick"></right-toolbar>
                <table-index ref="tableIndex" :loading="loading" idName="id" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
                    @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                    <template slot="status" slot-scope="scope">
                        <icon-svg :class="iconClassSize({ 0: 3, 1: 0 }[scope.value])"
                            :icon-class="iconEnableStautsClass({ 0: 3, 1: 0 }[scope.value])" />{{ scope.value |
                                fieldFormat(scope.fieldFormatArr) }}
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <operate ref="operate" @operateSuccess="operateSuccess"></operate>
        <warehouse-operate ref="warehouseOperate" @operateSuccess="operateSuccess"></warehouse-operate>
    </div>
</template>

<script>
import operate from './components/operate';
import warehouseOperate from '@/views/warehouseManage/warehousFundamentals/warehouse/warehouseOperate';
import { getWarehouseTree } from '@/api/warehouseManage/warehouse';
import { baseStorageList } from '@/api/warehouseManage/baseStorage';
import indexMixin from '@/views/mixins';
import collapse from '@/components/Collapse'
export default {
    name: "storageArea",
    mixins: [indexMixin],
    components: { operate, warehouseOperate, collapse },
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
            numberShow: true,
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
                areaId: null,
                warehouseId: null
            },
            formDataClick: {},
            // 部门树选项
            treeLoading: false,
            filterText: "",
            dataOptions: undefined,
            defaultProps: {
                children: "children",
                label: "name",
            },
            treeCurrentKey: "",
        };

    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        this.menuProperty();
        this.getWarehouseTree();
    },
    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.name, value);
        },
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
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
            this.listQuery.pageNum = 1;
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = ids;
            this.single = single;
            this.multiple = multiple;
            this.selection = selection;
        },
        handleResetField() {
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.formData.areaId = null;
            this.formData.warehouseId = null;
            if (data.id === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
            } else {
                this.treeCurrentKey = data.id;
                if (data.level == 0) {
                    this.formData.areaId = data.id;
                } else if (data.level == 1) {
                    this.formData.warehouseId = data.id;
                }
            }
            this.getList();
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode == 'update') {
                this.$refs.operate.init(buttonCode, rowArr[0]);
            } else if (buttonCode === 'create') {
                this.$refs.operate.init(buttonCode);
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            baseStorageList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list;
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        getWarehouseTree() {
            this.treeLoading = true;
            getWarehouseTree().then(({ data }) => {
                this.dataOptions = data || [];
            }).finally(() => {
                this.treeLoading = false;
            })
        },
        operateSuccess() {
            this.handleQuery();
        },
        clickLink(row, fieldCode, linkText) {
            if (fieldCode == 'storageCode') {
                this.$refs.operate.init('view', row);
            }
            if (fieldCode == 'warehouseCode') {
                this.$refs.warehouseOperate.init('view', 'warehouseOperate', row.warehouseId);
            }
        },
    }
};
</script>
<style lang="scss" scoped>
.ov_head {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
}
</style>
