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
            <el-form :model="formData" ref="queryForm" label-width="120px">
                <el-col :span="6">
                    <el-form-item label="生产单号" prop="orderRawCode" class="border-radius50">
                        <el-input v-model="formData.orderRawCode" placeholder="请输入生产单号" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="产品编码" prop="matlCode" class="border-radius50">
                        <el-input v-model="formData.matlCode" placeholder="请输入产品编码" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="产品名称" prop="matlName" class="border-radius50">
                        <el-input v-model="formData.matlName" placeholder="请输入产品名称" clearable
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
                    <el-form-item label="项目名称" prop="sourceProjectName" class="border-radius50">
                        <el-input v-model="formData.sourceProjectName" placeholder="请输入项目名称" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="客户名称" prop="cuName" class="border-radius50">
                        <el-input v-model="formData.cuName" placeholder="请输入客户名称" clearable
                            @keyup.enter.native="handleQuery" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="领料状态" prop="pickingStatus" class="border-radius50">
                        <el-select v-model="formData.pickingStatus" clearable style="width:100%">
                            <el-option v-for="(item, key) in dict.type.PICKING" :key="key" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="生产状态" prop="bizStatus" class="border-radius50">
                        <el-select v-model="formData.bizStatus" clearable style="width:100%">
                            <el-option v-for="(item, key) in dict.type.FINASGH" :key="key" :label="item.label"
                                :value="item.value" />
                        </el-select> </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="产品入库状态" prop="inStatus" class="border-radius50">
                        <el-select v-model="formData.inStatus" clearable style="width:100%">
                            <el-option v-for="(item, key) in dict.type.orderInStatus" :key="key" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-form>
            <el-table ref="tableRef" :class="{ 'container_table': true, 'table-no-checkbox': singleMode }"
                v-loading="loading" border row-key="orderRawId" v-if="openDataScope" :data="dataList" height="100%"
                @row-click="rowClick" @row-dblclick="dbClick" :row-style="changeDisabled"
                @selection-change="handleSelect" :tree-props="{ children: 'children' }">
                <el-table-column align="center" type="selection" width="50" v-if="singleMode" key="radio" fixed="left">

                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.orderRawId" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column v-else align="center" :selectable="isSelectable" key="selectable" fixed="left"
                    :reserve-selection="true" type="selection" width="50" />
                <el-table-column label="序号" align="center" type="index" :index="tableIndex" width="60" fixed="left" />
                <el-table-column label="阶层" min-width="90" align="center" prop="mLevel" fixed="left" />
                <el-table-column label="所属组织" prop="unitName" key="unitName" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="生产编码" prop="orderCode" key="orderCode" :show-overflow-tooltip="true"
                    align="center" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.orderId, tableType: '1', refName: 'productionOrderOperate' })">{{
                                row.orderCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="生产名称" prop="orderName" key="orderName" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="生产单号" prop="orderRawCode" key="orderRawCode" align="left"
                    :show-overflow-tooltip="true" min-width="180">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.orderRawId, tableType: '2', refName: 'productionOrderOperate' })">{{
                                row.orderRawCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="领料状态" prop="pickingStatus" key="pickingStatus" align="center"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span :class="'pickingStatus-' + row.pickingStatus">{{ row.pickingStatus |
                            orderTypeFilter(dict.type.PICKING) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="生产状态" prop="bizStatus" key="bizStatus" align="center"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span :class="'scStatus-' + row.bizStatus">{{ row.bizStatus | orderTypeFilter(dict.type.FINASGH)
                        }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="产品入库状态" prop="inStatus" key="inStatus" align="center"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span :class="'inStatus-' + row.inStatus">{{ row.inStatus |
                            orderTypeFilter(dict.type.orderInStatus) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="产品编码" prop="matlCode" key="matlCode" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                                row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="产品名称" prop="matlName" key="matlName" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="规格型号" prop="matlType" key="matlType" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="是否成品" prop="isFinished" key="isFinished" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.isFinished | orderTypeFilter(dict.type.YesNo) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="预计生产数量" prop="planNum" key="planNum" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="实际生产数量" prop="finishNum" key="finishNum" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="合格数量" prop="qualifiedNum" key="qualifiedNum" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="不良数量" prop="unqualifiedNum" key="unqualifiedNum" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="返工数量" prop="reworkNum" key="reworkNum" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="生产完工率(%)" prop="completionRate" key="completionRate" align="left"
                    :show-overflow-tooltip="true" min-width="150" />
                <el-table-column label="已生成入库单数量(累计)" prop="inQuoteNum" key="inQuoteNum" align="left"
                    :show-overflow-tooltip="true" min-width="250" />
                <el-table-column label="BOM编码" prop="bomCode" key="bomCode" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'bomAdministrationOperate' })">{{
                                row.bomCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="BOM名称" prop="bomName" key="bomName" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="BOM版本" prop="bomVersion" key="bomVersion" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'BOMAdministrationOperate' })">{{
                                row.bomVersion }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="是否有工艺" prop="hasPath" key="hasPath" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.hasPath | orderTypeFilter(dict.type.YesNo) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="工艺编码" prop="pathCode" key="pathCode" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.pathId, refName: 'processRouteOperate' })">{{
                                row.pathCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="工艺名称" prop="pathName" key="pathName" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="工艺版本" prop="pathVersion" key="pathVersion" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.processId, refName: 'standardProcessCreate' })">{{
                                row.pathVersion }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="来源项目编码" prop="sourceProjectCode" key="sourceProjectCode" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceProjectId, refName: 'projectManagementOperate' })">{{
                                row.sourceProjectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="来源项目名称" prop="sourceProjectName" key="sourceProjectName" align="left"
                    :show-overflow-tooltip="true" min-width="150">

                </el-table-column>
                <el-table-column label="来源需求类型" prop="sourceType" key="sourceType" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.sourceType | orderTypeFilter(dict.type.demandPlanSourceType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="来源需求单号" prop="sourceCode" key="sourceCode" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: getRouteByDemandPlanSourceType(row.sourceType) })">{{
                                row.sourceCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="来源计划单号" prop="sourcePlanCode" key="sourcePlanCode" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourcePlanId, refName: 'demandPlanWorkbenchOperate' })">{{
                                row.sourcePlanCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="客户编码" prop="cuCode" key="cuCode" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                                row.cuCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="客户名称" prop="cuName" key="cuName" align="left" :show-overflow-tooltip="true"
                    min-width="150" />
                <el-table-column label="是否有完工报告" prop="hasReport" key="hasReport" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.hasReport | orderTypeFilter(dict.type.YesNo) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="完工报告单号" prop="reportCode" key="reportCode" align="center"
                    :show-overflow-tooltip="true" min-width="180">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { rawId: row.orderRawId, refName: 'productionOrderReport' })">{{
                                row.reportCode }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                @pagination="getList" />
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button plain round type="primary" @click="choiceClick" v-preventReClick>确 定</el-button>
            <el-button plain round @click="openDataScope = false">取 消</el-button>
        </div>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import { changeQuoteList } from '@/api/projectManagement/productionOrder'
