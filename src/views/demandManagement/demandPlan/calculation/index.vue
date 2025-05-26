<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <div class="search-form">
            <el-collapse v-model="activeNames">
                <el-form ref="form" :model="formData" label-width="120px" :inline="true" class="form-data-search">
                    <div>
                        <el-collapse-item name="one">
                            <template slot="title">
                                <div class="tag1"></div>
                                <div class="form-title-name">计划方案</div>
                            </template>
                            <div>
                                <el-form-item class="custom-form-item" label="方案编码">
                                    <el-input v-model="formData.a" placeholder="请选择方案编码">
                                        <el-button slot="append" icon="el-icon-search" @click="handleA"></el-button>
                                    </el-input>
                                </el-form-item>
                                <el-form-item class="custom-form-item" label="方案名称">
                                    <el-input v-model="formData.b" :disabled="true" placeholder="自动填充"></el-input>
                                </el-form-item>
                                <el-form-item class="custom-form-item" label="需求来源">
                                    <el-input v-model="formData.c" :disabled="true" placeholder="自动填充"></el-input>
                                </el-form-item>
                                <el-form-item class="custom-form-item" label="计划展望期">
                                    <el-date-picker v-model="formData.d" type="daterange" range-separator="至"
                                        start-placeholder="开始日期" end-placeholder="结束日期">
                                    </el-date-picker>
                                </el-form-item>
                            </div>
                        </el-collapse-item>
                    </div>
                    <div>
                        <el-collapse-item name="two">
                            <template slot="title">
                                <div class="tag2"></div>
                                <div class="form-title-name">需求单据</div>
                            </template>
                            <div>
                                <el-form-item class="custom-form-item" label="订单单号">
                                    <el-input v-model="formData.e" placeholder="请输入订单单号"></el-input>
                                </el-form-item>
                                <el-form-item class="custom-form-item" label="物料编码">
                                    <el-input v-model="formData.f" placeholder="请输入物料编码"></el-input>
                                </el-form-item>
                                <el-form-item class="custom-form-item" label="物料名称">
                                    <el-input v-model="formData.g"  placeholder="请输入物料名称"></el-input>
                                </el-form-item>
                                <el-form-item class="custom-form-item" label="项目名称">
                                    <el-input v-model="formData.h" placeholder="请输入项目名称"></el-input>
                                </el-form-item>
                                <el-form-item class="custom-form-item" label="合同名称">
                                    <el-input v-model="formData.i"  placeholder="请输入合同名称"></el-input>
                                </el-form-item>
                                <el-form-item class="custom-form-item" label="客户名称">
                                    <el-input v-model="formData.j" placeholder="请输入客户名称"></el-input>
                                </el-form-item>
                                <el-form-item class="custom-form-item" label="运算状态">
                                    <el-select style="width: 100%;" v-model="formData.k" placeholder="请选择运算状态">
                                        <el-option value="已运算" label="已运算">已运算</el-option>
                                        <el-option value="未运算" label="未运算">未运算</el-option>
                                    </el-select>
                                </el-form-item>
                            </div>
                        </el-collapse-item>
                    </div>
                </el-form>
            </el-collapse>
        </div>
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
            <template slot="status" slot-scope="scope">
                <div class="tytyty">

                    <span class="fou" v-if="scope.value == '1'">未运算</span>
                    <span class="shi" v-else>已运算</span>
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
            <scheme ref="schemeRef" singleMode @change="handleConfirm"></scheme>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { planList, planDetailList, planRemoveDetail, planRemoveOrder, exportDetailList, planSubmit } from '@/api/prodmgr-mm/demandPlan'
import { getList } from '@/api/prodmgr-mm/scheme'
import { PuCtList } from '@/api/projectManagement/contractManagement'

