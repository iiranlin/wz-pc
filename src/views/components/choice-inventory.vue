<template>
    <Dialog class="max-height-dialog flex-dialog" :visible.sync="openDataScope" tabindex="1"
        :close-on-click-modal="false" width="1500px" append-to-body>
        <div slot="title" class="el-dialog__title">
            {{ title }}
            <div class="flex-dialog-button">
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
                    <el-form ref="elForm" :model="formData" label-suffix="：" label-width="110px">
                        <el-row>
                            <el-col :span="24">
                                <el-row>
                                    <el-col :span="6">
                                        <el-form-item label="仓库" prop="warehouseName" class="border-radius50 form-item-b10">
                                            <el-input v-model="formData.warehouseName" placeholder="请输入仓库" clearable
                                                @keyup.enter.native="getList" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="所属组织" prop="unitName" class="border-radius50 form-item-b10">
                                            <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData" :fieldData="{fieldCode: 'unitName', fieldName: '所属组织'}" z-index="99999" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="项目编码" prop="projectCode" class="border-radius50 form-item-b10">
                                            <el-input v-model="formData.projectCode" placeholder="请输入项目编码" clearable
                                                @keyup.enter.native="getList" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="项目名称" prop="projectName" class="border-radius50 form-item-b10">
                                            <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable
                                                @keyup.enter.native="getList" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="物料编码" prop="matlCode" class="border-radius50 form-item-b10">
                                            <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable
                                                @keyup.enter.native="getList" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="物料名称" prop="matlName" class="border-radius50 form-item-b10">
                                            <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable
                                                @keyup.enter.native="getList" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="规格型号" prop="matlType" class="border-radius50 form-item-b10">
                                            <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                                                @keyup.enter.native="getList" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="货位编码" prop="placeCode" class="border-radius50 form-item-b10">
                                            <el-input v-model="formData.placeCode" placeholder="请输入货位编码" clearable
                                                @keyup.enter.native="getList" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="批次号" prop="batchNo" class="border-radius50 form-item-b10">
                                            <el-input v-model="formData.batchNo" placeholder="请输入批次号" clearable
                                                @keyup.enter.native="getList" />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="合格状态" prop="type" class="border-radius50 form-item-b10">
                                            <el-select v-model="formData.type" clearable style="width:100%">
                                                <el-option v-for="(item, key) in dict.type.inventoryType" :key="key"
                                                    :label="item.label" :value="item.value" />
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item label="效期状态" prop="expireStatus" class="border-radius50 form-item-b10">
                                            <el-select v-model="formData.expireStatus" clearable style="width:100%">
                                                <el-option v-for="(item, key) in dict.type.expireStatus" :key="key"
                                                    :label="item.label" :value="item.value" />
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </el-form>
                    <el-table style="margin-top: 0px" ref="tableRef" class="container_table" v-loading="loading" border
                        row-key="id" v-if="openDataScope" :data="dataList" height="100%" @row-click="rowClick"
                        @row-dblclick="dbClick" :row-style="changeDisabled" @selection-change="handleSelect">
                        <el-table-column fixed="left" align="center" width="50" v-if="singleMode" key="radio">
                            <template v-slot="{ row }">
                                <el-radio v-model="selectDataRow" :label="row.id" class="table-radio"></el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column v-else fixed="left" align="center" :selectable="isSelectable" key="selectable"
                            :reserve-selection="true" type="selection" width="50" />
                        <el-table-column label="地区" prop="areaName" key="areaName" :show-overflow-tooltip="true"
                            align="left" min-width="150" />
                        <el-table-column label="仓库" prop="warehouseName" key="warehouseName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="储区" prop="storageName" key="storageName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="货位" prop="placeName" key="placeName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="批次号" prop="batchNo" key="batchNo" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="所属组织" prop="unitName" key="unitName" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="项目编码" prop="projectCode" key="projectCode" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="项目名称" prop="projectName" key="projectName" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="物料编码" prop="matlCode" key="matlCode" align="left"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                                    row.matlCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="物料名称" prop="matlName" key="matlName" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="规格型号" prop="matlType" key="matlType" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" align="left"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="货位编码" prop="placeCode" key="placeCode" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="合格状态" prop="type" key="type" align="center"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.type | orderTypeFilter(dict.type.inventoryType) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="效期状态" prop="expireStatus" key="expireStatus" align="center"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.expireStatus | orderTypeFilter(dict.type.expireStatus) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="库存数量" prop="inventoryNum" key="inventoryNum" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="生产日期" prop="manufactureDate" key="manufactureDate" align="center"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ parseTime(row.manufactureDate, '{y}-{m}-{d}') }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="失效日期" prop="expireDate" key="expireDate" align="center"
                            :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ parseTime(row.expireDate, '{y}-{m}-{d}') }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="剩余有效期天数" prop="remainingDays" key="remainingDays" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                    </el-table>
                    <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                        @pagination="getList" />
                </el-col>
            </el-row>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button plain round type="primary" @click="choiceMaterialClick" v-preventReClick>确 定
            </el-button>
            <el-button plain round @click="openDataScope = false">取 消</el-button>
        </div>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
import { classTree } from '@/api/prodmgr-mm/matlClass'
import { getInventoryList, getRefundQuoteList } from '@/api/warehouseManage/inventoryManage'
import FormUnitId from '@/views/components/form-unitId'
export default {
    mixins: [indexMixin],
    dicts: ['MeasureUnit', 'inventoryType', 'expireStatus'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog'),
        FormUnitId
    },
    props: {
        singleMode: {
            type: Boolean,
            required: false,
            default: false
        },
        propsFormData: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    data() {
        return {
            title: '选择库存',
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
                warehouseName: '',
                matlCode: '',
                matlName: '',
                matlType: '',
                placeCode: '',
                batchNo: '',
                type: '',
                expireStatus: '',
                unitName: undefined,
                projectCode: '',
                projectName: '',
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
            idArr: [],
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
        init(id = null, saleOrderDetails = [], idArr = [], { type = 'inv', ...query }) {
            this.selectData = []
            this._type = type
            this._query = query || {}
            this.saleOrderDetails = []
            this.selected = saleOrderDetails
            this.selectDataRow = null
            this.openDataScope = true
            this.idArr = idArr
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
            const api = {
                inv: getInventoryList,
                refund: getRefundQuoteList
            }[this._type]
            api(Object.assign({}, this.listQuery, this.formData, this._query, this.propsFormData)).then(({ data }) => {
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
                if (this.idArr.includes(row.id)) {
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
                    this.$message.warning('请选择库存')
                    return
                }
                const data = this.dataList.find(item => item.id === this.selectDataRow)
                this.$emit('selections', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择库存')
                    return
                }
                this.$emit('selections', this.selectData)
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
            this.$emit('selections', this.singleMode ? row : [row])
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
