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
                    <template v-slot:tab>
                        <orderDetailType :value="tableType" @input="handleTableTypeChange" :options="tableOptions" />
                    </template>
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
                    @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter"
                    :idName="{ MASTER: 'id', BRANCH: 'rawId' }[tableType]">
                    <template slot="status" slot-scope="scope">
                        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}
                    </template>
                    <template slot="bizStatus" slot-scope="scope">
                        <span :class="'qiStatus-' + scope.value">{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}</span>
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
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { getList, getDetailLists, removes, removeBatch, submit, exportDetailList } from '@/api/projectManagement/productionReview'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import orderDetailType from '@/views/components/orderDetailType'
import fileList from '@/views/components/fileList/index'
import workFlowView from '@/components/workFlowView'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import FormUnitId from '@/views/components/form-unitId'
import { menuConfig } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
const MENU_TYPE = {
    MASTER: 'MASTER', // 主单
    BRANCH: 'BRANCH'  // 主单+明细
}
export default {
    name: "productionReceive",
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
        }
    },

    data() {
        return {
            tableOptions: [
                { value: MENU_TYPE.MASTER, label: '主单' },
                { value: MENU_TYPE.BRANCH, label: '主单+明细' },
            ],
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
            selectedRow: null
        };

    },
    created() {
        this.menuProperty(this.tableType == MENU_TYPE.BRANCH ? menuConfig.MENU_RECEIVE_BRANCH : '')
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
            property.fields.forEach((field) => {
                if (field.fieldCode === 'fileList') {
                    field.listSlot = true
                }
                if (field.fieldCode === 'lendRowNum') {
                    field.fieldCode = 'rowNum'
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

                const func = { [MENU_TYPE.MASTER]: getList, [MENU_TYPE.BRANCH]: getDetailLists }[this.tableType]
                const { data: { list = [], total = 0 } } = await func(param)
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
        async handlePreview(scope) {
            try {
                this.$refs.fileList.init(scope.data.fileList)
            } catch (err) {
                console.error(err)
            }


        },
        handleNodeClick(node) {
            this.formData.matlClassifyId = node.matlClassifyId
            this.getList()
        },
        getTreeList() {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.dataOptions = data || [];
            }).finally(() => {
                this.treeLoading = false;
            })
        },

        handleTopButtonDisabled(button) {
            if (this.tableType === MENU_TYPE.BRANCH && ['submit'].includes(button.buttonCode)) {
                return true
            }
            if (this.tableType === MENU_TYPE.MASTER && ['push'].includes(button.buttonCode) && !this.selection.length) {
                return true
            }
            if (!this.selection.length && ['push'].includes(button.buttonCode)) {
                return true
            }

            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, { status, bizStatus, pickingNum, outQuoteNum }) {
            let flag = false
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(status)
            }
            if (this.tableType === MENU_TYPE.MASTER) {
                // 主表
                // 主表审核通过禁用删除&修改&提交

                if (['3', '2'].includes(status) && ['update', 'delete', 'submit'].includes(button.buttonCode)) {
                    return true
                }
                if (['push'].includes(button.buttonCode)) {
                    return true
                }
            } else {

                if (['create'].includes(button.buttonCode)) {
                    return false
                }
                if (['3', '2'].includes(status) && ['update', 'delete', 'submit'].includes(button.buttonCode)) {
                    return true
                }
                if (['submit'].includes(button.buttonCode)) {
                    return true
                }

                if (['push'].includes(button.buttonCode)) {
                    return !['3'].includes(status) && pickingNum > outQuoteNum
                }
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
                source: () => {
                    this.$router.push({ name: 'productionReviewQuery', query: { rawMatlId: rowArr[0].rawMatlId } });
                },
                update: () => {
                    this.handleUpdate(rowArr)
                },
                delete: () => { this.handleDelete(rowArr); },
                create: () => { this.$router.push({ name: 'productionReceiveOperate', query: { name: 'productionReceive', type: 'create' } }); },
                push: () => {
                    const rawIds = rowArr.map(({ id }) => id)
                    this.$router.push({ name: 'outboundMaintenanceOperate', query: { name: 'productionReceive', outSource: '9', type: 'create', ids: rawIds.join(',') } });
                },
                query: async () => {
                    this.getList();
                    this.$modal.msgSuccess('存量查询成功')
                },
                submit: () => {
                    this._selectedRows = rowArr
                    this.handleSubmit(ACTIVITI_ASSUGNEE.MM_LLD);
                },
                flowSee: () => {
                    this.workFlowViewVisible = true
                    const id = this.tableType === MENU_TYPE.BRANCH ? rowArr[0].returnId : rowArr[0].id
                    this.selectedRow = { id: id, businessId: id };
                },
                export: () => {
                    this.handleExport()
                },
                withdraw: () => {
                    this.handleWithdraw({ businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.MM_LLD, })
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                await exportDetailList(param)
            } catch (err) {
                console.error(err)
            }
        },
        async submit(assignee = '') {
            try {
                const ids = this._selectedRows.map(({ id }) => id)
                await submit({ assignee, ids: ids })
                this.$modal.msgSuccess(`提交成功`)
                this.getList();
                this.refreshChange(this.refName)
            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        handleUpdate(rowArr) {
            const key = this.tableType === MENU_TYPE.BRANCH ? 'id' : 'id'
            const ids = rowArr.map((item) => item[key])
            const route = 'productionReceiveOperate'
            if (this.tableType === MENU_TYPE.BRANCH) {
                this.$router.push({ name: route, query: { tableType: '2', name: 'productionRejected', type: 'update', ids: ids.join(',') } });
            } else {
                this.$router.push({ name: route, query: { tableType: '1', name: 'productionRejected', type: 'update', id: ids[0] } });
            }
        },
        handleDelete(rows) {
            try {
                this.$modal.confirm('是否确定删除?').then(async () => {
                    const ids = rows.map(({ id }) => id)
                    const req = this.tableType === MENU_TYPE.BRANCH ? removeBatch : removes
                    await req({ ids: ids })
                    this.$modal.msgSuccess(`删除成功`)
                    this.getList();
                    this.refreshChange(this.refName)
                })

            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        clickLink(row, code) {
            const linkConfig = {
                [MENU_TYPE.MASTER]: {
                    pickingName: { name: 'productionReceiveOperate', query: { name: 'productionReceive', type: 'view', id: row.id } },
                    pickingCode: { name: 'productionReceiveOperate', query: { name: 'productionReceive', type: 'view', id: row.id } },
                },
                [MENU_TYPE.BRANCH]: {
                    matlCode: { name: 'materialArchivesOperate', query: { name: 'productionReceive', type: 'view', matlCode: row.matlCode } },
                    orderRawCode: { name: 'productionOrderOperate', query: { name: 'productionReceive', type: 'view', id: row.orderRawId, tableType: 2 } },
                    produceCode: { name: 'materialArchivesOperate', query: { name: 'productionReceive', type: 'view', matlCode: row.produceCode } },
                    pickingCode: { name: 'productionReceiveOperate', query: { name: 'productionReceive', type: 'view', id: row.pickingId } },
                }
            }[this.tableType][code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    }
};
</script>

<style scoped lang="scss"></style>
