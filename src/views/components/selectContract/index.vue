<template>
    <Dialog class="flex-dialog max-height-dialog" title="合同选择" :visible.sync="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" tabindex='1' width="1300px" append-to-body>
        <div slot="title" class="el-dialog__title">
            合同选择
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="searchInfo" :model="searchInfo" label-suffix="：" label-width="105px">
            <el-row>
                <el-col :span="24">
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="合同编号" prop="ctCode" class="border-radius50">
                                <el-input v-model="searchInfo.ctCode" placeholder="请输入合同编号"
                                    @keyup.enter.native="searchData" clearable />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="合同名称" prop="ctName" class="border-radius50">
                                <el-input v-model="searchInfo.ctName" placeholder="请输入合同名称"
                                    @keyup.enter.native="searchData" clearable />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="所属组织" prop="unitName" class="border-radius50">
                                <FormUnitId class="form_unitId_h" :formData="searchInfo" :i18nData="i18nData"
                                :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="项目名称" prop="projectName" class="border-radius50">
                                <el-input v-model="searchInfo.projectName" placeholder="请输入项目名称"
                                    @keyup.enter.native="searchData" clearable />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="项目编码" prop="projectCode" class="border-radius50">
                                <el-input v-model="searchInfo.projectCode" placeholder="请输入项目编码"
                                    @keyup.enter.native="searchData" clearable />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="相对方名称" prop="relativeName" class="border-radius50">
                                <el-input v-model="searchInfo.relativeName" placeholder="请输入相对方名称"
                                    @keyup.enter.native="searchData" clearable />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="履约日期" prop="startTimeArr" class="border-radius50">
                                <el-date-picker style="width: 100%;" v-model="searchInfo.startTimeArr" type="daterange"
                                    range-separator="-" start-placeholder="履约开始日期"
                                    end-placeholder="履约结束日期">
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </el-form>

        <div class="table-wrapper" v-if="visible">
            <el-table ref="contractCommonTable" :row-style="changeDisabled" :data="dataList" border height="100%"
                @row-dblclick="dbClick" @selection-change="handleSelectChange" v-loading="loading" row-key="ctId"
                @row-click="rowClick" @sort-change="sortableColumnChange">
                <el-table-column align="center" width="50" v-if="singleMode" fixed="left">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.ctId" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column :selectable="isSelectable" :reserve-selection="true" type="selection" align="center"
                    width="50" fixed="left" v-else></el-table-column>
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="ctCode" label="合同编号" align="left" show-overflow-tooltip min-width="200">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.ctId, refName: 'contractManagementOperate' })">{{
                            row.ctCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="ctName" label="合同名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="ctType" label="合同类别" sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'dict', fieldFormatArr: dict.type.contractManagementType, fieldFormat: '' })"
                    align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.ctType | reviewMethodFilter(dict.type.contractManagementType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="mysideName" label="我方名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="relativeName" label="相对方名称" sortable="custom" :filters="[]"
                    :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
                    align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                            row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="startTime" label="履约开始日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.startTime, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="endTime" label="履约结束日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.endTime, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />

        <template #footer>
            <el-button plain round type="primary" @click="saveSelection">保存</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { PuCtAllList } from '@/api/projectManagement/contractManagement'
import dayjs from 'dayjs';
export default {
    dicts: ['contractManagementType'],
    name: 'selectContract',
    components: {
        FormUnitId: () => import('@/views/components/form-unitId'),
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    mixins: [indexMixin, inMixin],
    props: {
        filterCondition: {
            type: Object,
            default: function () {
                return {}
            }
        },
        singleMode: {
            type: Boolean,
            default: false
        },
        projectId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            dialogParam: {},
            visible: false,
            searchInfo: {
                ctCode: '',
                ctName: '',
                relativeName: '',
                startTimeArr: [],
                unitName: '',
                projectName:'',
                projectCode:'',
            },
            loading: false,
            tableData: [],
            selectDataRow: null,
            total: 0,
            selectData: [],
            selected: [],
            projectType: ''
        }
    },
    watch: {
        visible(val) {
            if (!val) {
                this.$refs.searchInfo.resetFields()
                this.tableData = []
            } else {

                this.getList()
            }
        }
    },
    filters: {
        reviewMethodFilter(val, code) {
            for (let key of code) {
                if (key.value == val) {
                    return key.label
                }
            }
        }
    },
    methods: {
        handleSelectChange(arr) {
            this.selectData = arr
        },
        changeDisabled({ row }) {
            const idList = this.selected.map((item) => item.ctId)
            return idList.includes(row.ctId) ? {
                opacity: "0.5",
                pointerEvents: "none"
            } : {}
        },
        isSelectable(row) {
            const idList = this.selected.map((item) => item.ctId)
            return !idList.includes(row.ctId)
        },
        init(id = null, selected = [], type = '') {
            this.projectType = type
            this.selectDataRow = null
            if (this.singleMode) {
                this.selectDataRow = id
            } else {
                this.selected = [...selected]
            }
            this.visible = true
        },
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        // 保存选择
        saveSelection() {
            if (this.singleMode) {
                if (!this.selectDataRow) {
                    this.$message.warning('请选择合同')
                    return
                }
                const data = this.tableData.find(item => item.ctId === this.selectDataRow)
                this.$emit('selections', data)
            } else {
                if (!this.selectData.length) {
                    this.$message.warning('请选择合同')
                    return
                }
                this.$emit('selections', this.selectData)
            }

            this.visible = false
        },
        // 物资列表双击添加到BOM清单
        dbClick(row) {
            if (!this.singleMode) {
                const flag = this.selected.some(item => item.ctId === row.ctId)
                if (flag) {
                    this.$message.warning('此条数据已经添加')
                    return
                }
            }
            this.$emit('selections', this.singleMode ? row : [row])
            this.visible = false
        },
        rowClick(row) {
            if (this.singleMode) {
                // 单选选中行
                this.selectDataRow = row.ctId
            } else {
                const idList = this.selected.map((item) => item.ctId)
                if (idList.includes(row.ctId)) {
                    return
                }
                // 多选选中行
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.ctId === row.ctId)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.contractCommonTable.toggleRowSelection(row, true)
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.ctId !== row.ctId
                    })
                    // 取消后剩余选中的
                    this.selectData = finalArr
                    this.$refs.contractCommonTable.toggleRowSelection(row, false)
                }
            }
        },
        // 查询物资
        getList() {
            this.loading = true
            const param = Object.assign({}, this.searchInfo, this.listQuery, { ctType: this.projectType == '2' ? '' : this.projectType, status: 3 }, this.filterCondition)
            if (!!this.projectId) {
                param['projectId'] = this.projectId
            }
            if (param.startTimeArr.length) {
                param.startTime = dayjs(param.startTimeArr[0]).format('YYYY-MM-DD')
                param.endTime = dayjs(param.startTimeArr[1]).format('YYYY-MM-DD')
            }
            PuCtAllList({ ...param }).then(({ data }) => {
                this.tableData = data?.list || []
                this.dataList = data?.list || []
                this.total = data?.total || 0
            }).finally(() => {
                this.loading = false
            })
        },
        // 重置物资列表查询
        resetSearch() {
            this.$refs.searchInfo.resetFields()
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
