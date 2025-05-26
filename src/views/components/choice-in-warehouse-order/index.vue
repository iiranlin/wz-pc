<template>
    <Dialog :title="title" class="max-height-dialog flex-dialog" :visible.sync="openDataScope" tabindex="1"
        :close-on-click-modal="false" width="1300px" append-to-body>
        <div slot="title" class="el-dialog__title">
            {{ title }}
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-suffix="：" label-width="110px">
            <el-row>
                <el-col :span="24">
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="入库单号" prop="inCode" class="border-radius50">
                                <el-input v-model="formData.inCode" placeholder="请输入入库单号" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="来源单号" prop="sourceCode" class="border-radius50">
                                <el-input v-model="formData.sourceCode" placeholder="请输入来源单号" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="所属组织" prop="unitName" class="border-radius50">
                                <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
                                    :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
                                <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="物料名称" prop="matlName" class="border-radius50">
                                <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="规格型号" prop="matlType" class="border-radius50">
                                <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="项目编码" prop="projectCode" class="border-radius50">
                                <el-input v-model="formData.projectCode" placeholder="请输入项目编码" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="项目名称" prop="projectName" class="border-radius50">
                                <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="合同编码" prop="ctCode" class="border-radius50">
                                <el-input v-model="formData.ctCode" placeholder="请输入合同编码" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="合同名称" prop="ctName" class="border-radius50">
                                <el-input v-model="formData.ctName" placeholder="请输入合同名称" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="供应商编码" prop="suCode" class="border-radius50">
                                <el-input v-model="formData.suCode" placeholder="请输入供应商编码" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="供应商名称" prop="suName" class="border-radius50">
                                <el-input v-model="formData.suName" placeholder="请输入供应商名称" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="入库负责人" prop="inUserName" class="border-radius50">
                                <el-input v-model="formData.inUserName" placeholder="请输入入库负责人" clearable
                                    @keyup.enter.native="handleQuery" size="small"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="创建日期" prop="createDate" class="border-radius50">
                                <el-date-picker v-model="formData.createDate" type="daterange" value-format="yyyy-MM-dd"
                                range-separator="-" style="width:217px !important" size="small"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" class="container_table" v-loading="loading" border row-key="id"
                v-if="openDataScope" :data="dataList" height="100%" @row-click="rowClick"
                @sort-change="sortableColumnChange" @row-dblclick="dbClick" @selection-change="handleSelect"
                :row-style="changeDisabled">
                <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.id" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column v-else align="center" :selectable="isSelectable" key="selectable"
                    :reserve-selection="true" type="selection" width="50" />
                <el-table-column label="入库来源" prop="inSource" key="inSource" sortable="custom" align="left"
                    min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.inSource | orderTypeFilter(dict.type.inMaintenance) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="来源单号" prop="sourceCode" key="sourceCode" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: getRouteByInsource(row.inSource) })">{{
                                row.sourceCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="入库单号" prop="inCode" key="inCode" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.inId, refName: 'createInventoryMaintenance' })">{{
                                row.inCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="所属组织" prop="unitName" key="unitName" sortable="custom" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="物料编码" prop="matlCode" key="matlCode" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                                row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="物料名称" prop="matlName" key="matlName" sortable="custom" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="规格型号" prop="matlType" key="matlType" sortable="custom" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" sortable="custom" align="left"
                    min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="项目编码" prop="projectCode" key="projectCode" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                                row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="项目名称" prop="projectName" key="projectName" sortable="custom"
                    align="left" :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="合同编码" prop="ctCode	" key="ctCode	" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.ctId, refName: 'contractManagementOperate' })">{{
                                row.ctCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="合同名称" prop="ctName" key="ctName" sortable="custom" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="供应商编码" prop="suCode" key="suCode" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.suId, refName: 'supplierOperate' })">{{
                                row.suCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="供应商名称" prop="suName" key="suName" sortable="custom" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="入库负责人" prop="inUserName" key="inUserName" sortable="custom" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="入库创建日期" prop="createDate" key="createDate" sortable="custom"
                    align="center" :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.createDate) }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                        @pagination="getList" />
        <div slot="footer" class="dialog-footer">
            <el-button plain round type="primary" @click="confirmClick" v-preventReClick>确 定</el-button>
            <el-button plain round @click="openDataScope = false">取 消</el-button>
        </div>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { queryDetailInfoList } from '@/api/warehouseManage/inventoryMaintenance'
