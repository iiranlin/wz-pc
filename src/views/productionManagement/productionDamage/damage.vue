<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" guideType="GUIDE_02" :buttonTopData="property.buttonTop" :multiple="multiple"
            :single="single" @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :treeList="treeList" @searchFormTreeSelected="searchFormTreeSelected"
            @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch" :searchArr="property.search || []"
            :formData="formData" @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :treeList="treeList" :formData="formDataClick"
                    :searchArr="property.search || []" :showSearch.sync="showSearch" :columns="property.fields"
                    @queryTable="handleQuery" :menuId="menuId" @handleCheckAllChange="handleCheckAllChange"
                    @clickReset="clickReset" @numberChange="numberChange" @cleanClick="cleanClick">
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
                    @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter"
                    :idName="{ MASTER: 'stId', BRANCH: 'stRawId' }[tableType]">
                    <template slot="status" slot-scope="scope">
                        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}
                    </template>
                    <template slot="fileList" slot-scope="scope">
                        <el-link :disabled="!scope.data.fileList || !scope.data.fileList.length"
                            :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
                            @click.stop="handlePreview(scope)">查看</el-link>
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <fileList ref="fileList" />
        <guidePreview ref="guidePreview" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { getList, exportList, submit } from '@/api/projectManagement/productionDamage'
import orderDetailType from '@/views/components/orderDetailType'
import fileList from '@/views/components/fileList/index'
import workFlowView from '@/components/workFlowView'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import { uniqueArrByField } from '@/utils'
import guidePreview from '@/components/guide-preview'
import FormUnitId from '@/views/components/form-unitId'

const MENU_TYPE = {
    MASTER: 'MASTER', // 主单
    BRANCH: 'BRANCH'  // 主单+明细
}
export default {
    name: "productionDamage",
    mixins: [indexMixin],
    components: { guidePreview, fileList, orderDetailType, activitiAssignee, workFlowView, FormUnitId },
    props: {
        tableType: {
            type: String,
            default: 'MASTER'
        },
        tabChange: {
            type: Function,
            default: null
        }
    },

    data() {
        return {
            menuId: '',
            treeList: {
                deptId: [],
            },
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
            selectedRow: null
        };

    },
    created() {
        this.menuProperty()
        this.getDeptTree();
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    methods: {
        async getDeptTree() {
            const unitOps = (await this.getDeptTreeByUserMixin()) || [];
            this.treeList.deptId = unitOps;
        },
        async searchFormTreeSelected(node, fieldCode) {
        },
        searchFormTreeCleared(fieldCode = "") {
        },
        async menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            const property = await this.$store.dispatch('menuProperty', this.menuId)
            this.listQuery.pageSize = property.defaultPageSize || 30
            this.property = property
        },
        async getList() {
            try {
                this.loading = true
                const param = {
                    ...this.listQuery,
                    ...this.formData
                }

                const { data: { list = [], total = 0 } } = await getList(param)
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
        async handlePreview(scope) {
            try {
                this.$refs.fileList.init(scope.data.fileList)
            } catch (err) {
                console.error(err)
            }


        },

        handleTopButtonDisabled(button) {
            if (!this.selection.length && ['submit', 'push'].includes(button.buttonCode)) {
                return true
            }
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, { status, damageNum, purPlanQuoteNum }) {
            let flag = false
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(status)
            }
            if (['3', '2'].includes(status) && ['submit'].includes(button.buttonCode)) {
                return true
            }
            if (['push'].includes(button.buttonCode)) {
                const codeArr = uniqueArrByField(this.selection, 'projectCode')
                return codeArr.length !== 1 || damageNum <= purPlanQuoteNum || status != '3'
            }
            return flag
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
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const buttonActions = {
                guide: () => {
                    this.$refs.guidePreview.clickHandler('GUIDE_03')
                },
                submit: () => {
                    this._selectedRows = rowArr
                    this.handleSubmit(ACTIVITI_ASSUGNEE.MM_ZSD);
                },
                push: () => {
                    this.handlePush(rowArr)
                },
                flowSee: () => {
                    this.workFlowViewVisible = true
                    this.selectedRow = { id: rowArr[0].id, businessId: rowArr[0].id };
                },
                export: () => {
                    this.handleExport()
                },
                withdraw: () => {
                    this.handleWithdraw({ businessId: rowArr[0].id, businessType: ACTIVITI_ASSUGNEE.MM_ZSD, })
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        handlePush(rowArr) {
            const ids = rowArr.map(({ id }) => id)
            this.$router.push({ name: 'purchasePlanOperate', query: { name: 'productionDamage', type: 'create', sourceType: 'damage', ids: ids.join(',') } });
        },
        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                const api = this.tableType === MENU_TYPE.BRANCH ? exportDetailList : exportList
                await api(param)
            } catch (err) {
                console.error(err)
            }
        },
        async submit(assignee = '') {
            try {
                const ids = this._selectedRows.map(({ id }) => id)
                await submit({ ids, assignee })
                this.$modal.msgSuccess(`提交成功`)
                this.getList();
            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        clickLink(row, code) {
            const linkConfig = {
                damageCode: { name: 'productionDamageOperate', query: { name: 'productionDamage', type: 'view', id: row.id } },
                returnCode: { name: 'productionRejectedOperate', query: { name: 'productionDamage', type: 'view', id: row.returnId } },
                matlCode: { name: 'materialArchivesOperate', query: { name: 'productionDamage', type: 'view', matlCode: row.matlCode } },
                qiCode: { name: 'qualityTestingOperate', query: { name: 'productionDamage', type: 'view', id: row.qiId } },
                orderRawCode: { name: 'productionOrderOperate', query: { name: 'productionDamage', type: 'view', id: row.orderRawId, tableType: 2 } },
                projectCode: { name: 'projectManagementOperate', query: { name: 'productionDamage', type: 'view', id: row.projectId } },
                outCode: { name: 'outboundMaintenanceOperate', query: { name: 'productionDamage', type: 'view', id: row.outId } },
                pickingCode: { name: 'productionReceiveOperate', query: { name: 'productionDamage', type: 'view', id: row.pickingId } },

            }[code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    }
};
</script>

<style scoped lang="scss"></style>
