<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :treeList="treeList" @searchFormTreeSelected="searchFormTreeSelected"
            @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch" :searchArr="property.search || []"
            :formData="formData" @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template slot="matlClassifyId" slot-scope="scope">
                <el-input :disabled="true" v-model="formDataClick.matlClassifyId"></el-input>
            </template>
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <collapse v-if="tableType == tableOptions[1].value">
                <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <span class="ov_head_title">物料分类</span>
                        <el-tree class="drawer-tree" node-key="matlClassifyId" :indent="0" :data="dataOptions"
                            :props="defaultProps" :expand-on-click-node="false" ref="tree" :highlight-current="true"
                            :filter-node-method="filterNode" @node-click="handleNodeClick" />
                    </div>

                </el-col>
            </collapse>
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
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                    <template slot="status" slot-scope="scope">
                        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}
                    </template>
                    <template slot="lendStatus" slot-scope="scope">
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
        <activiti-assignee ref="activitiAssignee"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <fileList ref="fileList" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { getList, getDetailList, delOrder, submitOrder, removeDetail, exportDetailList, getDetailOrder } from '@/api/warehouseManage/lendManage'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import orderDetailType from '@/views/components/orderDetailType'

import fileList from '@/views/components/fileList/index'

import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { menuConfig, uniqueArrByField } from '@/utils'
import collapse from '@/components/Collapse'
import workFlowView from '@/components/workFlowView'
import FormUnitId from '@/views/components/form-unitId'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
const LEND_TYPE = {
    MASTER: 'MASTER', // 主单
    BRANCH: 'BRANCH'  // 主单+明细
}
export default {
    name: "lendOrder",
    mixins: [indexMixin],
    components: { fileList, orderDetailType, activitiAssignee, collapse, workFlowView, FormUnitId },
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
        const arg = this.tableType == LEND_TYPE.BRANCH ? { matlClassifyId: '全部' } : {}
        return {
            tableOptions: [
                { value: LEND_TYPE.MASTER, label: '主单' },
                { value: LEND_TYPE.BRANCH, label: '主单+明细' },
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
            formDataClick: {
                ...arg
            },
            workFlowViewVisible: false,
            selectedRow: null
        };

    },
    created() {
        this.menuProperty({ [LEND_TYPE.MASTER]: '', [LEND_TYPE.BRANCH]: menuConfig.MENU_LEND_BRANCH }[this.tableType])
        this.tableType == LEND_TYPE.BRANCH && this.getTreeList()

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
            for (let i = 0; i < property.search.length; i++) {
                if (["matlClassifyId"].includes(property.search[i].fieldCode)) {
                    property.search[i]['clear'] = true
                    break
                }
            }
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
                if (this.formData.matlClassifyId == '全部') {
                    delete this.formData.matlClassifyId
                }
                const func = { [LEND_TYPE.MASTER]: getList, [LEND_TYPE.BRANCH]: getDetailList }[this.tableType]
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
                let { data } = await getDetailOrder(scope.data.id)
                this.$refs.fileList.init(data.fileList)

            } catch (err) {
                console.error(err)
            }


        },
        handleNodeClick(data) {
            if (data.matlClassifyId === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.matlClassifyId = null;
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
                this.formDataClick.matlClassifyId = '全部';
            } else {
                this.treeCurrentKey = data.matlClassifyId;
                this.formData.matlClassifyId = data.matlClassifyId;
                this.formDataClick.matlClassifyId = data.matlClassifyName;
            }
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
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, { status, lendStatus }) {
            let flag = false
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(status)
            }
            if (this.tableType === LEND_TYPE.MASTER) {
                // 主表
                // 主表禁用下推出库&归还
                if (['push', 'lend'].includes(button.buttonCode)) {
                    return true
                }
                // 主表审核通过禁用删除&修改&提交
                if (['3', '2'].includes(status) && ['update', 'delete', 'submit'].includes(button.buttonCode)) {
                    return true
                }
            } else {
                if (['3', '2'].includes(status) && ['update', 'delete', 'submit'].includes(button.buttonCode)) {
                    return true
                }

                if (['submit', 'export', 'flowSee'].includes(button.buttonCode)) {
                    return true
                }
                if (['push'].includes(button.buttonCode)) {
                    const codeArr = uniqueArrByField(this.selection, 'projectCode')
                    return codeArr.length !== 1 || !['2', '3'].includes(lendStatus)
                }
                if (['lend'].includes(button.buttonCode)) {
                    const codeArr = uniqueArrByField(this.selection, 'projectCode')
                    const allStatus = this.selection.some(s => s.lendStatus != '5')
                    return codeArr.length !== 1 || allStatus
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
            if (this.tableType == LEND_TYPE.BRANCH) {
                if (!this.formDataClick.matlClassifyId) {
                    this.formDataClick.matlClassifyId = '全部'
                } else {
                    const node = this.$refs.tree.getCurrentNode()
                    if (node && node.matlClassifyName) {
                        this.formDataClick.matlClassifyId = node.matlClassifyName
                    }

                }
            }
            this.getList();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, row) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = row

        },
        handleResetField() {
            this.formData.matlClassifyId = null;
            this.$refs.tree.setCurrentKey(null);
            this.treeCurrentKey = "";
            this.formDataClick.matlClassifyId = '全部';
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const ids = rowArr.map(({ id }) => id)
            const buttonActions = {
                update: () => {
                    this.handleUpdate(ids)
                },
                delete: () => { this.handleDelete(rowArr); },
                create: () => { this.$router.push({ name: 'createLendOrder', query: { name: 'lendOrder', type: 'create' } }); },
                // push: () => { this.$router.push({ name: 'createLendOutboundOrder', query: { name: 'lendOrder', type: 'create', ids: ids.join(',') } }); },
                push: () => { this.$router.push({ name: 'outboundMaintenanceOperate', query: { name: 'lendOrder', outSource: '5', type: 'outbound', ids: ids.join(',') } }); },

                lend: () => { this.$router.push({ name: 'lendReturnOrder', query: { name: 'lendOrder', type: 'create', ids: ids.join(',') } }); },
                submit: () => {
                    this.ids = idArr
                    this.handleSubmit(ACTIVITI_ASSUGNEE.INV_JCD);
                },
                flowSee: () => {
                    this.workFlowViewVisible = true
                    this.selectedRow = { id: rowArr[0].id, businessId: rowArr[0].id };
                },
                export: () => {
                    this.handleExport()
                },
                withdraw: () => {
                    this.handleWithdraw({ businessId: rowArr[0].id, businessType: ACTIVITI_ASSUGNEE.INV_JCD, })
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
        //提交
        submit(assignee = '') {
            this.loading = true;
            submitOrder({ ids: this.ids, assignee }).then(({ success, data, message }) => {
                if (success) {
                    this.$modal.msgSuccess('提交成功')
                    this.getList()
                    this.refreshChange(this.refName)
                } else {
                    this.$modal.msgError(message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        handleUpdate(ids) {
            const route = this.tableType === LEND_TYPE.BRANCH ? 'lendOrderDetail' : 'createLendOrder'
            if (this.tableType === LEND_TYPE.BRANCH) {
                this.$router.push({ name: route, query: { name: 'lendOrder', type: 'update', ids: ids.join(',') } });
            } else {
                this.$router.push({ name: route, query: { name: 'lendOrder', type: 'update', id: ids[0] } });
            }
        },
        handleDelete(rows) {
            try {
                this.$modal.confirm('是否确定删除?').then(async () => {
                    const ids = rows.map(({ id }) => id)
                    const req = this.tableType === LEND_TYPE.BRANCH ? removeDetail : delOrder
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
                [LEND_TYPE.MASTER]: {
                    lendCode: { name: 'createLendOrder', query: { name: 'lendOrder', type: 'view', id: row.id } },
                    projectCode: { name: 'projectManagementOperate', query: { name: 'lendOrder', type: 'view', id: row.projectId } }
                },
                [LEND_TYPE.BRANCH]: {
                    lendCode: { name: 'createLendOrder', query: { name: 'lendOrder', type: 'view', id: row.lendId } },
                    matlCode: { name: 'materialArchivesOperate', query: { name: 'lendOrder', type: 'view', matlCode: row.matlCode } },
                    projectCode: { name: 'projectManagementOperate', query: { name: 'lendOrder', type: 'view', id: row.projectId } }
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
