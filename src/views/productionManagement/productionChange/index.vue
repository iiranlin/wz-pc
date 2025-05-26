<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" @searchFormTreeSelected="searchFormTreeSelected"
            @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch" :searchArr="property.search || []"
            :formData="formData" @handleQuery="handleQuery" @handleResetField="handleResetField">
            <!-- <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template> -->

            <!-- <template slot="planAttribute" slot-scope="scope">
                <el-select class="select-box" v-model="formData.planAttribute" placeholder="请选择计划属性" style="width:100%"
                    size="small">
                    <el-option v-for="(item, key) in scope.data.fieldFormatArr.filter(item => item.code != '2')"
                        :key="key" :label="item.name" :value="item.code" />
                </el-select>
            </template> -->
        </form-data>

        <el-row type="flex" class="container_h">
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery" :menuId="menuId"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick">
                </right-toolbar>
                <table-index ref="tableIndex" :idName="idName" :loading="loading" :tableIndexs="tableIndex"
                    :tableData="list" :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
                    :menuId="menuId" @handleSelectionChange="handleSelectionChange" @clickLink="clickLink"
                    @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter">
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
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <activitiyTmpl ref="activitiyTmpl" @confirm="handleTmplConfirm"></activitiyTmpl>
        <History ref="historyRef"></History>
        <Logs ref="logsRef" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { getList, remove, exportList, submit, historyList } from '@/api/projectManagement/productionChange';
import fileList from '@/views/components/fileList/index'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { collectField, getRouteByDemandPlanSourceType } from '@/utils'
import activitiyTmpl from '@/views/print/activitiyTmpl'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import guidePreview from '@/components/guide-preview'
import FormUnitId from '@/views/components/form-unitId'

