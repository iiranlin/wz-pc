<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template v-slot:outUnitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
            <template v-slot:outWarehouseId="{ data, i18nData }">
                <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
            @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
            @emitAblFilter="emitAblFilter" @clickLink="clickLink">
            <template slot="status" slot-scope="scope">
                <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}
            </template>
            <template slot="outStatus" slot-scope="scope">
                <span :class="'saleStatus-' + scope.value">{{ scope.value | fieldFormat(scope.fieldFormatArr)
                }}</span>
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
import { getAllocateList, submitAllocate, deleteAllocate, getAllocateDetail, exportDetailList } from '@/api/warehouseManage/transferOrder'
import workFlowView from '@/components/workFlowView'
import fileList from '@/views/components/fileList/index'
import { download } from '@/utils/request'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
export default {
    name: "transferOutOrder",
    mixins: [indexMixin],
    components: { workFlowView, fileList, activitiAssignee, FormUnitId, FormWarehouseCode },
    data() {
        return {
            // 遮罩层
            loading: false,
            workFlowViewVisible: false,
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
            formData: {},
            formDataClick: {},
            workFlowViewVisible: false,
            selectedRow: null
        };

    },
    created() {
        this.menuProperty();
    },
    methods: {
        async linkClick(scope) {
            const detailInfo = await getAllocateDetail(scope.data.id)
            this.$refs.fileList.init(detailInfo.data.fileList)
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
        rowSetStyle(row, rowIndex) {
            if (row.status === '0') {
                return {
                    color: "red"
                }
            }
            return {}
        },
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
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
            if ((button.buttonCode === 'update' || button.buttonCode === 'delete' || button.buttonCode === 'submit') && (row.status == '2' || row.status == '3')) {
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
        handleDelete(ids) {
            this.$modal.confirm(`确定删除该数据吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.loading = true;
                deleteAllocate({ ids: ids }).then(({ success, data, message }) => {
                    this.loading = false;
                    if (success) {
                        this.$message({ type: 'success', message: '删除成功!' });
                        this.getList();
                    } else {
                        this.$message({ type: 'error', message: message });
                    }
                }).catch(({ data }) => {
                    this.loading = false;
                })
            })
        },
        submit(assignee = '') {
            this.loading = true;
            submitAllocate({ ids: this.ids, assignee }).then(({ success, data, message }) => {
                if (success) {
                    this.$message({ type: 'success', message: '提交成功!' });
                    this.getList();
                } else {
                    this.$message({ type: 'error', message: message });
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const buttonActions = {
                update: () => { this.$router.push({ name: 'createTransferOutOrder', query: { type: 'update', id: idArr[0], operateType: 'out' } }); },
                delete: () => { this.handleDelete(idArr); },
                create: () => { this.$router.push({ name: 'createTransferOutOrder', query: { type: 'create', operateType: 'out' } }); },
                submit: () => {
                    this.ids = idArr
                    this.handleSubmit(ACTIVITI_ASSUGNEE.INV_DBD);
                },
                flowSee: () => {
                    this.workFlowViewVisible = true
                    this.selectedRow = { businessId: rowArr[0].id };
                },
                export: () => {
                    const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                    download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
                },
                withdraw: () => {
                    this.handleWithdraw({ businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.INV_DBD, })
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        getList() {
            this.loading = true;
            getAllocateList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list;
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        clickLink(row, code) {
            if (code === 'allocateCode') {
                this.$router.push({ name: 'createTransferOutOrder', query: { type: "view", id: row.id, operateType: 'out' } })
                return
            }
            if (code === 'outProjectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'transferOutOrder', type: 'view', id: row.outProjectId } })
                return
            }
        },
    }
};
</script>
