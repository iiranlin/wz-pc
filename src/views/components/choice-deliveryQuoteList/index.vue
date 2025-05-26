<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择订单" :visible.sync="visible"
        :close-on-click-modal="false" width="1300px">
        <div slot="title" class="el-dialog__title">
            选择订单
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
                            <el-form-item label="所属组织" prop="unitName" class="border-radius50">
                                    <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData" :fieldData="{fieldCode: 'unitName', fieldName: '所属组织'}" :appendToBody="false" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="订单单号" prop="saleOrderCode" class="border-radius50">
                                <el-input v-model="formData.saleOrderCode" placeholder="请输入订单单号" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="订单名称" prop="saleOrderName" class="border-radius50">
                                <el-input v-model="formData.saleOrderName" placeholder="请输入订单名称" clearable
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
                                <el-input v-model="formData.projectName" placeholder="请选择项目名称" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
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
                            <el-form-item label="销售部门" prop="saleDeptName" class="border-radius50">
                                <el-input v-model="formData.saleDeptName" placeholder="请输入销售部门" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="销售负责人" prop="saleName" class="border-radius50">
                                <el-input v-model="formData.saleName" placeholder="请输入销售负责人" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </el-form>

        <div class="table-wrapper" v-if="visible">
            <el-table ref="tableRef" :data="dataList" border height="100%" row-key="saleOrderDetailId"
                v-loading="loading" @row-click="rowClick" @row-dblclick="dbClick" :row-style="changeDisabled"
                @selection-change="handleSelect" @sort-change="sortableColumnChange">
                <el-table-column fixed="left" align="center" :selectable="isSelectable" :reserve-selection="true"
                    key="selectable" type="selection" width="50" />
                <el-table-column label="序号" align="center" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="saleOrderCode" label="订单单号" sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                    align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.saleOrderId, refName: 'saleOrderOperate' })">{{
                            row.saleOrderCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="saleOrderName" label="订单名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="saleOrderRowNum" label="订单行号" align="left" show-overflow-tooltip
                    min-width="150" />
                <el-table-column prop="matlCode" label=" 物料编码" align="left" sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                    show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlType" label="规格型号" sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                    align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="saleOrderNum" label="需求数量" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="requiredDate" label="需求日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        {{ parseTime(row.requiredDate, '{y}-{m}-{d}') }}
                    </template>
                </el-table-column>
                <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                            row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="ctCode" label="合同编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.ctId, refName: 'contractManagementOperate' })">{{
                            row.ctCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="ctName" label="合同名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="cuCode" label="客户编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                            row.cuCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="cuName" label="客户名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="saleDeptName" label="销售部门" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="saleName" label="销售负责人" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="createDate" label="单据日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        {{ parseTime(row.createDate, '{y}-{m}-{d}') }}
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
import inMixin from '@/views/components/mixins'
import { deliveryQuoteList } from '@/api/saleManage/saleOrder'
import FormUnitId from '@/views/components/form-unitId'
export default {
    mixins: [indexMixin, inMixin],
    dicts: ['MeasureUnit'],
    components: {
        FormUnitId,
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        propsFormData: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    data() {
        return {
            dialogParam: {},
            visible: false,
            formData: {
                saleOrderCode: '',
                saleOrderName: '',
                projectCode: '',
                projectName: "",
                unitName: '',
                saleName:"",
                saleDeptName: '',
                ctName: '',
                ctCode: '',
                cuName: '',
                cuCode: ''
            },
            loading: false,
            tableData: [],
            total: 0,
            selectData: [],
            saleOrderDetails: [],
            selected: []
        }
    },
    methods: {
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item.saleOrderDetailId)
            return idList.includes(row.saleOrderDetailId) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {
            const idList = this.selected.map((item) => item.saleOrderDetailId)
            return !idList.includes(row.saleOrderDetailId)
        },
        init(saleOrderDetails = []) {
            this.visible = true;
            this.selectData = [];
            this.saleOrderDetails = saleOrderDetails;
            this.selected = saleOrderDetails

            this.$nextTick(() => {
                this.$refs.elForm.resetFields()
                this.tableData = []
                this.listQuery.pageNum = 1
                this.listQuery.pageSize = 30
                this.getList()
            })
        },
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        // 保存选择
        saveSelection() {
            if (!this.selectData.length) {
                this.$message.warning('请选择订单')
                return
            }
            const saleOrderId = this.saleOrderDetails.length ? this.saleOrderDetails[0].saleOrderId : this.selectData[0].saleOrderId;
            const flag = this.selectData.some(item => item.saleOrderId != saleOrderId)
            if (flag) {
                this.$message.warning('只能选同一个主单的数据')
                return
            }
            this.$emit('selections', this.selectData)
            this.visible = false
        },
        handleSelect(selectData) {
            this.selectData = selectData
        },
        // 物资列表双击添加到BOM清单
        dbClick(row) {
            const flag = this.saleOrderDetails.some(item => item.saleOrderDetailId === row.saleOrderDetailId)
            if (flag) {
                this.$message.warning('此条数据已经添加')
                return
            }
            if (this.saleOrderDetails.length && row.saleOrderId != this.saleOrderDetails[0].saleOrderId) {
                this.$message.warning('只能选同一个主单的数据')
                return
            }
            this.$emit('selections', [row])
            this.visible = false
        },
        rowClick(row) {
            const idList = this.saleOrderDetails.map((item) => item.saleOrderDetailId)
            if (idList.includes(row.saleOrderDetailId)) {
                return
            }
            // 多选选中行
            // 根据id判断当前点击的是否被选中
            const selected = this.selectData.some(item => item.saleOrderDetailId === row.saleOrderDetailId)
            if (!selected) {
                // 选择
                this.selectData.push(row)
                this.$refs.tableRef.toggleRowSelection(row, true)
            } else {
                // 取消
                var finalArr = this.selectData.filter((item) => {
                    return item.saleOrderDetailId !== row.saleOrderDetailId
                })
                // 取消后剩余选中的
                this.selectData = finalArr
                this.$refs.tableRef.toggleRowSelection(row, false)
            }
        },
        // 查询供应商
        getList() {
            this.loading = true
            deliveryQuoteList(Object.assign({}, this.formData, this.listQuery, this.propsFormData)).then(({ data }) => {
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
