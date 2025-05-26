<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:accountingOrgName="{ data, i18nData }">
                <FormUnitId  :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
            <template v-slot:code="{ data, i18nData }">
                <FormCodeNoSelect :key="data.fieldCode" :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
            <template v-slot:no="{ data, i18nData }">
                <FormCodeNoSelect  :key="data.fieldCode" :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>

        <el-row type="flex" class="container_h">
            <el-col :span="18" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick"></right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
                    @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
                    <template slot="status" slot-scope="scope">
                        <icon-svg v-if="!!scope.value" :class="iconClassSize(scope.value)"
                            :icon-class="iconClass(scope.value)" />{{
                                scope.value |
                                fieldFormat(scope.fieldFormatArr) }}
                    </template>
                    <template slot="sealStatus" slot-scope="scope">
                        <span :class="'sealStatus-' + scope.value">{{ scope.value | fieldFormat(scope.fieldFormatArr)
                        }}</span>
                    </template>
                    <template slot="forwardStatus" slot-scope="scope">
                        <span :class="'forwardStatus-' + scope.value">{{ scope.value | fieldFormat(scope.fieldFormatArr)
                        }}</span>
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected" />
        <logs ref="logRef" />
        <checkforward ref="checkForwardRef" @confirm="handleForwardStatus" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import FormUnitId from '@/views/components/form-unitId'
import FormCodeNoSelect from '@/views/components/form-codeno-select'
import { getList, remove, listNoPage, submit, exportFile, updateForwardYes, updateForwardNo, updateSealOff, checkForward, updateSealOn } from '@/api/calculateManagement/accounting'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import logs from './components/logs.vue'
import checkforward from './components/checkForward.vue'

