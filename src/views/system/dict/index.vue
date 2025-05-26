<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
            :formData="formData" />
        <el-row type="flex" class="container_h">
            <!--部门数据-->
            <collapse>
                <el-col :xs="24" class="container_flex_overflow">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <el-tree class="drawer-tree" v-loading="treeLoading" :indent="0" node-key="id"
                            :data="deptOptions" :props="defaultProps" :expand-on-click-node="false" ref="tree"
                            :highlight-current="true" :filter-node-method="filterNode" @node-click="handleNodeClick">
                            <template slot-scope="{ node, data }">
                                <span v-html="node.label"></span>
                            </template>

                        </el-tree>
                    </div>
                </el-col>
            </collapse>

            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick">
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="dataList"
                    :property="property" :numberShow="numberShow" :buttonDisable="handleButtonDisable"
                    @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter" />
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <operate ref="operate" @operateSuccess="operateSuccess" :deptOptions="deptOptions" />
    </div>
</template>

<script>
import {
    commonPage,
    commonTree,
    commonDeleteBatch,
    refreshCache,
} from "@/api/system/dict";
import operate from "./components/operate";
import indexMixin from "@/views/mixins";
import collapse from '@/components/Collapse'
export default {
    mixins: [indexMixin],
    name: "dict",
    components: { operate, collapse },
    data() {
        return {
            // 遮罩层
            loading: false,
            treeLoading: false,
            treeCurrentKey: "",
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 用户表格数据
            dataList: [],
            // 弹出层标题
            title: "",
            // 部门树选项
            deptOptions: undefined,
            // 表格序号是否展示
            numberShow: false,
            //列表选中的数据
            selection: [],
            // 查询参数
            formData: {
                parentId: "",
            },
            formDataClick: {},
            total: 0,
            property: {},
            defaultProps: {
                children: "children",
                label: "name",
            },
            filterText: "",
        };
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        this.commonTree();
        this.menuProperty();
    },
    methods: {
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            return false
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.name, value);
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (data.id === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.parentId = "";
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
            } else {
                this.treeCurrentKey = data.id;
                this.formData.parentId = data.id;
            }
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
            this.menuProperty();
            this.handleQuery();
        },
        commonTree() {
            commonTree().then(({ data }) => {
                this.deptOptions = data;
            });
        },
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch("menuProperty", id).then((data) => {
                this.property = data;
            });
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery);
            this.handleQuery();
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
        handleQuery(row = {}, type = '') {
            if (type === 'queryForm') {
                this.treeCurrentKey = '';
                this.formData.parentId = '';
                this.$refs.tree.setCurrentKey(null);
            }
            this.listQuery.pageNum = 1;
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },
        getList() {
            this.loading = true;
            commonPage(Object.assign({}, this.listQuery, this.formData)).then(
                (res) => {
                    this.dataList = res.data.list;
                    this.total = res.data.total;
                    this.loading = false;
                }
            );
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.single = single;
            this.multiple = multiple;
            this.selection = selection;
        },
        handleCreate() {
            this.$refs.operate.init("create", this.formData.parentId);
        },
        handleUpdate(ids) {
            this.$refs.operate.init("update", ids);
        },
        handleDelete(ids) {
            this.$modal
                .confirm("是否确认删除字典?")
                .then(function () {
                    return commonDeleteBatch({ ids });
                })
                .then(() => {
                    this.commonTree();
                    this.handleQuery();
                    this.$modal.msgSuccess("删除成功");
                })
                .catch(() => { });
            //   }
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            switch (buttonCode) {
                case "update":
                    this.handleUpdate(idArr[0]);
                    break;
                case "delete":
                    this.handleDelete(idArr);
                    break;
                case "create":
                    this.handleCreate();
                    break;
                case "refresh":
                    refreshCache().then(({ success, message }) => {
                        if (success) {
                            this.$message.success("刷新缓存成功");
                        }
                    });
                    break;
                default:
                    break;
            }
        },
        operateSuccess() {
            this.commonTree();
            this.handleQuery();
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