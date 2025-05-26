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
                    <el-form :model="formData" ref="queryForm" label-width="90px">
                        <el-col :span="6">
                            <el-form-item label="仓库名称" prop="warehouseName" class="border-radius50">
                                <el-input v-model="formData.warehouseName" placeholder="请输入仓库名称" clearable
                                    @keyup.enter.native="handleQuery" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="货架编码" prop="frameCode" class="border-radius50">
                                <el-input v-model="formData.frameCode" placeholder="请输入货架编码" clearable
                                    @keyup.enter.native="handleQuery" />
                            </el-form-item>
                        </el-col>

                        <el-col :span="6">
                            <el-form-item label="货架名称" prop="frameName" class="border-radius50">
                                <el-input v-model="formData.frameName" placeholder="请输入货架名称" clearable
                                    @keyup.enter.native="handleQuery" />
                            </el-form-item>
                        </el-col>

                        <el-col :span="6">
                            <el-form-item label="机器类型" prop="frameType" class="border-radius50">
                                <el-select v-model="formData.frameType" clearable>
                                    <el-option v-for="(item, key) in dict.type.frameType" :key="key" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </el-form-item>
                        </el-col>

                    </el-form>
                    <el-table ref="tableRef" class="container_table" v-loading="loading" border row-key="frameCode"
                        v-if="openDataScope" :data="dataList" height="100%" @row-click="rowClick"
                        @sort-change="sortableColumnChange" @row-dblclick="dbClick" @selection-change="handleSelect"
                        :row-style="changeDisabled">
                        <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                            <template v-slot="{ row }">
                                <el-radio v-model="selectDataRow" :label="row.frameCode" class="table-radio"></el-radio>
                            </template>
                        </el-table-column>
                        <el-table-column v-else align="center" :selectable="isSelectable" key="selectable"
                            :reserve-selection="true" type="selection" width="50" />
                        <el-table-column label="货架编码" prop="frameCode" key="frameCode" :show-overflow-tooltip="true"
                            align="left" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small" @click="handleDetail('frameOperateRef', row.id)">{{
                                    row.frameCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="货架名称" prop="frameName" key="frameName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="通道编码" prop="passageCode" key="passageCode" :show-overflow-tooltip="true"
                            align="left" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="handleDetail('passagewayOperateRef', row.passageId)">{{
                                        row.passageCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="通道名称" prop="passageName" key="passageName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="通道类型" prop="passageType" key="passageType" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.passageType | orderTypeFilter(dict.type.passageType) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="储区编码" prop="storageCode" key="storageCode" :show-overflow-tooltip="true"
                            align="left" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="handleDetail('storageAreaOperateRef', row.storageId)">{{
                                        row.storageCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="储区名称" prop="storageName" key="storageName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="储区类型" prop="storageType" key="storageType" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.storageType | orderTypeFilter(dict.type.storageType) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="仓库编码" prop="warehouseCode" key="warehouseCode"
                            :show-overflow-tooltip="true" align="left" min-width="150">
                            <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="handleDetail('warehouseOperateRef', row.warehouseId, 'warehouse')">{{
                                        row.warehouseCode }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="仓库名称" prop="warehouseName" key="warehouseName" sortable="custom"
                            align="left" :show-overflow-tooltip="true" min-width="150" />
                        <el-table-column label="仓库类型" prop="warehouseType" key="warehouseType" sortable="custom"
                            align="left" min-width="150">
                            <template slot-scope="{row}">
                                <span>{{ row.warehouseType | orderTypeFilter(dict.type.warehouseType) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="地区" prop="areaName" key="areaName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150" />
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
        <frameOperate ref="frameOperateRef" />
        <warehouseOperate ref="warehouseOperateRef" />
        <passagewayOperate ref="passagewayOperateRef" />
        <storageAreaOperate ref="storageAreaOperateRef" />
    </Dialog>
</template>

<script>
import { basePassageGetPassageTree } from '@/api/warehouseManage/basePassage';
import { frameReferenceList } from '@/api/warehouseManage/frame'
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { invMatlStorageRelReferenceFrameList } from '@/api/warehouseManage/materialStorage'
import warehouseOperate from '@/views/warehouseManage/warehousFundamentals/warehouse/warehouseOperate';
import passagewayOperate from '@/views/warehouseManage/warehousFundamentals/passageway/components/operate';
import storageAreaOperate from '@/views/warehouseManage/warehousFundamentals/storageArea/components/operate';
import frameOperate from '@/views/warehouseManage/warehousFundamentals/frame/components/operate';

export default {
    mixins: [indexMixin, inMixin],
    dicts: ['passageType', 'warehouseType', 'storageType', 'frameType'],
    components: {
        frameOperate,
        warehouseOperate,
        passagewayOperate,
        storageAreaOperate,
    },
    props: {
        singleMode: {
            type: Boolean,
            required: false,
            default: false
        },
        isMaterialStorage: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            title: '货架选择',
            openDataScope: false,
            treeLoading: false,
            loading: false,
            // 部门树选项
            deptOptions: undefined,
            defaultProps: {
                children: 'children',
                label: 'name'
            },
            formData: {
                warehouseName: '',
                frameCode: '',
                frameName: '',
                frameType: '',
                areaId: null,
                warehouseId: null,
                storageId: null,
                passageId: null,
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
        handleDetail(ref, id, type = '') {
            if (type == 'warehouse') {
                this.$refs[ref].init('view', 'warehouseOperate', id)
            } else {
                this.$refs[ref].init('view', { id: id })
            }

        },
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item.frameCode)
            return idList.includes(row.frameCode) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {

            const idList = this.selected.map((item) => item.frameCode)
            return !idList.includes(row.frameCode)
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
            this.classTree()
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
        classTree() {
            this.treeLoading = true
            basePassageGetPassageTree().then(({ data }) => {
                this.deptOptions = data || []
            }).finally(() => {
                this.treeLoading = false
            })
        },
        getList() {
            this.loading = true
            const param = Object.assign({}, this.listQuery, this.formData)
            const func = this.isMaterialStorage ? invMatlStorageRelReferenceFrameList : frameReferenceList

            func(param).then(({ data }) => {
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
                this.selectDataRow = row.frameCode
            } else {
                if (this.matlCodeArr.includes(row.frameCode)) {
                    return false
                }
                const idList = this.saleOrderDetails.map((item) => item.frameCode)
                if (idList.includes(row.frameCode)) {
                    return
                }
                // 多选选中行
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.frameCode === row.frameCode)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true)
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.frameCode !== row.frameCode
                    })
                    // 取消后剩余选中的
                    this.selectData = finalArr
                    this.$refs.tableRef.toggleRowSelection(row, false)
                }
            }
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.formData.areaId = null;
            this.formData.warehouseId = null;
            this.formData.storageId = null;
            this.formData.passageId = null;
            if (data.id === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
            } else {
                this.treeCurrentKey = data.id;
                if(data.level == 0){
                    this.formData.areaId = data.id;
                }else if(data.level == 1){
                    this.formData.warehouseId = data.id;
                }else if(data.level == 2){
                    this.formData.storageId = data.id;
                }else if(data.level == 3){
                    this.formData.passageId = data.id;
                }
            }
            this.getList();
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
            this.$refs.queryForm.resetFields()
            this.handleQuery()
        },
        choiceMaterialClick() {
            if (this.singleMode) {
                if (this.selectDataRow == null) {
                    this.$message.warning('请选择货架')
                    return
                }
                const data = this.tableData.find(item => item.frameCode === this.selectDataRow)
                this.$emit('confirm', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择货架')
                    return
                }
                this.$emit('confirm', this.selectData)
            }
            this.openDataScope = false
        },
        dbClick(row) {
            if (!this.singleMode) {
                const flag = this.saleOrderDetails.some(item => item.frameCode === row.frameCode)
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
