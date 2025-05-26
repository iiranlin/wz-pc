<template>
    <Dialog class="roleRange" width="1300px" :close-on-click-modal="false" append-to-body  :visible.sync="drawer" >
        <template slot="title">
            <div class="avue-crud__dialog__header">
                <span class="el-dialog__title"><icon-svg icon-class="Left-title" /><span>已分配角色</span></span>
                <!-- <div class="avue-crud__dialog__menu" @click="dialogFull = !dialogFull">
                    <i class="el-icon-full-screen"></i>
                </div> -->
            </div>
        </template>
        <div class="roleRange-mian">
            <div class="roleRange-box">
                <div class="roleRange-box-p">
                    <!-- <p><icon-svg icon-class="Left-title" /><span>已分配角色</span></p> -->
                    <p><span>用户名称：</span><span>{{selectRadioData && selectRadioData.nickName}}</span></p>
                    <div style="width: 98%;height: 1px;background: #f5f5f5;margin: 20px auto;"></div>
                </div>
                <div class="roleRange-list">
                    <!-- <p>已分配以下角色</p> -->
                    <el-radio-group v-model="radioVal" @input="radioValInput">
                        <el-radio-button v-for="item in roleObj" :key="item.code" :label="item.code">{{ item.name }}</el-radio-button>
                    </el-radio-group>
                </div>
                <div style="width: 98%;height: 1px;background: #f5f5f5;margin: 20px auto;"></div>
                <div class="roleRange-div">
                    <el-table class="container_table" :height="tableHeight()" :data="arrAclList" ref="product" border lazy row-key="id" header-cell-class-name="DisableSelection"
                        :row-class-name="rowClassNameFun" :header-row-class-name="headerRowClassName" @select="selectFun"
                        @select-all="selectAllFun">
                        <el-table-column type="selection" width="55" align="center" :reserve-selection="true" :selectable="checkSelectable"></el-table-column>
                        <el-table-column prop="menuName" label="菜单名称">
                            <template slot-scope="{ row }">
                                <span>{{ row.menuName }}</span>
                                <acl-checkbox :disabled="true"
                                    v-if="(row.buttonList && row.buttonList.length) || (row.fieldList && row.fieldList.length)"
                                    :ref="'checkbox' + row.id" :item="row" @changeAll="changeAll" :id="row.id" />
                            </template>
                        </el-table-column>
                    </el-table>
                </div> 
            </div>
            <div class="roleRange-footer">
                <div class="roleRange-footer-button">
                    <el-button @click="drawer = false">关闭</el-button>
                </div>
            </div>  
        </div>
    </Dialog>
