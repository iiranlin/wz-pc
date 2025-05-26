<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择物料需求" :visible.sync="visible"
        :close-on-click-modal="false" append-to-body width="1300px">
        <div slot="title" class="el-dialog__title">
            选择物料需求
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="110px">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="计划编码" prop="planCode" class="border-radius50">
                        <el-input v-model="formData.planCode" placeholder="请输入计划编码" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="计划名称" prop="planName" class="border-radius50">
                        <el-input v-model="formData.planName" placeholder="请输入计划名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="所属组织" v-if="propsFormData.unitId" prop="unitName">
                        <el-input class="border-radius50" v-model="formData.unitName" placeholder="请输入所属组织" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
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
                    <el-form-item label="规格型号" prop="matlType" class="border-radius50">
                        <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" :data="dataList" border row-key="id" v-loading="loading" @row-click="rowClick"
                height="100%" :row-style="changeDisabled" @row-dblclick="dbClick" @selection-change="handleSelect"
                @sort-change="sortableColumnChange">
                <el-table-column fixed="left" align="center" key="selectable" :reserve-selection="true" type="selection"
                    width="50" :selectable="isSelectable" />
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column label="计划编码" prop="planCode" key="planCode" sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                    align="left" :show-overflow-tooltip="true" min-width="180">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.planId, refName: 'demandPlanWorkbenchOperate' })">{{
                            row.planCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="计划名称" prop="planName" key="planName" sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                    align="left" :show-overflow-tooltip="true" min-width="150" />
                <el-table-column v-if="propsFormData.unitId" prop="unitName" label="所属组织" align="left"
                    show-overflow-tooltip min-width="150" />
                <el-table-column label="计划单号" prop="detailCode" key="detailCode" align="left"
                    :show-overflow-tooltip="true" min-width="220">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.id, tableType: '2', refName: 'demandPlanWorkbenchOperate' })">{{
                            row.detailCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="物料编码" prop="matlCode" key="matlCode" :show-overflow-tooltip="true" align="left"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="物料名称" prop="matlName" key="matlName" sortable="custom" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="规格型号" prop="matlType" key="matlType" sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                    align="left" :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" sortable="custom" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <!-- <el-table-column label="需求数量" prop="demandNum" key="demandNum" align="center" :show-overflow-tooltip="true" min-width="150" /> -->
                <el-table-column label="计划数量" prop="planNum" key="planNum" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <!-- <el-table-column label="需求日期" prop="demandDate" key="demandDate" align="center"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.demandDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column> -->
                <el-table-column label="项目编码" prop="projectCode" key="projectCode" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                            row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="项目名称" prop="projectName" key="projectName" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="来源需求单号" prop="sourceCode" key="sourceCode" align="left"
                    :show-overflow-tooltip="true" min-width="180" >
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: 'selfResearchDemandOperate' })">{{
                                row.sourceCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="来源需求行号" prop="sourceRowNum" key="sourceRowNum" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
            </el-table>
        </div>
        <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />

        <template #footer>
            <el-button plain round type="primary" @click="saveSelection" v-preventReClick>确定</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { planQuoteList } from '@/api/prodmgr-mm/demandPlan'
export default {
    mixins: [indexMixin, inMixin],
    dicts: ['demandPlanSourceType', 'MeasureUnit'],
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
                planAttribute: '2',
                planCode: '',
                planName: '',
                detailCode: '',
                matlCode: '',
                matlName: '',
                matlType: '',
                projectName: '',
                unitName: ''
            },
            loading: false,
            tableData: [],
            total: 0,
            selectData: [],
            saleOrderDetails: [],
        }
    },
    methods: {
        changeDisabled({ row }) {
            const idList = this.saleOrderDetails.map((item) => item.id)
            return idList.includes(row.id) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {
            const idList = this.saleOrderDetails.map((item) => item.id)
            return !idList.includes(row.id)
        },
        init(detailsList = []) {
            this.saleOrderDetails = detailsList
            this.visible = true;
            this.selectData = []
            this.$nextTick(() => {
                this.$refs.elForm.resetFields()
                this.tableData = []
                this.listQuery.pageNum = 1
                this.listQuery.pageSize = 30
                this.getList()
            })
        },
        handleSelect(selectData) {
            this.selectData = selectData;
        },
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        // 保存选择
        saveSelection() {
            if (!this.selectData.length) {
                this.$message.warning('请选择物料需求')
                return
            }
            this.$emit('change', this.selectData)
            this.visible = false
        },
        // 物资列表双击添加
        dbClick(row) {
            const flag = this.saleOrderDetails.some(item => item.id === row.id)
            if (flag) {
                this.$message.warning('此条数据已经添加')
                return
            }
            this.$emit('change', [row])
            this.visible = false
        },
        rowClick(row) {
            // 多选选中行
            const idList = this.saleOrderDetails.map((item) => item.id)
            if (idList.includes(row.id)) {
                return
            }
            // 根据id判断当前点击的是否被选中
            const selected = this.selectData.some(item => item.id === row.id)
            if (!selected) {
                // 选择
                this.selectData.push(row)
                this.$refs.tableRef.toggleRowSelection(row, true);
            } else {
                // 取消
                var finalArr = this.selectData.filter((item) => {
                    return item.id !== row.id
                })
                // 取消后剩余选中的
                this.selectData = finalArr
                this.$refs.tableRef.toggleRowSelection(row, false);
            }
        },
        // 查询物资
        getList() {
            this.loading = true
            planQuoteList(Object.assign({}, this.formData, this.listQuery, this.propsFormData)).then(({ data }) => {
                this.tableData = data?.list || []
                this.dataList = data?.list || []
                this.total = data?.total || 0
            }).finally(() => {
                this.loading = false
            })
        },
        // 重置物资列表查询
        resetSearch() {
            this.$refs.elForm.resetFields()
            this.getList()
        },
        emitAblFilter() {
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