<template>
    <div class="app-container app-container-selection" :style="{ '--theme': theme }">
        <button-top :buttonTopData="buttonTop" @newButton="newButton"></button-top>
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
                <el-table class="container_table" height="100%" :data="arrAclList" ref="product" border lazy row-key="id"
                    :row-class-name="rowClassNameFun" :header-row-class-name="headerRowClassName" @select="selectFun"
                    @select-all="selectAllFun" :header-cell-style="{ background: '#fafafa' }">
                    <el-table-column type="selection" width="55" align="center"></el-table-column>
                    <el-table-column prop="menuName" label="菜单名称">
                        <template slot-scope="{ row }">
                            <span>{{ row.menuName }}</span>
                            <acl-checkbox
                                v-if="(row.buttonList && row.buttonList.length) || (row.fieldList && row.fieldList.length)"
                                :ref="'checkbox' + row.id" :item="row" @changeAll="changeAll" :id="row.id" />
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { rolePage } from "@/api/system/role";
import { aclList, aclAssign } from "@/api/system/acl";

import indexMixin from "@/views/mixins";
import aclCheckbox from "./components/aclCheckbox";
import dataCheckbox from "./components/dataCheckbox";
import collapse from '@/components/Collapse'
export default {
    name: "aclOpt",
    mixins: [indexMixin],
    components: { aclCheckbox, dataCheckbox, collapse },
    data() {
        return {
            // 遮罩层
            loading: false,
            // 显示搜索条件
            showSearch: true,
            // 部门树选项
            roleOptions: undefined,
            defaultProps: {
                children: "children",
                label: "roleName",
            },
            // 查询参数
            formData: {
                deptName: "",
                parentId: "",
            },
            menuList: [],
            arrAclList: [],
            arrAclButtonList: {},
            arrChangeAllObj: {},
            isSelectAll: true,
            arrRadioAllObj: {},
            roleDataRuleOptions: [],
            roleLoading: false,
            filterText: '',
            buttonTop: [{ buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save' }],
        };
    },
    computed: {
        theme() {
            return this.$store.state.settings.theme;
        },
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        }
    },
    created() { },
    mounted() {
        this.rolePage();
    },
    methods: {
        handleQuery() {
            this.aclList();
        },
        rolePage() {
            this.roleLoading = true;
            rolePage().then(({ data }) => {
                this.roleOptions = data.list || [];
                this.formData.parentId = data.list[0].id;
                this.roleLoading = false;
                this.$nextTick(() => {
                    this.$refs.tree.setCurrentKey(data.list[0].id)
                })
                this.aclList();
            });
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.formData.parentId = data.id;
            this.arrChangeAllObj = {};
            this.arrRadioAllObj = {};
            this.arrAclList = [];
            if (data.id) {
                this.handleQuery();
            }
        },
        handleNodeClickMenu(data) {
            this.arrAclButtonList = data;
        },
        aclList() {
            this.loading = true;
            aclList({}, this.formData.parentId).then(({ data }) => {
                this.arrAclList = data;
                this.initData(this.arrAclList);
                let _this = this;

                function selectAllFor(selectionArr) {
                    selectionArr.forEach((item) => {
                        if (item.isBind == 1) {
                            item.isSelect = true;
                            _this.toggleSelection([item], true);
                        }
                        if (item.children.length > 0) {
                            selectAllFor(item.children);
                        }
                    });
                }

                this.$nextTick(() => {
                    selectAllFor(this.arrAclList);
                    this.loading = false;
                });
            });
        },
        newButton(buttonCode) {
            if (buttonCode === 'save') {
                let parentId = this.formData.parentId;
                if (!parentId) {
                    this.$modal.msgError("请先选择角色");
                    return false;
                }
                let _this = this,
                    arrChangeAll = [];

                function selectAllFor(selectionArr) {
                    selectionArr.forEach((item) => {
                        if (item.isSelect || item.isSelect === "") {
                            arrChangeAll.push({
                                menuId: item.id,
                                aclIds: _this.arrChangeAllObj[item.id] || [],
                            });
                        }
                        if (item.children.length > 0) {
                            selectAllFor(item.children);
                        }
                    });
                }

                selectAllFor(this.arrAclList);

                let objChangeAll = {
                    roleId: parentId,
                    menuIds: [],
                    aclIds: [],
                };
                arrChangeAll.forEach((item) => {
                    objChangeAll.menuIds.push(item.menuId);
                    objChangeAll.aclIds.push(...item.aclIds);
                });
                aclAssign(objChangeAll).then(({ message }) => {
                    this.$modal.msgSuccess(message);
                });
            }
        },
        changeAll(data, id, item) {
            this.arrChangeAllObj[id] = data;
            if (item) {
                let len = this.arrChangeAllObj[id].length;
                let lens1 = item.buttonList ? item.buttonList.length : 0;
                let lens2 = item.fieldList ? item.fieldList.length : 0;
                let lens = lens1 + lens2;
                if (item.isSelect === false) {
                    this.$refs.product.toggleRowSelection(item, true);
                } else {
                    this.$refs.product.toggleRowSelection(item, item.isSelect);
                }
                if (len > 0 && len < lens) {
                    item.isSelect = "";
                    this.$refs.product.toggleRowSelection(item, false);
                    this.setRowIsSelect(item, true);
                }
                if (len === 0) {
                    item.isSelect = false;
                    this.$refs.product.toggleRowSelection(item, false);
                    this.setRowIsSelect(item, true);
                }
                if (len === lens) {
                    item.isSelect = true;
                    this.$refs.product.toggleRowSelection(item, true);
                    this.setRowIsSelect(item, true);
                }
            }
        },
        radioAll(data, id) {
            this.arrRadioAllObj[id] = data;
        },

        //初始化数据
        initData(data) {
            data.forEach((item) => {
                item.isSelect = false; //默认为不选中
                if (item.children && item.children.length) {
                    this.initData(item.children);
                }
            });
        },
        selectFun(selection, row) {
            this.setRowIsSelect(row);
        },
        setRowIsSelect(row, type) {
            //当点击父级点复选框时，当前的状态可能为未知状态，所以当前行状态设为false并选中，即可实现子级点全选效果
            if (!type) {
                if (row.isSelect === "") {
                    row.isSelect = false;
                    this.$refs.product.toggleRowSelection(row, true);
                }
                row.isSelect = !row.isSelect;
            }
            let that = this;

            function selectAllChildrens(data) {
                data.forEach((item) => {
                    item.isSelect = row.isSelect;
                    that.$refs.product.toggleRowSelection(item, row.isSelect);
                    if (item.children && item.children.length) {
                        selectAllChildrens(item.children);
                    }
                    if (that.$refs["checkbox" + item.id] && !type) {
                        that.$refs["checkbox" + item.id].isWatch();
                    }
                });
            }

            function getSelectStatus(selectStatuaArr, data) {
                data.forEach((childrenItem) => {
                    selectStatuaArr.push(childrenItem.isSelect);
                    if (childrenItem.children && childrenItem.children.length) {
                        getSelectStatus(selectStatuaArr, childrenItem.children);
                    }
                });
                return selectStatuaArr;
            }

            function getLevelStatus(row) {
                //如果当前节点的parantId =0 并且有子节点，则为1
                //如果当前节点的parantId !=0 并且子节点没有子节点 则为3
                if (!row.parentId) {
                    if (row.children && row.children.length) {
                        return 1;
                    } else {
                        return 4;
                    }
                } else {
                    if (
                        (row.buttonList && row.buttonList.length) ||
                        (row.fieldList && row.fieldList.length)
                    ) {
                        return 5;
                    } else if (!row.children || !row.children.length) {
                        return 3;
                    } else {
                        return 2;
                    }
                }
            }

            let result = {};

            //获取明确的节点
            function getExplicitNode(data, parentId) {
                data.forEach((item) => {
                    if (item.id == parentId) {
                        result = item;
                    }
                    if (item.children && item.children.length) {
                        getExplicitNode(item.children, parentId);
                    }
                });
                return result;
            }

            function operateLastLeve(row, type) {
                //操作的是子节点  1、获取父节点  2、判断子节点选中个数，如果全部选中则父节点设为选中状态，如果都不选中，则为不选中状态，如果部分选择，则设为不明确状态
                let selectStatuaArr = [];
                let item = getExplicitNode(that.arrAclList, row.parentId);
                selectStatuaArr = getSelectStatus(
                    selectStatuaArr,
                    item.children
                );
                if (
                    selectStatuaArr.every((selectItem) => {
                        return true == selectItem;
                    })
                ) {
                    item.isSelect = true;
                    that.$refs.product.toggleRowSelection(item, true);
                } else if (
                    selectStatuaArr.every((selectItem) => {
                        return false == selectItem;
                    })
                ) {
                    if (!type) {
                        item.isSelect = false;
                        that.$refs.product.toggleRowSelection(item, false);
                    } else {
                        if (
                            selectStatuaArr.every((selectItem) => {
                                return false === selectItem;
                            })
                        ) {
                            item.isSelect = false;
                        } else {
                            item.isSelect = "";
                        }
                    }
                } else {
                    item.isSelect = "";
                }
                //则还有父级
                if (item.parentId != null && item.parentId != "") {
                    operateLastLeve(item, type);
                }
            }

            //判断操作的是子级点复选框还是父级点复选框，如果是父级点，则控制子级点的全选和不全选

            //1、只是父级 2、既是子集，又是父级 3、只是子级
            let levelSataus = getLevelStatus(row);
            if (levelSataus == 1) {
                selectAllChildrens(row.children);
            } else if (levelSataus == 2) {
                selectAllChildrens(row.children);
                operateLastLeve(row);
            } else if (levelSataus == 3) {
                operateLastLeve(row);
            } else if (levelSataus == 5) {
                selectAllChildrens([row]);
                operateLastLeve(row, type);
            }
            if (this.$refs["checkbox" + row.id] && !type) {
                this.$refs["checkbox" + row.id].isWatch();
            }
        },
        checkIsAllSelect() {
            this.oneProductIsSelect = [];
            this.arrAclList.forEach((item) => {
                this.oneProductIsSelect.push(item.isSelect);
            });
            //判断一级产品是否是全选.如果一级产品全为true，则设置为取消全选，否则全选
            let isAllSelect = this.oneProductIsSelect.every(
                (selectStatusItem) => {
                    return true == selectStatusItem;
                }
            );
            return isAllSelect;
        },
        selectAllFun(selection) {
            let isAllSelect = this.checkIsAllSelect();
            this.arrAclList.forEach((item) => {
                item.isSelect = isAllSelect;
                this.$refs.product.toggleRowSelection(item, !isAllSelect);
                this.selectFun(selection, item);
            });
        },
        rowClassNameFun({ row }) {
            if (row.isSelect === "") {
                return "indeterminate";
            }
        },
        headerRowClassName({ row }) {
            let oneProductIsSelect = [];
            this.arrAclList.forEach((item) => {
                oneProductIsSelect.push(item.isSelect);
            });
            if (oneProductIsSelect.includes("")) {
                return "indeterminate";
            }
            return "";
        },
        toggleSelection(rows, flag) {
            if (rows) {
                rows.forEach((row) => {
                    this.$refs.product.toggleRowSelection(row, flag);
                });
            } else {
                this.$refs.product.clearSelection();
            }
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.roleName, value) || data.roleCode.indexOf(value) !== -1;
        },
    },
};
</script>
<style lang="scss" scoped>
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
}</style>
