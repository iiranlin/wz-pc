<template>
    <Dialog class="flex-dialog max-height-dialog" title="" :visible.sync="visible"
        :close-on-press-escape="false"   append-to-body width="800px" >
        <div slot="title" class="el-dialog__title">
            查看货位
        </div>
        <div class="table-wrapper">
            <el-table  :data="tableData" border height="100%"
                v-loading="loading" row-key="placeId">
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="placeCode" label="货位编码" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="batchNo" label="批次号" align="left" show-overflow-tooltip min-width="200">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: row.batchNo, refName: 'inventoryQueryDetail'})">{{ row.batchNo }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="inventoryNum" label="存储数量" align="left" show-overflow-tooltip min-width="150" />
            </el-table>
        </div>
        <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList" />
        <detail-dialog ref="detailDialogRef"/>
    </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import { getInventoryGroupDetail } from '@/api/warehouseManage/inventoryManage'
export default {
    name: 'selectPlace',
    mixins: [indexMixin],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    data() {
        return {
            visible: false,
            loading: false,
            tableData: [],
            total: 0,
        }
    },
    methods: {
        init(data) {
            this._param = data || {}
            this.visible = true
            this.getList()
        },
        getList() {
            this.loading = true
            const param = Object.assign({}, this._param, this.listQuery)
            getInventoryGroupDetail(param).then(({ data }) => {
                this.tableData = data?.list || []
                this.total = data?.total || 0
            }).finally(() => {
                this.loading = false
            })
        },
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>
