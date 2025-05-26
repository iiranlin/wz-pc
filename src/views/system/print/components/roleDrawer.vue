<template>
    <el-drawer class="menuDrawer" size="500px" :show-close="false" :visible.sync="drawer" :before-close="handleClose">
        <div class="menuDrawer-box">
            <div class="menuDrawer-box-p">
                <p><icon-svg icon-class="Left-title" /><span>权限管理</span></p>
                <el-input placeholder="输入关键字进行过滤" v-model="filterText">
                </el-input>
                <div style="width:440px;height: 1px;background: #f5f5f5;margin: 16px auto;"></div>
            </div>
            <div class="menuDrawer-div">
                <div class="tmplDrawer-tree" v-if="dataParent.length">
                   
                    <el-checkbox class="el-tree-node__content"
                        style="height: 38px;display: inline-flex;width: calc(100% - 16px);margin-left: 8px;padding: 0 28px;align-items: center;"
                        :indeterminate="isIndeterminate" v-model="checkbox" @change="handleAll">全部</el-checkbox>
                    <el-tree class="drawer-tree" @check-change="handleCheckChange" :data="dataParent" show-checkbox
                        node-key="id" check-on-click-node ref="tree" :props="defaultProps"
                        :filter-node-method="filterNode">
                    </el-tree>
                </div>
                <div v-else class="menuDrawer-text">
                    暂无数据
                </div>
            </div>
        </div>
        <div class="menuDrawer-footer">
            <div class="menuDrawer-footer-button">
                <el-button @click="drawer = false">关闭</el-button>
                <el-button type="primary" @click="handleConfirm">保存</el-button>
            </div>
        </div>
    </el-drawer>
</template>
<script>
import { roleListAll } from "@/api/system/role"
import { tmplAllList, getRolesByTmplId, saveRolePrint, userPrintTemplate } from '@/api/system/print'
export default {
    name: "role-drawer",
    data() {
        return {
            filterText: '',
            checkbox: false,
            isIndeterminate: false,
            drawer: false,
            selectRadioData: null,
            totalCount: 0,
            dataParent: [],
            data: [],
            defaultProps: {
                children: 'children',
                label: 'roleName',
                disabled: (data, node) => {
                    //禁用操作
                    // if(data.isBind === 1){
                    //     return true
                    // }else{
                    //     return false
                    // }
                }
            },
            type: '1',
            arrTree: [],
        };
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        }
    },
    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return data.roleName.indexOf(value) !== -1;
        },
        handleAll(e) {
            if (e) {
                const ids = this.dataParent.map(({ id }) => id)
                this.isIndeterminate = false
                this.$refs['tree'].setCheckedKeys(ids)
            } else {
                this.$refs['tree'].setCheckedKeys([])
            }
        },
        handleCheckChange(a, b, c) {
           
            let keys = this.$refs['tree'].getCheckedKeys();
            if (keys.length == this.dataParent.length) {
                this.isIndeterminate = false
                this.checkbox = true
            } else {
                keys.length > 0 ? this.isIndeterminate = true : this.isIndeterminate = false
                this.checkbox = false
            }
        },
        init(row) {
            this.checkbox = false
            this.filterText = ''
            this.selectRadioData = row;
            this.drawer = true;
            this.allRoleList(row);
        },
        menuIdsArrList() {
            let children = this.$refs['tree'].getCheckedKeys();
            return children
        },
        async handleConfirm() {
            const param = {
                roleIds: this.menuIdsArrList(),
                printTemplateId: this.selectRadioData.id

            }
            await saveRolePrint(param)
            this.$modal.msgSuccess("操作成功");
            this.drawer = false;
            this.$emit('confirm')
        },
        async allRoleList(row) {
            const { data: { list } } = await roleListAll()
            this.dataParent = list;
            const res = await getRolesByTmplId(row.id)
            const roleIds = res.data.map(({ roleId }) => roleId)
            this.$refs['tree'].setCheckedKeys(roleIds)
            if (list.length == roleIds.length) {
                this.isIndeterminate = false
                this.checkbox = true
            } else if (list.length > roleIds.length && roleIds.length > 0) {
                this.isIndeterminate = true
            }
        },

        handleClose(done) {
            done();
        },
    }
}
</script>
<style lang="scss">
.menuDrawer {
    .el-drawer__body {
        height: 100%;
        overflow: initial;
    }

    .menuDrawer-box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        padding: 10px 10px 70px 10px;

        .menuDrawer-box-p {
            .svg-icon-font {
                font-size: 36px;
                color: #959595;
                float: left;
            }

            p:nth-child(1) {
                height: 50px;

                span {
                    display: block;
                    float: left;
                    margin-top: 6px;
                    font-weight: 700;
                    font-size: 18px;
                }
            }

            p:nth-child(2) {
                span {
                    font-size: 14px;

                    &:nth-child(1) {
                        font-weight: 700;
                        margin-left: 22px;
                    }
                }
            }
        }
    }

    .menuDrawer-div {
        flex: 1;
        overflow-y: auto;

        .el-radio-group {
            width: 230px;
            float: left;
            border-right: 1px solid #f5f5f5;

            .el-radio-button {
                width: 200px;
                height: 40px;
                line-height: 40px;
                margin-left: 15px;

                .el-radio-button__inner {
                    width: 100%;
                    height: 100%;
                    border: 0px;
                    padding: 0px;
                    padding-left: 5px;
                    font-family: Microsoft YaHei;
                    font-size: 14px;
                    line-height: 40px;
                    text-align: inherit;
                }

                .menuDrawer-span {
                    position: absolute;
                    right: 5px;
                    font-size: 12px;
                }

                .menuDrawer-span-color {
                    color: #c4c4c4;
                }
            }

            .is-active {
                .menuDrawer-span-color {
                    color: #ffffff;
                }
            }
        }

        .menuDrawer-tree {
            width: calc(100% - 30px);
            float: left;
            margin-left: 20px;
        }

        .menuDrawer-text {
            line-height: 80px;
            font-size: 14px;
            color: #959595;
            text-align: center;
        }
    }

    .el-drawer__header {
        margin-bottom: 0px;
        padding: 0px;
        font-family: Microsoft YaHei;
        color: #292b32;
        font-size: 18px;
    }

    .menuDrawer-footer {
        width: 100%;
        text-align: center;
        position: absolute;
        bottom: 20px;

        .menuDrawer-footer-button {
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