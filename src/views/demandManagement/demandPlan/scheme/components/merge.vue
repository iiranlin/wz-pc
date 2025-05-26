<template>
    <Dialog tabindex='1' class="flex-dialog" title="需求合并" :visible.sync="visible" :close-on-click-modal="false"
        append-to-body width="70%">
        <el-table :data="tableData" border style="width: 100%" max-height="500">
            <el-table-column align="left" label="阶层" prop="bomLevel" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="版本号" prop="bomVersion" show-overflow-tooltip width="150">
            </el-table-column>
            <el-table-column align="left" label="BOM编码" prop="bomCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'bomAdministrationOperate' })">{{
                            row.bomCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="BOM名称" prop="bomName" show-overflow-tooltip
                width="150"></el-table-column>
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
                    <span>{{ scope.row.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="需求数量" prop="demandNum" show-overflow-tooltip width="100">
                <template slot="header">
                    <span>需求数量</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="库存数量" prop="inventoryNum" show-overflow-tooltip width="150">
            </el-table-column>
            <el-table-column align="left" label="计划数量" prop="planNum" show-overflow-tooltip width="220">
            </el-table-column>
            <el-table-column align="center" label="计划开始日期" prop="planStartDate" show-overflow-tooltip width="200">
            </el-table-column>
            <el-table-column align="center" label="计划完成日期" prop="planEndDate" show-overflow-tooltip width="200">
            </el-table-column>

            <el-table-column align="left" label="来源项目编码" prop="projectCode" show-overflow-tooltip width="180">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                        row.projectCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="来源项目名称" prop="projectName" show-overflow-tooltip width="180">
            </el-table-column>
            <el-table-column align="left" label="来源需求类型" prop="sourceType" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <span>{{ row.sourceType | orderTypeFilter(dict.type.demandPlanSourceType) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="来源需求单号" prop="sourceCode" show-overflow-tooltip
                width="190"></el-table-column>
            <el-table-column align="left" label="来源需求行号" prop="sourceRowNum" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="客户编码" prop="cuCode" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="客户名称" prop="cuName" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="是否有产能分流" prop="isDivide" show-overflow-tooltip width="160">
                <template slot-scope="{row}">
                    {{ row.isDivide | orderTypeFilter(dict.type.YesNo) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="是否有需求合并" prop="isMerge" show-overflow-tooltip  width="160">
                <template slot-scope="{row}">
                    <span :style="{color: row.isMerge == '1' ? 'red' : ''}">{{ row.isMerge | orderTypeFilter(dict.type.YesNo) }}</span>
                </template>
            </el-table-column>
        </el-table>

        <template #footer>
            <el-button plain round type="primary" @click="confirm">确定并重新展算</el-button>
            <el-button plain round @click.native="visible = false">关闭</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins';
export default {
    mixins: [indexMixin],
    dicts: ['MeasureUnit', 'planAttribute', 'demandPlanSourceType', 'YesNo'],
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
               this.$emit('merge', this.tableData)
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