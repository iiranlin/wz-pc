<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择生产订单" :visible.sync="visible"
         :close-on-click-modal="false" append-to-body width="1300px" >
        <div slot="title" class="el-dialog__title">
            选择生产订单
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="80px" inline>
            <el-form-item label="生产单号" prop="produceCode" class="border-radius50">
                <el-input v-model="formData.produceCode" placeholder="请输入生产单号" clearable
                    @keyup.enter.native="searchData" />
            </el-form-item>
            <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
                <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable
                    @keyup.enter.native="searchData" />
            </el-form-item>
            <el-form-item label="物料名称" prop="matlName" class="border-radius50">
                <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable
                    @keyup.enter.native="searchData" />
            </el-form-item>
            <el-form-item label="规格型号" prop="matlType" class="border-radius50">
                <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                    @keyup.enter.native="searchData" />
            </el-form-item>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" :data="dataList" border height="100%" :row-style="changeDisabled" @sort-change="sortableColumnChange"
                @selection-change="handleSelect" :tree-props="{ hasChildren: 'hasChildren', children: 'a' }"
                v-loading="loading" @row-click="rowClick" @row-dblclick="dbClick" :row-key="rowKey">
                <el-table-column fixed="left" v-if="singleMode" align="center" width="50" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.produceDetailId" class="table-radio"
                            ></el-radio>
                    </template>
                </el-table-column>
                <el-table-column v-else align="center" :selectable="isSelectable" key="selectable"
                    :reserve-selection="true" type="selection" width="50" />
                <el-table-column label="序号" align="center" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="produceCode" label="生产单号" sortable="custom" :filters="[]" :render-header="(h, obj) => renderSpecNameHeader(h, obj, {fieldType: 'String', fieldFormatArr: [], fieldFormat: ''})" align="center" show-overflow-tooltip min-width="170">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.produceDetailId, tableType: '2', refName: 'productionOrderOperate' })">{{
                                row.produceCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlCode" label="物料编码" :filters="[]" :render-header="(h, obj) => renderSpecNameHeader(h, obj, {fieldType: 'String', fieldFormatArr: [], fieldFormat: ''})" sortable="custom" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                                row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlType" label="规格型号" :filters="[]" :render-header="(h, obj) => renderSpecNameHeader(h, obj, {fieldType: 'String', fieldFormatArr: [], fieldFormat: ''})" sortable="custom" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlUnit" label="计量单位" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="totalProduceNum" label="预计生产数量" align="right" show-overflow-tooltip min-width="150" />
                <el-table-column prop="planStartDate" label="计划开始日期" align="center" show-overflow-tooltip
                    min-width="150">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.planStartDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="planEndDate" label="计划完成日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.planEndDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="pathCode" label="工艺编码" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.pathId, refName: 'processRouteOperate' })">{{
                                row.pathCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="pathName" label="工艺名称" align="left" show-overflow-tooltip min-width="150" />
            </el-table>
        </div>
        <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />

        <template #footer>
            <el-button plain round type="primary" @click="saveSelection">确定</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { flowQuoteList } from '@/api/projectManagement/productionOrder';

export default {
    dicts: ['MeasureUnit', 'YesNo'],
    mixins: [indexMixin, inMixin],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        propsFormData: {
            type: Object,
            default: null
        },
        type: {
            type: String,
            default: ''
        },
        singleMode: {
            type: Boolean,
            required: false,
            default: true
        },
    },
    data() {
        return {
            visible: false,
            dialogParam: {},
            formData: {
                matlCode: '',
                matlName: '',
                matlType: '',
                produceCode: '',
            },
            loading: false,
            tableData: [],
            total: 0,
            selectDataRow: null,
            selected: [],
            selectData: [],
            rowKey: 'produceDetailId'
        }
    },

    methods: {
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
        init(produceDetailId = null, selected = []) {
            this.selected = [] 
            this.selectData = []
            this.selectDataRow = produceDetailId
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
                this.$emit('change', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择生产订单')
                    return
                }
                this.$emit('change', this.selectData)
            }
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
            this.$emit('change', this.singleMode ? row : [row])
            this.visible = false
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
            flowQuoteList(Object.assign({}, this.formData, this.listQuery, this.propsFormData)).then(({ data }) => {
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
        emitAblFilter () {
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
