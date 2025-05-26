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
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" idName="id" :tableIndexs="tableIndex" :tableData="list"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
            @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
            @selectChange="selectChange" @emitAblFilter="emitAblFilter">
            <template slot="inventoryNum" slot-scope="scope">
                <span>{{ scope.data.checkType != '2' ? scope.data.inventoryNum : '' }}</span>
            </template>
            <template slot="checkStatus" slot-scope="scope">
                <span :class="'pickingStatus-' + scope.value">{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}</span>
            </template>
            <template slot="checkResult" slot-scope="scope">
                <span :class="scope.value == '1' ? 'check_result_win' : scope.value == '2' ? 'check_result_lose' : ''">{{
                    handleStatus(scope.value, dict.type.checkResult) }}</span>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <check ref="check" @getList="getList"></check>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { detailList, removeDetail, exportDetailList } from '@/api/warehouseManage/inventorySheet'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import Check from './components/check'
import cache from '@/plugins/cache'
import { download } from '@/utils/request'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'

export default {
    name: "inventorySheetMaintenance",
    dicts: ['checkResult'],
    mixins: [indexMixin],
    components: { Check, FormUnitId, FormWarehouseCode },

    data() {
        return {
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
            selectedRow: null
        };

    },
    created() {
        this.menuProperty();
        this.getTreeList()
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    methods: {
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key)
                }
                this.formData[key] = null
            }
            this.handleQuery()
        },
        handleStatus(val, dict) {
            for (let key in dict) {
                if (dict[key].value == val) {
                    return dict[key].label;
                }
            }
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
        },
        handleNodeClick(node) {
            this.formData.matlClassifyId = node.matlClassifyId
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
            if ((button.buttonCode === 'update' || button.buttonCode === 'inventory' ||  button.buttonCode === 'inventoryRow') && row.checkStatus != '1') {
                return true
            }
            if(button.buttonCode === 'delete') {
                return this.selection.some(({checkStatus}) => checkStatus != '1')
            }
            // 调整单数据，已盘点，并且为盘盈或者盘亏
            if (button.buttonCode === 'adjustOrder' && !(row.checkStatus == '2')) {
                return true
            }
            if (button.buttonCode === 'invUpdate' && (row.checkStatus != '2')) {
                return true
            }
            if (button.buttonCode === 'invView' && (row.checkStatus == '1')) {
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
            this.ids = row.map(item => item.saleOrderId)
            this.single = single
            this.multiple = multiple
            this.selection = row
        },
        handleResetField() {
        },
        handleDelete(rowArr) {
            let ids = rowArr.map(item => item.id)
            this.$modal.confirm('是否确认删除该盘点明细数据？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.loading = true
                removeDetail({ ids: ids }).then((data, message, success) => {
                    this.$message.success('删除成功')
                    this.handleQuery()
                }).finally(() => {
                    this.loading = false
                })
            });
        },
        handleInventory(rowArr) {
            this.$refs.check.init(rowArr, 'create')
        },
        handleInvUpdate(rowArr) {
            this.$refs.check.init(rowArr, 'update')
        },
        handleInvView(rowArr) {
            this.$refs.check.init(rowArr, 'view')
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const buttonActions = {
                update: () => { this.$router.push({ name: 'inventorySheetMainDetail', query: { type: 'update', id: rowArr[0].checkId } }); },
                delete: () => { this.handleDelete(rowArr); },
                create: () => { this.$router.push({ name: 'inventorySheetMainDetail', query: { type: 'create' } }); },
                invUpdate: () => { this.handleInvUpdate(rowArr) },
                invView: () => { this.handleInvView(rowArr) },
                inventory: () => { this.handleInventory(rowArr) },
                inventoryRow: () => { this.handleInventory(rowArr) },
                adjustOrder: () => {

                    // 本次勾选10条数据，5条可调整
                    let realArr = rowArr.filter(item => item.checkResult !== '3')
                    if (realArr.length < rowArr.length) {
                        this.$message.warning(`本次勾选${rowArr.length}条数据，${realArr.length}条可调整`)
                    }
                    if (realArr.length === 0) return
                    cache.session.setJSON('adjustOrder', realArr)
                    this.$router.push({ name: 'inventoryAdjustDetail', query: { type: 'create', id: idArr.join(',') } });
                },
                export: () => {
                    const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                    download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        getList() {
            this.loading = true;
            detailList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list;
                this.list.map(item => {
                    item.invNum = item.checkType == '2' ? '' : item.inventoryNum;
                })
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        clickLink(row, code) {
            if (code === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'inventorySheetMaintenance' } });
            } else if (code == 'checkCode') {
                this.$router.push({ name: 'inventorySheetMainDetail', query: { id: row.checkId, type: 'view', name: 'inventorySheetMaintenance' } })
            } else if (code == 'batchNo') {
                this.$router.push({ name: 'batchNoDetail', query: { id: row.batchNo, type: 'view', name: 'inventorySheetMaintenance', isQuery: 'query' } })
            } else if (name === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { id: row.projectId, type: 'view', name: 'inventorySheetMaintenance' } });
            }
        },
    }
};
</script>

<style scoped lang="scss">
.ov_head_title {
    color: #555555;
    font-size: 14px;
    margin-left: 15px;
}

.check_result_win {
    color: #008080
}

.check_result_lose {
    color: #D9001B
}
</style>
