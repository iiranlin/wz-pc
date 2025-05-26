<template>
    <fragment>
        <el-table ref="tableRef" border row-key="orderRawId" :data="tableList" :tree-props="{ children: 'list' }">
            <el-table-column label="阶层" min-width="90" align="center" prop="mlevel" />
            <el-table-column label="生产单号" prop="orderRawCode" key="orderRawCode" align="left"
                :show-overflow-tooltip="true" min-width="180">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.orderRawId, tableType: '2', refName: 'productionOrderOperate' })">{{
                            row.orderRawCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="当前领料状态" prop="pickingStatus" key="pickingStatus" align="center"
                :show-overflow-tooltip="true" min-width="150">
                <template slot-scope="{row}">
                    <span :class="'pickingStatus-' + row.pickingStatus">{{ row.pickingStatus |
                        orderTypeFilter(dict.type.PICKING) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="当前生产状态" prop="bizStatus" key="bizStatus" align="center"
                :show-overflow-tooltip="true" min-width="150">
                <template slot-scope="{row}">
                    <span :class="'scStatus-' + row.bizStatus">{{ row.bizStatus | orderTypeFilter(dict.type.FINASGH)
                        }}</span>
                </template>
            </el-table-column>
            <el-table-column label="当前产品入库状态" prop="inStatus" key="inStatus" align="center"
                :show-overflow-tooltip="true" min-width="150">
                <template slot-scope="{row}">
                    <span :class="'inStatus-' + row.inStatus">{{ row.inStatus |
                        orderTypeFilter(dict.type.orderInStatus) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="产品编码" prop="matlCode" key="matlCode" align="left" :show-overflow-tooltip="true"
                min-width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="产品名称" prop="matlName" key="matlName" align="left" :show-overflow-tooltip="true"
                min-width="150" />
            <el-table-column label="规格型号" prop="matlType" key="matlType" align="left" :show-overflow-tooltip="true"
                min-width="150" />
            <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" align="left" :show-overflow-tooltip="true"
                min-width="150">
                <template slot-scope="{row}">
                    <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="是否成品" prop="isFinished" key="isFinished" align="left" :show-overflow-tooltip="true"
                min-width="150">
                <template slot-scope="{row}">
                    <span>{{ row.isFinished | orderTypeFilter(dict.type.YesNo) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="预计生产数量" prop="planNum" key="planNum" align="left" :show-overflow-tooltip="true"
                min-width="150">
                <template slot-scope="{row}">
                    <el-input-number v-if="queryType != 'view'" v-model="row.planNum" controls-position="right" :min="0"
                        :max="20" style="width: 100%"></el-input-number>
                    <span v-else>{{ row.planNum }}</span>
                </template>
            </el-table-column>
            <el-table-column label="计划开始日期" prop="planStartDate" key="planStartDate" align="left"
                :show-overflow-tooltip="true" min-width="170">
                <template slot-scope="{row}">
                    <el-date-picker style="width: 100%;" v-if="queryType != 'view'" v-model="row.planStartDate"
                        type="date" />
                    <span v-else>{{ parseTime(row.planStartDate, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="计划完成日期" prop="planEndDate" key="planEndDate" align="left"
                :show-overflow-tooltip="true" min-width="170">
                <template slot-scope="{row}">
                    <el-date-picker style="width: 100%;" v-if="queryType != 'view'" v-model="row.planEndDate"
                        type="date" />
                    <span v-else>{{ parseTime(row.planEndDate, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="BOM编码" prop="bomCode" key="bomCode" align="left" :show-overflow-tooltip="true"
                min-width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'bomAdministrationOperate' })">{{
                            row.bomCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="BOM名称" prop="bomName" key="bomName" align="left" :show-overflow-tooltip="true"
                min-width="150" />
            <el-table-column label="BOM版本" prop="bomVersion" key="bomVersion" align="left" :show-overflow-tooltip="true"
                min-width="160">
                <template slot-scope="{row, $index}">
                    <el-input style="width: 100%;" v-if="queryType != 'view'" v-model="row.bomVersion"> <el-button
                            slot="append" icon="el-icon-search"
                            @click="handleBomVersion(row, $index)"></el-button></el-input>
                    <el-button v-else type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'BOMAdministrationOperate' })">{{
                            row.bomVersion }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="工艺编码" prop="pathCode" key="pathCode" align="left" :show-overflow-tooltip="true"
                min-width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.pathId, refName: 'processRouteOperate' })">{{
                            row.pathCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="工艺名称" prop="pathName" key="pathName" align="left" :show-overflow-tooltip="true"
                min-width="150" />
            <el-table-column label="工艺版本" prop="pathVersion" key="pathVersion" align="left"
                :show-overflow-tooltip="true" min-width="200">
                <template slot-scope="{row, $index}">
                    <el-input style="width: 100%;" v-if="queryType != 'view'" v-model="row.pathVersion"> <el-button
                            slot="append" icon="el-icon-search"
                            @click="handlePathVersion(row, $index)"></el-button></el-input>
                    <el-button v-else type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.processId, refName: 'standardProcessCreate' })">{{
                            row.pathVersion }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="来源项目编码" prop="sourceProjectCode" key="sourceProjectCode" align="left"
                :show-overflow-tooltip="true" min-width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceProjectId, refName: 'projectManagementOperate' })">{{
                            row.sourceProjectCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="来源项目名称" prop="sourceProjectName" key="sourceProjectName" align="left"
                :show-overflow-tooltip="true" min-width="150">
            </el-table-column>
            <el-table-column label="来源需求类型" prop="sourceType" key="sourceType" align="left"
                :show-overflow-tooltip="true" min-width="150">
                <template slot-scope="{row}">
                    <span>{{ row.sourceType | orderTypeFilter(dict.type.demandPlanSourceType) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="来源需求单号" prop="sourceCode" key="sourceCode" align="left"
                :show-overflow-tooltip="true" min-width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: getRouteByDemandPlanSourceType(row.sourceType) })">{{
                            row.sourceCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="来源需求行号" prop="rawNo" key="rawNo" align="left" :show-overflow-tooltip="true"
                min-width="150">
            </el-table-column>
            <el-table-column label="来源计划单号" prop="sourcePlanCode" key="sourcePlanCode" align="left"
                :show-overflow-tooltip="true" min-width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourcePlanId, refName: 'demandPlanWorkbenchOperate' })">{{
                            row.sourcePlanCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="客户编码" prop="cuCode" key="cuCode" align="left" :show-overflow-tooltip="true"
                min-width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                            row.cuCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column label="客户名称" prop="cuName" key="cuName" align="left" :show-overflow-tooltip="true"
                min-width="150" />
            <el-table-column label="库存可用量" prop="inventoryNum" key="inventoryNum" align="left"
                :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="工单版本" prop="orderVersion" key="orderVersion" align="left"
                :show-overflow-tooltip="true" min-width="150" />
        </el-table>
        <detail-dialog ref="detailDialogRef" />
        <bomHistory ref="bomHistory" singleMode @confirm="handleBomConfirm" />
        <processHistory ref="processHistory" singleMode @confirm="handlePathConfirm" />
    </fragment>
