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
                    :defaultExpandAll="false" :treeProps="treeProps">
                    <template slot="status" slot-scope="scope">
                        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}
                    </template>
                    <template slot="bizStatus" slot-scope="scope">
                        <span :class="'scStatus-' + scope.value">{{ scope.value |
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
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { detail } from '@/api/projectManagement/productionParams'
import { getListQuery, getDetailListQuery, exportQueryList } from '@/api/projectManagement/productionOrder';
import orderDetailType from '@/views/components/orderDetailType'
import fileList from '@/views/components/fileList/index'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { menuConfig, treeProps } from '@/utils'
import activitiyTmpl from '@/views/print/activitiyTmpl'
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
    components: { activitiyTmpl, fileList, orderDetailType, activitiAssignee, workFlowView, guidePreview, FormUnitId },
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
            formData: {},
            formDataClick: {},
            workFlowViewVisible: false,
        };

    },
    computed: {
    },
    created() {
        this.menuProperty(this.tableType == MENU_TYPE.BRANCH ? menuConfig.MENU_PRODUCTION_QUERY_BRANCH : '',)
        this.idName = this.tableType == MENU_TYPE.BRANCH ? 'orderRawId' : 'orderId'

    },
  
    methods: {

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
                const func = { [MENU_TYPE.MASTER]: getListQuery, [MENU_TYPE.BRANCH]: getDetailListQuery }[this.tableType]
                const { data: { list = [], total = 0 } } = await func(param)

                this.list = list
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

            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button) {
            let flag = false

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
                export: () => {
                    this.handleExport()
                },
            };
            const action = buttonActions[buttonCode];
            action && action();
        },

        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                await exportQueryList(param)
            } catch (err) {
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
