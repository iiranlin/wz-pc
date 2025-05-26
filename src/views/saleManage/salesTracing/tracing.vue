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
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" :menuId="menuId" @clickReset="clickReset"
            @numberChange="numberChange" @cleanClick="cleanClick">
            <template v-slot:tab>
                <orderDetailType :value="tableType" @input="handleTableTypeChange" :options="tableOptions" />
            </template>
        </right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list" idName="id"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
            @handleButton="handleButton" @handleSelectionChange="handleSelectionChange" @emitAblFilter="emitAblFilter"
            @clickLink="clickLink">
            <template slot="saleOrderStatus" slot-scope="scope">
                <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value || '1' |
                    fieldFormat(scope.fieldFormatArr) }}
            </template>
             <template slot="status" slot-scope="scope">
                <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value || '1' |
                    fieldFormat(scope.fieldFormatArr) }}
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <orderDetail ref="orderDetailRef" />
        <detail ref="detailRef"></detail>
    </div>
</template>

<script>

import indexMixin from '@/views/mixins';
import orderDetailType from '@/views/components/orderDetailType'
import { getCtList, exportSaleDetailList } from '@/api/prodmgr-pu/Ct'
import { allOrderList, exportAllOrderList } from '@/api/saleManage/saleOrder'
import orderDetail from '@/views/components/orderDetail'
import detail from './detail.vue'
import { download } from '@/utils/request'
import FormUnitId from '@/views/components/form-unitId'
import { menuConfig } from '@/utils'
const TABLE_TYPE = {
    MASTER: 'MASTER', // 主单
    BRANCH: 'BRANCH'  // 主单+明细
}

export default {
    name: "salesTracing",
    mixins: [indexMixin],
    props: {
        tableType: {
            type: String,
            default: 'MASTER'
        },
        tabChange: {
            type: Function,
            default: null
        }
    },
    components: {detail, orderDetailType, orderDetail, FormUnitId },
    data() {
        return {
            tableOptions: [
                { value: TABLE_TYPE.MASTER, label: '主单' },
                { value: TABLE_TYPE.BRANCH, label: '主单+明细' },
            ],
            options: [
                {
                    value: 'MASTER',
                    label: '是'
                },
                {
                    value: 'BRANCH',
                    label: '否'
                },
            ],
            menuId: '',
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
                pageSize: 30,
            },
            // 表单参数
            formData: {},
            formDataClick: {},
            selectedRow: null
        };

    },
    created() {
        this.menuProperty({ [TABLE_TYPE.MASTER]: '', [TABLE_TYPE.BRANCH]: menuConfig.MENU_TRACING_BRANCH }[this.tableType])
    },
    methods: {
        handleSelectionChange(ids, single, multiple, row) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = row
        },
        menuProperty(id) {
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
            if(button.buttonCode == 'rowQuery' && this.tableType == TABLE_TYPE.BRANCH) {
                return !row.saleDetailId
            }
             if(button.buttonCode == 'query' && this.tableType == TABLE_TYPE.BRANCH) {
                return !row.saleDetailId
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
        handleResetField() {
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)

            const methodObj = {
                mrowQuery:() => {
                    const {id} = rowArr[0]
                    this.$refs.detailRef.init({saleOrderId: id})
                },
                rowQuery: () => {
                    const id = rowArr[0].saleDetailId
                    this.$router.push({ name: 'salesTracingCharts', query: { name: 'salesTracing', type: 'view', id: id } });
                },
                query: () => {
                    const id = rowArr[0].saleDetailId
                    this.$router.push({ name: 'salesTracingCharts', query: { name: 'salesTracing', type: 'view', id: id } });
                },
                export: () => {
                    this.exportOperation()
                }
            }
            methodObj[buttonCode] && methodObj[buttonCode]()
        },
        getList() {
            this.loading = true;
            const params = Object.assign({}, this.listQuery, this.formData)
            const func = { [TABLE_TYPE.MASTER]: allOrderList, [TABLE_TYPE.BRANCH]: getCtList }[this.tableType]
            func(params).then(({ data }) => {
                this.list = data.list;
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        async exportOperation() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${this.tableType == TABLE_TYPE.BRANCH ? exportSaleDetailList : exportAllOrderList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
            } catch (err) {
                console.error(err)
            }
        },
        clickLink(row, name) {
            if (name === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'salesReturn', type: 'view', id: row.projectId } })
            } else if (name === 'ctCode') {
                this.$router.push({ name: 'contractManagementOperate', query: { name: 'salesReturn', type: 'view', id: row.ctId } })
            } else if (name === 'relativeCode') {
                this.$router.push({ name: 'customerProfileAdd', query: { name: 'salesReturn', type: 'view', id: row.relativeId } })
            } else if (name === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { name: 'salesReturn', type: 'view', matlCode: row.matlCode } })
            } else if (['demandNum', 'produceNum', 'deliveryNum', 'produceInNum', 'returnNum'].includes(name)) {
                this.$refs.orderDetailRef.init({ saleOrderDetailId: row.saleDetailId }, { demandNum: 'demandNum', produceNum: 'produceNum', deliveryNum: 'deliveryNum', produceInNum: 'produceInNum', returnNum: 'returnNum' }[name])
            } else if (name === 'saleOrderCode') {
                this.$router.push({ name: 'saleOrderOperate', query: { name: 'salesReturn', type: 'view', id: row.id } })
            }
        },
    }
};
</script>

<style scope>
.icon-size {
    width: 16px;
    height: 16px;
    margin-left: 4px;
    margin-right: 3.5px;
}
</style>