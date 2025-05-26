<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template slot="d" slot-scope="scope">
                    <el-select class="select-box" v-model="planAttribute"
                        placeholder="请选择" style="width:100%" size="small">
                        <el-option label="全部" value="全部" />
                        <el-option v-for="(item, key) in ['启用', '停用']" :key="key" :label="item"
                            :value="item" />
                    </el-select>
            </template>
        </form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :menuId="menuId" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick">
        </right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list" :lazy="true"
            :defaultExpandAll="false" :treeProps="treeProps" :buttonDisable="handleButtonDisable" :property="property"
            :numberShow="numberShow" :menuId="menuId" @handleSelectionChange="handleSelectionChange"
            @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter"
            @clickLink="clickLink">
            <template slot="d" slot-scope="scope">
                <div class="tytyty">
                    <span class="shi" v-if="scope.value == '启用'"> {{ scope.value }}</span>
                    <span class="fou" v-if="scope.value == '停用'"> {{ scope.value }}</span>
                </div>

            </template>
            <template slot="h" slot-scope="scope">
                <div class="tyty">
                    <span class="shi" v-if="scope.value == '是'"> {{ scope.value }}</span>
                    <span class="fou" v-if="scope.value == '否'"> {{ scope.value }}</span>
                </div>

            </template>
            <template slot="j" slot-scope="scope">
                <div class="tyty">
                    <span class="shi" v-if="scope.value == '是'"> {{ scope.value }}</span>
                    <span class="fou" v-if="scope.value == '否'"> {{ scope.value }}</span>
                </div>

            </template>
            <template slot="y" slot-scope="scope">
                <div class="tyty">
                    <span class="shi" v-if="scope.value == '是'"> {{ scope.value }}</span>
                    <span class="fou" v-if="scope.value == '否'"> {{ scope.value }}</span>
                </div>

            </template>


        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <fileList ref="fileList" />
        <mergeHistory ref="mergeHistoryRef" />
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { planList, planDetailList, planRemoveDetail, planRemoveOrder, exportDetailList, planSubmit } from '@/api/prodmgr-mm/demandPlan'
import { getList } from '@/api/prodmgr-mm/scheme'
import fileList from '@/views/components/fileList/index'
import { menuConfig, treeProps } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import mergeHistory from '@/views/components/merge-history'
import { getListByParentCode } from "@/api/system/dict";
import workFlowView from '@/components/workFlowView'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
const PLAN_ATTR = { 2: '-1', 3: '1', 4: '2', 5: '3' }
export default {
    name: "demandPlanWorkbench",
    mixins: [indexMixin],
    dicts: ['planAttribute'],
    props: {
        tableType: {
            type: String,
            default: '1'
        },
        tabChange: {
            type: Function,
            default: null
        }
    },
    components: { mergeHistory, fileList, orderDetailType, activitiAssignee, workFlowView },
    data() {

        return {
            treeProps: {
                children: 'children',
                hasChildren: 'hasChildren'
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
            numberShow: true,
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
            selectedRow: null,
            menuId: '',
            optionsData: [
                { value: '1', label: '主单' },
                { value: '2', label: '全部（主单+明细）' },
            ],
            planAttribute: '-1'
        };

    },
    async created() {
        this.planAttribute = PLAN_ATTR[this.tableType]
        await this.loadgetListByParentCode()
        await this.menuProperty({ '1': '', '2': menuConfig.MENU_WLXQJHGZT_TABLE, '3': menuConfig.MENU_WLXQJHGZT_TABLE, '4': menuConfig.MENU_WLXQJHGZT_TABLE, '5': menuConfig.MENU_WLXQJHGZT_TABLE }[this.tableType])
    },
    methods: {
        async loadgetListByParentCode() {
            const { data } = await getListByParentCode('planAttribute')
            const planAttributeArr = data.map(({ label }, index) => ({ label, value: `${index + 3}` }));
            this.optionsData = Object.freeze([
                ...this.optionsData,
                ...planAttributeArr
            ])
        },
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                const property = data;
                property.buttonTop = property.buttonTop.map(item => {
                    if (item.buttonCode === 'pushDown') {
                        item.children = [
                            {
                                buttonCode: 'pushPurchase',
                                buttonName: '下推采购计划',
                                buttonMode: '2',
                            },
                            {
                                buttonCode: 'pushProduction',
                                buttonName: '下推生产订单',
                                buttonMode: '2'
                            },
                        ]
                    }
                    return item
                })
                if (['1', '2', '3'].includes(this.planAttribute)) {
                    property.buttonTop = property.buttonTop.filter(item => item.buttonCode !== 'mergeQuery')
                    property.buttonRow = property.buttonRow.filter(item => item.buttonCode !== 'rowMergeQuery')
                }
                this.property = Object.freeze(property)
            });
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {

            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(row.status)
            }
            if (['print'].includes(button.buttonCode)) {
                return [...new Set(this.selection.map(({ planCode }) => planCode))].length != 1
            }
            if (button.buttonCode == 'pushPurchase') {
                const projectObj = {}
                const unitObj = {}
                for (let i = 0; i < this.selection.length; i++) {
                    projectObj[this.selection[i].projectId] = ''
                    unitObj[this.selection[i].unitId] = ''
                }
                const projectKeys = Object.keys(projectObj)
                const unitKeys = Object.keys(unitObj)
                return !(['2', '3'].includes(row.planStatus) && row.planAttribute == '2' && projectKeys.length == 1 && unitKeys.length == 1)
            }
            if (button.buttonCode == 'rowMergeQuery') {
                return row.isMerge == '0'
            }
            if (button.buttonCode == 'pushProduction') {
                const obj = {}
                for (let i = 0; i < this.selection.length; i++) {
                    obj[this.selection[i].unitId] = ''
                }
                const keys = Object.keys(obj)
                return !(['2', '3'].includes(row.planStatus) && ['1', '3'].includes(row.planAttribute) && !row.parentId && keys.length == 1)
            }

            if (['submit', 'flowSee'].includes(button.buttonCode) && this.tableType == '2') {
                return true
            }
            if (['update', 'delete', 'submit'].includes(button.buttonCode) && !['0', '1'].includes(row.status)) {
                return true
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
        //选择框回调
        selectChange(row) {
            let { formData, isWatch } = row;
            if (!isWatch) {
                this.handleQuery(formData);
            } else {
                this.formData = Object.assign({}, this.formData, formData);
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
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = row
        },
        handleResetField() {
            this.planAttribute = '-1'
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if(buttonCode === 'create') {
                this.$router.push({ name: 'schemeOperate', query: { type: 'create' } })
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            const param = Object.assign({}, this.listQuery, this.formData)
            getList(param).then(async ({ data }) => {
                this.list = data.list
                this.total = data.total || 0;
            }).finally(() => {
                this.loading = false;
            })
        },
        createOperation(buttonCode) {
            this.$router.push({ name: 'demandPlanWorkbenchOperate', query: { type: buttonCode } })
        },
        updateOperation(buttonCode, ids, rows) {
            const arr = rows.map(({ id, planId, }) => this.tableType != '1' ? planId : id)
            this.$router.push({ name: 'demandPlanWorkbenchOperate', query: { type: buttonCode, id: arr.join(','), } })
        },
        deleteOperation(buttonCode, ids) {
            this.$modal.confirm(this.tableType == '1' ? '是否确认删除？' : '是否删除该明细信息?').then(() => {
                return this.tableType == '1' ? planRemoveOrder({ ids }) : planRemoveDetail({ ids });
            }).then((data) => {
                if (data.success) {
                    this.getList();
                    this.refreshChange(this.refName)
                    this.$modal.msgSuccess("删除成功");
                } else {
                    this.getList();
                    this.$modal.msgError(data.message);
                }

            }).catch(() => { });
        },
        async exportOperation() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = Object.assign({}, this.listQuery, this.formData, { exportColumns })
                if (this.planAttribute) {
                    param.planAttribute = this.planAttribute == '-1' ? '' : this.planAttribute
                }
                await exportDetailList(param)
            } catch (err) {
                console.error(err)
            }
        },
        //提交
        submitOperation(buttonCode, ids) {
            this.ids = ids
            this.handleSubmit(ACTIVITI_ASSUGNEE.MM_XQJH)
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            planSubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
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
        flowSeeOperation(buttonCode, ids) {
            this.workFlowViewVisible = true;
            this.selectedRow = { businessId: ids[0] };
        },
        pushPurchaseOperation(buttonCode, ids, rowArr) {
            const isProject = rowArr.every((item, index, arr) => {
                return item.projectCode == arr[0].projectCode
            })
            if (!isProject) {
                this.$modal.msgError('只能选相同项目或项目为空的数据')
                return
            }
            let realArr = rowArr.filter(item => item.planAttribute == '2' && ['2', '3'].includes(item.planStatus))
            if (realArr.length < rowArr.length) {
                this.$modal.msgError(`本次选择${rowArr.length}条数据，其中${realArr.length}条符合下推条件`)
            }
            if (realArr.length === 0) return
            this.$router.push({ name: 'purchasePlanOperate', query: { name: 'demandPlanWorkbench', type: "create", ids: ids.join(',') } })
        },
        pushProductionOperation(buttonCode, ids, rowArr) {
            if (rowArr.length > 1) {
                this.$modal.msgError(`只能选择一条数据下推生产订单`)
                return
            }
            this.$router.push({ name: 'productionOrderOperate', query: { name: 'demandPlanWorkbench', type: "create", ids: ids.join(','), planAttribute: rowArr[0].planAttribute } })
        },
        clickLink(row, code) {
            const objPush = {
                planCode: () => {
                    this.$router.push({ name: 'demandPlanWorkbenchOperate', query: { type: "view", id: this.tableType == '1' ? row.id : row.planId } })
                },
                planName: () => {
                    this.$router.push({ name: 'demandPlanWorkbenchOperate', query: { type: "view", id: this.tableType == '1' ? row.id : row.planId } })
                },
                detailCode: () => {
                    this.$router.push({ name: 'demandPlanWorkbenchOperate', query: { type: "view", id: row.id, tableType: this.tableType } })
                },
                cuCode: () => {
                    this.$router.push({ name: 'customerProfileAdd', query: { type: "view", id: row.cuId, name: 'demandPlanWorkbench' } })
                },
                matlCode: () => {
                    this.$router.push({ name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'demandPlanWorkbench' } })
                },
                projectCode: () => {
                    this.$router.push({ name: 'projectManagementOperate', query: { name: 'demandPlanWorkbench', type: 'view', id: row.projectId } })
                },
                sourceCode: () => {
                    this.$router.push({ name: 'selfResearchDemandOperate', query: { name: 'demandPlanWorkbench', type: 'view', id: row.sourceId } })
                },
                bomCode: () => {
                    this.$router.push({ name: 'BOMAdministrationOperate', query: { name: 'demandPlanWorkbench', type: 'view', id: row.bomId } })
                },
            }
            objPush[code] && objPush[code]()
        },
        linkClick(scope) {
            this.$refs.fileList.init(scope.value)
        },
        radioChange() {
            this.handleQuery()
        }
    }
};
</script>

<style lang="scss" scope>
.tytyty {
    .shi {
        background-color: #cff3f3;
        color: #149696;
        padding: 5px 15px;
        border-radius: 5px;
    }

    .fou {
        background-color: #fbe7ea;
        color: #ed8592;
        padding: 5px 15px;
        border-radius: 5px;
    }
}

.tyty {
    .shi {
        background-color: #f5fee7;
        color: #279e9b;
        padding: 5px 15px;
        border-radius: 5px;
    }

    .fou {
        background-color: #fef6ea;
        color: #ba7921;
        padding: 5px 15px;
        border-radius: 5px;
    }
}
</style>
