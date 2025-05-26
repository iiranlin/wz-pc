<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择需求" :visible.sync="visible"
        :close-on-click-modal="false" append-to-body width="1300px">
        <div slot="title" class="el-dialog__title">
            选择需求
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="90px" v-if="visible">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="项目编码" prop="projectCode" class="border-radius50">
                        <el-input v-model="formData.projectCode" placeholder="请输入项目编码" clearable
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
                    <el-form-item label="需求类型" prop="sourceType" class="border-radius50">
                        <el-select v-model="formData.sourceType" placeholder="请选择需求类型" style="width: 100%">
                            <el-option v-for="item in dict.type.demandPlanSourceType" :key="item.value"
                                :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="需求单号" prop="sourceCode" class="border-radius50">
                        <el-input v-model="formData.sourceCode" placeholder="请输入需求单号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="客户编码" prop="cuCode" class="border-radius50">
                        <el-input v-model="formData.cuCode" placeholder="请输入客户编码" clearable
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
                    <el-form-item label="需求日期" prop="demandDate" class="border-radius50">
                        <el-date-picker v-model="formData.demandDate" type="daterange" value-format="yyyy-MM-dd"
                            range-separator="-" style="width: 100%"></el-date-picker>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" v-if="visible" row-key="sourceDetailId" :row-style="changeDisabled"
                :data="tableData" border height="100%" v-loading="loading" @row-click="rowClick" @row-dblclick="dbClick"
                @selection-change="handleSelect">
                <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.sourceDetailId" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column v-else fixed="left" align="center" key="selectable" :reserve-selection="true"
                    type="selection" width="50" :selectable="isSelectable" />
                <el-table-column label="序号" align="center" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="projectCode" label="项目编码" align="center" show-overflow-tooltip min-width="170">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                                row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="sourceType" label="需求类型" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.sourceType | orderTypeFilter(dict.type.demandPlanSourceType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sourceCode" label="需求单号" align="center" show-overflow-tooltip min-width="150">

                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: getRouteByDemandPlanSourceType(row.sourceType) })">{{
                                row.sourceCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="sourceRowNum" label="需求行号" align="center" show-overflow-tooltip
                    min-width="150" />
                <el-table-column prop="matlCode" label="物料编码" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                                row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlUnit" label="计量单位" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="matlType" label="计划属性" align="center" show-overflow-tooltip min-width="150" >
                    <template slot-scope="{row}">
                                <span :class="'planAttribute-' + row.planAttribute">{{ row.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
                            </template>
                </el-table-column>
                <el-table-column prop="demandNum" label="需求数量" align="right" show-overflow-tooltip min-width="150" />
                <el-table-column prop="demandDate" label="需求日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.demandDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="cuCode" label="客户编码" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                                row.cuCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="cuName" label="客户名称" align="left" show-overflow-tooltip min-width="150" />
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
import { demandQuoteList } from '@/api/prodmgr-mm/researchDemand'
import { saleOrderDemandQuoteList } from '@/api/saleManage/saleOrder'
import { getRouteByDemandPlanSourceType } from '@/utils'
export default {
    mixins: [indexMixin],
    dicts: ['demandPlanSourceType', 'MeasureUnit', 'planAttribute'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        propsFormData: {
            type: Object,
            default: null
        },
        singleMode: {
            type: Boolean,
            required: false,
            default: false
        },
    },
    data() {
        return {
            dialogParam: {},
            visible: false,
            selectDataRow: null,
            formData: {
                projectCode: '',
                projectName: '',
                sourceType: '1',
                sourceCode: '',
                cuCode: '',
                cuName: '',
                demandDate: null
            },
            loading: false,
            tableData: [],
            total: 0,
            selectData: [],
            saleOrderDetails: [],
            selected: [],
            unitId: ''
        }
    },
    methods: {
        getRouteByDemandPlanSourceType: getRouteByDemandPlanSourceType,
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item.sourceDetailId)
            return idList.includes(row.sourceDetailId) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {
            const idList = this.selected.map((item) => item.sourceDetailId)
            return !idList.includes(row.sourceDetailId)
        },
        init(detailsList = [], unitId = '') {
            this.selectData = [],
                this.saleOrderDetails = []
            this.visible = true;
            this.selected = []
            this.unitId = unitId
            this.selectDataRow = null,
                this.$nextTick(() => {
                    this.saleOrderDetails = detailsList
                    this.selected = detailsList
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
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择需求')
                    return
                }
                const data = this.tableData.find(item => item.sourceDetailId === this.selectDataRow)
                this.$emit('change', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择需求')
                    return
                }
                this.$emit('change', this.selectData)
            }


            this.visible = false
        },
        // 物资列表双击添加
        dbClick(row) {
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择需求')
                    return
                }
                const data = this.tableData.find(item => item.sourceDetailId === this.selectDataRow)
                this.$emit('change', data)
            } else {
                const flag = this.saleOrderDetails.some(item => item.sourceDetailId === row.sourceDetailId)
                if (flag) {
                    this.$message.warning('此条数据已经添加')
                    return
                }
                this.$emit('change', [row])
            }

            this.visible = false
        },
        rowClick(row) {
            if (this.singleMode) {
                // 单选选中行
                this.selectDataRow = row.sourceDetailId
            } else {
                // 多选选中行
                const idList = this.saleOrderDetails.map((item) => item.sourceDetailId)
                if (idList.includes(row.sourceDetailId)) {
                    return
                }
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.sourceDetailId === row.sourceDetailId)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true);
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.sourceDetailId !== row.sourceDetailId
                    })
                    // 取消后剩余选中的
                    this.selectData = finalArr
                    this.$refs.tableRef.toggleRowSelection(row, false);
                }
            }

        },
        // 查询物资
        getList() {
            let url = null
            if (this.formData.sourceType == '3') {
                url = demandQuoteList
            }
            if (this.formData.sourceType == '2') {
                this.tableData = []
                this.total = 0
                return
            }
            if (this.formData.sourceType == '1') {
                url = saleOrderDemandQuoteList
            }
            this.loading = true
            const demandDate = this.formData.demandDate || []
            url(Object.assign({}, this.formData, this.listQuery, this.propsFormData, { unitId: this.unitId }, { demandDateStart: demandDate[0] || '', demandDateEnd: demandDate[1] || '', demandDate: null })).then(({ data }) => {
                this.tableData = data?.list || []
                this.total = data?.total || 0
                // if (this.saleOrderDetails.length) {
                //     const selectRowIdGroup = this.saleOrderDetails.map(item => item.sourceDetailId)
                //     this.tableData.forEach(item => {
                //         if (selectRowIdGroup.includes(item.sourceDetailId)) {
                //             this.$nextTick(() => {
                //                 this.$refs.tableRef.toggleRowSelection(item)
                //             })
                //         }
                //     })
                // }
            }).finally(() => {
                this.loading = false
            })
        },
        // 重置物资列表查询
        resetSearch() {
            this.$refs.elForm.resetFields()
            this.searchData()
        }
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>