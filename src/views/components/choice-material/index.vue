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
                <el-col :span="4" :xs="24" class="container_flex_overflow">
                    <div class="head-container">
                        <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                        </el-input>
                        <el-tree v-loading="treeLoading" node-key="id" class="drawer-tree" :indent="0"
                            :filter-node-method="filterNode" :data="deptOptions" :props="defaultProps"
                            :expand-on-click-node="false" ref="tree" :highlight-current="true"
                            @node-click="handleNodeClick" />
                    </div>
                </el-col>
                <el-col :span="20" :xs="24" class="container_flex">
                    <el-form :model="formData" ref="queryForm" label-width="90px" :inline="true">
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
                    </el-form>
                    <el-table ref="tableRef" class="container_table" v-loading="loading" border row-key="matlCode"
                        v-if="openDataScope" :data="dataList" height="100%" @row-click="rowClick"
                        @sort-change="sortableColumnChange" @row-dblclick="dbClick" @selection-change="handleSelect"
                        :row-style="changeDisabled">
                        <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                            <template v-slot="{ row }">
                                <el-radio v-model="selectDataRow" :label="row.matlCode" class="table-radio"></el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column v-else align="center" :selectable="isSelectable" key="selectable"
                            :reserve-selection="true" type="selection" width="50" />
                        <el-table-column align="center" label="序号" type="index" width="50">
                            <template slot-scope="{$index}">
                                {{ (listQuery.pageNum - 1) * listQuery.pageSize + ($index + 1) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="物料编码" prop="matlCode" key="matlCode" :show-overflow-tooltip="true"
                            align="center" min-width="150">
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
                        <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" sortable="custom" align="center"
                            :filters="[]"
                            :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'dict', fieldFormatArr: dict.type.MeasureUnit, fieldFormat: '' })"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.matlUnit }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column v-if="isLend" label="所属组织" prop="unitName" key="unitName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column v-if="isLend" label="库存合格数量" prop="inventoryNum" key="inventoryNum"
                            sortable="custom" align="right" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column v-if="isLend" label="项目编码" prop="projectCode" key="projectCode"
                            sortable="custom" align="center" :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                                        row.projectCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column v-if="isLend" label="项目名称" prop="projectName" key="projectName"
                            sortable="custom" align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column v-if="!isLend" label="计划属性" prop="planAttribute" key="planAttribute"
                            align="center" :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.bizParam.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                    <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                        @pagination="getList" />
                </el-col>
            </el-row>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button plain round type="primary" @click="choiceMaterialClick" v-preventReClick>确 定</el-button>
            <el-button plain round @click="openDataScope = false">取 消</el-button>
        </div>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import { classTree } from '@/api/prodmgr-mm/matlClass'
import { matlList, lendQuoteList, matlPurPlanQuoteList, matlInvInQuoteList } from '@/api/prodmgr-mm/matlMatl'
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'

export default {
    mixins: [indexMixin, inMixin],
    dicts: ['MeasureUnit', 'planAttribute'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        singleMode: {
            type: Boolean,
            required: false,
            default: false
        },
        isLend: {
            type: Boolean,
            required: false,
            default: false
        },
        isPurPlanQuote: {
            type: Boolean,
            required: false,
            default: false
        },
        propsFormData: {
            type: Object,
            default: null
        },
        isInventory: {
            type: Boolean,
            required: false,
            default: false
        },
    },
    data() {
        return {
            title: '物料选择',
            openDataScope: false,
            treeLoading: false,
            loading: false,
            // 部门树选项
            deptOptions: undefined,
            defaultProps: {
                children: 'children',
                label: 'matlClassifyName'
            },
            formData: {
                matlCode: '',
                matlName: '',
                matlType: '',
                bizStatus: '0',
                matlClassifyId: ''
            },
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            tableData: [],
            treeCurrentKey: '',
            filterText: '',
            selectData: [],
            saleOrderDetails: [],
            selectDataRow: null,
            matlCodeArr: [],
            selected: []
        }
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val)
        }
    },
    mounted() {
    },
    methods: {
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item.matlCode)
            return idList.includes(row.matlCode) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {

            const idList = this.selected.map((item) => item.matlCode)
            return !idList.includes(row.matlCode)
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
                this.classTree()
                this.getList()
            })
        },
        classTree() {
            this.treeLoading = true
            classTree().then(({ data }) => {
                this.deptOptions = data || []
            }).finally(() => {
                this.treeLoading = false
            })
        },
        getList() {
            this.loading = true
            let req = this.isLend ? lendQuoteList : matlList
            if (this.isPurPlanQuote) {
                req = matlPurPlanQuoteList
            } else if (this.isInventory) {
                req = matlInvInQuoteList
            }
            const params = Object.assign({}, this.listQuery, this.formData, this.propsFormData)
            req(params).then(({ data }) => {
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
                this.selectDataRow = row.matlCode
            } else {
                if (this.matlCodeArr.includes(row.matlCode)) {
                    return false
                }
                const idList = this.saleOrderDetails.map((item) => item.matlCode)
                if (idList.includes(row.matlCode)) {
                    return
                }
                // 多选选中行
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.matlCode === row.matlCode)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true)
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.matlCode !== row.matlCode
                    })
                    // 取消后剩余选中的
                    this.selectData = finalArr
                    this.$refs.tableRef.toggleRowSelection(row, false)
                }
            }
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (data.matlClassifyId === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.matlClassifyId = null
                this.$refs.tree.setCurrentKey(null)
                this.treeCurrentKey = ''
            } else {
                this.treeCurrentKey = data.matlClassifyId
                this.formData.matlClassifyId = data.matlClassifyId
            }
            this.getList()
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.$refs.tree.setCurrentKey(null)
            this.treeCurrentKey = ''
            this.formData.matlClassifyId = ''
            this.$refs.queryForm.resetFields()
            this.handleQuery()
        },
        choiceMaterialClick() {
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择物料')
                    return
                }
                const data = this.tableData.find(item => item.matlCode === this.selectDataRow)
                this.$emit('choiceMaterialClick', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择物料')
                    return
                }
                this.$emit('choiceMaterialClick', this.selectData)
            }
            this.openDataScope = false
        },
        dbClick(row) {
            if (!this.singleMode) {
                const flag = this.saleOrderDetails.some(item => item.matlCode === row.matlCode)
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
