<template>
    <Dialog :title="title" class="max-height-dialog flex-dialog" :visible.sync="openDataScope" tabindex="1"
        :close-on-click-modal="false" width="80%" append-to-body @close="handleClose()">
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
                    <el-form :model="formData" ref="queryForm" label-width="100px">
                        <el-col :span="6">
                            <el-form-item label="核算组织" prop="accountingOrgName" class="border-radius50">
                                <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
                                    :fieldData="{ fieldCode: 'accountingOrgName', fieldName: '核算组织' }" z-index="99999" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="期间名称" prop="name" class="border-radius50">
                                <el-input v-model="formData.name" placeholder="请输入期间名称" clearable
                                    @keyup.enter.native="handleQuery" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="期间号" prop="no" class="border-radius50">
                                <el-input v-model="formData.no" placeholder="请输入期间号" clearable
                                    @keyup.enter.native="handleQuery" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="期间开始日期" prop="startDate" class="border-radius50">
                                <el-date-picker v-model="formData.startDate" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss"
                                    range-separator="-" style="width:217px !important"></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="期间结束日期" prop="endDate" class="border-radius50">
                                <el-date-picker v-model="formData.endDate" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss"
                                    range-separator="-" style="width:217px !important"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-form>
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
                        <el-table-column label="核算组织" prop="accountingOrgName" key="accountingOrgName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="期间编码" prop="code" key="code" :show-overflow-tooltip="true" align="left"
                            min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { id: row.id, refName: 'accountantCycleOperate' })">{{
                                        row.code }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="期间名称" prop="name" key="name" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150" />

                        <el-table-column label="期间类型" prop="type" key="type" sortable="custom" align="left"
                            :filters="[]"
                            :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'dict', fieldFormatArr: dict.type.DURING, fieldFormat: '' })"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.type | orderTypeFilter(dict.type.DURING) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="期间号" prop="no" key="no" sortable="custom" align="left" :filters="[]"
                            :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="期间开始日期" prop="startDate" key="startDate" sortable="custom"
                            align="center" :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ parseTime(row.startDate) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="期间结束日期" prop="endDate" key="endDate" sortable="custom" align="center"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ parseTime(row.endDate) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="创建人" prop="createUserName" key="createUserName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150">
                        </el-table-column>
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
import { getList } from '@/api/calculateManagement/accounting'
import FormUnitId from '@/views/components/form-unitId'
export default {
    mixins: [indexMixin, inMixin],
    dicts: ['DURING'],
    components: {
        FormUnitId,
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
            title: '期间选择',
            openDataScope: false,
            treeLoading: false,
            loading: false,
            formData: {
                accountingOrgId: '',
                accountingOrgName: '',
                name: '',
                no: '',
                startDate: null,
                endDate: null
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
        init(accountingPeriodOrgId = '', accountingPeriodOrgName = '', id = null, saleOrderDetails = [], matlCodeArr = []) {
            this.formData.accountingOrgId = accountingPeriodOrgId;
            this.formData.accountingOrgName = accountingPeriodOrgName;
            this.selectData = []
            this.saleOrderDetails = []
            this.selectDataRow = null
            this.openDataScope = true
            this.matlCodeArr = matlCodeArr
            this.selected = matlCodeArr
            this.$nextTick(() => {
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
            const params = Object.assign({}, this.listQuery, this.formData, this.propsFormData)
            if (params.startDate) {
                params.startDateStart = params.startDate[0]
                params.startDateEnd = params.startDate[1]
            }
            if (params.endDate) {
                params.endDateStart = params.endDate[0]
                params.endDateEnd = params.endDate[1]
            }
            delete params.startDate
            delete params.endDate
            getList(params).then(({ data }) => {
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
            this.formData.accountingOrgId = ''
            this.$refs.queryForm.resetFields()
            this.handleQuery()
        },
        confirmClick() {
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择期间')
                    return
                }
                const data = this.tableData.find(item => item.id === this.selectDataRow)
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
        },
        handleClose() {
            this.formData = this.$options.data().formData;
            this.openDataScope = false
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