import indexMixin from '@/views/mixins'
import { getRouteByDemandPlanSourceType } from '@/utils'
export default {
    mixins: [indexMixin],
    dicts: ['processType', 'YesNo', 'orderInStatus', 'PICKING', 'demandPlanSourceType', 'FINASGH', 'MeasureUnit'],
    components: {
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
            dialogParam: {},
            title: '选择生产单',
            openDataScope: false,
            loading: false,
            // 部门树选项
            formData: {
                orderRawCode: '',
                matlCode: '',
                matlName: '',
                matlType: '',
                sourceProjectName: '',
                cuName: '',
                pickingStatus: '',
                bizStatus: '',
                inStatus: ''
            },
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            dataList: [],
            treeCurrentKey: '',
            filterText: '',
            selectData: [],
            saleOrderDetails: [],
            selectDataRow: null,
            selected: []

        }
    },
    mounted() {
    },
    methods: {
        getRouteByDemandPlanSourceType: getRouteByDemandPlanSourceType,
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item.orderRawId)
            return idList.includes(row.orderRawId) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {
            const idList = this.selected.map((item) => item.orderRawId)
            return !idList.includes(row.orderRawId)
        },
        init(id = null, saleOrderDetails = []) {
            this.selectData = []
            this.saleOrderDetails = []
            this.selectDataRow = null
            this.openDataScope = true
            this.selected = saleOrderDetails
            this.formData = {
                orderRawCode: '',
                matlCode: '',
                matlName: '',
                matlType: '',
                sourceProjectName: '',
                cuName: '',
                pickingStatus: '',
                bizStatus: '',
                inStatus: ''
            }
            this.$nextTick(() => {
                this.$refs.queryForm.resetFields()
                if (this.singleMode) {
                    this.selectDataRow = id
                } else {
                    this.saleOrderDetails = saleOrderDetails
                }
            })
        },

        getList() {
            this.loading = true
            const param = Object.assign({ status: '3', }, this.listQuery, this.formData, this.propsFormData)

            changeQuoteList(param).then(({ data }) => {
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
                this.selectDataRow = row.orderRawId
            } else {
                const idList = this.saleOrderDetails.map((item) => item.orderRawId)
                if (idList.includes(row.orderRawId)) {
                    return
                }
                // 多选选中行
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.orderRawId === row.orderRawId)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true)
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.orderRawId !== row.orderRawId
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
        choiceClick() {
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择生产单')
                    return
                }
                const data = this.dataList.find(item => item.orderRawId === this.selectDataRow)
                this.$emit('confirm', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择生产单')
                    return
                }
                this.$emit('confirm', this.selectData)
            }
            this.openDataScope = false
        },
        dbClick(row) {
            if (!this.singleMode) {
                const flag = this.saleOrderDetails.some(item => item.orderRawId === row.orderRawId)
                if (flag) {
                    this.$message.warning('此条数据已经添加')
                    return
                }
            }
            this.$emit('confirm', this.singleMode ? row : [row])
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

    .form-item-flex-row {
        display: flex;
        flex-direction: row;
    }
}
</style>