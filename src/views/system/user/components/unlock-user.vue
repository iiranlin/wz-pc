<template>
    <Dialog title="用户列表" :visible.sync="showLock" width="900px" :close-on-click-modal="false" append-to-body >
        <div class="btn-row">
            <el-form ref="form" :inline="true" :model="form" label-width="85px" @submit.native.prevent>
                <el-form-item class="custom-form-item" label="用户编号">
                    <el-input clearable placeholder="请输入用户编号" v-model="form.username"
                        @keyup.enter.native="lockUserList"></el-input>
                </el-form-item>
                <el-button @click="lockUserList">搜索</el-button>
                <el-button @click="handleLockAll" :disabled="multipleSelection.length == 0">批量解锁</el-button>
            </el-form>
        </div>
        <el-table ref="elTable" :data="tableData" v-loading="loading" class="container_table" height="400px"
            highlight-current-row default-expand-all @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" :reserve-selection="true" align="center" fixed="left" />
            <el-table-column prop="key" label="KEY" align="left"></el-table-column>
            <el-table-column prop="username" label="用户账号" align="left"></el-table-column>
            <el-table-column fixed="right" label="操作" width="200" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button @click="handleunLock(scope.row)" type="text" size="small">
                        <i class="el-icon-edit-outline"></i>解锁
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </Dialog>
</template>

<script>
import { lockUserList, unlockUser } from '@/api/system/user'
export default {
    name: "unlock-user",
    data() {
        return {
            showLock: false,
            loading: false,
            tableData: [],
            form: {
                username: ''
            },
            multipleSelection: []
        }
    },
    methods: {
        init() {
            this.showLock = true
            this.lockUserList()
        },
        lockUserList() {
            this.loading = true
            lockUserList(this.form).then(res => {
                if (res.success) {
                    this.tableData = res.data
                    this.loading = false
                }
            })
        },
        handleunLock(row) {
            let key = row.key
            const data = [{ key }]
            unlockUser(data).then(res => {
                if (res.success) {
                    this.lockUserList()
                    this.$modal.msgSuccess(res.message);
                } else {
                    this.$modal.msgError(res.message);
                }
            })
        },
        handleSelectionChange(val) {
            let multipleSelection = []
            val.forEach(item => {
                multipleSelection.push({ key: item.key })
            });
            this.multipleSelection = multipleSelection
        },
        handleLockAll() {
            unlockUser(this.multipleSelection).then(res => {
                if (res.success) {
                    this.lockUserList()
                    this.$modal.msgSuccess(res.message);
                } else {
                    this.$modal.msgError(res.message);
                }
            })
        },
    }
}
</script>
<style scoped></style>