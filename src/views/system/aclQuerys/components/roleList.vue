<template>
    <el-row type="flex" class="container_h">
        <collapse>
            <el-col :xs="24" class="container_flex_overflow">
                <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                </el-input>
                <div class="head-container ov_head" :loading="roleLoading">
                    <el-tree class="drawer-tree" :indent="0" :data="roleOptions" :props="defaultProps"
                        :expand-on-click-node="false" ref="tree" :highlight-current="true" @node-click="handleNodeClick"
                        :filter-node-method="filterNode" node-key="id">
                        <span slot-scope="{ data }">
                            <span class="custom-tree-node">
                                <i class="el-icon-user"></i>
                                <el-tooltip :content="`${data.roleName}【${data.roleCode}】`" :open-delay="300"
                                    placement="top" effect="dark">
                                    <span class="over-ellipsis">
                                        {{ data.roleName }}【{{ data.roleCode }}】
                                    </span>
                                </el-tooltip>
                            </span>
                        </span>
                    </el-tree>
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
                @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                <template #roleRange="{ data, value }">
                    <el-link type="primary" @click="roleRangeClick(data, value)"><icon-svg
                            icon-class="file-upload-field" style="font-size: 14px;" />详情</el-link>
                </template>
            </table-index>
            <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                :limit.sync="listQuery.pageSize" @pagination="getList" />
            <roleRange ref="roleRange"></roleRange>
        </el-col>
    </el-row>
</template>

<script>
import { rolePage, allocatedUserList } from "@/api/system/role";
import indexMixin from "@/views/mixins";
import roleRange from "./roleRange";
import collapse from '@/components/Collapse'
export default {
    mixins: [indexMixin],
    components: { roleRange, collapse },
    data() {
        return {
            // 遮罩层
            loading: false,
            roleLoading: false,
            // 显示搜索条件
            showSearch: false,
            // 表格序号是否展示
            numberShow: false,
            roleOptions: undefined,
            defaultProps: {
                children: "children",
                label: "roleName",
            },
            // 查询参数
            formData: {
                roleId: "",
            },
            property: {},
            total: 0,

            filterText: '',
            dataList: [],
        };
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        }
    },
    created() { },
    mounted() {
        this.rolePage();
        this.menuProperty();
    },
    methods: {
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
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
        roleRangeClick(data) {
            this.$refs.roleRange.init(data);
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.roleName, value) || data.roleCode.indexOf(value) !== -1;
        },
        handleQuery() {
            this.listQuery.pageNum = 1;
            this.getList();
        },
        rolePage() {
            this.roleLoading = true;
            rolePage().then(({ data }) => {
                this.roleOptions = data.list || [];
                this.formData.roleId = data.list[0].id;
                this.roleLoading = false;
                this.$nextTick(() => {
                    this.$refs.tree.setCurrentKey(data.list[0].id)
                    this.handleQuery();
                })
            });
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.formData.roleId = data.id;
            if (data.id) {
                this.handleQuery();
            }
        },
        getList() {
            this.loading = true;
            allocatedUserList(Object.assign({}, this.formData, this.listQuery)).then(res => {
                this.dataList = res.data.list;
                this.total = res.data.total;
                this.loading = false;
            });
        },
    },
};
</script>
<style lang="scss" scoped>
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

.app-container-selection {
    .container_flex_overflow {
        height: calc(100% - 17px);
    }

    .custom-tree-node {
        font-size: 14px;

        i {
            margin-left: -20px;
            margin-right: 8px;
        }
    }

    .head-container-h2 {
        color: #606266;
        padding-left: 18px;
        font-size: 20px;
    }

    .ov_head {
        flex: 1;
        height: 100%;
        overflow-y: scroll;
    }

    .ov_head::-webkit-scrollbar {
        display: none;
    }

    .acl_tree {
        height: 725px;
        overflow-y: auto;
    }

    .button_checked {
        display: flex;
        padding-left: 50px;
        margin-bottom: 10px;

        .button_list {
            float: left;
            margin-left: 15px;
        }
    }

    .indeterminate {
        .el-table-column--selection {
            .el-checkbox__input {
                .el-checkbox__inner {
                    background-color: #{"var(--theme)"} !important;
                    border-color: #{"var(--theme)"} !important;
                    color: #fff !important;

                    &::after {
                        content: "";
                        position: absolute;
                        display: block;
                        width: auto !important;
                        height: 2px;
                        left: 0;
                        right: 0;
                        top: 5px;
                        transform: scale(0.5);
                        border-color: #fff !important;
                        background-color: #fff;
                    }
                }
            }
        }
    }

    .container_flex {
        padding-top: 6px;
        padding-bottom: 10px;
    }

    .container_table {
        display: flex;
        flex-direction: column;

        ::v-deep td {
            padding: 8px 0 !important;
        }

        .el-tabs__content {
            flex: 1;

            .el-tab-pane {
                height: 100%;
            }
        }
    }

    ::v-deep .cell {
        padding-left: 18px;
    }

    .el-table--border .el-table__cell:first-child .cell {
        padding-left: 10px;
    }

    ::v-deep .el-tabs__content {
        height: 100%;
    }

    ::v-deep .el-tabs__header {
        margin: 0 12px 15px;
    }
}
</style>