export default {
    name: "productionChange",
    mixins: [indexMixin],
    dicts: ['planAttribute'],
    components: {
        History: () => import('./components/history'),
        Logs: () => import('./components/logs'),
        activitiyTmpl, fileList, activitiAssignee, workFlowView, guidePreview, FormUnitId
    },
    data() {
        return {
            idName: 'id',
            menuId: '',

            // 遮罩层
            loading: false,
            selectedRow: null,
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
                pageSize: 30,
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
        this.menuProperty()
        this.idName = 'id'

    },

    methods: {
        async searchFormTreeSelected(node, fieldCode) {
        },
        searchFormTreeCleared(fieldCode = "") {
        },
        async menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            const property = await this.$store.dispatch('menuProperty', this.menuId)
            this.listQuery.pageSize = property.defaultPageSize || 30
            this.property = Object.freeze(property)
        },
        async getList() {
            try {
                this.loading = true
                const param = {
                    ...this.listQuery,
                    ...this.formData,
                    dLevel: 0
                }
                if (!!param.deptId) {
                    param.borrowDeptId = param.deptId
                    delete param.deptId
                }

                const { data: { list = [], total = 0 } } = await getList(param)
                this.list = list.map(item => ({ ...item, children: null }))
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


        handleNodeClick(node) {
            this.formData.matlClassifyId = node.matlClassifyId
            this.getList()
        },

        handleTopButtonDisabled(button) {
            if (['print'].includes(button.buttonCode)) {
                return !this.selection.length
            }

            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, { status, bizStatus, canIn, matlStatus, inStatus, useNum, pickingStatus, isChange }) {
            let flag = false
            if (['update', 'delete', 'submit'].includes(button.buttonCode)) {
                return ['2', '3'].includes(status)
            }
            if (['async'].includes(button.buttonCode)) {
                return !['3'].includes(status)
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
            this.ids = row.map(item => item.changeId)
            this.single = single
            this.multiple = multiple
            this.selection = row

        },
        handleResetField() {
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const ids = rowArr.map(({ id }) => id)
            const that = this
            const buttonActions = {
                update: () => {
                    const cids = rowArr.map(({ changeId }) => changeId)
                    this.handleUpdate(cids)
                },
                source: () => {
                    this.$router.push({ name: 'productionReviewQuery', query: { orderRawCode: rowArr[0].orderRawCode } });
                },
                report: () => {
                    this.handleReport(rowArr)
                },
                delete: () => { this.handleDelete(rowArr); },
                create: () => { this.$router.push({ name: 'productionChangeOperate', query: { name: 'productionChange', type: 'create' } }); },
                submit: () => {
                    this._selectedRows = rowArr
                    this.handleSubmit(ACTIVITI_ASSUGNEE.MM_SCBG);
                },
                flowSee: () => {
                    this.workFlowViewVisible = true
                    this.selectedRow = { id: rowArr[0].changeId, businessId: rowArr[0].changeId };
                },
                export: () => {
                    this.handleExport()
                },
                async: () => {
                    const that = this
                    this.$modal.confirm(`<p style="color:red;text-align: left;">1.  同步后，将覆盖原有生产订单，以变更后的数据为准；</p>
                    <p style="color:red;text-align: left;">2.如果原有生产订单已做相关操作，比如已领料，需要退料的，请及时自行退料等逆向操作;</p>
                    <p style="color:red;text-align: center;">是否确定同步数据？</p>
                    `, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        dangerouslyUseHTMLString: true,
                        center: true,
                        distinguishCancelAndClose: true,
                        showCancelButton: true,
                    }).then(() => {
                        this.setButtonLoading('async', true)
                        const timer = setTimeout(() => {
                            clearTimeout(timer)
                            this.setButtonLoading('async', false)
                        }, 5000);


                    })
                },
                logs: () => {
                    const ids = rowArr[0].changeContent ? rowArr[0].changeContent.split(',').filter(itm => !!itm) : []
                    this.$refs.logsRef.init(ids)
                },
                historyList: () => {
                    this.$refs.historyRef.init();
                },
                history: () => {
                    this.$refs.historyRef.init(rowArr[0], true)
                },
                withdraw: () => {
                    this.handleWithdraw({ businessId: rowArr[0].changeId, businessType: ACTIVITI_ASSUGNEE.MM_SCBG, })
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        btnLoading() {

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
                const ids = this._selectedRows.map(({ changeId }) => changeId)
                await submit({ assignee, ids: ids })
                this.$modal.msgSuccess(`提交成功`)
                this.getList();

            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        handleUpdate(ids) {
            const route = 'productionChangeOperate'
            this.$router.push({ name: route, query: { name: 'productionChange', type: 'update', id: ids[0] } });
        },


        handleDelete(rows) {
            try {
                this.$modal.confirm('是否确定删除?').then(async () => {
                    const ids = rows.map(({ changeId }) => changeId)
                    await remove({ ids: ids })
                    this.$modal.msgSuccess(`删除成功`)
                    this.getList();
                })

            } catch (err) {
                this.$modal.msgError(err.message)
                console.error(err)
            }
        },
        clickLink(row, code) {
            const linkConfig = {
                changeCode: { name: 'productionChangeOperate', query: { type: "view", id: row.changeId, name: 'productionChange', isQuery: 'query' } },
                cuCode: { name: 'customerProfileAdd', query: { type: "view", id: row.cuId, name: 'productionChange', isQuery: 'query' } },
                reportCode: { name: 'productionOrderReport', query: { name: 'productionChange', type: 'view', rawId: row.orderRawId } },
                sourceProjectCode: { name: 'projectManagementOperate', query: { name: 'productionChange', type: 'view', id: row.sourceProjectId } },
                bomCode: { name: 'BOMAdministrationOperate', query: { name: 'productionChange', type: 'view', id: row.bomId } },
                bomVersion: { name: 'BOMAdministrationOperate', query: { name: 'productionChange', type: 'view', id: row.bomId } },
                sourceCode: { name: getRouteByDemandPlanSourceType(row.sourceType), query: { name: 'productionChange', type: 'view', id: row.sourceId } },
                pathCode: { name: 'processRouteCreate', query: { name: 'productionChange', type: 'view', id: row.pathId } },
                pathVersion: { name: 'processRouteCreate', query: { name: 'productionChange', type: 'view', id: row.pathId } },
                orderRawCode: { name: 'productionOrderOperate', query: { name: 'productionChange', type: 'view', id: row.orderRawId, tableType: '2' } },
                orderCode: { name: 'productionOrderOperate', query: { name: 'productionChange', type: 'view', id: row.orderId } },
                matlCode: { name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'productionChange' } },
                sourcePlanCode: { name: 'demandPlanWorkbenchOperate', query: { type: "view", id: row.sourcePlanId, name: 'productionChange' } },
            }[code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    },

};
</script>

<style scoped lang="scss"></style>