import { getRouteByInsource } from '@/utils'
export default {
    mixins: [indexMixin, inMixin],
    dicts: ['MeasureUnit', 'inMaintenance'],
    components: {
        FormUnitId: () => import('@/views/components/form-unitId'),
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        singleMode: {
            type: Boolean,
            required: false,
            default: false
        },
        propsFormData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            title: '入库单选择',
            openDataScope: false,
            treeLoading: false,
            loading: false,
            formData: {
                inCode: '',
                sourceCode: '',
                unitName: '',
                matlCode: '',
                matlName: '',
                matlType: '',
                projectCode: '',
                projectName: '',
                ctCode: '',
                ctName: '',
                suCode: '',
                suName: '',
                inUserName: '',
                createDate: null,
            },
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            tableData: [],
            selectData: [],
            saleOrderDetails: [],
            selectDataRow: null,
            matlCodeArr: [],
            selected: []
        }
    },
    mounted() {
    },
    methods: {
        getRouteByInsource: getRouteByInsource,
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item.id)
            return idList.includes(row.id) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {

            const idList = this.selected.map((item) => item.id)
            return !idList.includes(row.id)
        },
        filterNode(value, data) {
            if (!value) return true
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1
        },
        init(id = null, saleOrderDetails = [], matlCodeArr = []) {
            this.selectData = []
            this.saleOrderDetails = []
            this.selectDataRow = null
            this.openDataScope = true
            this.matlCodeArr = matlCodeArr
            this.selected = matlCodeArr
            this.$nextTick(() => {
                this.$refs.queryForm.resetFields()
                if (this.singleMode) {
                    this.selectDataRow = id
                } else {
                    this.saleOrderDetails = saleOrderDetails
                }
                this.getList()
            })
        },
        getList() {
            this.loading = true
            queryDetailInfoList(Object.assign({}, this.listQuery, this.formData, this.propsFormData)).then(({ data }) => {
                this.tableData = data.list
                this.dataList = data.list
                this.total = data.total
                
            }).finally(() => {
                this.loading = false
            })
        },
        handleSelect(selectData) {
            this.selectData = selectData
        },
        rowClick(row) {
            if (this.singleMode) {
                // 单选选中行
                this.selectDataRow = row.id
            } else {
                if (this.matlCodeArr.includes(row.id)) {
                    return false
                }
                const idList = this.saleOrderDetails.map((item) => item.id)
                if (idList.includes(row.id)) {
                    return
                }
                // 多选选中行
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.id === row.id)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true)
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.id !== row.id
                    })
                    // 取消后剩余选中的
                    this.selectData = finalArr
                    this.$refs.tableRef.toggleRowSelection(row, false)
                }
            }
        },

        /** 搜索按钮操作 */
        handleQuery() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.$refs.queryForm.resetFields()
            this.handleQuery()
        },
        confirmClick() {
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择单据')
                    return
                }
                const data = this.tableData.find(item => item.id === this.selectDataRow)
                this.$emit('confirm', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择单据')
                    return
                }
                this.$emit('confirm', this.selectData)
            }
            this.openDataScope = false
        },
        dbClick(row) {
            if (!this.singleMode) {
                const flag = this.saleOrderDetails.some(item => item.id === row.id)
                if (flag) {
                    this.$message.warning('此条数据已经添加')
                    return
                }
            }
            this.$emit('confirm', this.singleMode ? row : [row])
            this.openDataScope = false
        },
        emitAblFilter() {
            this.getList()
        }
    }
}
</script>

<style lang="scss" scoped>
.app-container {
    height: 100%;

    .container_flex_overflow {
        width: 210px;
    }
}
</style>
