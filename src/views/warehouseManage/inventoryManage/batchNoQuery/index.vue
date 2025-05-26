<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery">
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
        </right-toolbar>
        <table-index ref="tableIndex" :loading="loading" idName="matlId" :tableIndexs="tableIndex" :menuId="menuId"
            :tableData="list" :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
            @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
            @selectChange="selectChange" @emitAblFilter="emitAblFilter">
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <selectPlace ref="selectPlace"></selectPlace>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { getList, exportList } from '@/api/warehouseManage/batchNoQuery'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import { download } from '@/utils/request'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import selectPlace from '@/views/components/selectPlace'
import collapse from '@/components/Collapse'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'

export default {
    name: "inventoryQuery",
    mixins: [indexMixin],
    components: { orderDetailType, selectPlace, collapse, FormUnitId, FormWarehouseCode },
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
            selectedRow: null,
            menuId: ''
        };

    },
    created() {
        this.menuProperty();
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
        menuProperty() {
            this.menuId = this.$route.meta.id;
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data;
            });
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
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

        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const buttonActions = {
                export: () => {
                    const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                    download(`${exportList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        getList() {
            this.loading = true;
            getList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list;
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        clickLink(row, code) {
            if (code === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'batchNoQuery' } });
            } else if (code == 'batchNo') {
                this.$router.push({ name: 'batchNoDetail', query: { id: row.batchNo, type: 'view', name: 'batchNoQuery' } })
            } else if (code == 'inventoryNum') {
                this.$refs.selectPlace.init(row)
            } else if (code == 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'batchNoQuery', type: 'view', id: row.projectId, isQuery: 'query' } })
            } else if (code == 'suCode') {
                this.$router.push({ name: 'supplierOperate', query: { type: "view", id: row.suId, name: 'batchNoQuery', isQuery: 'query' } })
            } else if (code == 'sourceCode') {
                this.$router.push({ name: 'purchaseOrderOperate', query: { type: "view", id: row.sourceId, name: 'batchNoQuery', isQuery: 'query' } })
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
</style>
