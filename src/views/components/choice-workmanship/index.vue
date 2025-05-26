<template>
    <Dialog  tabindex='1' class="flex-dialog max-height-dialog" title="选择工艺"
        :visible.sync="visible"   :close-on-click-modal="false" append-to-body width="1300px" >
        <div slot="title" class="el-dialog__title">
            选择工艺
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="110px" inline>
            <el-form-item label="工艺编码" prop="pathCode" class="border-radius50">
                <el-input v-model="formData.pathCode" placeholder="请输入工艺编码" clearable
                    @keyup.enter.native="searchData" />
            </el-form-item>
            <el-form-item label="工艺名称" prop="pathName" class="border-radius50">
                <el-input v-model="formData.pathName" placeholder="请输入工艺名称" clearable
                    @keyup.enter.native="searchData" />
            </el-form-item>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" :data="tableData" border height="100%" v-loading="loading" @row-click="rowClick" @row-dblclick="dbClick">
                <el-table-column align="center" width="50" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="pathCode" label="工艺编码" align="left" show-overflow-tooltip min-width="150" >
                    <template slot-scope="{row}">
                        <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: row.pathId, refName: 'processRouteOperate'})">{{ row.pathCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="pathName" label="工艺名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="processDesc" label="工艺描述" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="version" label="版本号" align="left" show-overflow-tooltip min-width="150" />
            </el-table>
        </div>
        <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />

        <template #footer>
            <el-button plain round type="primary" @click="saveSelection" v-preventReClick>确定</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
        <detail-dialog ref="detailDialogRef"/>
    </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import { getList } from '@/api/prodmgr-mm/processRoute';

export default {
    mixins: [indexMixin],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        propsFormData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            dialogParam: {},
            visible: false,
            formData: {
                pathCode: '',
                pathName: '',
            },
            loading: false,
            tableData: [],
            total: 0,
            selectDataRow: null,
            pathCode: ''
        }
    },
    methods: {
        init(pathCode) {
            this.selectDataRow = null
            this.visible = true;
            this.pathCode = pathCode
            this.$nextTick(() => {
                this.$refs.elForm.resetFields()
                this.tableData = []
                this.listQuery.pageNum = 1
                this.listQuery.pageSize = 30
                this.getList()
            })
        },
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        // 保存选择
        saveSelection() {
            if (!this.selectDataRow) {
                this.$message.warning('请选择工艺')
                return
            }
            this.$emit('change', this.selectDataRow)
            this.visible = false
        },
        // 双击
        dbClick(row) {
            this.$emit('change', row)
            this.visible = false
        },
        rowClick(row) {
            // 单选选中行
            this.selectDataRow = row
        },
        // 查询
        getList() {
            this.loading = true
            getList(Object.assign({}, this.formData, this.listQuery, this.propsFormData, {status: 3})).then(({ data }) => {
                this.tableData = data?.list || []
                this.total = data?.total || 0
                const row = this.tableData.filter(item => this.pathCode === item.pathCode)[0]
                this.selectDataRow = row
            }).finally(() => {
                this.loading = false
            })
        },
        // 重置列表查询
        resetSearch() {
            this.$refs.elForm.resetFields()
            this.getList()
        }
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>