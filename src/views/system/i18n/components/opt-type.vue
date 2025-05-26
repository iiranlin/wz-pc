<template>
    <Dialog :title="title" :visible.sync="dialogVisible" width="60%" append-to-body >
        <el-button type="primary" size="mini" @click="add">添加</el-button>
        <el-table :data="dataList" stripe>
            <el-table-column prop="i18nType" label="语言类型" align="left" width="120">
                <template slot-scope="{ row }">
                    <template v-if="row.isEdit">
                        <el-input v-model="row.i18nType" size="mini" placeholder="请输入语言类型"></el-input>
                    </template>
                    <template v-else>
                        {{ row.i18nType }}
                    </template>
                </template>
            </el-table-column>
            <el-table-column prop="i18nName" label="类型说明" align="left">
                <template slot-scope="{ row }">
                    <template v-if="row.isEdit">
                        <el-input v-model="row.i18nName" size="mini" placeholder="请输入类型说明"></el-input>
                    </template>
                    <template v-else>
                        {{ row.i18nName }}
                    </template>
                </template>
            </el-table-column>
            <el-table-column prop="seq" label="排序" width="80" align="left">
                <template slot-scope="{ row }">
                    <template v-if="row.isEdit">
                        <el-input-number v-model="row.seq" controls-position="right" :min="1" :max="99"
                            size="mini"></el-input-number>
                    </template>
                    <template v-else>
                        {{ row.seq }}
                    </template>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
                <template slot-scope="{ row }">
                    <template v-if="row.isEdit">
                        <el-switch v-model="row.status" :active-value="0" :inactive-value="1" size="mini"></el-switch>
                    </template>
                    <template v-else>
                        {{ row.status == 0 ? '启用' : '停用' }}
                    </template>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" align="center">
                <template slot-scope="{ row }">
                    {{ parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}') }}
                </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="修改时间" align="center">
                <template slot-scope="{ row }">
                    {{ parseTime(row.updateTime, '{y}-{m}-{d} {h}:{i}') }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" align="center" width="250">
                <template slot-scope="{row, $index}">
                    <el-button v-if="row.isEdit" type="primary" size="mini" @click="save($index)">保存</el-button>
                    <el-button v-if="!row.isEdit" type="primary" size="mini" @click="modify($index)">修改</el-button>
                    <el-button v-if="!row.isEdit" type="primary" size="mini" @click="remove($index)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </Dialog>
</template>

<script>
import { i18nList, i18nCreate, i18nModify, i18nDelete } from '@/api/system/i18n'

export default {
    data() {
        return {
            title: "语言类型",
            dialogVisible: false,
            dataList: [],
            form: {
                "i18nType": "",
                "i18nName": "",
                "seq": 1,
                "status": 0,
                "isEdit": true
            },
        }
    },
    methods: {
        init() {
            this.dialogVisible = true
            this.getList()
        },
        getList() {
            i18nList().then(res => {
                this.dataList = res.data.map(item => {
                    return {
                        ...item,
                        isEdit: false
                    }
                })
            })
        },
        add() {
            this.dataList.push({ ...this.form, seq: (this.dataList.length + 1) })
        },
        save(idx) {
            const data = this.dataList[idx];
            if (!!data.id) {
                // 修改
                i18nModify(data).then((res) => {
                    this.$msg(res)
                    if (res.success) {
                        this.dataList[idx].isEdit = false
                    }
                })
            } else {
                // 新增
                i18nCreate(data).then((res) => {
                    this.$msg(res)
                    if (res.success) {
                        this.dataList[idx].id = res.data.id
                        this.dataList[idx].isEdit = false
                    }
                })
            }

        },
        modify(idx) {
            this.dataList[idx].isEdit = true
        },
        remove(idx) {
            this.$modal.confirm('是否确认删除?')
                .then(() => {
                    i18nDelete(this.dataList[idx]['id']).then((res) => {
                        this.$msg(res)
                        if (res.success) {
                            this.dataList.splice(idx, 1)
                        }
                    })
                });

        }
    },
}
</script>

<style lang="scss" scoped></style>
