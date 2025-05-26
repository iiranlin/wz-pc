<template>
    <fragment>
        <el-table ref="tableRef" row-key="uid" :data="tableList" border class="saleOrderOperateEltable"
            style="width: 100%">
            <el-table-column align="center" label="序号" width="50px" type="index" :index="tableIndex" />
            <el-table-column align="center" label="物料编码" prop="matlCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip
                width="240"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="计量单位" prop="matlUnit" show-overflow-tooltip>
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="计划属性" prop="planAttribute" show-overflow-tooltip width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="right" label="需求数量" prop="demandNum" show-overflow-tooltip width="100">
                <template slot="header">
                    <span>需求数量</span>
                </template>
            </el-table-column>
            <el-table-column align="right" label="库存数量" prop="inventoryNum" show-overflow-tooltip width="150">
            </el-table-column>
            <el-table-column align="right" label="计划数量" prop="planNum" width="220">
                <template slot="header">
                    <span>计划数量</span>
                </template>
                <template slot-scope="scope">
                    <el-input-number style="width: calc(100% - 20px);"
                        v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.planNum" :min="0"
                        :precision="4" controls-position="right"></el-input-number>
                    <span v-else>{{ scope.row.planNum }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="计划开始日期" prop="planStartDate" show-overflow-tooltip width="250">
                <template slot-scope="{row}">
                    <span>{{ parseTime(row.planStartDate, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="计划完成日期" prop="planEndDate" show-overflow-tooltip width="250">
                <template slot-scope="{row}">
                    <span>{{ parseTime(row.planEndDate, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="来源项目编码" prop="projectCode" show-overflow-tooltip width="180">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                            row.projectCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="来源项目名称" prop="projectName" show-overflow-tooltip width="180">
            </el-table-column>
            <el-table-column align="center" label="来源需求类型" prop="sourceType" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <span>{{ row.sourceType | orderTypeFilter(dict.type.demandPlanSourceType) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="来源需求单号" prop="sourceCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: getRouteByDemandPlanSourceType(row.sourceType) })">{{
                            row.sourceCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="center" label="来源需求行号" prop="sourceRowNum" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="客户编码" prop="cuCode" show-overflow-tooltip width="150">

                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                            row.cuCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="客户名称" prop="cuName" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="是否有产能分流" prop="isDivide" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <span>{{ row.isDivide | orderTypeFilter(dict.type.YesNo) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="是否有合并需求" prop="isMerge" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <span>{{ row.isMerge | orderTypeFilter(dict.type.YesNo) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="阶层" prop="bomLevel" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="版本号" prop="bomVersion" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="BOM编码" prop="bomCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'bomAdministrationOperate' })">{{
                            row.bomCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="BOM名称" prop="bomName" show-overflow-tooltip
                width="150"></el-table-column>
        </el-table>
        <detail-dialog ref="detailDialogRef" />
    </fragment>
</template>

<script>
import Fragment from 'vue-fragment'
import Vue from 'vue'
import indexMixin from '@/views/mixins';
import { getRouteByDemandPlanSourceType } from '@/utils'

Vue.use(Fragment.Plugin)
export default {
    dicts: ['MeasureUnit', 'planAttribute', 'demandPlanSourceType', 'YesNo'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog'),
    },
    props: {
        queryType: {
            type: String,
            default: ''
        },
        tableType: {
            type: String,
            default: '1'
        },
    },
    mixins: [indexMixin],
    data() {
        return {
            tableList: []
        }
    },
    computed: {
    },
    methods: {
        getRouteByDemandPlanSourceType: getRouteByDemandPlanSourceType,
        async init(list) {
            this.tableList = list
        },
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
    font-size: 16px;
    margin-left: 2px;
}
</style>