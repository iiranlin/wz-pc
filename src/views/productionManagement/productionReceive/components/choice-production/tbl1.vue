<template>
    <fragment>
        <el-form ref="elForm" :model="formData" label-width="100px">
            <el-row>
                <el-col :span="6"> <el-form-item label="生产单号" prop="orderRawCode" class="border-radius50">
                        <el-input v-model="formData.orderRawCode" placeholder="请输入生产单号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item></el-col>
                <el-col :span="6"> <el-form-item label="产品编码" prop="matlCode" class="border-radius50">
                        <el-input v-model="formData.matlCode" placeholder="请输入产品编码" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item></el-col>
                <el-col :span="6"> <el-form-item label="产品名称" prop="matlName" class="border-radius50">
                        <el-input v-model="formData.matlName" placeholder="请输入产品名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item></el-col>
                <el-col :span="6"><el-form-item label="规格型号" prop="matlType" class="border-radius50">
                        <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item></el-col>
                <el-col :span="6"> <el-form-item label="来源项目编码" prop="sourceProjectCode" class="border-radius50">
                        <el-input v-model="formData.sourceProjectCode" placeholder="请输入来源项目编码" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item></el-col>
                <el-col :span="6"> <el-form-item label="来源项目名称" prop="sourceProjectName" class="border-radius50">
                        <el-input v-model="formData.sourceProjectName" placeholder="请输入来源项目名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item></el-col>
                <el-col :span="6"> <el-form-item label="来源需求单号" prop="sourceCode" class="border-radius50">
                        <el-input v-model="formData.sourceCode" placeholder="请输入来源需求单号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item></el-col>
                <el-col :span="6"><el-form-item label="来源计划单号" prop="sourcePlanCode" class="border-radius50">
                        <el-input v-model="formData.sourcePlanCode" placeholder="请输入来源计划单号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item></el-col>
                <el-col :span="6"><el-form-item label="计划属性" prop="planAttribute" class="border-radius50">
                        <el-select class="select-box" v-model="formData.planAttribute" placeholder="请选择计划属性"
                            style="width:100%" size="small">
                            <el-option v-for="(item, key) in dict.type.planAttribute" :key="key" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item></el-col>
                <el-col :span="6"><el-form-item label="是否成品" prop="isFinished" class="border-radius50">
                        <el-select v-model="formData.isFinished" placeholder="请选择是否成品" clearable
                            @keyup.enter.native="searchData">
                            <el-option :value="item.value" :label="item.label" v-for="item in dict.type.YesNo"
                                :key="item.value"></el-option>
                        </el-select>
                    </el-form-item></el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" :data="dataList" border height="100%" :row-style="changeDisabled"
                @sort-change="sortableColumnChange" @selection-change="handleSelect"
                :tree-props="{ hasChildren: 'hasChildren', children: 'a' }" v-loading="loading" @row-click="rowClick"
                @row-dblclick="dbClick" :row-key="rowKey">
                <el-table-column fixed="left" v-if="singleMode" align="center" width="50" key="radio">
                    <template v-slot="{ row }">
                        <el-radio :value="selectDataRow" :label="row[rowKey]" class="table-radio"
                            @click="rowClick(row)"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column fixed="left" v-else align="center" :selectable="isSelectable" key="selectable"
                    :reserve-selection="true" type="selection" width="50" />
                <el-table-column label="序号" align="center" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="orderRawCode" label="生产单号" sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                    align="center" show-overflow-tooltip min-width="170">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.orderRawId, tableType: '2', refName: 'productionOrderOperate' })">{{
                                row.orderRawCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlCode" label="产品编码" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                                row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlName" label="产品名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column label="计划属性" prop="planAttribute" key="planAttribute" align="center"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span :class="'planAttribute-' + row.planAttribute">{{ row.planAttribute |
                            orderTypeFilter(dict.type.planAttribute) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="isFinished" label="是否成品" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.isFinished | orderTypeFilter(dict.type.YesNo) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="mLevel" label="阶次" align="center" show-overflow-tooltip min-width="150" />
                <el-table-column prop="planNum" label="预计生产数量" align="center" show-overflow-tooltip min-width="150" />
                <el-table-column prop="orderCode" label="生产编码" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.orderId, tableType: '1', refName: 'productionOrderOperate' })">{{
                                row.orderCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="orderName" label="生产名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="sourceProjectCode" label="来源项目编码" align="left" show-overflow-tooltip
                    min-width="150" >
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceProjectId, refName: 'projectManagementOperate' })">{{
                                row.sourceProjectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="sourceProjectName" label="来源项目名称" align="left" show-overflow-tooltip
                    min-width="150" />
                <el-table-column prop="sourceType" label="来源需求类型" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.sourceType | orderTypeFilter(dict.type.demandPlanSourceType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sourceCode" label="来源需求单号" align="left" show-overflow-tooltip min-width="150" >
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId,  refName: getRouteByDemandPlanSourceType(row.sourceType) })">{{
                                row.sourceCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="sourcePlanCode" label="来源计划单号" align="left" show-overflow-tooltip
                    min-width="150" >
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourcePlanId,  refName: 'demandPlanWorkbenchOperate' })">{{
                                row.sourcePlanCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="createUserName" label="创建人" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="createDate" label="创建时间" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
            <detail-dialog ref="detailDialogRef" />
            <orderDetail ref="orderDetailRef" />
    </fragment>
