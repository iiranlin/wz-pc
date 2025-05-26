<template>
    <Dialog class="flex-dialog max-height-dialog" title="合并历史" :visible.sync="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" width="1300px" append-to-body>
        <div slot="title" class="el-dialog__title">
            合并历史
            <div class="flex-dialog-button" v-if="!rowDetail">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form v-if="!rowDetail" ref="elForm" :model="formData" label-width="110px">
            <el-row>
                <el-col :span="24">
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="计划单号" prop="detailCode" class="border-radius50">
                                <el-input v-model="formData.detailCode" placeholder="请输入计划单号" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
                                <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="物料名称" prop="matlName" class="border-radius50">
                                <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="项目名称" prop="projectName" class="border-radius50">
                                <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="客户名称" prop="cuName" class="border-radius50">
                                <el-input v-model="formData.cuName" placeholder="请输入客户名称" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>

                        <el-col :span="6">
                            <el-form-item label="来源需求单号" prop="sourceCode" class="border-radius50">
                                <el-input v-model="formData.sourceCode" placeholder="输入来源需求单号" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>

                    </el-row>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table :data="tableData" row-key="id" border height="100%" v-loading="loading"
                :tree-props="{ children: 'children' }" default-expand-all>
                <el-table-column label="序号" align="left" width="50" type="index" />
                <el-table-column prop="bomLevel" label="阶层" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <span>{{ !!row.parentId ? row.bomLevel : '' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="bomVersion" label="版本号" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="bomCode" label="BOM编码" align="left" show-overflow-tooltip width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'bomAdministrationOperate' })">{{
                                row.bomCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="bomName" label="BOM名称" align="left" show-overflow-tooltip
                    width="160"></el-table-column>
                <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip width="120">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                                row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="planAttribute" label="计划属性" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <span>{{ row.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="demandNum" label="需求数量" align="left" show-overflow-tooltip>

                </el-table-column>
                <el-table-column prop="inventoryNum" label="库存数量" align="left" show-overflow-tooltip>

                </el-table-column>
                <el-table-column prop="planNum" label="计划数量" align="left" show-overflow-tooltip>

                </el-table-column>
                <el-table-column prop="planStartDate" label="计划开始日期" align="center" show-overflow-tooltip width="150">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.planStartDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="planEndDate" label="计划结束日期" align="center" show-overflow-tooltip width="150">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.planEndDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="projectCode" label="来源项目编码" align="left" show-overflow-tooltip width="180">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                                row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="projectName" label="来源项目名称" align="left" show-overflow-tooltip width="180">
                </el-table-column>
                <el-table-column prop="sourceType" label="来源需求类型" align="left" show-overflow-tooltip width="180">
                    <template slot-scope="{row}">
                        <span>{{ row.sourceType | orderTypeFilter(dict.type.demandPlanSourceType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sourceCode" label="来源需求单号" align="left" show-overflow-tooltip width="180">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: getRouteByDemandPlanSourceType(row.sourceType) })">{{
                                row.sourceCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="sourceRowNum" label="来源需求行号" align="left" show-overflow-tooltip width="180">
                </el-table-column>
                <el-table-column prop="cuCode" label="客户编码" align="left" show-overflow-tooltip width="160">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                            row.cuCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="cuName" label="客户名称" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="isDivide" label="是否有产能分流" align="left" show-overflow-tooltip width="180">
                    <template slot-scope="{row}">
                        <span>{{ row.isDivide | orderTypeFilter(dict.type.YesNo) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="isMerge" label="是否有需求合并" align="left" show-overflow-tooltip width="180">
                    <template slot-scope="{row}">
                        <span>{{ row.isMerge | orderTypeFilter(dict.type.YesNo) }}</span>
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
import { mergeList } from '@/api/prodmgr-mm/demandPlan';
import indexMixin from '@/views/mixins'
import { getRouteByDemandPlanSourceType } from '@/utils'
export default {
    mixins: [indexMixin],
    dicts: ['MeasureUnit', 'YesNo', 'demandPlanSourceType', 'planAttribute'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    data() {
        return {
            rowDetail: false,
            dialogParam: {},
            visible: false,
            loading: false,
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            formData: {
                detailCode: '',
                matlCode: '',
                matlName: '',
                projectName: '',
                cuName: '',
                sourceCode: ''
            },
            tableData: [],
        }
    },
    methods: {
        getRouteByDemandPlanSourceType: getRouteByDemandPlanSourceType,
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        resetSearch() {
            this.$refs.elForm.resetFields()
            this.getList()
        },
        init(id = '') {
            this.rowDetail = !!id
            this._id = id
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
                ...this.listQuery,

            }
            if (!!this._id) {
                formData.id = this._id
            }
            this.loading = true;
            mergeList(formData).then(({ data }) => {
                this.tableData = data.list || [];
                this.total = data.total || 0;
            }).finally(() => {
                this.loading = false;
            })
        },
        createClick(scope) {
            this.$emit('createClick', scope.row.id)
            this.visible = false
        }
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>