<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :treeList="treeList" @searchFormTreeSelected="searchFormTreeSelected"
            @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch" :searchArr="property.search || []"
            :formData="formData" @handleQuery="handleQuery" @handleResetField="handleResetField" />
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
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { submit, getList, getDetailList, removes, removeBatch, exportList, pushState, exportDetailList } from '@/api/projectManagement/productionPiecework'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import orderDetailType from '@/views/components/orderDetailType'
import fileList from '@/views/components/fileList/index'
import workFlowView from '@/components/workFlowView'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { menuConfig } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'

const MENU_TYPE = {
    MASTER: 'MASTER', // 主单
    BRANCH: 'BRANCH'  // 主单+明细
}
export default {
    name: "productionPrecework",
    mixins: [indexMixin],
    components: { fileList, orderDetailType, activitiAssignee, workFlowView },
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
        this.menuProperty(this.tableType == MENU_TYPE.BRANCH ? menuConfig.MENU_PRECEWORK_BRANCH : '')
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

                const func = { [MENU_TYPE.MASTER]: getList, [MENU_TYPE.BRANCH]: getDetailList }[this.tableType]
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
        handleButtonDisable(button, { status, bizStatus, pushStatus }) {
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
                if (['push'].includes(button.buttonCode) && !['1', '3'].includes(pushStatus)) {
                    return true
                }
            } else {
                if (['3', '2'].includes(status) && ['update', 'delete', 'submit'].includes(button.buttonCode)) {
                    return true
                }
                if (['create', 'submit', 'export'].includes(button.buttonCode)) {
                    return true
                }
                if (['push'].includes(button.buttonCode) && !['0'].includes(bizStatus)) {
                    return true
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
            const ids = rowArr.map(({ stId }) => stId)
            const buttonActions = {
                update: () => {
                    this.handleUpdate(ids)
                },
                delete: () => { this.handleDelete(rowArr); },
                create: () => { this.$router.push({ name: 'productionPieceworkOperate', query: { name: 'productionPiecework', type: 'create' } }); },
                push: () => {
                    this.handlePushState(rowArr)
                },
                submit: () => {
                    this._selectedRows = rowArr
                    this.handleSubmit(ACTIVITI_ASSUGNEE.MM_ST);
                },
                flowSee: () => {
                    this.workFlowViewVisible = true
                    this.selectedRow = { id: rowArr[0].stId, businessId: rowArr[0].stId };
                },
                export: () => {
                    this.handleExport()
                },
                withdraw: () => {
                    this.handleWithdraw({ businessId: rowArr[0].stId, businessType: ACTIVITI_ASSUGNEE.MM_ST, })
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        async handlePushState(rows) {
            
            // const index = this.property.buttonTop.findIndex(item => item.buttonCode == 'push')
            // const button = this.property.buttonTop[index]
            try {
                // this.$set(this.property.buttonTop, index, { ...button, loading: true, buttonName: '推送中' })
                this.setButtonLoading('push', true)
                const [id] = rows.map(({ stId }) => stId)
                await pushState(id)
                this.$modal.msgSuccess('推送成功')
                this.getList()
            } catch (err) {
                console.error(err)
            } finally {
                  this.setButtonLoading('push', false)
                // this.$set(this.property.buttonTop, index, { ...button, loading: false, buttonName: '推送' })
            }

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
                const ids = this._selectedRows.map(({ stId }) => stId)
                await submit({ ids: ids, assignee: assignee })
                this.$modal.msgSuccess(`提交成功`)
                this.getList();
                this.refreshChange(this.refName)
            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        handleUpdate(ids) {
            const route = 'productionPieceworkOperate'
            if (this.tableType === MENU_TYPE.BRANCH) {
                this.$router.push({ name: route, query: { tableType: '2', name: 'productionPiecework', type: 'update', ids: ids.join(',') } });
            } else {
                this.$router.push({ name: route, query: { tableType: '1', name: 'productionPiecework', type: 'update', id: ids[0] } });
            }
        },
        handleDelete(rows) {
            try {
                this.$modal.confirm('是否确定删除?').then(async () => {
                    const ids = rows.map(({ stId, stRawId }) => this.tableType === MENU_TYPE.BRANCH ? stRawId : stId)
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
            const commonConfig = {
                stCode: { name: 'productionPieceworkOperate', query: { name: 'productionPiecework', type: 'view', id: row.stId } },
            }
            const linkConfig = {
                [MENU_TYPE.MASTER]: {
                    ...commonConfig,
                },
                [MENU_TYPE.BRANCH]: {
                    ...commonConfig,
                    matlCode: { name: 'materialArchivesOperate', query: { name: 'productionPiecework', type: 'view', matlCode: row.matlCode } },
                    orderRawId: { name: 'productionOrderOperate', query: { name: 'productionPiecework', type: 'view', id: row.orderRawId, tableType: '2' } },
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
