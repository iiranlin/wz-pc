<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:unitName="{ data, i18nData }">
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
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
            @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
            @emitAblFilter="emitAblFilter" @clickLink="clickLink">
            <template slot="status" slot-scope="scope">
                <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}
            </template>
            <template slot="fileList" slot-scope="scope">
                <el-link :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
                    :disabled="!scope.data.fileList || !scope.data.fileList.length"
                    @click.stop="linkClick(scope)">查看</el-link>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <fileList ref="fileList" />
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { demandList, demandDetailList, demandRemoveDetail, demandRemoveOrder, exportDetailList, demandSubmit } from '@/api/prodmgr-mm/researchDemand'
import fileList from '@/views/components/fileList/index'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import workFlowView from '@/components/workFlowView'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import FormUnitId from '@/views/components/form-unitId'
export default {
    name: "selfResearchDemand",
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
    components: { fileList, orderDetailType, activitiAssignee, workFlowView, FormUnitId },
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
            selectedRow: null,
            menuId: '',
        };

    },
    watch: {
        // tableType: {
        //     handler(val) {
        //         this.menuProperty({ '1': '', '2': menuConfig.MENU_ZYXQWH_BRANCH }[val])
        //         this.getList()
        //     },
        //     immediate: true,
        // }
    },
    created() {
        this.menuProperty({ '1': '', '2': menuConfig.MENU_ZYXQWH_BRANCH }[this.tableType])
    },
    methods: {
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data;
            });
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(row.status)
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
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            this[`${buttonCode}Operation`] && this[`${buttonCode}Operation`](buttonCode, idArr, rowArr);
        },
        /** 查询菜单列表 */
        getList() {
            const apiUrl = this.tableType == '1' ? demandList : demandDetailList;
            this.loading = true;
            apiUrl(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list || [];
                this.total = data.total || 0;
            }).finally(() => {
                this.loading = false;
            })
        },
        withdrawOperation(buttonCode, ids) {
            this.handleWithdraw({ businessId: ids[0], businessType: ACTIVITI_ASSUGNEE.MM_ZYXQ, })
        },
        createOperation(buttonCode) {
            this.$router.push({ name: 'selfResearchDemandOperate', query: { type: buttonCode } })
        },
        updateOperation(buttonCode, ids) {
            this.$router.push({ name: 'selfResearchDemandOperate', query: { type: buttonCode, id: ids.join(','), tableType: this.tableType } })
        },
        deleteOperation(buttonCode, ids) {
            this.$modal.confirm(this.tableType == '1' ? '是否确认删除？' : '是否删除该明细信息?').then(() => {
                return this.tableType == '1' ? demandRemoveOrder({ ids }) : demandRemoveDetail({ ids });
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
                const param = { ...this.formData, exportColumns }
                await exportDetailList(param)
            } catch (err) {
                console.error(err)
            }
        },
        //提交
        submitOperation(buttonCode, ids) {
            this.ids = ids
            this.handleSubmit(ACTIVITI_ASSUGNEE.MM_ZYXQ)
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            demandSubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
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
        clickLink(row, code) {
            const objPush = {
                demandCode: () => {
                    this.$router.push({ name: 'selfResearchDemandOperate', query: { type: "view", id: this.tableType == '1' ? row.id : row.demandId } })
                },
                cuCode: () => {
                    this.$router.push({ name: 'customerProfileAdd', query: { type: "view", id: row.cuId, name: 'selfResearchDemand' } })
                },
                matlCode: () => {
                    this.$router.push({ name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'selfResearchDemand' } })
                },
                projectCode: () => {
                    this.$router.push({ name: 'projectManagementOperate', query: { name: 'selfResearchDemand', type: 'view', id: row.projectId } })
                }
            }
            objPush[code] && objPush[code]()
        },
        linkClick(scope) {
            this.$refs.fileList.init(scope.value)
        }
    }
};
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
    margin-left: 20px;
    margin-top: 16px;
}
</style>
