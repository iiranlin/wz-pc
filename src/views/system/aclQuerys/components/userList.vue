<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop"></button-top>
        <form-data :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery" />
        <el-row type="flex" class="container_h">
            <collapse>
                <el-col :xs="24" class="container_flex_overflow">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <el-tree class="drawer-tree" v-loading="deptLoading" node-key="id" :indent="0"
                            :data="deptOptions" :props="defaultProps" :expand-on-click-node="false" ref="tree"
                            :highlight-current="true" :filter-node-method="filterNode" @node-click="handleNodeClick" />
                    </div>
                </el-col>
            </collapse>

            <!--用户数据-->
            <el-col :span="12" :xs="24" class="container_flex" v-loading="loading">
                <right-toolbar ref="rightToolbar" :formData="{}" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset"
                    @numberChange="numberChange"></right-toolbar>
                <table-index ref="tableIndex" :tableIndexs="tableIndex" :tableData="dataList" :property="property"
                    :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickTableRow="clickTableRow">
                    <template #roleRange="{ data, value }">
                        <el-link type="primary" @click="roleRangeClick(data, value)"><icon-svg
                                icon-class="file-upload-field" style="font-size: 14px;" />详情</el-link>
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
            <!-- <el-col :span="6" :xs="24" style="border-left: 1px solid #dfe6ec;">
                <userRange ref="userRange"></userRange>
            </el-col> -->
        </el-row>
        <roleRange ref="roleRange"></roleRange>
    </div>
</template>

<script>
import { userPage } from "@/api/system/user";
import { deptTree } from "@/api/system/dept";
import indexMixin from "@/views/mixins";
import userRange from "./userRange"
import roleRange from "./roleRange";
import collapse from '@/components/Collapse'
export default {
    mixins: [indexMixin],
    components: { userRange, roleRange, collapse },
    data() {
        return {
            // 遮罩层
            loading: false,
            deptLoading: false,
            // 显示搜索条件
            showSearch: true,
            // 表格序号是否展示
            numberShow: false,
            deptOptions: undefined,
            defaultProps: {
                children: "children",
                label: "deptName",
            },
            // 查询参数
            formData: {
                deptId: "",
            },
            property: {},
            total: 0,

            filterText: '',
            dataList: [],
            treeCurrentKey: "",
            userData: null
        };
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
        // userData (val) {
        //     this.$refs.userRange.init(val);
        // }
    },
    mounted() {
        this.deptTree();
        this.menuProperty();
        this.handleQuery();
    },
    methods: {
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
                // data.fieldList = data.fieldList.filter( item => item.fieldCode != 'roleRange' );
                // data.fields = data.fields.filter( item => item.fieldCode != 'roleRange' );
                this.property = data;
            });
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
        handleSelectionChange(ids, single, multiple) {

        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
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
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.deptName, value) || data.deptCode.indexOf(value) !== -1;
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
            this.getList();
        },
        deptTree() {
            this.deptLoading = true;
            deptTree().then(({ data }) => {
                if (data[0].deptCode == "10000001") {
                    this.deptOptions = data[0]["children"];
                } else {
                    this.deptOptions = data;
                }
                this.deptLoading = false;
            });
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (data.id === this.treeCurrentKey) {
                this.formData.deptId = null;
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
            } else {
                this.treeCurrentKey = data.id;
                this.formData.deptId = data.id;
            }
            this.handleQuery();
        },
        getList() {
            this.loading = true;
            userPage(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.userData = data.list.length > 0 && data.list[0];
                this.dataList = data.list;
                this.total = data.total;
                this.loading = false;
            });
        },
        clickTableRow(row) {
            this.userData = row;
        },
        roleRangeClick(data) {
            this.$refs.roleRange.init(data);
        }
    },
};
</script>
<style lang="scss" scoped>
.container_h {
    overflow: hidden;
}

.app-container-tabs {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-top: 10px;

    ::v-deep .el-tabs__nav {
        margin-left: 20px;

        .el-tabs__item {
            border: 1px solid #dfe4ed;
            padding: 0 10px;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
    }

    ::v-deep .el-tabs__content {
        flex: 1;

        .el-tab-pane {
            height: 100%;
        }
    }
}

.ov_head {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
}
</style>