<template>
    <Dialog class="usually-dialog" title="常用功能" :visible.sync="openDataScope" :close-on-click-modal="false"
        width="600px" append-to-body >
        <div class="operate-box">
            <!-- <div class="operate-left">
                <div :class="appActiveId==item.id?'active-app':''+'app-item'" v-for="item in appList" :key="item.id" @click="handleMenu(item.id)">{{ item.appName }}</div>
            </div> -->
            <div class="operate-right">
                <el-tree ref="tree" :data="appMenu" show-checkbox node-key="id" default-expand-all :props="defaultProps"
                    @check="handleCheck">
                </el-tree>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope()">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>
<script>
// import { getAppForIndex } from "@/api/app"
// import { getFuncByApp, createfuncDaily } from "@/api/examine/to-be-reviewed"
export default {
    data() {
        return {
            openDataScope: false,
            appList: [],
            allMenuList: [],
            allSelectMenuData: [],
            defaultProps: {
                children: 'children',
                label: 'menuName'
            },
            appActiveId: '',
            appMenu: [],
            checkedMenu: {},
            initSelect: [],
        }
    },
    methods: {
        init(appList) {
            this.openDataScope = true,
                this.appList = appList
            this.appActiveId = ''
            this.checkedMenu = {}
            this.appMenu = []
            getFuncByApp().then(res => {
                if (res.success) {
                    const currentApp = res.data[0] || {};
                    this.appActiveId = currentApp.id
                    this.appActiveId = currentApp.id
                    this.allSelectMenuData = [
                        {
                            appId: currentApp.id
                        }
                    ]
                    this.appMenu = currentApp.menuList
                    this.handleInitSelect()
                    this.handleInitMenuData()
                }
            })
        },
        // handleMenu(id){
        //     this.appActiveId = id
        //     this.allMenuList.map(item=>{
        //         if(item.id == id){
        //             this.appMenu = item.menuList
        //         }
        //     })
        //     this.handleInitSelect()
        //     if(this.checkedMenu[id]){
        //         this.$refs.tree.setCheckedKeys(this.checkedMenu[id])
        //     }else{
        //         if(this.initSelect.length){
        //             this.$refs.tree.setCheckedKeys(this.initSelect)
        //         }else{
        //             this.$refs.tree.setCheckedKeys([]);
        //         }
        //     }
        // },
        // 选中的id的集合
        handleInitSelect() {
            let initSelect = []
            this.appMenu.forEach(item => {
                this.handleChildren(item, initSelect)
            })
            this.initSelect = initSelect || []
            this.$refs.tree.setCheckedKeys(this.initSelect)
        },
        // 如果isBind 则就是已经选中的数据  拼凑选中的id的集合
        handleChildren(item, array) {
            if (item?.children?.length) {
                item.children.forEach(childItem => {
                    if (childItem.children && childItem.children.length) {
                        this.handleChildren(childItem, array)
                    } else {
                        if (childItem.isBind == 1) {
                            array.push(childItem.id)
                        }
                    }
                })
            } else {
                if (item.isBind == 1) {
                    array.push(item.id)
                }
            }
        },
        handleInitMenuData() {
            let everySelectMenu = []
            this.appMenu.forEach(item => {
                this.handleInitChildMenu(item, everySelectMenu)
            })
            console.log("🚀 ~ file: uaually.vue:133 ~ handleInitMenuData ~ everySelectMenu:", everySelectMenu)
            if (everySelectMenu.length) {
                this.allSelectMenuData[0]['funcList'] = everySelectMenu
            }
        },
        handleInitChildMenu(item, data) {
            if (item.isBind == 1) {
                data.push({
                    "menuId": item.id, "menuParentId": item.parentId, "funcIcon": item.menuIcon, "funcName": item.menuName, "funcUrl": item.menuUrl
                })
            }
            if (item?.children?.length) {
                item.children.forEach(childItem => {
                    if (item?.children?.length) {
                        this.handleInitChildMenu(childItem, data)
                    } else {
                        if (childItem.isBind == 1) {
                            data.push({
                                "menuId": childItem.id, "menuParentId": childItem.parentId, "funcIcon": childItem.menuIcon, "funcName": childItem.menuName, "funcUrl": childItem.menuUrl
                            })
                        }
                    }
                })
            }
        },
        handleCheck(row, data) {
            console.log("🚀 ~ file: uaually.vue:158 ~ handleCheck ~ data:", data)
            const checkedNodes = data.checkedNodes;
            const funcList = checkedNodes.map(i => {
                return {
                    menuId: i.id,
                    menuParentId: i.parentId,
                    funcIcon: i.menuIcon,
                    funcName: i.menuName,
                    funcUrl: i.menuUrl
                }
            })
            this.allSelectMenuData[0].funcList = funcList
            // let appActiveId = this.appActiveId
            // let selectMenu = []
            // data.halfCheckedNodes.concat(data.checkedNodes).map(item=>selectMenu.push({
            //     "menuId":item.id,"menuParentId":item.parentId,"funcIcon":item.menuIcon,"funcName":item.menuName,"funcUrl":item.menuUrl
            // }))

            // let hasCheckArr = this.allSelectMenuData.map(item=>{
            //     return item.appId
            // })
            // let hasIndex = hasCheckArr.indexOf(appActiveId)
            // if(hasIndex > -1){
            // if(selectMenu.length){
            //     this.allSelectMenuData[hasIndex].funcList = selectMenu
            // }else{
            //     this.allSelectMenuData.splice(hasIndex,1)
            // }
            // }else{
            //     this.allSelectMenuData.push({
            //         "appId": appActiveId,
            //         "funcList": selectMenu,
            //     })
            // }
            // this.checkedMenu[appActiveId] = data.checkedKeys
        },
        // 提交
        submitDataScope() {
            createfuncDaily(this.allSelectMenuData).then(res => {
                this.$modal.msgSuccess(res.message)
                this.openDataScope = false
                this.$emit('operate')
            })
        },
    },
}
</script>
<style scoped>
.usually-dialog {
    min-height: 650px;
}

.operate-box {
    display: flex;
    height: 100%;
}

.operate-left {
    padding-left: 18px;
    width: 200px;
    border: 1px solid #e1e1e1;
    height: fit-content;
    max-height: 90%;
    overflow-y: scroll;
}

.operate-right {
    margin-left: 18px;
    flex: 1;
    border: 1px solid #e1e1e1;
}

.app-item {
    height: 24px;
    line-height: 24px;
    color: #1b1e22;
}

.app-item:hover {
    cursor: pointer;
    color: rgb(64, 158, 255);
}

.active-app {
    color: #3d8aff;
    line-height: 24px;
}

::v-deep .el-dialog {
    height: 80%;
}

::v-deep .el-dialog::-webkit-scrollbar {
    display: none;
}

::v-deep .el-tree {
    max-height: 100%;
    overflow-y: scroll;
}

::v-deep .el-dialog__body {
    height: 80%;
}
</style>