export default {
    name: 'accountantCycle',
    mixins: [indexMixin],
    components: {
        activitiAssignee,
        workFlowView,
        logs,
        checkforward,
        FormUnitId,
        FormCodeNoSelect
    },
    data() {
        return {
            filterCondition: {
                isProjectQuery: '1',
                isProject: '1',
                status: '1',
            },
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
            numberShow: false,
            // 页面属性
            property: {},
            total: 0,
            // 查询参数
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            // 表单参数
            formData: {},
            formDataClick: {},
            // 部门树选项
            treeLoading: false,
            filterText: '',

            open: false,
            rules: {
                dataTime: [
                    { required: true, message: '同步日期不能为空', trigger: 'blur' }
                ]
            },
            workFlowViewVisible: false,
            selectedRow: null,
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' }]
        }
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val)
        }
    },
    async created() {
        await this.menuProperty()
    },
    methods: {

        iconClassSize(value) {
            if (value !== '3') {
                return 'icon-size'
            }
            return 'icon-size'
        },
        filterNode(value, data) {
            if (!value) return true
            return !!this.$py.match(data.deptName, value) || data.deptCode.indexOf(value) !== -1
        },
        menuProperty() {
            let id = this.$route.meta.id
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                for (let i = 0; i < data.buttonTop.length; i++) {
                    if (['sealStatus'].includes(data.buttonTop[i]['buttonCode'])) {
                        data.buttonTop[i].children = [
                            { buttonCode: 'sealStatusConfrim', buttonName: '封账', buttonMode: '2' },
                            { buttonCode: 'sealStatusCancel', buttonName: '取消封账', buttonMode: '2' }
                        ]
                    }
                    // if (['forwardStatus'].includes(data.buttonTop[i]['buttonCode'])) {
                    //     data.buttonTop[i].children = [
                    //         { buttonCode: 'forwardStatusConfrim', buttonName: '结转', buttonMode: '2' },
                    //         // { buttonCode: 'forwardStatusCancel', buttonName: '取消结转', buttonMode: '2' }
                    //     ]
                    // }
                }

                this.property = data
            })
        },
        handleTopButtonDisabled(button) {
            if (button.buttonCode == 'forwardStatusConfrim' && !this.selection.length) {
                return true
            }
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(row.status)
            }
            if (button.buttonCode === 'update') {
                return row.forwardStatus === '1' || ['2', '3'].includes(row.status)
            }
            if (['delete'].includes(button.buttonCode)) {
                return ['2', '3'].includes(row.status)
            }
            if (['submit'].includes(button.buttonCode)) {
                return !(row.sealStatus == '0' && row.forwardStatus == '1' && ['0', '3'].includes(row.status))
            }
            if (['sealStatusConfrim'].includes(button.buttonCode)) {
                if (row.forwardStatus == '1') {
                    return true
                }
                return !(row.sealStatus == '0')
            }
            if (['sealStatusCancel'].includes(button.buttonCode)) {
                if (row.forwardStatus == '1') {
                    return true
                }
                return !(row.sealStatus == '1')
            }
            if (['forwardStatusConfrim'].includes(button.buttonCode)) {
                return !(row.forwardStatus == '0')
            }
            if (['forwardStatusCancel'].includes(button.buttonCode)) {
                return !(['0', '1'].includes(row.status))
            }

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
        clickLink(row) {
            this.$router.push({ name: 'accountantCycleOperate', query: { name: 'accountantCycle', type: 'view', id: row.id } })
        },
        //选择框回调
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
            this.formData.code = ''
            this.formData.no = ''

        },
        async handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const ids = rowArr.map(({ id }) => id)
            if (buttonCode == 'update') {
                this.$router.push({ name: 'accountantCycleOperate', query: { name: 'accountantCycle', type: buttonCode, id: rowArr[0].id } })
            } else if (buttonCode === 'delete') {
                this.$modal.confirm('是否确定删除?').then(() => {
                    return this.handleRemove(ids)
                })
            } else if (buttonCode === 'create') {
                this.$router.push({ name: 'accountantCycleOperate', query: { name: 'accountantCycle', type: buttonCode } })
            } else if (buttonCode === 'flowSee') {
                this.workFlowViewVisible = true
                this.selectedRow = { id: rowArr[0].id, businessId: rowArr[0].id }
            } else if (buttonCode === 'export') {
                this.handleExport()
            } else if (buttonCode == 'submit') {
                this.ids = idArr
                this.handleSubmit(ACTIVITI_ASSUGNEE.FA_KJQJ)
            } else if (buttonCode == 'log') {
                this.$refs.logRef.init(ids[0])
            } else if (buttonCode == 'forwardStatusConfrim') {
                this.forwardStatusConfrim(ids[0])
            } else if (buttonCode == 'forwardStatusCancel') {
                this.forwardStatusCancel(ids[0])
            } else if (buttonCode == 'sealStatusConfrim') {
                this.sealStatusConfrim(ids[0])
            } else if (buttonCode == 'sealStatusCancel') {
                this.sealStatusCancel(ids[0])
            } else if (buttonCode === 'withdraw') {
                this.handleWithdraw({ businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.FA_KJQJ, })
            }
        },
        sealStatusConfrim(id) {
            this.$modal.confirm(`<p>封账后将不能进行如下业务操作：</p>
            <p style="color:red;">1. 入库单不可操作入库完成。</p>
            <p style="color:red;">2. 出库单不可操作出库完成。</p>
            <p style="color:red;">3. 调整点单不可操调整完成。</p>
            <p>跟业务沟通后、是否确定封账？</p>`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                distinguishCancelAndClose: true,
                dangerouslyUseHTMLString: true,
                center: true
            }).then(async () => {
                await updateSealOff({ id })
                this.getList()
            })

        },
        async sealStatusCancel(id) {
            this.$modal.confirm(`<p>是否确定取消封账？</p>`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                distinguishCancelAndClose: true,
                dangerouslyUseHTMLString: true,
                center: true
            }).then(async () => {
                await updateSealOn({ id })
                this.getList()
            })
        },
        async forwardStatusConfrim(id) {
            this._curId = id;
            const { data } = await checkForward({ id })
            if (data.check && !data.outInList.length) {
                this.$modal.confirm(`<p style="color:red;">1.结转后，结束日期以当前结转日期为准。</p>
                         <p style="color:red;">2.结转后不可取消结转。</p>
                         <p style="color:red;">请确认是否结转？</p>`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    distinguishCancelAndClose: true,
                    dangerouslyUseHTMLString: true,
                    center: true
                }).then(async () => {
                    this.handleForwardStatus()
                })
            } else {
                this.$refs.checkForwardRef.init(data)
            }
        },
        async handleForwardStatus() {
            if (!!this._curId) {
                await updateForwardYes({ id: this._curId })
                this.getList()
                this.$modal.msgSuccess("结转成功");
            }

        },
        async forwardStatusCancel(id) {
            await updateForwardNo({ id: id })
            this.getList()

        },
        // 删除事件处理器
        async handleRemove(ids = []) {
            await remove({ ids: ids })
            this.getList()
        },
        // 导出事件处理器
        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                await exportFile(param)
            } catch (err) {
                this.$modal.msgError(err.message)
            }
        },
        // 列表数据
        async getList() {
            try {
                this.loading = true
                const param = Object.assign({}, this.listQuery, this.formData)
                const { data: { list, total } } = await getList(param)
                this.list = list
                this.total = total
            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false
            }
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            submit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
                if (success) {
                    this.$modal.msgSuccess('提交成功')
                    this.getList()
                } else {
                    this.$modal.msgError(message)
                }
            }).finally(() => {
                this.loading = false;
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.flex-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .search-input {
        width: 80%
    }

    .plus-icon {
        cursor: pointer;
        margin-right: 5px;
        color: #52A2FF;
        font-size: 24px;
    }
}

.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}

.icon-size {
    width: 16px;
    height: 16px;
    margin-left: 4px;
    margin-right: 3.5px;
}
</style>