<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择计划方案" :visible.sync="visible"
        :close-on-click-modal="false" append-to-body width="1300px">
        <div slot="title" class="el-dialog__title">
            选择计划方案
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="120px">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="方案编码" prop="a" class="border-radius50">
                        <el-input v-model="formData.a" placeholder="请输入方案编码" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="方案名称" prop="b" class="border-radius50">
                        <el-input v-model="formData.b" placeholder="请输入方案名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="计算方式" prop="c" class="border-radius50">
                        <el-input v-model="formData.c" placeholder="请输入计算方式" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="是否考虑替代料" prop="d" class="border-radius50">
                        <el-select class="select-box" v-model="formData.d" placeholder="请选择是否考虑替代料" style="width:100%" size="small">
                            <el-option label="全部" value="全部" />
                            <el-option v-for="(item, key) in ['是', '否']" :key="key" :label="item" :value="item" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="创建人" prop="e" class="border-radius50">
                        <el-input v-model="formData.e" placeholder="请输入创建人" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="创建日期" prop="f" class="border-radius50">
                        <el-date-picker v-model="formData.f" type="daterange" value-format="yyyy-MM-dd"
                            range-separator="-"></el-date-picker>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" v-if="visible" :data="dataList" border height="100%" v-loading="loading"
                @row-click="rowClick" @sort-change="sortableColumnChange" row-key="id" :row-style="changeDisabled"
                @row-dblclick="dbClick" @selection-change="handleSelect">
                <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.id" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column v-else align="center" key="selectable" type="selection" width="50"
                    :selectable="isSelectable" :reserve-selection="true" />
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="a" label="方案编码" align="left" show-overflow-tooltip min-width="170">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small">{{
                            row.a }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="b" label="方案名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="e" label="物料范围" align="left" show-overflow-tooltip min-width="150">
                </el-table-column>
                <el-table-column prop="f" label="计算方式" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="g" label="超期供应天数" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="h" label="是否计算开完工日期" align="left" show-overflow-tooltip min-width="150">
                </el-table-column>
                <el-table-column prop="j" label="是否考虑替代料" align="left" show-overflow-tooltip min-width="150">
                </el-table-column>
                <el-table-column prop="y" label="生成数量为0的计划订单" align="left" show-overflow-tooltip min-width="190">
                </el-table-column>
                <el-table-column prop="i" label="备注" align="left" show-overflow-tooltip min-width="150">
                </el-table-column>
                <el-table-column prop="o" label="创建人" align="left" show-overflow-tooltip min-width="150">
                </el-table-column>
                <el-table-column prop="p" label="创建日期" align="center" show-overflow-tooltip min-width="150">
                </el-table-column>
            </el-table>
        </div>
        <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />

        <template #footer>
            <el-button plain round type="primary" @click="saveSelection">确定</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { getList } from '@/api/prodmgr-mm/scheme'
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
                a: '',
                b: '',
                c: '',
                d: '',
                e: '',
                f: null
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
            const idList = this.selected.map((item) => item.id)
            return idList.includes(row.id) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {
            if (Array.isArray(this.selected)) {
                const idList = this.selected.map((item) => item.id)
                return !idList.includes(row.id)
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
                    this.$message.warning('请选择计划方案')
                    return
                }
                const data = this.tableData.find(item => item.id === this.selectDataRow)
                this.$emit('change', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择计划方案')
                    return
                }
                this.$emit('change', this.selectData)
            }

            this.visible = false
        },
        // 物资列表双击添加到BOM清单
        dbClick(row) {
            const flag = this.saleOrderDetails.some(item => item.id === row.id)
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
                this.selectDataRow = row.id
            } else {
                // 多选选中行
                const idList = this.saleOrderDetails?.map((item) => item.id)
                if (idList.includes(row.id)) {
                    return
                }
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.id === row.id)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true);
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.id !== row.id
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

            getList(Object.assign({}, this.formData, this.listQuery, this.propsFormData, this.query)).then(({ data }) => {
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