<template>
    <Dialog class="flex-dialog" title="查看" :visible.sync="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" width="600px" append-to-body>
        <div slot="title" class="el-dialog__title">
            查看
        </div>
        <div class="table-wrapper">
            <el-table :data="tableData" ref="tableIndexRef" row-key="bomVersion" border height="600"
                v-loading="loading">
                <el-table-column prop="saleOrderCode" label="销售订单号" align="center" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.saleOrderId, refName: 'saleOrderOperate' })">
                            {{ row.saleOrderCode }}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="rowNumber" label="行号" align="right" show-overflow-tooltip></el-table-column>
                <el-table-column prop="matlNum" label="订单数量" align="right" show-overflow-tooltip></el-table-column>
                <el-table-column label="操作" align="center" fixed="right" width="170">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.id, refName: 'saleChart' })">
                            查看执行情况
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

        </div>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import { saleOrderAllList } from '@/api/saleManage/saleOrder';
import indexMixin from '@/views/mixins'
export default {
    mixins: [indexMixin],
    dicts: ['MeasureUnit', 'bomPurpose'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    data() {
        return {
            visible: false,
            loading: false,
            tableData: [],
        }
    },
    methods: {

        init(params) {

            this.visible = true;
            this.tableData = [];
            this.getList(params);
        },
        // 查询物资
        getList(params) {
            this.loading = true;
            saleOrderAllList(params).then(({ data }) => {
                this.tableData = data.list || [];
            }).finally(() => {
                this.loading = false;
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