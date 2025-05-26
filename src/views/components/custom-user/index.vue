<template>
    <Dialog :title="title" class="max-height-dialog flex-dialog dialog-padding" :visible.sync="openDataScope" tabindex='1'
        :close-on-click-modal="false"   width="1300px" append-to-body >
        <div slot="title" class="el-dialog__title">
            {{ title }}
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            </div>
        </div>
        <div class="app-container">
            <el-row type="flex" :gutter="20" class="container_h">
                <!--部门数据-->
                <el-col :span="6" :xs="24" class="container_flex_overflow">
                    <div class="head-container">
                        <el-tree v-loading="treeLoading" node-key="id" class="drawer-tree" :indent="0"
                            :data="deptOptions" :default-expanded-keys="defaultExpandedKeys" :props="defaultProps" :expand-on-click-node="false" ref="tree"
                            :highlight-current="true" @node-click="handleNodeClick" />
                    </div>
                </el-col>
                <el-col :span="18" :xs="24" class="container_flex">
                    <el-form :model="formData" ref="queryForm" size="small" :inline="true">
                        <el-form-item label="用户账号" prop="username" class="border-radius50">
                            <el-input v-model="formData.username" placeholder="请输入用户账号" clearable style="width: 240px"
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="用户昵称" prop="nickName" class="border-radius50">
                            <el-input v-model="formData.nickName" placeholder="请输入用户昵称" clearable style="width: 240px"
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                    </el-form>
                    <el-table ref="containerTableRef" class="container_table" v-loading="loading" border
                        :data="dataList" height="100%"  @row-click="rowClick" @row-dblclick="dbClick">
                        <el-table-column align="center" width="50">
                            <template v-slot="{ row }">
                                <el-radio v-model="selectRowId" :label="row.id" class="table-radio"></el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column label="用户账号" prop="username" :show-overflow-tooltip="true" align="left"
                            min-width="150" />
                        <el-table-column label="用户昵称" prop="nickName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="所属部门" prop="deptName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                    </el-table>
                    <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                        @pagination="getList" />
                </el-col>
            </el-row>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button plain round type="primary" @click="customUserClick" v-preventReClick>确 定</el-button>
            <el-button plain round @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { deptTreeAll } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'

export default {
    name: 'customUser',
    props: {
        singleMode: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            title: '用户选择',
            openDataScope: false,
            treeLoading: false,
            loading: false,
            // 部门树选项
            deptOptions: undefined,
            defaultProps: {
                children: 'children',
                label: 'deptName'
            },
            formData: {
                deptId: '',
                username: '',
                nickName: ''
            },
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            dataList: [],
            treeCurrentKey: '',
            selectRowId: null,
            defaultExpandedKeys: []
        }
    },
    mounted() {
    },
    methods: {
        init(id) {
            this.selectRowId = id || null;
            this.openDataScope = true;
            this.$nextTick( () => {
                this.$refs.queryForm.resetFields();
                this.deptTree()
                this.getList()
            })
        },
        deptTree() {
            this.treeLoading = true
            deptTreeAll().then(({ data }) => {
                this.deptOptions = data
                this.treeLoading = false
                this.$nextTick(() => {
                    this.defaultExpandedKeys = [this.deptOptions[0].id]
                })
            })
        },
        getList() {
            this.loading = true
            userListAll(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.dataList = data.list
                this.total = data.total
                this.loading = false
            })
        },
        rowClick(row) {
            this.selectRowId = row.id;
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (data.id === this.treeCurrentKey) {
                this.formData.deptId = null
                this.$refs.tree.setCurrentKey(null)
                this.treeCurrentKey = ''
            } else {
                this.treeCurrentKey = data.id
                this.formData.deptId = data.id
            }
            this.getList()
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.formData = {
                deptId: null,
                username: '',
                nickName: ''
            }
            this.$refs.tree.setCurrentKey(null)
            this.treeCurrentKey = ''
            this.handleQuery()
        },
        customUserClick() {
            if (!this.selectRowId) {
                this.$message.warning('请选择用户')
                return
            }
            this.$emit('customUserClick', this.dataList.find(item => item.id === this.selectRowId))
            this.openDataScope = false
        },
        dbClick (row) {
            this.$emit('customUserClick', row);
            this.openDataScope = false;
        }
    }
}
</script>

<style lang="scss" scoped>
.app-container {
    height: 100%;

    .container_flex_overflow {
    }
}
</style>