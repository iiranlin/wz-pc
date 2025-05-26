<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" />
        <el-row type="flex" class="container_h">
            <!--部门数据-->
            <collapse>
                <el-col :xs="24" class="container_flex_overflow">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <el-tree v-loading="treeLoading" class="drawer-tree" node-key="id" :indent="0"
                            :data="menuOptions" :props="defaultProps" :expand-on-click-node="false" ref="tree"
                            :highlight-current="true" :filter-node-method="filterNode" @node-click="handleNodeClick" />
                    </div>
                </el-col>
            </collapse>

            <!--用户数据-->
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick"></right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
                    @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter" />
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <operate ref="operate" @menuSuccess="menuSuccess" />
    </div>
</template>

<script>
import { menuPage, menuDeleteBatch, menuTree } from "@/api/system/menu";
import operate from "./components/operate";
import indexMixin from "@/views/mixins";
import collapse from '@/components/Collapse'
export default {
    name: "menu",
    mixins: [indexMixin],
    components: { operate, collapse },
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
            // 日期范围
            dateRange: [],
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
                menuName: "",
                status: "",
                parentId: null,
            },
            formDataClick: {},
            visible: false,
            treeLoading: false,
            menuOptions: [],
            defaultProps: {
                children: "children",
                label: "menuName",
            },
            treeCurrentKey: "",
            filterText: "",
        };
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        let id = this.$route.meta.id;
        this.$store.dispatch("menuProperty", id).then((data) => {
            this.property = data;
        });
        this.getMenuTree();
    },
    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.menuName, value);
        },
        filterTreeNode(list) {
            return list
            // return list.filter(item => {
            //     item.children = this.filterTreeNode(item.children || [])
            //     return !['productInfo', 'procedureInfo', 'materialInfo', 'analysisInfo'].includes(item.menuUrl)
            // })
        },
        getMenuTree() {
            this.treeLoading = true;
            menuTree().then(({ data }) => {
                this.menuOptions = this.filterTreeNode(data);
                this.treeLoading = false;
            });
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (data.id === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.parentId = null;
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
            } else {
                this.treeCurrentKey = data.id;
                this.formData.parentId = data.id;
            }
            this.getList();
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
        renderHeader(h, { column, $index }, index) {
            return (
                <span>
                    问题分类
                    <el-popover
                        placement="bottom"
                        width="200"
                        height="200"
                        trigger="click"
                        v-model={this.visible}
                    >
                        <span slot="reference">
                            <i
                                class="el-icon-search"
                                style={
                                    this.formData.menuName
                                        ? { color: "red" }
                                        : { color: "blue" }
                                }
                            ></i>
                        </span>
                        <el-input
                            size="small"
                            v-model={this.formData.menuName}
                            placeholder="请输入内容"
                        ></el-input>
                        <div class="el-table-filter__bottom">
                            <button
                                class={
                                    this.formData.menuName ? "" : "is-disabled"
                                }
                                on-click={this.handleQuery}
                            >
                                筛选
                            </button>
                            <button on-click={this.clearSearch}>重置</button>
                        </div>
                    </el-popover>
                </span>
            );
        },
        clearSearch() {
            this.formData.menuName = "";
            this.getList();
        },
        handleQuery(row = {}, type = '') {
            if (type === 'queryForm') {
                this.treeCurrentKey = '';
                this.formData.parentId = '';
                this.$refs.tree.setCurrentKey(null);
            }
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row)
            this.getList();
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.resetForm("queryForm");
            this.handleQuery();
        },
        emitAblFilter() {
            this.dateRange = [];
            this.getList();
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        menuSuccess() {
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple) {
            this.single = single;
            this.multiple = multiple;
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            menuPage(Object.assign({}, this.listQuery, this.formData)).then(
                ({ data }) => {
                    this.list = data.list;
                    this.total = data.total;
                    this.loading = false;
                }
            );
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            switch (buttonCode) {
                case "create":
                    this.$refs.operate.init("create", this.formData.parentId);
                    break;
                case "update":
                    this.$refs.operate.init("update", idArr[0]);
                    break;
                case "delete":
                    this.$modal
                        .confirm("是否确认删除菜单?")
                        .then(() => {
                            return menuDeleteBatch({ ids: idArr });
                        })
                        .then(() => {
                            this.getList();
                            this.$modal.msgSuccess("删除成功");
                        })
                        .catch(() => { });
                    break;
                case "copy":
                    this.$refs.operate.init("copy", idArr[0]);
                    break;
                default:
            }
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
    },
};
</script>
<style lang="scss" scoped>
.ov_head {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
}
</style>