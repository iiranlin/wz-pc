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
        <el-form :model="formData" ref="queryForm" label-width="120px">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="所属组织" prop="unitName" class="border-radius50">
                        <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
                            :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">

                    <el-form-item label="制损单号" prop="damageCode" class="border-radius50">
                        <el-input v-model="formData.damageCode" placeholder="请输入制损单号" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
                        <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="物料名称" prop="matlName" class="border-radius50">
                        <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="规格型号" prop="matlType" class="border-radius50">
                        <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="来源生产单号" prop="orderRawCode" class="border-radius50">
                        <el-input v-model="formData.orderRawCode" placeholder="请输入来源生产单号" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="来源退料单号" prop="returnCode" class="border-radius50">
                        <el-input v-model="formData.returnCode" placeholder="请输入来源退料单号" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="来源质检单号" prop="qiCode" class="border-radius50">
                        <el-input v-model="formData.qiCode" placeholder="请输入来源质检单号" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">

                    <el-form-item label="来源项目名称" prop="projectName" class="border-radius50">
                        <el-input v-model="formData.projectName" placeholder="请输入来源项目名称" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="创建日期" prop="createDate">
                        <el-date-picker v-model="formData.createDate" type="daterange" value-format="yyyy-MM-dd"
                            range-separator="-" style="width:100% !important"></el-date-picker>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" v-loading="loading" border row-key="id" v-if="openDataScope" :data="dataList"
                height="100%" @row-click="rowClick" @sort-change="sortableColumnChange" @row-dblclick="dbClick"
                @selection-change="handleSelect" :row-style="changeDisabled">
                <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.id" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column v-else align="center" :selectable="isSelectable" key="selectable"
                    :reserve-selection="true" type="selection" width="50" />
                <el-table-column v-if="propsFormData.unitId" prop="unitName" label="所属组织" align="left"
                    show-overflow-tooltip min-width="150" />
                <el-table-column label="制损单号" prop="damageCode" key="damageCode" sortable="custom" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.id, refName: 'productionDamageOperate' })">{{
                                row.damageCode }}</el-button>
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
                <el-table-column label="规格型号" prop="matlType" key="matlType" sortable="custom" align="left"
                    :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" sortable="custom" align="left"
                    :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'dict', fieldFormatArr: dict.type.MeasureUnit, fieldFormat: '' })"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="来源生产单号" prop="orderRawCode" key="orderRawCode" :show-overflow-tooltip="true"
                    align="left" min-width="200">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.orderRawId, refName: 'productionOrderOperate' })">{{
                                row.orderRawCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="来源退料单号" prop="returnCode" key="returnCode" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.returnId, refName: 'productionRejectedOperate' })">{{
                                row.returnCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="来源退料单行号" prop="returnRowNum" key="returnRowNum" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                </el-table-column>
                <el-table-column label="来源质检单号" prop="qiCode" key="qiCode" :show-overflow-tooltip="true" align="left"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.qiId, refName: 'qualityTestingOperate' })">{{
                                row.qiCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="来源质检单行号" prop="qiRowNum" key="qiRowNum" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                </el-table-column>
                <el-table-column label="来源项目编码" prop="projectId" key="projectId" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                                row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="来源项目名称" prop="projectName" key="projectName" :show-overflow-tooltip="true"
                    align="left" min-width="150">
                </el-table-column>
                <el-table-column label="创建日期" prop="createDate" key="createDate" :show-overflow-tooltip="true"
                    align="center" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.createDate) }}</span>
                    </template>
                </el-table-column>
            </el-table>

        </div>
        <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <div slot="footer">
            <el-button plain round type="primary" @click="confirm" v-preventReClick>确 定</el-button>
            <el-button plain round @click="openDataScope = false">取 消</el-button>
        </div>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { purPlanQuoteList } from '@/api/projectManagement/productionDamage'
export default {
    mixins: [indexMixin, inMixin],
    dicts: ['MeasureUnit', 'planAttribute'],
    components: {
        FormUnitId: () => import('@/views/components/form-unitId'),
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        propsFormData: {
            type: Object,
            default: () => {
                return {}
            }
        },
        singleMode: {
            type: Boolean,
            required: false,
            default: false
        },
    },
    data() {
        return {
            title: '选择制损单',
            openDataScope: false,
            loading: false,
            formData: {
                matlCode: '',
                matlName: '',
                matlType: '',
                damageCode: '',
                createDate: [],
                projectName: '',
                qiCode: '',
                returnCode: '',
                orderRawCode: '',
                unitName: ''
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
            selected: []
        }
    },
    mounted() {
    },
    methods: {
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

        init(id = null, saleOrderDetails = []) {
            this.selectData = []
            this.saleOrderDetails = []
            this.selectDataRow = null
            this.openDataScope = true
            this.selected = [...saleOrderDetails]
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
            const createDate = this.formData.createDate || []
            const timeObj = {}
            if (!!createDate.length) {
                timeObj.createDateStart = createDate[0]
                timeObj.createDateEnd = createDate[1]
            }
            purPlanQuoteList(Object.assign({}, this.listQuery, this.formData, timeObj, this.propsFormData)).then(({ data }) => {
                this.tableData = data.list
                this.dataList = data.list
                this.total = data.total
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
                const idList = this.selected.map((item) => item.id)
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
        confirm() {
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择物料')
                    return
                }
                const data = this.tableData.find(item => item.id === this.selectDataRow)
                this.$emit('change', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择物料')
                    return
                }
                this.$emit('change', this.selectData)
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
            this.$emit('change', this.singleMode ? row : [row])
            this.openDataScope = false
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
