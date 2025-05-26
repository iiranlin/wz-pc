<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
            <template v-slot:warehouseId="{ data, i18nData }">
                <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :menuId="menuId"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick">
            <template v-slot:tab>
                <orderDetailType :value="tableType" @input="handleTableTypeChange" />
            </template>
        </right-toolbar>
        <table-index ref="tableIndex" :loading="loading" idName="id" :tableIndexs="tableIndex" :menuId="menuId"
            :tableData="list" :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
            @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
            @selectChange="selectChange" @emitAblFilter="emitAblFilter">
            <template slot="status" slot-scope="scope">
                <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconClass(scope.value)" />{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}
            </template>
            <template slot="adjustStatus" slot-scope="scope">
                <span :class="'adjustStatus-' + scope.value">{{ scope.value | fieldFormat(scope.fieldFormatArr)
                    }}</span>
            </template>
            <template slot="fileList" slot-scope="scope">
                <el-link :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
                    :disabled="!scope.data.fileList || !scope.data.fileList.length"
                    @click.stop="linkClick(scope)">查看</el-link>
            </template>
            <template slot="checkResult" slot-scope="scope">
                <span
                    :class="scope.value == '1' ? 'check_result_win' : scope.value == '2' ? 'check_result_lose' : ''">{{
                        handleStatus(scope.value, dict.type.checkResult) }}</span>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <purchaseOrderShipping ref="purchaseOrderShipping"></purchaseOrderShipping>
        <fileList ref="fileList" />
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { finish, adjustList, adjustDetailList, adjustSubmit, adjustOrderView, adjustExportDetailList } from '@/api/warehouseManage/inventorySheet'
import purchaseOrderShipping from '@/views/purchasingManagement/purchaseOrder/components/purchaseOrderShipping';
import fileList from '@/views/components/fileList/index'
import { download } from '@/utils/request'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import workFlowView from '@/components/workFlowView'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
export default {
    name: 'adjustFormReview',
    mixins: [indexMixin],
    dicts: ['checkResult'],
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
    components: { purchaseOrderShipping, fileList, orderDetailType, activitiAssignee, workFlowView, FormUnitId, FormWarehouseCode },
    data() {
        return {
            loading: false,
            property: {},
            workFlowViewVisible: false,
            selectedRow: {},
            total: 0,
            numberShow: false,
            list: [],
            // 非多个禁用
            multiple: true,
            // 非单个禁用
            single: true,
            selection: [],
            ids: [],
            // 显示搜索条件
            showSearch: true,
            formData: {},
            formDataClick: {},
            menuId: '',
            listQuery: {
                pageNum: 1,
                pageSize: 30,
            },
        }
    },
    created() {
        this.menuProperty({ '1': '', '2': menuConfig.MENU_TZDSH_BRANCH }[this.tableType])
    },
    methods: {
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data;
            });
        },
        async linkClick(scope) {
            let { data } = await adjustOrderView(scope.data.id)
            this.$refs.fileList.init(data.fileList)
        },
        handleStatus(val, dict) {
            for (let key in dict) {
                if (dict[key].value == val) {
                    return dict[key].label;
                }
            }
        },
        getList() {
            const apiCallMap = {
                '1': adjustList,
                '2': adjustDetailList
            }
            this.loading = true;
            apiCallMap[this.tableType](Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list;
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        clickLink(row, name) {
            if (name === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'adjustFormReview', name: 'adjustFormReview' } });
            } else if (name === 'batchNo') {
                this.$router.push({ name: 'batchNoDetail', query: { id: row.batchNo, type: 'view', name: 'adjustFormReview' } })
            } else if (name === 'adjustCode') {
                this.$router.push({ name: 'inventoryAdjustDetail', query: { id: this.tableType === '1' ? row.id : row.adjustId, type: 'view', name: 'adjustFormReview' } });
            } else if (name === 'checkCode') {
                this.$router.push({ name: 'inventorySheetMainDetail', query: { id: row.checkId, type: 'view', name: 'adjustFormReview' } });
            } else if (name === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { id: row.projectId, type: 'view', name: 'adjustFormReview' } });
            }
        },
        handleButtonDisable(button, row) {
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(row.status)
            }
            if (this.tableType === '2' && (button.buttonCode === 'submit' || button.buttonCode === 'flowSee')) {
                return true
            }
            if (button.buttonCode === 'finish' && this.tableType === '2') {
                return !(row.status == '3' && row.adjustStatus != '1')
            }

            if ((button.buttonCode === 'submit' && row.status != '1' && row.status != '0') || (button.buttonCode === 'flowSee' && row.status == '1')) {
                return true
            }
            return false
        },
        cleanClick(data) {
            for (const key of data) {
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, row) {
            this.single = single
            this.multiple = multiple
            this.selection = row
        },
        handleFlowSee(idArr) {
            this.workFlowViewVisible = true;
            this.selectedRow = { businessId: idArr[0] };
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const buttonActions = {
                submit: () => {
                    this.ids = idArr
                    this.handleSubmit(ACTIVITI_ASSUGNEE.INV_TZD)
                },
                finish: () => {
                    this.handleFinish(rowArr)
                },
                flowSee: () => { this.handleFlowSee(idArr); },
                export: () => {
                    const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                    download(`${adjustExportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
                },
                withdraw: () => {
                    this.handleWithdraw({ businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.INV_TZD, })
                }
            }
            const action = buttonActions[buttonCode];
            action && action();
        },
        async handleFinish(rows) {
            try {
                const ids = rows.map(({ id }) => id)
                await finish({ ids: ids })
                this.$modal.msgSuccess('提交成功')
                this.getList()
            } catch (err) {
                console.error(err)
            }

        },
        selectChange() { },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();

        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            adjustSubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
                if (success) {
                    this.$modal.msgSuccess('提交成功')
                    this.getList()
                } else {
                    this.$modal.msgError(message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns);
        },
        numberChange(val) {
            this.numberShow = val;
        },
        handleResetField() { },
        clickReset() {
            this.handleQuery();
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        }
    }
}
</script>

<style lang="scss" scoped>
.check_result_win {
    color: #008080
}

.check_result_lose {
    color: #D9001B
}
</style>