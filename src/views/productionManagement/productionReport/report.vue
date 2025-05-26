<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery" :menuId="menuId"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick">
                    <template v-slot:tab>
                        <orderDetailType :value="tableType" @input="handleTableTypeChange" :options="tableOptions" />
                    </template>
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
                    @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                    <template slot="status" slot-scope="scope">
                        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <activiti-assignee ref="activitiAssignee" @activitiAssigneeSelected="activitiAssigneeSelected"
            :multiple="false"></activiti-assignee>
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <fileList ref="fileList" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { getList, exportList, exportDetailList, saveSubmit, detailList, submitValid } from '@/api/projectManagement/productionReport'
import orderDetailType from '@/views/components/orderDetailType'
import { download } from '@/utils/request'
import fileList from '@/views/components/fileList/index'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import workFlowView from '@/components/workFlowView'
import FormUnitId from '@/views/components/form-unitId'
import { menuConfig } from '@/utils'
const MENU_TYPE = {
    MASTER: 'MASTER', // 主单
    BRANCH: 'BRANCH'  // 主单+明细
}
export default {
    name: "productionReport",
    mixins: [indexMixin],
    components: { fileList, orderDetailType, activitiAssignee, workFlowView, FormUnitId },
    props: {
        tableType: {
            type: String,
            default: 'MASTER'
        },
        tabChange: {
            type: Function,
            default: null
        },
    },
    data() {
        return {
            previewFileVisible: false,
            menuId: '',
            // 遮罩层
            loading: false,
            selectedRow: null,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            filterText: "",
            dataOptions: undefined,
            treeLoading: false,
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
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
                pageSize: 30,
            },
            // 表单参数
            formData: {},
            formDataClick: {},
            workFlowViewVisible: false,
            selectedRow: null,
            tableOptions: [
                { value: MENU_TYPE.MASTER, label: '综合' },
                { value: MENU_TYPE.BRANCH, label: '明细' },
            ],
        };

    },
    created() {
        this.menuProperty(this.tableType == MENU_TYPE.BRANCH ? menuConfig.MENU_COMPLETION_BRANCH : '',)
    },
    methods: {
        searchFormTreeCleared(fieldCode = "") {
        },
        async menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            const property = await this.$store.dispatch('menuProperty', this.menuId)
            this.listQuery.pageSize = property.defaultPageSize || 30
            property.fields.forEach((field) => {
                if (field.fieldCode === 'fileList') {
                    field.listSlot = true
                }
            })
            this.property = property
        },
        async getList() {
            try {
                this.loading = true
                const param = {
                    ...this.listQuery,
                    ...this.formData
                }
                if (!!param.deptId) {
                    param.borrowDeptId = param.deptId
                    delete param.deptId
                }
                const api = this.tableType == MENU_TYPE.BRANCH ? detailList : getList
                const { data: { list = [], total = 0 } } = await api(param)
                this.list = list;
                this.total = total;
            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false;
            }
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
        },
        async handlePreview(list) {
            try {
                this.$refs.fileList.init(list)
            } catch (err) {
                console.error(err)
            }
        },

        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, { status }) {
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(status)
            }
            if (button.buttonCode == 'submit') {
                return ['2', '3'].includes(status)
            }
            if (button.buttonCode == 'update') {
                return ['2', '3'].includes(status)
            }
            return false
        },
        numberChange(val) {
            this.numberShow = val;
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns);
        },
        clickReset() {
            this.handleQuery();
        },
        selectChange(row) {
            let { formData, isWatch } = row;
            if (!isWatch) {
                this.handleQuery(formData);
            } else {
                this.formData = Object.assign({}, this.formData, formData);
            }
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, row) {
            this.ids = row.map(item => item.saleOrderId)
            this.single = single
            this.multiple = multiple
            this.selection = row

        },
        handleResetField() {
        },
        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                download(this.tableType == MENU_TYPE.BRANCH ? `${exportDetailList}` : `${exportList}`, param);
            } catch (err) {
                console.error(err)
            }
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const ids = rowArr.map(({ id }) => id)
            const buttonActions = {
                export: () => {
                    this.handleExport()
                },
                update: () => {
                    this.handleUpdate(ids)
                },
                submit: async () => {
                    this._selectedRows = rowArr
                    const ids = rowArr.map(({ id }) => id)
                    const { data } = await submitValid({ ids })
                    if (!!data.length) {
                        // 完工报告【' + data.join('、') + '】实际生产数量<预计生产数量,是否确定提交?
                        this.handleSubmit(ACTIVITI_ASSUGNEE.MM_WGBG, '所选数据存在 “实际生产数量 < 预计生产数量” 的情况，即生产单未全部完工，原则上全部完工再提交审核；是否一定要提交？');
                    } else {
                        this.handleSubmit(ACTIVITI_ASSUGNEE.MM_WGBG);
                    }

                },
                flowSee: () => {
                    this.workFlowViewVisible = true
                    this.selectedRow = { id: ids[0], businessId: ids[0] };
                },
                withdraw: () => {
                    this.handleWithdraw({ businessId: ids[0], businessType: ACTIVITI_ASSUGNEE.MM_WGBG, })
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        handleUpdate(ids) {
            this.$router.push({ name: 'productionOrderReport', query: { name: 'productionReport', type: 'update', id: ids[0] } });
        },
        async submit(assignee = '') {
            try {
                const ids = this._selectedRows.map(({ id }) => id)
                await saveSubmit({ ids: ids, assignee })
                this.$modal.msgSuccess(`提交成功`)
                this.getList();
            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        clickLink(row, code) {
            const linkConfig = {
                produceCode: { name: 'productionOrderOperate', query: { name: 'productionReport', type: 'view', id: row.produceDetailId, tableType: '2' } },
                // produceCode: { name: 'productionOrderOperate', query: { name: 'productionReport', type: 'view', id: row.produceCode, tableType: '2' } },
                reportCode: { name: 'productionOrderReport', query: { name: 'productionReport', type: 'view', id: this.tableType == MENU_TYPE.BRANCH ? row.reportId : row.id } },
                matlCode: { name: 'materialArchivesOperate', query: { name: 'productionReport', type: 'view', matlCode: row.matlCode } },
                flowCode: { name: 'processFlowOperate', query: { type: "view", id: row.flowId } },
            }[code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    }
};
</script>

<style scoped lang="scss"></style>