import fileList from '@/views/components/fileList/index'
import { menuConfig, treeProps } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import mergeHistory from '@/views/components/merge-history'
import { getListByParentCode } from "@/api/system/dict";
import workFlowView from '@/components/workFlowView'
import scheme from './components/scheme'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
const PLAN_ATTR = { 2: '-1', 3: '1', 4: '2', 5: '3' }
export default {
    name: "calculation",
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
    components: { scheme, mergeHistory, fileList, orderDetailType, activitiAssignee, workFlowView, tooltip: () => import('@/components/tooltip') },
    data() {

        return {
            activeNames: ['one', 'two'],

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
            formData: {
                a: '',
                b: '',
                c: '',
                d: '',
                e: '',
                f: '',
                g: '',
                h: '',
                i: '',
                j: '',
                k: ''
            },
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
        handleConfirm(data) {
            this.formData.a = data.a
            this.formData.b = data.b
            this.formData.c = data.f
        },
        handleA() {
            this.$refs.schemeRef.init()
        },
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
            if (['ysa'].includes(button.buttonCode)) {
                return !this.selection.length
            }
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (['ys'].includes(button.buttonCode)) {
                return row.status != '1'
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
            if (buttonCode === 'ys') {
                this.$modal.msgSuccess('运算成功')
                this.getList()
            } else if (buttonCode === 'ysa') {
                if (this.selection.some(item => item.status != '1')) {
                    this.$modal.msgError('请选择未运算的数据')
                    return
                }
                this.$modal.msgSuccess('运算成功')
                this.getList()
            } else if (buttonCode === 'check') {

                this.$router.push({ name: 'productionOrder', query: { name: 'calculation' } })
            }

        },
        /** 查询菜单列表 */
        async getList() {
            this.loading = true;
            const param = Object.assign({}, this.listQuery, this.formData)
            const ct = await PuCtList(this.listQuery)
            planDetailList(param).then(async ({ data }) => {
                this.list = data.list.map((item, index) => ({ ...item, ctCode: ct.data.list[index].ctCode, ctName: ct.data.list[index].ctName }))
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
                    this.$router.push({ name: 'demandPlanWorkbenchOperate', query: { name: 'calculation', type: "view", id: this.tableType == '1' ? row.id : row.planId } })
                },
                planName: () => {
                    this.$router.push({ name: 'demandPlanWorkbenchOperate', query: { name: 'calculation', type: "view", id: this.tableType == '1' ? row.id : row.planId } })
                },
                detailCode: () => {
                    this.$router.push({ name: 'demandPlanWorkbenchOperate', query: { type: "view", id: row.id, tableType: this.tableType, name: 'calculation', } })
                },
                cuCode: () => {
                    this.$router.push({ name: 'customerProfileAdd', query: { type: "view", id: row.cuId, name: 'calculation' } })
                },
                matlCode: () => {
                    this.$router.push({ name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'calculation' } })
                },
                projectCode: () => {
                    this.$router.push({ name: 'projectManagementOperate', query: { name: 'calculation', type: 'view', id: row.projectId } })
                },
                sourceCode: () => {
                    this.$router.push({ name: 'saleOrderOperate', query: { name: 'calculation', type: 'view', id: row.sourceId } })
                },
                bomCode: () => {
                    this.$router.push({ name: 'BOMAdministrationOperate', query: { name: 'calculation', type: 'view', id: row.bomId } })
                },
                ctCode: () => {
                    this.$router.push({ name: 'contractManagementOperate', query: { name: 'calculation', type: 'view', id: row.ctId } })
                }
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
.search-form {
    .tag1 {
        display: inline-block;
        width: 6px;
        height: 16px;
        background-color: #00ffff;
        border-radius: 4px;
    }

    .tag2 {
        display: inline-block;
        width: 6px;
        height: 16px;
        background-color: #95f204;
        border-radius: 4px;
    }

    .form-title-name {
        font-size: 14px;
        font-weight: 600;
        margin-left: 6px;
    }
}

.tytyty {
    .shi {
        background-color: #cff3f3;
        color: #149696;
        padding: 5px 15px;
        border-radius: 5px;
    }

    .fou {
        background-color: #fbe7ea;
        color: #db0128;
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
