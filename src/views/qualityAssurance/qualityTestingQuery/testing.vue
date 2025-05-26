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
            <template slot="qiStatus" slot-scope="scope">
                <span :class="'qiStatus-' + scope.value">{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}</span>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <!-- <purchaseOrderShipping ref="purchaseOrderShipping"></purchaseOrderShipping> -->
        <normalDelivery ref="normalDelivery" @normalDeliverySuccess="getList"></normalDelivery>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { qiOrderQueryList, qiDetailQueryList, exportDetailQueryList } from '@/api/prodmgr-inv/qi'
// import purchaseOrderShipping from '@/views/purchasingManagement/purchaseOrder/components/purchaseOrderShipping';
import { download } from '@/utils/request'
import { menuConfig, getRouteByInsource } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import normalDelivery from '@/views/warehouseManage/warehousing/arrivedGoodsConfirm/components/normalDelivery'
import FormUnitId from '@/views/components/form-unitId'
export default {
    name: "qualityTestingQuery",
    mixins: [indexMixin],
    props: {
        tableType: {
            type: String,
            default: '2'
        },
        tabChange: {
            type: Function,
            default: null
        }
    },
    components: { orderDetailType, normalDelivery, FormUnitId },
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
            menuId: ''
        };

    },
    created() {
        this.menuProperty({ '1': '', '2': menuConfig.MENU_ZJDWH_BRANCH_CX }[this.tableType])
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
            if (['print'].includes(button.buttonCode)) {
                return !this.selection.length
            }
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (['warehousing'].includes(button.buttonCode) && !['4', '5'].includes(row.qiStatus)) {
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
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = selection
        },
        handleResetField() {
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode === 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportDetailQueryList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
            } else if (buttonCode === 'warehousing') {
                const isSource = rowArr.every((item, index, arr) => {
                    return item.qiSource == arr[0].qiSource
                })
                if (isSource) {
                    const isUnit = rowArr.every((item, index, arrs) => {
                      return item.unitId == arrs[0].unitId
                    })
                    if (!isUnit) {
                      this.$modal.msgError('只能选相同所属组织的数据')
                      return
                    }
                    this.$router.push({ name: 'createInventoryMaintenance', query: { name: 'qualityTesting', inSource: rowArr[0].qiSource, type: 'create', ids: idArr.join(',') } });
                } else {
                    this.$modal.msgError('请选择同一个质检来源')
                }
            }

            //             else if (buttonCode === 'print') {

            // const isCode = rowArr.every((item, index, arr) => {
            //     return item.qiCode == arr[0].qiCode
            // })
            // if (!isCode) {
            //     this.$modal.msgError('请选择同一个质检单号')
            //     return
            // }
            // const tmpls = buttonData.printTemplateId.split(',')
            // this.handlePrint(tmpls, rowArr)
            // }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            const queryParam = Object.assign({}, this.listQuery, this.formData)
            if (this.tableType == '1') {
                qiOrderQueryList(queryParam).then(({ data }) => {
                    this.list = data.list;
                    this.total = data.total;
                }).finally(() => {
                    this.loading = false;
                })
            } else {
                qiDetailQueryList(queryParam).then(({ data }) => {
                    this.list = data.list;
                    this.total = data.total;
                }).finally(() => {
                    this.loading = false;
                })
            }
        },
        clickLink(row, name) {
            if (name === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'qualityTesting', isQuery: 'query' } });
            } else if (name === 'sourceCode') {
                const route = getRouteByInsource(row.qiSource)
                route && this.$router.push({ name: route, query: { type: 'view', id: row.sourceId, name: 'qualityTesting', isQuery: 'query' } })
            } else if (name === 'batchNo') {
                // this.$refs.purchaseOrderShipping.init(row, 'view');
                this.$refs.normalDelivery.init('listDetails', row)
            } else {
                if (this.tableType == '1') {
                    this.$router.push({ name: 'qualityTestingOperate', query: { type: "view", id: row.id, tableType: this.tableType, isQuery: 'query' } })
                } else {
                    this.$router.push({ name: 'qualityTestingOperate', query: { type: "view", id: row.qiOrderId, tableType: this.tableType, isQuery: 'query' } })
                }
            }
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