</template>

<script>
import Fragment from 'vue-fragment'
import Vue from 'vue'
import indexMixin from '@/views/mixins';
import bomHistory from '@/views/components/bom-history'
import DetailDialog from '@/views/components/DetailDialog'
import processHistory from '@/views/components/process-history'
Vue.use(Fragment.Plugin)
export default {
    mixins: [indexMixin],
    dicts: ['planAttribute', 'processType', 'YesNo', 'orderInStatus', 'PICKING', 'demandPlanSourceType', 'FINASGH', 'MeasureUnit'],
    props: {
        queryType: {
            type: String,
            default: 'view'
        },
        tableList: {
            type: Array,
            default: () => {
                return []
            }
        }
    },
    components: {
        bomHistory,
        DetailDialog,
        processHistory
    },
    methods: {
        handleBomVersion(row, idx) {
            this._idx = idx
            this.$refs.bomHistory.init(row.bomCode, row.bomVersion);
        },
        handleBomConfirm(row) {
            const temp = { ...this.tableList[this._idx] }
            this.$set(this.tableList, this._idx, { ...temp, bomId: row.bomId, bomVersion: row.bomVersion, bomCode: row.bomCode })
            this._idx = undefined
        },
        handlePathVersion(row, idx) {
            this._idx = idx
            this.$refs.processHistory.init(row);
        },
        handlePathConfirm(row) {
            const temp = { ...this.tableList[this._idx] }
            this.$set(this.tableList, this._idx, { ...temp, pathId: row.pathId, pathVersion: row.version, pathCode: row.pathCode, pathName: row.pathName })
            this._idx = undefined
        },
    }
}
</script>