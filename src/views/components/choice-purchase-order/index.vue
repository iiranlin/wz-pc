<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="采购订单" :visible.sync="visible"
        :close-on-click-modal="false" width="1300px" append-to-body>
        <div slot="title" class="el-dialog__title">
            采购订单
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-suffix="：" label-width="110px">
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-form-item label="采购单号" prop="purCode" class="border-radius50">
                        <el-input v-model="formData.purCode" placeholder="请输入采购单号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="采购名称" prop="purName" class="border-radius50">
                        <el-input v-model="formData.purName" placeholder="请输入采购名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="所属组织" prop="unitName" class="border-radius50">
                        <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
                            :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="创建方式" prop="sourceType" class="border-radius50">
                        <el-select v-model="formData.sourceType" placeholder="请选择创建方式" clearable>
                            <el-option v-for="item in dict.type.purOrderSourceType" :key="item.value"
                                :label="item.label" :value="item.value" @keyup.enter.native="searchData" />
                        </el-select>
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
                    <el-form-item label="合同编码" prop="ctCode" class="border-radius50">
                        <el-input v-model="formData.ctCode" placeholder="请输入合同编码" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="合同名称" prop="ctName" class="border-radius50">
                        <el-input v-model="formData.ctName" placeholder="请输入合同名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="供应商编码" prop="suCode" class="border-radius50">
                        <el-input v-model="formData.suCode" placeholder="请输入供应商编码" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="供应商名称" prop="suName" class="border-radius50">
                        <el-input v-model="formData.suName" placeholder="请输入供应商名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="采购方式" prop="purType" class="border-radius50">
                        <el-select v-model="formData.purType" placeholder="请选择采购方式" clearable>
                            <el-option v-for="item in dict.type.purchaseMode" :key="item.value" :label="item.label"
                                :value="item.value" @keyup.enter.native="searchData" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="采购负责人" prop="purUserName" class="border-radius50">
                        <el-input v-model="formData.purUserName" placeholder="请输入采购负责人" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="创建日期" prop="createDate" class="border-radius50">
                        <el-date-picker v-model="formData.createDate" style="width: 100%;" type="daterange"
                            range-separator="-" start-placeholder="起始" end-placeholder="截止" value-format="yyyy-MM-dd">
                        </el-date-picker>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <div class="table-wrapper">
            <el-table ref="tableRef" :row-style="changeDisabled" row-key="id" :data="tableData" border height="100%"
                v-loading="loading" @row-click="rowClick" @row-dblclick="dbClick" @selection-change="handleSelect">
                <el-table-column fixed="left" v-if="singleMode" align="center" width="50" key="radio">
                    <template v-slot="{ row }">
                        <el-radio :value="selectDataRow" :label="row.id" class="table-radio"
                            @click="rowClick(row)"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column v-else fixed="left" align="center" :selectable="isSelectable" key="selectable"
                    type="selection" width="50" />
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />

                <el-table-column prop="purCode" label="采购单号" align="left" show-overflow-tooltip min-width="170" />
                <el-table-column prop="sourceType" label="创建方式" align="left" show-overflow-tooltip min-width="170">
                    <template slot-scope="{row}">
                        <span>{{ row.sourceType | orderTypeFilter(dict.type.purOrderSourceType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="审批状态" align="center" show-overflow-tooltip min-width="170">
                    <template slot-scope="{row}">
                        <span>{{ row.status | orderTypeFilter(dict.type.flowStatus) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                                row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="purNum" label="本次采购数量" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="ctCode" label="合同编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.ctId, refName: 'contractManagementOperate' })">{{
                                row.ctCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="ctName" label="合同名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                                row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="suCode" label="供应商编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.suId, refName: 'supplierOperate' })">{{
                                row.suCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="suName" label="供应商名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="purType" label="采购方式" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.purType | orderTypeFilter(dict.type.purchaseMode) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="purUserName" label="采购负责人" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="createDate" label="创建日期" align="center" show-overflow-tooltip min-width="130">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.createDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>

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
import { OrderRawList } from '@/api/prodmgr-pu/order'
export default {
    mixins: [indexMixin],
    dicts: ['MeasureUnit', 'purchaseMode', 'purOrderSourceType', 'flowStatus'],
    components: {
        FormUnitId: () => import('@/views/components/form-unitId'),
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        propsFormData: {
            type: Object,
            default: {}
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
                purCode: '',
                purName: '',
                unitName: '',
                sourceType: undefined,
                matlCode: '',
                matlName: '',
                matlType: '',
                projectCode: '',
                projectName: '',
                ctCode: '',
                ctName: '',
                suCode: '',
                suName: '',
                purType: undefined,
                purUserName: '',
                createDate: []
            },
            loading: false,
            tableData: [],
            total: 0,
            selectData: [],
            selected: []

        }
    },
    methods: {
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => `${item.batchNo}-${item.sourceDetailId}`)
            return idList.includes(`${row.batchNo}-${row.sourceDetailId}`) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {
            const idList = this.selected.map((item) => `${item.batchNo}-${item.sourceDetailId}`)
            return !idList.includes(`${row.batchNo}-${row.sourceDetailId}`)
        },
        init(arr = []) {
            this.visible = true;
            this.selected = arr
            this.selectDataRow = null
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
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择数据')
                    return
                }
                const data = this.tableData.find(item => item.id === this.selectDataRow)
                this.$emit('selections', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择数据')
                    return
                }
                this.$emit('selections', this.selectData)
            }

            this.visible = false
        },
        // 物资列表双击添加到BOM清单
        dbClick(row) {
            if (this.singleMode) {
                this.$emit('selections', row)
            } else {
                const flag = this.selected.some(item => item.sourceDetailId === row.sourceDetailId)
                if (flag) {
                    this.$message.warning('此条数据已经添加')
                    return
                }
                this.$emit('selections', [row])
            }

            this.visible = false
        },
        rowClick(row) {
            if (this.singleMode) {
                this.selectDataRow = row.id
            } else {
                // 多选选中行
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
            this.loading = true
            this.formData.createDateStart = this.formData.createDate[0] || '';
            this.formData.createDateEnd = this.formData.createDate[1] || '';
            OrderRawList(Object.assign({}, this.formData, this.listQuery)).then(({ data }) => {
                this.tableData = data?.list || []
                this.total = data?.total || 0
            }).finally(() => {
                this.loading = false
            })
        },
        // 重置物资列表查询
        resetSearch() {
            this.$refs.elForm.resetFields()
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