</template>
<script>
import aclCheckbox from "@/views/system/acl/components/aclCheckbox";
import { aclList } from "@/api/system/acl";
export default {
    components: { aclCheckbox },
    data () {
        return {
            drawer: false,
            dialogFull: false,
            selectRadioData: {},
            arrAclList: [],
            roleObj: [],
            radioVal: null,
            arrChangeAllObj: {},
        };
    },
    mounted () {
    },
    methods: {
        tableHeight() {
            let windowHeight = document.body.clientHeight && document.documentElement.clientHeight;
            if(this.dialogFull){
                windowHeight = windowHeight - 310
            }else{
                windowHeight = windowHeight - 400
            }
            return windowHeight
        },
        init (row) {
            this.drawer = true;
            this.roleObj = [];
            this.arrAclList = [];
            this.selectRadioData = row;
            if(row.roleName){
                const roleNameArr = row.roleName.split(',');
                const roleIdArr = row.roleId.split(',');
                roleNameArr.forEach( (val, i) => {
                    this.roleObj.push({code: roleIdArr[i], name: val})
                })
                this.radioVal = roleIdArr[0];
                this.aclList(roleIdArr[0]);
            }
        },
        handleClose(done) {
            done();
        },
        checkSelectable () {
            return false;
        },
        rowClassNameFun({ row }) {
            if (row.isSelect === "") {
                return "indeterminate";
            }
        },
        radioValInput (val) {
            this.$refs.product.clearSelection();
            this.aclList(val);
        },
        aclList(roleId) {
            this.arrChangeAllObj = {};
            this.arrAclList = [];
            this.loading = true;
            aclList({}, roleId).then(({ data }) => {
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
        //初始化数据
        initData(data) {
            data.forEach((item) => {
                item.isSelect = false; //默认为不选中
                if (item.children && item.children.length) {
                    this.initData(item.children);
                }
            });
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
    }
}
</script>
<style lang="scss">
.roleRange1{
    .el-dialog{
        height: 90%;
    }
}
.roleRange{
    .el-dialog{
        display: flex;
        flex-direction: column;
        .el-dialog__title{
            .svg-icon-font{
                font-size: 36px;
                color: #959595;
                float: left;
            }
            span {
                display: block;
                float: left;
                margin-top: 6px;
                font-weight: 700;
                font-size: 18px;
                color: #606266;
            }
        }
    }
    .el-dialog__body{
        flex: 1;
        padding: 0;
    }
    .roleRange-mian{
        height: 100%;
        display: flex;
		flex-direction: column;
    }
    .roleRange-box{
        display: flex;
		flex-direction: column;
		justify-content: space-between;
        padding: 10px 38px;
        height: 100%;
        .roleRange-box-p{
            .svg-icon-font{
                font-size: 36px;
                color: #959595;
                float: left;
            }
            // p:nth-child(1){
            //     height: 50px;
            //     span {
            //         display: block;
            //         float: left;
            //         margin-top: 6px;
            //         font-weight: 700;
            //         font-size: 18px;
            //     }
            // }
            p{
                span{
                    font-size: 16px;
                    &:nth-child(1) {
                        font-weight: 700;
                        margin-left: 22px;
                    }
                }
            }
        }
        .roleRange-list{
            p{
                text-align: center;
                padding: 0;
                margin: 0;
            }
            .el-radio-group{
                display: flex;
                width: 100%;
                max-height: 110px;
                flex-direction: row;
                justify-content: space-between;
                flex-wrap: wrap;
                padding: 0px 45px 0px 45px;
                overflow: auto;
                .el-radio-button{
                    margin-bottom: 10px;
                    .el-radio-button__inner{
                        border: 1px solid #1890ff;
                        border-radius: 4px;
                        padding: 10px 40px;
                    }
                }
            }
            .el-radio-button__orig-radio:checked + .el-radio-button__inner{
                border-color: #1890ff !important;
            }
        }
    }
    .roleRange-div{
        flex: 1;
        .container_table{
            .is-disabled{
                .el-checkbox__inner{
                    background-color: #edf2fc;
                    border-color: #DCDFE6;
                    &::after{
                        border-color: #C0C4CC;
                    }
                }
            }
            .is-checked{
                .el-checkbox__inner{
                    background-color: #1890ff;
                    border-color: #1890ff;
                    &::after{
                        border-color: #fff;
                    }
                }
                .el-checkbox__label{
                    color: #1890ff;
                }
            }
        }
    }
    .el-drawer__header{
        margin-bottom: 0px;
        padding: 0px;
        font-family:Microsoft YaHei;
        color:#292b32;
        font-size:18px;
    }
    .roleRange-footer{
        width: 100%;
        text-align: center;
        bottom: 20px;
        padding: 10px;
        .roleRange-footer-button{
            .el-button {
                height: 40px;
                width: 40%;
                margin-left: 0px;
                &:first-child {
                    margin-right: 1%;
                }
            }
        }
    }
}
</style>
<style lang="scss" scoped>
::v-deep .avue-crud__dialog__menu {
    padding-right: 25px;
    float: left;
}

::v-deep .avue-crud__dialog__menu i {
    color: #909399;
    font-size: 15px;
}
::v-deep .avue-crud__dialog__header {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
}
::v-deep {
    .DisableSelection{
        text-align: center;
        .cell{
            .el-checkbox{
                .el-checkbox__inner{
                    display: none;
                }
            }
        }
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
.roleRange-box{
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