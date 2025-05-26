<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:unitName="{data, i18nData}">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :menuId="menuId" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick">
            <template v-slot:tab>
                <orderDetailType :value="tableType" @input="handleTableTypeChange" />
            </template>
        </right-toolbar>
        <table-index ref="tableIndex" idName="id" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
            @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
            @emitAblFilter="emitAblFilter" @clickLink="clickLink">
            <template slot="status" slot-scope="scope">
                <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />
                {{ scope.value | fieldFormat(scope.fieldFormatArr) }}
            </template>
            <template slot="bizStatus" slot-scope="scope">
                <span :class="'saleStatus-' + scope.value">{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}</span>
            </template>
            <template v-if="tableType === '1'" slot="fileList" slot-scope="scope">
                <el-link :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
                    :disabled="!scope.data.fileList || !scope.data.fileList.length"
                    @click.stop="linkClick(scope)">查看</el-link>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <mate-contract ref="ContractRef" @selections="getList"></mate-contract>
        <fileList ref="fileList" />
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
        <activitiyTmpl ref="activitiyTmpl" @confirm="handleTmplConfirm"></activitiyTmpl>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import MateContract from './components/mateContract.vue'
import {
    PuPlanList,
    PuPlanRawList,
    PuPlanBatchRemove,
    PuPlanRawBatchRemove,
    exportDetailList,
    PuPlanSubmit,
    planMatchingCt,
    planAscriptionList,
    planConfirmByList,
    PuPlanDetail
} from '@/api/purchasingManagement/plan'
import fileList from '@/views/components/fileList/index'
import { download } from '@/utils/request'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import activitiyTmpl from '@/views/print/activitiyTmpl'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import FormUnitId from '@/views/components/form-unitId'
export default {
    name: 'purchasePlan',
    mixins: [indexMixin],
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
    components: { activitiyTmpl, MateContract, fileList, orderDetailType, activitiAssignee, workFlowView, FormUnitId },
    data() {
        return {
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
                pageSize:  30
            },
            formData: {
            },
            formDataClick: {},
            workFlowViewVisible: false,
            selectedRow: null,
            menuId: '',
            sourceDetails: {
              '1': 'demandPlanWorkbenchOperate',
              '2': 'requirementPlanMaintenanceOperate',
              '3': 'productionDamageOperate',
              '4': 'saleOrderOperate'
            }
        }

    },
    created() {
        this.menuProperty({ '1': '', '2': menuConfig.MENU_CGJHWH_BRANCH }[this.tableType])
    },
    methods: {
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data
            })
        },
        handleTopButtonDisabled(button) {
            if(['print'].includes(button.buttonCode)) {
                return !this.selection.length
            }
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if( ['withdraw'].includes(button.buttonCode)){
              return row.status != '2'
            }
            if (['matchContract', 'push'].includes(button.buttonCode)) {
                const pcObj = {}
                for (let i = 0; i < this.selection.length; i++) {
                    pcObj[this.selection[i]['projectCode']] = ''
                }
                const keys = Object.keys(pcObj)
                return !(['2', '3'].includes(row.bizStatus) && this.tableType == '2' && keys.length == 1)
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
            this.numberShow = val
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns)
        },
        clickReset() {
            this.handleQuery()
        },
        //选择框回调
        selectChange(row) {
            let { formData, isWatch } = row
            if (!isWatch) {
                this.handleQuery(formData)
            } else {
                this.formData = Object.assign({}, this.formData, formData)
            }
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key)
                }
                this.formData[key] = null
            }
            this.handleQuery()
        },
        handleQuery(row = {}, type) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
            this.formDataClick = Object.assign({}, this.formData, row)
            this.getList()
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery()
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = selection
        },
        handleResetField() {
        },
        handleButton(buttonCode, idArr, rowArr, {buttonData}) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode === 'print') {
                const isPlanCode = rowArr.every((item, index, arr) => {
                    return item.planCode == arr[0].planCode
                })
                if (!isPlanCode) {
                  this.$modal.msgError('请选择同一个采购计划')
                  return
                }
                const tmpls = buttonData.printTemplateId.split(',')
                this.handlePrint(tmpls, rowArr)
            } else if (buttonCode === 'update') {
                if (this.tableType == '1' && idArr.length > 1) {
                    this.$modal.msgError('只能选择同一个主单修改');
                    return
                }
                this.$router.push({
                    name: 'purchasePlanOperate',
                    query: { type: buttonCode, id: idArr.join(','), tableType: this.tableType }
                })
            } else if (buttonCode === 'delete') {
                this.$modal.confirm(this.tableType === '1' ? '是否确认删除？' : '是否删除该明细信息?').then(() => {
                    return this.tableType === '1' ? PuPlanBatchRemove({ ids: idArr }) : PuPlanRawBatchRemove({ ids: idArr })
                }).then((data) => {
                    if (data.success) {
                        this.getList()
                        this.refreshChange(this.refName)
                        this.$modal.msgSuccess('删除成功')
                    } else {
                        this.getList()
                        this.$modal.msgError(data.message)
                    }

                }).catch(() => {
                })
            } else if (buttonCode === 'create') {
                this.$router.push({ name: 'purchasePlanOperate', query: { type: buttonCode } })
            } else if (buttonCode === 'submit') {
                this.rowArr = rowArr
                this.handleSubmit(ACTIVITI_ASSUGNEE.PU_PP)
            } else if (buttonCode === 'flowSee') {
                this.workFlowViewVisible = true
                this.selectedRow = { businessId: idArr[0] }
            } else if (buttonCode === 'matchContract') {
                const isProject = rowArr.every((item, index, arr) => {
                    return item.projectCode == arr[0].projectCode
                })
                if (isProject) {
                    this.$refs.ContractRef.init(rowArr, planMatchingCt)
                } else {
                    this.$modal.msgError('请选择同一个项目的采购计划明细')
                }
            } else if (buttonCode === 'push') {
                const isProject = rowArr.every((item, index, arr) => {
                    return item.projectCode == arr[0].projectCode
                })
                const isUnitId = rowArr.every((item, index, arr) => {
                    return item.unitId == arr[0].unitId
                })
                if (!isUnitId) {
                  this.$modal.msgError('请选择同一个所属组织的采购计划明细')
                  return
                }
                if (!isProject) {
                  this.$modal.msgError('请选择同一个项目的采购计划明细')
                  return
                }
                this.$router.push({ name: 'pullDownPurchaseOrder', query: { type: buttonCode, id: idArr.join(',') } })
                return
            } else if (buttonCode === 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
                return
            }else if (buttonCode === 'withdraw'){
              this.handleWithdraw({businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.PU_PP,})
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true
            if (this.tableType === '1') {
                PuPlanList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list
                    this.total = data.total
                }).finally(() => {
                    this.loading = false
                })
            } else {
                PuPlanRawList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list
                    this.total = data.total
                }).finally(() => {
                    this.loading = false
                })
            }
        },
        handleChange(val) {
            this.menuProperty()
            this.getList()
        },
        handleDelete(ids) {
            this.$modal.confirm('是否确认删除?').then(() => {
                return this.tableType == '1' ? qiRemoveOrder({ ids }) : qiRemoveDetail({ ids })
            }).then(() => {
                if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                    this.listQuery.pageNum -= 1
                }
                this.getList()
                this.refreshChange(this.refName)
                this.$modal.msgSuccess('删除成功')
            })
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            const ids = this.rowArr.map(({ id }) => id)
            PuPlanSubmit({ ids: ids, assignee }).then(({ success, data, message }) => {
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
        linkClick(scope) {
            this.$refs.fileList.init(scope.value)
        },
        clickLink(row, name) {
            const tableType = this.tableType;
            if (name === 'planCode') {
                this.$router.push({
                    name: 'purchasePlanOperate',
                    query: {
                        type: 'view',
                        id: this.tableType == '2' ? row.planId : row.id,
                    }
                })
            } else if (name === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'purchasePlan', type: 'view', id: row.projectId } })
            } else if (name === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'purchasePlan' } });
            } else if (name === 'sourceCode') {
              if(this.sourceDetails[row.sourceType]){
                this.$router.push({name: this.sourceDetails[row.sourceType], query:{type: 'view', id: row.sourceId, name: 'purchasePlan'}})
              }
            }
        },
        qiBatchQualified(ids) {
            this.$modal.confirm('本次所选数据将批量全部合格，是否确定？').then(() => {
                return qiBatchQualified({ ids })
            }).then(({ message }) => {
                this.getList()
                this.refreshChange(this.refName)
                this.$modal.msgSuccess(message)
            })
        },
        planAscriptionList() {
            planAscriptionList().then(({ data }) => {
                this.ascriptionsData = data
            })
        },
        planConfirmByList() {
            planConfirmByList().then(({ data }) => {
                this.confirmBysData = data
            })
        },
    }
}
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
    margin-left: 20px;
    margin-top: 16px;
}
</style>
