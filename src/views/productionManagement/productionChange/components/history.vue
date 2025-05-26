<template>
    <Dialog class="flex-dialog max-height-dialog" title="历史版本" :visible.sync="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" width="1300px" append-to-body>
        <div slot="title" class="el-dialog__title">
            历史版本
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="110px">
            <el-row>
                <el-col :span="24">
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="生产单号" prop="orderRawCode" class="border-radius50">
                                <el-input :disabled="flag" v-model="formData.orderRawCode" placeholder="请输入生产单号"
                                    clearable @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="产品编码" prop="matlCode" class="border-radius50">
                                <el-input :disabled="flag" v-model="formData.matlCode" placeholder="输入产品编码" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="产品名称" prop="matlName" class="border-radius50">
                                <el-input :disabled="flag" v-model="formData.matlName" placeholder="输入产品名称" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="产品规格型号" prop="matlType" class="border-radius50">
                                <el-input :disabled="flag" v-model="formData.matlType" placeholder="输入产品规格型号" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="版本号" prop="orderVersion" class="border-radius50">
                                <el-input v-model="formData.orderVersion" placeholder="输入版本号" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" border row-key="orderRawId" :data="tableData"
                :tree-props="{ children: 'children' }" height="100%">
                <el-table-column label="阶层" min-width="90" align="center" prop="mlevel" />
                <el-table-column label="变更编号" prop="changeCode" key="changeCode" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="变更原因" prop="changeReason" key="changeReason" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.changeReason | orderTypeFilter(dict.type.orderChangeReason) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="所属组织" prop="unitName" key="unitName" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="生产单号" prop="orderRawCode" key="orderRawCode" align="left"
                    :show-overflow-tooltip="true" min-width="180">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.orderRawId, tableType: '2', refName: 'productionOrderOperate' })">{{
                                row.orderRawCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="物料编码" prop="matlCode" key="matlCode" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                                row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="物料名称" prop="matlName" key="matlName" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="规格型号" prop="matlType" key="matlType" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="是否成品" prop="isFinished" key="isFinished" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.isFinished | orderTypeFilter(dict.type.YesNo) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="预计生产数量" prop="planNum" key="planNum" align="right" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.planNum }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="实际生产数量" prop="finishNum" key="finishNum" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.finishNum }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="合格数量" prop="qualifiedNum" key="qualifiedNum" align="right"
                    :show-overflow-tooltip="true" min-width="150">
                </el-table-column>
                <el-table-column label="不良品数量" prop="unqualifiedNum" key="unqualifiedNum" align="right"
                    :show-overflow-tooltip="true" min-width="150">
                </el-table-column>
                <el-table-column label="返工数量" prop="reworkNum" key="reworkNum" align="right"
                    :show-overflow-tooltip="true" min-width="150">
                </el-table-column>
                <el-table-column label="已生成入库单数量(累计)" prop="inNum" key="inNum" align="right"
                    :show-overflow-tooltip="true" min-width="150">
                </el-table-column>
                <el-table-column label="计划开始日期" prop="planStartDate" key="planStartDate" align="left"
                    :show-overflow-tooltip="true" min-width="170">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.planStartDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="计划完成日期" prop="planEndDate" key="planEndDate" align="left"
                    :show-overflow-tooltip="true" min-width="170">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.planEndDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="实际开始日期" prop="actualStartDate" key="actualStartDate" align="left"
                    :show-overflow-tooltip="true" min-width="170">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.actualStartDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="实际完成日期" prop="actualEndDate" key="actualEndDate" align="left"
                    :show-overflow-tooltip="true" min-width="170">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.actualEndDate, '{y}-{m}-{d}') }}</span>
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
                <el-table-column label="BOM版本" prop="bomVersion" key="bomVersion" align="left"
                    :show-overflow-tooltip="true" min-width="160">
                    <template slot-scope="{row, $index}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'BOMAdministrationOperate' })">{{
                                row.bomVersion }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="是否有工艺" prop="hasPath" key="hasPath" align="center" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.hasPath |
                            orderTypeFilter(dict.type.YesNo) }}</span>
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
                        <el-button type="text" size="small"
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

                <el-table-column label="工单版本" prop="orderVersion" key="orderVersion" align="left"
                    :show-overflow-tooltip="true" min-width="150" >
                 <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.orderRawId, name: 'productionChange', tableType: '2', refName: 'productionOrderOperate' })">{{
                                row.orderVersion }}</el-button>
                    </template>
                </el-table-column>
            </el-table>

        </div>
        <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <template #footer>
            <el-button plain round @click.native="visible = false">关闭</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>

import { historyList } from '@/api/projectManagement/productionChange';
import indexMixin from '@/views/mixins'
import { getRouteByDemandPlanSourceType } from '@/utils'
export default {
    mixins: [indexMixin],
    dicts: ['planAttribute', 'orderChangeReason', 'processType', 'YesNo', 'orderInStatus', 'PICKING', 'demandPlanSourceType', 'FINASGH', 'MeasureUnit'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    created() {
    },
    data() {
        return {
            flag: false,
            visible: false,
            loading: false,
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            formData: {
                orderRawCode: '',
                matlCode: "",
                matlName: '',
                matlType: '',
                orderVersion: ''
            },
            tableData: [],
        }
    },
    methods: {
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        resetSearch() {
            this.$refs.elForm.resetFields()
            if (this.flag && 'orderRawCode' in this._params) {
                this.formData.orderRawCode = this._params.orderRawCode
            }
            if (this.flag && 'matlCode' in this._params) {
                this.formData.matlCode = this._params.matlCode
            }
            if (this.flag && 'matlName' in this._params) {
                this.formData.matlName = this._params.matlName
            }
            if (this.flag && 'matlType' in this._params) {
                this.formData.matlType = this._params.matlType
            }
            this.$nextTick(() => {
                this.getList()
            })

        },
        init(params = {}, flag = false) {
            this.flag = flag
            this._params = params
            if (this.flag && 'orderRawCode' in this._params) {
                this.formData.orderRawCode = this._params.orderRawCode
            }
            if (this.flag && 'matlCode' in this._params) {
                this.formData.matlCode = this._params.matlCode
            }
            if (this.flag && 'matlName' in this._params) {
                this.formData.matlName = this._params.matlName
            }
            if (this.flag && 'matlType' in this._params) {
                this.formData.matlType = this._params.matlType
            }
            this.visible = true;
            this.$nextTick(() => {
                this.tableData = [];
                this.getList();
            })
        },
        // 查询物资
        getList() {
            let formData = {
                ...this.formData,
                ...this.listQuery
            }
            this.loading = true;
            historyList(formData).then(({ data }) => {
                this.tableData = data.list || [];
                this.total = data.total || 0;
            }).finally(() => {
                this.loading = false;
                this.$refs.tableRef.doLayout()
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