<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择BOM" :visible.sync="visible"
        :close-on-click-modal="false" append-to-body width="1300px">
        <div slot="title" class="el-dialog__title">
            选择BOM
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="90px">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="BOM编码" prop="bomCode" class="border-radius50">
                        <el-input v-model="formData.bomCode" placeholder="请输入BOM编码" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="BOM名称" prop="bomName" class="border-radius50">
                        <el-input v-model="formData.bomName" placeholder="请输入BOM名称" clearable
                            @keyup.enter.native="searchData" />
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
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" v-if="visible" :data="dataList" border height="100%" v-loading="loading"
                @row-click="rowClick" @sort-change="sortableColumnChange" row-key="bomCode" :row-style="changeDisabled"
                @row-dblclick="dbClick" @selection-change="handleSelect">
                <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.bomCode" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column v-else align="center" key="selectable" type="selection" width="50"
                    :selectable="isSelectable" :reserve-selection="true" />
                <el-table-column label="序号" align="center" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="bomCode" label="BOM编码" align="center" show-overflow-tooltip min-width="170">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'bomAdministrationOperate' })">{{
                            row.bomCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="bomName" label="BOM名称" align="left" show-overflow-tooltip min-width="150"
                    sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })" />
                <el-table-column prop="matlCode" label="物料编码" align="center" show-overflow-tooltip min-width="150"
                    sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip min-width="150"
                    sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })" />
                <el-table-column prop="matlUnit" label="计量单位" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
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
import { bomList } from '@/api/prodmgr-mm/bom'
export default {
    mixins: [indexMixin, inMixin],
    dicts: ['MeasureUnit'],
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
            visible: false,
            formData: {
                bomCode: '',
                bomName: '',
                matlCode: '',
                matlName: '',
                matlType: '',
                status: '3'
            },
            loading: false,
            tableData: [],
            total: 0,
            selectData: [],
            saleOrderDetails: [],
            selectDataRow: null,
            selected: [],
            query: {}
        }
    },
    methods: {
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item.bomCode)
            return idList.includes(row.bomCode) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {
            if (Array.isArray(this.selected)) {
                const idList = this.selected.map((item) => item.bomCode)
                return !idList.includes(row.bomCode)
            }
            return true
        },
        init(id = null, detailsList = [], query = {}) {
            this.selected = detailsList
            this.selectDataRow = null
            this.selectData = []
            this.query = query
            if (this.singleMode) {
                this.selectDataRow = id
            } else {
                this.saleOrderDetails = detailsList
            }
            this.visible = true;

            this.tableData = []
            this.listQuery.pageNum = 1
            this.listQuery.pageSize = 30
            this.$nextTick(() => {
                this.$refs.elForm.resetFields()
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
                    this.$message.warning('请选择BOM')
                    return
                }
                const data = this.tableData.find(item => item.bomCode === this.selectDataRow)
                this.$emit('change', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择BOM')
                    return
                }
                this.$emit('change', this.selectData)
            }

            this.visible = false
        },
        // 物资列表双击添加到BOM清单
        dbClick(row) {
            const flag = this.saleOrderDetails.some(item => item.bomCode === row.bomCode)
            if (flag) {
                this.$message.warning('此条数据已经添加')
                return
            }
            this.$emit('change', this.singleMode ? row : [row])
            this.visible = false
        },
        rowClick(row) {
            if (this.singleMode) {
                // 单选选中行
                this.selectDataRow = row.bomCode
            } else {
                // 多选选中行
                const idList = this.saleOrderDetails?.map((item) => item.bomCode)
                if (idList.includes(row.bomCode)) {
                    return
                }
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.bomCode === row.bomCode)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true);
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.bomCode !== row.bomCode
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

            bomList(Object.assign({}, this.formData, this.listQuery, this.propsFormData, this.query)).then(({ data }) => {
                this.tableData = data?.list || []
                this.dataList = data?.list || []
                this.total = data?.total || 0
                // if (this.saleOrderDetails.length) {
                //     const selectRowIdGroup = this.saleOrderDetails.map(item => item.bomCode)
                //     this.tableData.forEach(item => {
                //         if (selectRowIdGroup.includes(item.bomCode)) {
                //             this.$nextTick(() => {
                //                 this.$refs.tableRef.toggleRowSelection(item)
                //             })
                //         }
                //     })
                // }
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