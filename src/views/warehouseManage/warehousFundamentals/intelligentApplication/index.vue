<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled">
        </button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template slot="applyCategory" slot-scope="scope">
                <el-select class="select-box" v-model="formData.applyCategory" placeholder="请选择应用分类" style="width:100%"
                    size="small" clearable @clear="applyCategoryClear">
                    <el-option v-for="(item, key) in dict.type.applyCategory" :key="key" :label="item.label"
                        :value="item.value" @click.native="applyCategoryChange(item)" />
                </el-select>
            </template>
            <template slot="applyType" slot-scope="scope">
                <el-select class="select-box" v-model="formData.applyType" placeholder="请选择应用类型" style="width:100%"
                    size="small" clearable>
                    <el-option v-for="(item, key) in applyTypeOptions" :key="key" :label="item.label"
                        :value="item.value" />
                </el-select>
            </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <el-col :span="18" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick">
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
                    @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
                    <template slot="applyCategory" slot-scope="scope">
                        <span :class="['applyCategory-color-robot', scope.value == '2' ? 'applyCategory-color-work' : '']">
                            {{ scope.value | fieldFormat(scope.fieldFormatArr) }}
                        </span>
                    </template>
                    <template slot="applyType" slot-scope="scope">
                        <div v-if="scope.data.applyCategory == '1'">
                            <span :class="checkFrameTypeCircle(scope.value)"></span>
                            <span class="frameType-font">{{ scope.value | orderTypeFilter(dict.type.frameType) }}</span>
                        </div>
                        <span v-else :class="checkWorkbenchApplyTypeStyle(scope.value)">
                            {{ scope.value | orderTypeFilter(dict.type.workbenchApplyType) }}
                        </span>
                    </template>
                    <template slot="machineType" slot-scope="scope">
                        <div>
                            <span :class="checkFrameTypeCircle(scope.value)"></span>
                            <span class="frameType-font">{{ scope.value | orderTypeFilter(dict.type.frameType) }}</span>
                        </div>
                    </template>
                    <template slot="status" slot-scope="scope">
                        <icon-svg :class="iconClassSize({ 0: 3, 1: 0 }[scope.value])"
                            :icon-class="iconEnableStautsClass({ 0: 3, 1: 0 }[scope.value])" />{{ scope.value |
                                fieldFormat(scope.fieldFormatArr) }}
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <applicataion-operate ref="operate" @operateSuccess="operateSuccess" />
    </div>
</template>
<script>
import indexMixin from '@/views/mixins'
import applicataionOperate from './components/applicataionOperate.vue'
import { baseApplyList, exportDetailList } from '@/api/warehouseManage/intelligentApplication'
import { download } from '@/utils/request'

export default {
    name: 'intelligentApplication',
    mixins: [indexMixin],
    dicts: ['applyCategory', 'frameType', 'workbenchApplyType'],

    components: {
        applicataionOperate
    },

    data() {
        return {
            // 遮罩层
            loading: false,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 表格数据
            list: [],
            //列表选中数据
            selection: [],
            // 表格序号是否展示
            numberShow: true,
            // 页面属性
            property: {},
            //总条数
            total: 0,
            // 查询参数
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            // 表单参数
            formData: {
                applyType: '',
            },
            formDataClick: {

            },
            applyTypeOptions: [],
        }
    },
    created() {
        this.menuProperty()
    },
    methods: {
        menuProperty() {
            let id = this.$route.meta.id
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data
            })
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            return false
        },
        numberChange(val) {
            this.numberShow = val
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns)
        },
        clickReset() {
            this.handleQuery()
        },
        selectChange(row) {
            let { formData, isWatch } = row
            if (!isWatch) {
                this.handleQuery(formData)
            } else {
                this.formData = Object.assign({}, this.formData, formData)
            }
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key)
                }
                this.formData[key] = null
            }
            this.handleQuery()
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
            this.formDataClick = Object.assign({}, this.formData, row)
            this.getList()
        },
        operateSuccess() {
            this.handleQuery()
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery()
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = selection
        },
        handleResetField() {
            this.applyTypeOptions = [];
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode == 'create') {
                this.$refs.operate.init('create');
            } else if (buttonCode === 'update') {
                this.$refs.operate.init('update', rowArr[0]);
            } else if (buttonCode == 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
            }
        },
        getList() {
            this.loading = true

            baseApplyList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list
                this.total = data.total
            }).finally(() => {
                this.loading = false
            })
        },
        clickLink(row) {
            this.$refs.operate.init('view', row)
        },
        applyCategoryClear() {
            this.formData.applyType = '';
            this.applyTypeOptions = [];
        },
        applyCategoryChange(item) {
            this.formData.applyType = '';

            if (item.value == '1') {
                this.applyTypeOptions = this.dict.type.frameType
            } else {
                this.applyTypeOptions = this.dict.type.workbenchApplyType
            }
        },
        checkWorkbenchApplyTypeStyle(value) {
            if (value == '1') {
                return 'workbenchApplyType-1'
            } else if (value == '2') {
                return 'workbenchApplyType-2'
            } else if (value == '3') {
                return 'workbenchApplyType-3'
            }
        },
        checkFrameTypeCircle(value) {
            if (value == '1') {
                return 'frameType-1'
            } else if (value == '2') {
                return 'frameType-2'
            } else if (value == '4') {
                return 'frameType-4'
            }
        },
    },
}
</script>
<style lang="scss" scoped>
.applyCategory-color-robot {
    color: #00BFBF;
}

.applyCategory-color-work {
    color: #A30014;
}

.workbenchApplyType-1 {
    display: inline-block;
    padding: 0 8px;
    background-color: #feffd7;
    border: 1px solid #facd91;
    border-radius: 4px;
    box-sizing: border-box;
    white-space: nowrap;
    font-size: 12px;
    line-height: 26px;
    height: 26px;
}

.workbenchApplyType-2 {
    display: inline-block;
    padding: 0 8px;
    background-color: #dafe9e;
    border: 1px solid #95f204;
    border-radius: 4px;
    box-sizing: border-box;
    white-space: nowrap;
    font-size: 12px;
    line-height: 26px;
    height: 26px;
}

.workbenchApplyType-3 {
    display: inline-block;
    padding: 0 8px;
    background-color: #caffff;
    border: 1px solid #80ffff;
    border-radius: 4px;
    box-sizing: border-box;
    white-space: nowrap;
    font-size: 12px;
    line-height: 26px;
    height: 26px;
}

.frameType-1 {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: #81d3f8;
    margin-right: 5px;
    transform: translateY(2px);
}

.frameType-2 {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: #c280ff;
    margin-right: 5px;
    transform: translateY(2px);
}

.frameType-4 {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: #d8001b;
    margin-right: 5px;
    transform: translateY(2px);
}

.frameType-font {
    width: 70px;
    display: inline-block;
}
</style>