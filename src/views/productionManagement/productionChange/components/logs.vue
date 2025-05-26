<template>
    <Dialog class="flex-dialog max-height-dialog" title="查看" :visible.sync="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" width="60%" append-to-body>
        <div slot="title" class="el-dialog__title">
            查看
        </div>
        <div class="table-wrapper">
            <el-table :data="tableData" ref="tableIndexRef" border height="100%">
                <el-table-column label="序号" align="center" width="50" type="index" />
                <el-table-column prop="change" label="修改内容" align="left" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span style="" v-if="scope.row.change">√</span>
                    </template>
                </el-table-column>
                <el-table-column prop="label" label="描述" align="left" show-overflow-tooltip></el-table-column>
            </el-table>
        </div>
    </Dialog>
</template>

<script>
import { PRODUCT_CHANGE_LOGS } from '@/utils/constant'
export default {
    data() {
        return {
            visible: false,
            tableData: [],
        }
    },
    methods: {
        init(ids = []) {
            this.visible = true;
            const list = Object.keys(PRODUCT_CHANGE_LOGS).map(key => ({ id: key, change: ids.includes(key), label: PRODUCT_CHANGE_LOGS[key] }))
            this.tableData = list
        },
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>