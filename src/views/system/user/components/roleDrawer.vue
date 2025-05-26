<template>
    <el-drawer
        class="menuDrawer"
        size="500px"
        :show-close="false"
        :visible.sync="drawer"
        :before-close="handleClose">
        <div class="menuDrawer-box">
            <div class="menuDrawer-box-p">
                <p><icon-svg icon-class="Left-title" /><span>权限管理</span></p>
                <p><span>用户名称：</span><span>{{selectRadioData && selectRadioData.nickName}}</span></p>
                <div style="width:440px;height: 1px;background: #f5f5f5;margin: 16px auto;"></div>
            </div>
            <div class="menuDrawer-div">
                <div class="menuDrawer-tree" v-if="dataParent.length">
                    <!-- <el-checkbox style="margin-left: 24px;font-size: 12px;" v-model="checkbox" v-if="data.length > 0">全部</el-checkbox> -->
                    <el-tree
                        class="drawer-tree"
                        :data="dataParent"
                        show-checkbox
                        node-key="id"
                        ref="tree"
                        :props="defaultProps">
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
                <el-button type="primary" @click="userBindRole()">保存</el-button>
            </div>
        </div>  
    </el-drawer>
</template>
<script>
import {userRoleList, userBindRole} from '@/api/system/user';
export default {
    name:"role-drawer",
    data () {
        return {
            checkbox: false,
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
    methods: {
        init (row) {
            this.selectRadioData = row;
            this.drawer = true;
            this.userRoleList(row.id);
        },
        menuIdsArrList() {
            let children = this.$refs['tree'].getCheckedKeys();
            return children
        },
        userBindRole () {
            userBindRole({roleIds: this.menuIdsArrList()}, this.selectRadioData.id).then( ({message}) => {
                this.$message({
                    message: message,
                    type: 'success'
                });
                this.drawer = false;
                this.$emit('userBindRoleSuccess')
            })
        },
        userRoleList (id) {
            userRoleList(id).then( ({data}) => {
                this.dataParent = data;
				this.$nextTick(() => {
                    this.checkFlagList();

                    let initCheck = []
                    data.forEach((dataItem,dataIndex)=>{
                        if(dataItem.isBind){
                            initCheck.push(dataItem.id)
                        }
                    })
                    this.$refs['tree'].setCheckedKeys(initCheck)
				});
            })
        },
        // initTreeCheck(item,initCheck){
        //     if(item.children && item.children.length){
        //         item.children.forEach((childItem)=>{
        //             if(childItem.isBind){
        //                 initCheck.push(childItem.id)
        //             }
        //             initTreeCheck(childItem,initCheck)
        //         })
        //     }
        // },
        checkFlagList (init) {
            this.dataParent.forEach((item, index)=>{
                let generateArr = this.generateArr([item]);
                this.$refs['tree'].setCheckedNodes(generateArr);
                this.$set(item,'checkFlagList',generateArr.length);
            })
        },
		generateArr(routes, checkbox) {
			let data = [];
			const filterRoute = (routes) => {
				routes.forEach(route => {
                    if(route.children){
                        filterRoute(route.children)
                    }else{
                        if(route.isBind == 1){
                            data.push(route);
                        }
                    }
				});
				return 
			};
            filterRoute(routes);
            return data;
        },
        handleClose(done) {
            done();
        },
    }
}
</script>
<style lang="scss">
.menuDrawer{
    .el-drawer__body{
        height: 100%;
        overflow: initial;
    }
    .menuDrawer-box{
        display: flex;
		flex-direction: column;
		justify-content: space-between;
        height: 100%;
        padding: 10px 10px 70px 10px;
        .menuDrawer-box-p{
            .svg-icon-font{
                font-size: 36px;
                color: #959595;
                float: left;
            }
            p:nth-child(1){
                height: 50px;
                span {
                    display: block;
                    float: left;
                    margin-top: 6px;
                    font-weight: 700;
                    font-size: 18px;
                }
            }
            p:nth-child(2){
                span{
                    font-size: 14px;
                    &:nth-child(1) {
                        font-weight: 700;
                        margin-left: 22px;
                    }
                }
            }
        }
    }
    .menuDrawer-div{
        flex: 1;
        overflow-y: auto;
        .el-radio-group{
            width: 230px;
            float: left;
            border-right: 1px solid #f5f5f5;
            .el-radio-button{
                width: 200px;
                height: 40px;
                line-height: 40px;
                margin-left: 15px;
                .el-radio-button__inner{
                    width: 100%;
                    height: 100%;
                    border: 0px;
                    padding: 0px;
                    padding-left: 5px;
                    font-family:Microsoft YaHei;
                    font-size:14px;
                    line-height: 40px;
                    text-align: inherit;
                }
                .menuDrawer-span{
                    position: absolute;
                    right: 5px;
                    font-size:12px;
                }
                .menuDrawer-span-color{
                    color: #c4c4c4;
                }
            }
            .is-active{
                .menuDrawer-span-color{
                    color: #ffffff;
                }
            }
        }
        .menuDrawer-tree{
            width: 210px;
            float: left;
            margin-left: 20px;
        }
        .menuDrawer-text{
            line-height: 80px;
            font-size: 14px;
            color: #959595;
            text-align: center;
        }
    }
    .el-drawer__header{
        margin-bottom: 0px;
        padding: 0px;
        font-family:Microsoft YaHei;
        color:#292b32;
        font-size:18px;
    }
    .menuDrawer-footer{
        width: 100%;
        text-align: center;
        position: absolute;
        bottom: 20px;
        .menuDrawer-footer-button{
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