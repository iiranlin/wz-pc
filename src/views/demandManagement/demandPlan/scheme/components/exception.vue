<template>
    <Dialog tabindex='1' class="flex-dialog" title="例外信息" :visible.sync="visible" :close-on-click-modal="false"
        append-to-body width="70%">
        <el-table :data="tableData" border style="width: 100%" max-height="500">
            <el-table-column align="left" label="例外类型" prop="exceptionType" show-overflow-tooltip>
                <template slot-scope="{row}">
                    <span style="color: red;">{{ row.exceptionType | orderTypeFilter(dict.type.exceptionType) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="物料编码" prop="matlCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                        row.matlCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip
                width="240"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip>
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="计划属性" prop="planAttribute" show-overflow-tooltip width="100">
                <template slot-scope="scope">
                    <span
                        :class="[scope.row.planAttribute !== '1' ? `planAttribute-${scope.row.planAttribute}` : '']">{{
                            scope.row.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="创建时间" prop="createDate" show-overflow-tooltip>
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.createDate) }}</span>
                </template>
            </el-table-column>
        </el-table>

        <template #footer>
            <el-button plain round type="primary" @click="confirm">确认并查询BOM</el-button>
            <el-button plain round @click.native="visible = false">关闭</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins';
export default {
    mixins: [indexMixin],
    dicts: ['MeasureUnit', 'planAttribute', 'demandPlanSourceType', 'YesNo', 'exceptionType'],
    components: { DetailDialog: () => import('@/views/components/DetailDialog') },

    data() {
        return {
            visible: false,
            tableData: [],
        }
    },
    methods: {
        init(list = []) {
            this.visible = true;
            this.tableData = list

        },

        async confirm() {
            try {
                this.visible = false
                const {matlCode} = this.tableData[0]
                this.$router.push({ name: 'BOMAdministration', query: { matlCode } });
            } catch (err) {
                console.error(err)
            }

        },
    }
}
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
    font-size: 16px;
    margin-left: 2px;
}

.slotIcon-color-content {
    color: red;
}
</style>