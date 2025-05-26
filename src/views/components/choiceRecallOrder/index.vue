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
        <div class="app-container">
            <el-row type="flex" :gutter="20" class="container_h">
                <!--部门数据-->
                <el-col :span="20" :xs="24" class="container_flex">
                    <el-form :model="formData" ref="queryForm" label-width="110px" :inline="true">
                        <el-form-item label="调拨类型" prop="isExternal" class="border-radius50">

                            <el-select v-model="formData.isExternal" clearable style="width:100%">
                                <el-option v-for="(item, key) in dict.type.allocationType" :key="key"
                                    :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="调出单号" prop="allocateCode" class="border-radius50">
                            <el-input v-model="formData.allocateCode" placeholder="请输入调出单号" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
                            <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="物料名称" prop="matlName" class="border-radius50">
                            <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="规格型号" prop="matlType" class="border-radius50">
                            <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="调出组织" prop="outUnitName" class="border-radius50">
                            <el-input v-model="formData.outUnitName" placeholder="请输入调出组织" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="调出项目编码" prop="outProjectCode" class="border-radius50">
                            <el-input v-model="formData.outProjectCode" placeholder="请输入调出项目编码" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="调出项目名称" prop="outProjectName" class="border-radius50">
                            <el-input v-model="formData.outProjectName" placeholder="请输入调出项目名称" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="调出仓库" prop="outWarehouseName" class="border-radius50">
                            <el-input v-model="formData.outWarehouseName" placeholder="请输入调出仓库" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="调入组织" prop="inUnitName" class="border-radius50">
                            <el-input v-model="formData.inUnitName" placeholder="请输入调入组织" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="调入项目编码" prop="inProjectCode" class="border-radius50">
                            <el-input v-model="formData.inProjectCode" placeholder="请输入调入项目编码" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="调入项目名称" prop="inProjectName" class="border-radius50">
                            <el-input v-model="formData.inProjectName" placeholder="请输入调入项目名称" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="调入仓库" prop="inWarehouseName" class="border-radius50">
                            <el-input v-model="formData.inWarehouseName" placeholder="请输入调入仓库" clearable
                                @keyup.enter.native="handleQuery" />
                        </el-form-item>
                        <el-form-item label="创建日期" prop="createDate" class="border-radius50">
                            <el-date-picker v-model="formData.createDate" type="daterange" value-format="yyyy-MM-dd"
                                range-separator="-" style="width:200px !important"></el-date-picker>
                        </el-form-item>
                    </el-form>
                    <el-table ref="tableRef" class="container_table" v-loading="loading" border row-key="allocateCode"
                        v-if="openDataScope" :data="dataList" height="100%" @row-click="rowClick"
                        @sort-change="sortableColumnChange" @row-dblclick="dbClick" @selection-change="handleSelect"
                        :row-style="changeDisabled">
                        <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                            <template v-slot="{ row }">
                                <el-radio v-model="selectDataRow" :label="row.allocateCode"
                                    class="table-radio"></el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column v-else align="center" :selectable="isSelectable" key="selectable"
                            :reserve-selection="true" type="selection" width="50" />
                        <el-table-column label="调拨类型" prop="isExternal" key="isExternal" sortable="custom" align="left"
                            min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.isExternal | orderTypeFilter(dict.type.allocationType) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="调出单号" prop="allocateCode" key="allocateCode"
                            :show-overflow-tooltip="true" align="left" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { id: row.allocateId, refName: 'createTransferOutOrder' })">{{
                                        row.allocateCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="调出组织" prop="outUnitName" key="outUnitName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="调出项目编码" prop="outProjectCode" key="outProjectCode"
                            :show-overflow-tooltip="true" align="left" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { id: row.outProjectId, refName: 'projectManagementOperate' })">{{
                                        row.outProjectCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="调出项目名称" prop="outProjectName" key="outProjectName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="调出仓库" prop="outWarehouseName" key="outWarehouseName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="调入组织" prop="inUnitName" key="inUnitName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="调入项目编码" prop="inProjectCode" key="inProjectCode"
                            :show-overflow-tooltip="true" align="left" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { id: row.inProjectId, refName: 'projectManagementOperate' })">{{
                                        row.inProjectCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="调入项目名称" prop="inProjectName" key="inProjectName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="调入仓库" prop="inWarehouseName" key="inWarehouseName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
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
                        <el-table-column label="调拨数量" prop="allocateNum" key="allocateNum" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="创建日期" prop="createDate" key="createDate" sortable="custom"
                            align="center" :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ parseTime(row.createDate) }}</span>
                            </template>
                        </el-table-column>

                    </el-table>
                    <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                        @pagination="getList" />
                </el-col>
            </el-row>
        </div>
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
import { allocateOutOrderList } from '@/api/prodmgr-inv/allocate'

export default {
    mixins: [indexMixin, inMixin],
    dicts: ['MeasureUnit', 'allocationType'],
    components: {
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
            title: '调出单选择',
            openDataScope: false,
            treeLoading: false,
            loading: false,
            formData: {
                isExternal: '',
                allocateCode: '',
                matlCode: '',
                matlName: '',
                matlType: '',
                outUnitName: '',
                outProjectCode: '',
                outProjectName: '',
                outWarehouseName: '',
                inUnitName: '',
                inProjectCode: '',
                inProjectName: '',
                inWarehouseName: '',
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
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item.allocateCode)
            return idList.includes(row.allocateCode) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {

            const idList = this.selected.map((item) => item.allocateCode)
            return !idList.includes(row.allocateCode)
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
            allocateOutOrderList(Object.assign({}, this.listQuery, this.formData, this.propsFormData)).then(({ data }) => {
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
                this.selectDataRow = row.allocateCode
            } else {
                if (this.matlCodeArr.includes(row.allocateCode)) {
                    return false
                }
                const idList = this.saleOrderDetails.map((item) => item.allocateCode)
                if (idList.includes(row.allocateCode)) {
                    return
                }
                // 多选选中行
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.allocateCode === row.allocateCode)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true)
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.allocateCode !== row.allocateCode
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
                    this.$message.warning('请选择期间')
                    return
                }
                const data = this.tableData.find(item => item.allocateCode === this.selectDataRow)
                this.$emit('confirm', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择期间')
                    return
                }
                this.$emit('confirm', this.selectData)
            }
            this.openDataScope = false
        },
        dbClick(row) {
            if (!this.singleMode) {
                const flag = this.saleOrderDetails.some(item => item.allocateCode === row.allocateCode)
                if (flag) {
                    this.$message.warning('此条数据已经添加')
                    return
                }
            }
            this.$emit('choiceMaterialClick', this.singleMode ? row : [row])
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