</template>

<script>
import Fragment from 'vue-fragment'
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { pickingQuoteOrderList } from '@/api/projectManagement/productionOrder';
import { getRouteByDemandPlanSourceType } from '@/utils'
import Vue from 'vue'
Vue.use(Fragment.Plugin)
export default {
    dicts: ['MeasureUnit', 'YesNo', 'planAttribute', 'demandPlanSourceType'],
    mixins: [indexMixin, inMixin],
    components: {
        orderDetail: () => import('@/views/components/orderDetail'),
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
            default: true
        },
        unitId: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            visible: false,
            dialogParam: {},
            formData: {
                orderRawCode: '',
                matlCode: '',
                matlName: '',
                matlType: '',
                sourceProjectCode: '',
                sourceProjectName: '',
                sourceCode: '',
                sourcePlanCode: '',
                isFinished: ''
            },
            loading: false,
            tableData: [],
            total: 0,
            selectDataRow: null,
            selected: [],
            selectData: [],
            rowKey: 'orderRawId'
        }
    },

    methods: {
        getRouteByDemandPlanSourceType: getRouteByDemandPlanSourceType,
        handleTabClick(val) {
            this.init(this._orderRawId, this.selected)
        },
        handleTotalPickingNumClick(row) {
            this.$refs.orderDetailRef.init({ queryType: 'pickingQuoteNum', rawMatlId: row.rawMatlId }, 'pickingQuoteNum')
        },
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item[this.rowKey])
            return idList.includes(row[this.rowKey]) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {
            const idList = this.selected.map((item) => item[this.rowKey])
            return !idList.includes(row[this.rowKey])
        },
        init(orderRawId = null, selected = []) {
            this._orderRawId = orderRawId
            this.selected = selected
            this.selected = []
            this.selectData = []
            this.selectDataRow = orderRawId
            this.visible = true;
            this.$nextTick(() => {
                this.$refs.tableRef.clearSelection();
                this.$refs.elForm.resetFields()
                this.selected = selected
                this.tableData = []
                this.listQuery.pageNum = 1
                this.listQuery.pageSize = 30
                this.getList()
            })
        },
        handleSelect(selectData) {
            this.selectData = selectData
        },
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        // 保存选择
        saveSelection() {
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择生产订单')
                    return
                }
                const data = this.tableData.find(item => item[this.rowKey] === this.selectDataRow)

                this.callChange(data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择生产订单')
                    return
                }
                this.callChange(this.selectData)
            }

        },
        callChange(data) {
            let flag = false
            if (!this.singleMode) {
                const arr = this.selected.concat(data)
                const matlCodes = arr.map(({ matlCode }) => matlCode)
                flag = new Set(matlCodes).size !== matlCodes.length;
            }
            if (!!flag) {
                return this.$message.warning('存在相同材料，不允许合并领料，无法按“生产订单/领料单/材料”维度进行跟踪')
            }
            this.$emit('change', data)
            this.visible = false
        },
        // 物资列表双击添加到BOM清单
        dbClick(row) {
            if (!this.singleMode) {
                const flag = this.selected.some(item => item[this.rowKey] === row[this.rowKey])
                if (flag) {
                    this.$message.warning('此条数据已经添加')
                    return
                }
            }
            this.callChange(this.singleMode ? row : [row])
        },
        rowClick(row) {
            if (this.singleMode) {
                this.selectDataRow = row[this.rowKey]
            } else {
                const idList = this.selected.map((item) => item[this.rowKey])
                if (idList.includes(row[this.rowKey])) {
                    return
                }
                // 多选选中行
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item[this.rowKey] === row[this.rowKey])
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true)
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item[this.rowKey] !== row[this.rowKey]
                    })
                    // 取消后剩余选中的
                    this.selectData = finalArr
                    this.$refs.tableRef.toggleRowSelection(row, false)
                }
            }

        },
        // 查询物资
        getList() {
            this.loading = true
            const api = pickingQuoteOrderList
            let params = Object.assign({}, this.formData, this.listQuery, { unitId: this.unitId })
            api(params).then(({ data }) => {
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

.dialog-padding .el-dialog__body {
    padding: 10px 20px !important;
    box-sizing: border-box !important;
}

.dialog-padding .dialog-tab {
    flex: 1;
}

.dialog-padding .dialog-tab-pane {
    flex: 1;
}

.dialog-padding .el-tabs__content {
    flex: 1 !important;
}
</style>
<style lang="scss">
.dialog-padding .el-dialog__body {
    padding: 10px 20px !important;
    box-sizing: border-box !important;
}

.dialog-padding .dialog-tab {
    height: calc(100% - 60px) !important;
}

.dialog-padding .dialog-tab-pane {
    flex: 1;
}

.dialog-padding .el-tabs__content {
    height: calc(100% - 60px) !important;
}
</style>