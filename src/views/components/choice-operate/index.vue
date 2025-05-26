<template>
    <Dialog :title="title" class="flex-dialog max-height-dialog" :visible.sync="openDataScope" tabindex="1"
        :close-on-click-modal="false" width="1350px" append-to-body>
        <div slot="title" class="el-dialog__title">
            {{ title }}
            <div class="flex-dialog-button">
                <el-col :span="4" style="text-align: right">
                </el-col>
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
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
                    <el-form ref="elForm" :model="formData" label-width="100px">
                        <el-row>
                            <el-col :span="6">
                                <el-form-item label="所属组织" v-if="propsFormData.unitId" prop="unitName">
                                    <el-input class="border-radius50" v-model="formData.unitName" placeholder="请输入所属组织"
                                        clearable @keyup.enter.native="searchData" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="需求计划单号" prop="demandCode" class="border-radius50">
                                    <el-input v-model="formData.demandCode" placeholder="请输入需求计划单号" clearable
                                        @keyup.enter.native="searchData" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="需求计划名称" prop="demandName" class="border-radius50">
                                    <el-input v-model="formData.demandName" placeholder="请输入需求计划名称" clearable
                                        @keyup.enter.native="searchData" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="需求来源" prop="demandSource" class="border-radius50">
                                    <el-select v-model="formData.demandSource" clearable>
                                        <el-option v-for="(item, key) in dict.type.needPanSource" :key="key"
                                            :label="item.label" :value="item.value" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="需求用途" prop="demandPurpose" class="border-radius50">
                                    <el-select v-model="formData.demandPurpose" clearable>
                                        <el-option v-for="(item, key) in dict.type.needPanFor" :key="key"
                                            :label="item.label" :value="item.value" />
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
                                        @keyup.enter.native="getList" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="规格型号" prop="matlType" class="border-radius50">
                                    <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                                        @keyup.enter.native="getList" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                    <el-table style="margin-top: 20px" ref="tableRef" class="container_table" v-loading="loading" border
                        row-key="id" v-if="openDataScope" :data="dataList" height="100%" @row-click="rowClick"
                        :row-style="changeDisabled" @row-dblclick="dbClick" @selection-change="handleSelect">
                        <el-table-column fixed="left" align="center" width="50" v-if="singleMode" key="radio">
                            <template v-slot="{ row }">
                                <el-radio v-model="selectDataRow" :label="row.id" class="table-radio"></el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column v-else fixed="left" align="center" :selectable="isSelectable" key="selectable"
                            :reserve-selection="true" type="selection" width="50" />
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
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="需求来源" prop="demandSource" key="demandSource" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.demandSource | orderTypeFilter(dict.type.needPanSource) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="需求用途" prop="demandPurpose" key="demandPurpose" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.demandPurpose | orderTypeFilter(dict.type.needPanFor) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="需求数量" prop="demandNum" key="demandNum" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="已使用数量" prop="purPlanQuoteNum" key="purPlanQuoteNum" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="可支配数量" key="useNum1" align="left" :show-overflow-tooltip="true"
                            min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.demandNum - row.purPlanQuoteNum }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="需求日期" prop="demandDate" key="demandDate" align="center"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ parseTime(row.demandDate, '{y}-{m}-{d}') }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column v-if="propsFormData.unitId" prop="unitName" label="所属组织" align="left"
                            show-overflow-tooltip min-width="150" />
                        <el-table-column label="需求计划单号" prop="demandCode" key="demandCode" align="left"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { id: row.demandId, refName: 'requirementPlanMaintenanceOperate' })">{{
                                        row.demandCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="需求计划行号" prop="rowNum" key="rowNum" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="需求计划名称" prop="demandName" key="demandName" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="项目编码" prop="projectCode" key="projectCode" align="left"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                                        row.projectCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="项目名称" prop="projectName" key="projectName" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                    </el-table>
                    <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                        @pagination="getList" />
                </el-col>
            </el-row>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="choiceMaterialClick" v-preventReClick>确 定
            </el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import { classTree } from '@/api/prodmgr-mm/matlClass'
import { NeedPlanRawAllList } from '@/api/prodmgr-pu/NeedPlan'
import indexMixin from '@/views/mixins'

export default {
    dicts: ['needPanSource', 'needPanFor', 'MeasureUnit'],
    mixins: [indexMixin],
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
        },
        projectEqually: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            dialogParam: {},
            title: '选择运营需求',
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
                demandCode: '',
                demandName: '',
                demandSource: '',
                demandPurpose: '',
                projectCode: '',
                projectName: '',
                unitName: ''
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
            needPanRawIdArr: [],
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
        init(id = null, saleOrderDetails = [], needPanRawIdArr = []) {

            this.selectData = []
            this.saleOrderDetails = []
            this.selectDataRow = null
            this.openDataScope = true
            this.needPanRawIdArr = needPanRawIdArr
            this.selected = saleOrderDetails
            this.$nextTick(() => {
                this.$refs.elForm.resetFields()
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
            NeedPlanRawAllList(Object.assign({}, this.listQuery, this.formData, this.propsFormData)).then(({ data }) => {
                this.dataList = data.list || []
                this.total = data.total || 0
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
                if (this.needPanRawIdArr.includes(row.id)) {
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
            this.handleQuery()
        },
        choiceMaterialClick() {
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择需求')
                    return
                }
                const data = this.dataList.find(item => item.id === this.selectDataRow)
                this.$emit('choiceOperateClick', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择需求')
                    return
                }
                let projectTrue = false
                if (this.projectEqually) {
                    let arr = JSON.parse(JSON.stringify(this.saleOrderDetails))
                    arr.push(...this.selectData)
                    const projectId = arr[0].projectId
                    arr.forEach(item => {
                        if (item.projectId != projectId) {
                            projectTrue = true
                        }
                    });
                }
                if (projectTrue) {
                    this.$message.warning('请选择相同项目的数据')
                    return
                }
                this.$emit('choiceOperateClick', this.selectData)
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
                let projectTrue = false
                if (this.projectEqually) {
                    let arr = JSON.parse(JSON.stringify(this.saleOrderDetails))
                    arr.push(row)
                    const projectId = arr[0].projectId
                    arr.forEach(item => {
                        if (item.projectId != projectId) {
                            projectTrue = true
                        }
                    });
                }
                if (projectTrue) {
                    this.$message.warning('请选择相同项目的数据')
                    return
                }
            }
            this.$emit('choiceOperateClick', this.singleMode ? row : [row])
            this.openDataScope = false
        },
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        // 重置物资列表查询
        resetSearch() {
            this.$refs.elForm.resetFields()
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
