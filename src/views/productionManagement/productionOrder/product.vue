<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :treeList="treeList" @searchFormTreeSelected="searchFormTreeSelected"
            @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch" :searchArr="property.search || []"
            :formData="formData" @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
            <template slot="collapse" slot-scope="scope">
                <el-radio-group v-model="collapse">
                    <el-radio :label="false">阶层全折叠</el-radio>
                    <el-radio :label="true">阶层全展开</el-radio>
                </el-radio-group>
            </template>
            <template slot="planAttribute" slot-scope="scope">
                <el-select class="select-box" v-model="formData.planAttribute"  placeholder="请选择计划属性"
                    style="width:100%" size="small">
                    <el-option v-for="(item, key) in scope.data.fieldFormatArr.filter(item => item.code != '2')" :key="key" :label="item.name"
                        :value="item.code" />
                </el-select>
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
                <table-index ref="tableIndex" :idName="idName" :loading="loading" :tableIndexs="tableIndex"
                    :tableData="list" :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
                    :lazy="false" :menuId="menuId" @handleSelectionChange="handleSelectionChange" @clickLink="clickLink"
                    @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter"
                    :defaultExpandAll="collapse" :treeProps="treeProps">
                    <template slot="status" slot-scope="scope">
                        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}
                    </template>
                    <template slot="bizStatus" slot-scope="scope">
                        <span :class="'scStatus-' + scope.value">{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}</span>
                    </template>
                    <template slot="isChange" slot-scope="scope">
                        <span :class="'yesOrNo-' + scope.value">{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}</span>
                    </template>

                    <template slot="planAttribute" slot-scope="scope">
                        <span :class="'planAttribute-' + scope.value">{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}</span>
                    </template>
                    <template slot="pickingStatus" slot-scope="scope">
                        <span :class="'pickingStatus-' + scope.value">{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}</span>
                    </template>
                    <template slot="inStatus" slot-scope="scope">
                        <span :class="'inStatus-' + scope.value">{{ scope.value |
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
        <guidePreview ref="guidePreview" />
        <activitiyTmpl ref="activitiyTmpl" @confirm="handleTmplConfirm"></activitiyTmpl>
        <bomHistory ref="bomHistory" :copyOperate="true"
            @createClick="(id) => { $router.push({ name: 'BOMAdministrationOperate', query: { type: 'create', copyHistoryCreate: '2', id } }) }">
        </bomHistory>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import bomHistory from '@/views/components/bom-history';
import { classTree } from '@/api/prodmgr-mm/matlClass';
import { detail } from '@/api/projectManagement/productionParams'
import { getList, remove, getDetailList, startM, finishM, batchRemove, exportList, submit } from '@/api/projectManagement/productionOrder';
import orderDetailType from '@/views/components/orderDetailType'
import fileList from '@/views/components/fileList/index'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { menuConfig, collectField, treeAddProps } from '@/utils'
import activitiyTmpl from '@/views/print/activitiyTmpl'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import guidePreview from '@/components/guide-preview'
import FormUnitId from '@/views/components/form-unitId'
const MENU_TYPE = {
    MASTER: 'MASTER', // 主单
    BRANCH: 'BRANCH'  // 主单+明细
}
export default {
    name: "productionOrderTable",
    mixins: [indexMixin],
    dicts: ['planAttribute'],
    components: {bomHistory, activitiyTmpl, fileList, orderDetailType, activitiAssignee, workFlowView, guidePreview, FormUnitId },
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
            collapse: false,
            treeProps: {
                children: 'children',
                hasChildren: 'hasChildren'
            },
            idName: 'orderId',
            tableOptions: [
                { value: MENU_TYPE.MASTER, label: '主单' },
                { value: MENU_TYPE.BRANCH, label: '主单+明细' },
            ],
            // tableType: MENU_TYPE.MASTER,
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
                pageSize:  30,
            },
            // 表单参数
            formData: {
            },
            formDataClick: {
            },
            workFlowViewVisible: false,
        };

    },
    computed: {
    },
    created() {
        this.getDeptTree();
        this.getTreeList()
        this.menuProperty(this.tableType == MENU_TYPE.BRANCH ? menuConfig.MENU_PRODUCTION_BRANCH : '',)
        this.idName = this.tableType == MENU_TYPE.BRANCH ? 'orderRawId' : 'orderId'

    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    methods: {
        async getDeptTree() {
            const unitOps = (await this.getDeptTreeByUserMixin()) || [];
            this.treeList.deptId = Object.freeze(unitOps);
        },
        async searchFormTreeSelected(node, fieldCode) {
        },
        searchFormTreeCleared(fieldCode = "") {
        },
        async menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            const { data: { isCreatePicking } } = await detail();
            const property = await this.$store.dispatch('menuProperty', this.menuId)
            this.listQuery.pageSize = property.defaultPageSize || 30
            property.fields.forEach((field) => {
                if (field.fieldCode === 'fileList') {
                    field.listSlot = true
                }
            })
            if (id === menuConfig.MENU_PRODUCTION_BRANCH) {
                if (isCreatePicking == '1') {
                    property.buttonRow = property.buttonRow.filter(item => item.buttonCode != 'receive')
                }
                property.buttonTop = property.buttonTop.map(item => {
                    if (item.buttonCode === 'branch') {
                        item.children = [
                            { buttonCode: 'branchStart', buttonName: '批量开工', buttonMode: '2' },
                            { buttonCode: 'branchEnd', buttonName: '批量完工', buttonMode: '2' }
                        ]
                    }
                    return item
                })
            }
            this.property = Object.freeze(property)
        },
        async getList() {
            try {
                this.idName = this.tableType == MENU_TYPE.BRANCH ? 'orderRawId' : 'orderId'
                this.loading = true
                const param = {
                    ...this.listQuery,
                    ...this.formData
                }
                if (!!param.deptId) {
                    param.borrowDeptId = param.deptId
                    delete param.deptId
                }
                if (this.tableType == MENU_TYPE.BRANCH) {
                    param.dLevel = 0
                }
                const func = { [MENU_TYPE.MASTER]: getList, [MENU_TYPE.BRANCH]: getDetailList }[this.tableType]
                const { data: { list = [], total = 0 } } = await func(param)
                treeAddProps(list, 'children')
                this.list = list.map(item => ({...item, isChange: '1'}))
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
                this.dataOptions = Object.freeze(data) || [];
            }).finally(() => {
                this.treeLoading = false;
            })
        },

        handleTopButtonDisabled(button) {
            if (['print'].includes(button.buttonCode)) {
                return !this.selection.length
            }
            if (this.tableType === MENU_TYPE.BRANCH && ['submit'].includes(button.buttonCode)) {
                return true
            }
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, { status, bizStatus, canIn, matlStatus, inStatus, useNum, pickingStatus, isChange }) {
            let flag = false
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(status)
            }
            if (this.tableType === MENU_TYPE.MASTER) {
                // 主表审核通过禁用删除&修改&提交
                if (['3', '2'].includes(status) && ['update', 'delete', 'submit'].includes(button.buttonCode)) {
                    return true
                }
            } else {
                if(['historyVersion'].includes(button.buttonCode)) {
                    return isChange != '1'
                }
                if (['update', 'delete'].includes(button.buttonCode)) {
                    return ['3', '2'].includes(status) || !'1' == bizStatus
                }
                if ('analysis' == button.buttonCode) {
                    return '4' == bizStatus
                }
                if ('branchStart' == button.buttonCode) {
                    return '2' != bizStatus
                }
                if ('branchEnd' == button.buttonCode) {
                    return !('3' == bizStatus &&  pickingStatus != '1')
                }
                if (['report'].includes(button.buttonCode)) {
                    return !['3', '4'].includes(bizStatus)
                }
                if (['receive'].includes(button.buttonCode)) {
                    return !['3'].includes(status) || ['4'].includes(bizStatus)
                }
                if (['receive'].includes(button.buttonCode)) {
                    return !['3'].includes(status) || ['4'].includes(bizStatus)
                }
                if (['production'].includes(button.buttonCode)) {
                    return !'1' == canIn
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
            const ids = rowArr.map(({ orderId }) => orderId)
            const that = this
            const buttonActions = {
                guide: () => {
                    this.$refs.guidePreview.clickHandler('GUIDE_01')
                },
                historyVersion: () => {
                    this.$refs.bomHistory.init(rowArr[0].bomCode, rowArr[0].bomVersion);
                },
                update: () => {
                    this.handleUpdate(ids)
                },
                charts: () => {
                    this.handleCharts(rowArr)
                },
                analysis: () => {
                    this.handleAnalysis(rowArr)
                },
                source: () => {
                    this.$router.push({ name: 'productionReviewQuery', query: { orderRawCode: rowArr[0].orderRawCode } });
                },
                report: () => {
                    this.handleReport(rowArr)
                },
                delete: () => { this.handleDelete(rowArr); },
                create: () => { this.$router.push({ name: 'productionOrderOperate', query: { name: 'productionOrder', type: 'create' } }); },
                submit: () => {
                    this._selectedRows = rowArr
                    this.handleSubmit(ACTIVITI_ASSUGNEE.MM_ORDER);
                },
                flowSee: () => {
                    this.workFlowViewVisible = true
                    this.selectedRow = { id: rowArr[0].orderId, businessId: rowArr[0].orderId };
                },
                export: () => {
                    this.handleExport()
                },
                production: async () => {
                    if (await this.showMsg(rowArr)) {
                        const isUnit = rowArr.every((item, index, arrs) => {
                          return item.unitId == arrs[0].unitId
                        })
                        if (!isUnit) {
                          this.$modal.msgError('只能选相同所属组织的数据')
                          return
                        }
                        this.$modal.confirm(`<p style="color:red;text-align: center;">因生产入库需要根据"消耗的材料成本"计算"产品的入库单价",如果本次入库是"该生产单最后一笔入库",有余料的请一定先维护退料单并完成入库,这样才能扣减掉退料成本;请务必确认清楚!</p>
                    `, '提示', {
                            confirmButtonText: '已确认,继续操作',
                            cancelButtonText: '先不继续,去确认',
                            dangerouslyUseHTMLString: true,
                            center: true,
                            distinguishCancelAndClose: true,
                            showCancelButton: true,
                        }).then(() => {
                            const ids = rowArr.map(({ orderRawId }) => orderRawId)
                            this.$router.push({ name: 'createInventoryMaintenance', query: { name: 'productionOrder', inSource: '5', type: 'product', ids: ids.join(',') } });
                        })
                    }

                },
                // productionOrder: () => {
                //     const ids = rowArr.map(({ orderRawId }) => orderRawId)
                //     // 生产订单
                //     this.$router.push({ name: 'createInventoryMaintenance', query: { name: 'productionOrder', inSource: '6', type: 'product', ids: ids.join(',') } });
                // },
                // productionReport: () => {
                //     const ids = rowArr.map(({ orderRawId }) => orderRawId)
                //     // 完工报告
                //     this.$router.push({ name: 'createInventoryMaintenance', query: { name: 'productionOrder', inSource: '5', type: 'product', ids: ids.join(',') } });
                // },
                receive: () => {
                    const ids = rowArr.map(({ orderRawId }) => orderRawId)
                    // 领料
                    this.$router.push({ name: 'outboundMaintenanceOperate', query: { name: 'productionOrder', outSource: '7', type: 'receive', ids: ids.join(',') } });
                },
                branchStart: async () => {
                    if (await this.showMsg(rowArr)) {
                        this.handleStart(rowArr)
                    }

                },
                branchEnd: async () => {
                    if (await this.showMsg(rowArr)) {
                        this.handleEnd(rowArr)
                    }

                },
               
                withdraw: () => {
                    this.handleWithdraw({ businessId: rowArr[0].orderId, businessType: ACTIVITI_ASSUGNEE.MM_ORDER, })
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        async showMsg(rows) {
            const that = this
            return new Promise(async (resolve) => {
                let flag = true
                try {
                    const expandedAll = collectField(rows, 'expandedRow')
                    const flags = expandedAll.every(flag => flag)
                    if (!flags) {
                        await that.$modal.confirm('存在折叠的数据，请先展开后再进行选择', '提示', {
                            showClose: false,
                            showCancelButton: false,
                            type: 'warning'
                        })
                        flag = false
                    }

                } catch (err) {
                    flag = false
                    console.error()
                }
                resolve(flag)
            })



        },
        async handleStart(rows) {
            try {
                this.$modal.confirm('是否确定批量开工?').then(async () => {
                    const ids = rows.map(({ orderRawId }) => orderRawId)
                    await startM(ids)
                    this.$modal.msgSuccess(`批量开工成功`)
                    this.getList();
                    this.refreshChange(this.refName)
                })
            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        async handleEnd(rows) {
            try {
                this.$modal.confirm('是否确定批量完工?').then(async () => {
                    const ids = rows.map(({ orderRawId }) => orderRawId)
                    await finishM(ids)
                    this.$modal.msgSuccess(`批量完工成功`)
                    this.getList();
                    this.refreshChange(this.refName)
                })
            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                await exportList(param)
            } catch (err) {
                console.error(err)
            }
        },
        async submit(assignee = '') {
            try {
                const ids = this._selectedRows.map(({ orderId }) => orderId)
                await submit({ assignee, ids: ids })
                this.$modal.msgSuccess(`提交成功`)
                this.getList();
                this.refreshChange(this.refName)
            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        handleUpdate(ids) {
            const route = 'productionOrderOperate'
            this.$router.push({ name: route, query: { tableType: 1, name: 'productionOrder', type: 'update', id: ids[0] } });
        },
        handleCharts(rows) {
            const ids = rows.map(({ orderRawId }) => orderRawId)
            const route = this.tableType === MENU_TYPE.BRANCH ? 'productionOrderCharts' : ''
            if (this.tableType === MENU_TYPE.BRANCH) {
                this.$router.push({ name: route, query: { name: 'productionOrder', type: 'view', id: ids[0] } });
            }
        },
        handleAnalysis(rows) {
            const ids = rows.map(({ orderRawId }) => orderRawId)
            const route = this.tableType === MENU_TYPE.BRANCH ? 'productionOrderAnalysis' : ''
            if (this.tableType === MENU_TYPE.BRANCH) {
                this.$router.push({ name: route, query: { name: 'productionOrder', type: 'view', id: ids[0] } });
            }
        },
        handleReport(rows) {
            const ids = rows.map(({ orderRawId }) => orderRawId)
            const route = this.tableType === MENU_TYPE.BRANCH ? 'productionOrderReport' : ''
            if (this.tableType === MENU_TYPE.BRANCH) {
                this.$router.push({ name: route, query: { name: 'productionOrder', type: 'create', rawId: ids[0] } });
            }
        },
        handleDelete(rows) {
            try {
                this.$modal.confirm('是否确定删除?').then(async () => {
                    const ids = this.tableType === MENU_TYPE.BRANCH ? rows.map(({ orderRawId }) => orderRawId) : rows.map(({ orderId }) => orderId)
                    const req = this.tableType === MENU_TYPE.BRANCH ? batchRemove : remove
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
                    orderCode: { name: 'productionOrderOperate', query: { name: 'productionOrder', type: 'view', id: row.orderId } },
                    matlCode: { name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'productionOrder' } }
                },
                [MENU_TYPE.BRANCH]: {
                    cuCode: { name: 'customerProfileAdd', query: { type: "view", id: row.cuId, name: 'productionOrder', isQuery: 'query' } },
                    reportCode: { name: 'productionOrderReport', query: { name: 'productionOrder', type: 'view', rawId: row.orderRawId } },
                    sourceProjectCode: { name: 'projectManagementOperate', query: { name: 'productionOrder', type: 'view', id: row.sourceProjectId } },
                    bomCode: { name: 'BOMAdministrationOperate', query: { name: 'productionOrder', type: 'view', id: row.bomId } },
                    bomVersion: { name: 'BOMAdministrationOperate', query: { name: 'productionOrder', type: 'view', id: row.bomId } },
                    sourceCode: { name: 'selfResearchDemandOperate', query: { name: 'productionOrder', type: 'view', id: row.sourceId } },
                    pathCode: { name: 'processRouteCreate', query: { name: 'productionOrder', type: 'view', id: row.pathId } },
                    pathVersion: { name: 'processRouteCreate', query: { name: 'productionOrder', type: 'view', id: row.pathId } },
                    orderRawCode: { name: 'productionOrderOperate', query: { name: 'productionOrder', type: 'view', id: row.orderRawId, tableType: '2' } },
                    orderCode: { name: 'productionOrderOperate', query: { name: 'productionOrder', type: 'view', id: row.orderId } },
                    matlCode: { name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'productionOrder' } },
                    sourcePlanCode: { name: 'demandPlanWorkbenchOperate', query: { type: "view", id: row.sourcePlanId, name: 'productionOrder' } },
                }
            }[this.tableType][code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    },

};
</script>

<style scoped lang="scss"></style>
