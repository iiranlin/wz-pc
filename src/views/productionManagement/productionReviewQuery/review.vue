<template>
    <div class="app-container container_flex">
        <button-top ref="buttonTopRef" :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton" :button-disable="handleTopButtonDisabled" />
        <form-data ref="formData" :treeList="treeList" @searchFormTreeSelected="searchFormTreeSelected"
          @searchFormTreeCleared="searchFormTreeCleared" :showSearch="showSearch" :searchArr="property.search || []"
          :formData="formData" @handleQuery="handleQuery" @handleResetField="handleResetField">
          <template v-slot:unitName="{data, i18nData}">
            <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
          </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :treeList="treeList" :formData="formDataClick"
                    :searchArr="property.search || []" :showSearch.sync="showSearch" :columns="property.fields"
                    @queryTable="handleQuery" :menuId="menuId" @handleCheckAllChange="handleCheckAllChange"
                    @clickReset="clickReset" @numberChange="numberChange" @cleanClick="cleanClick">
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
                    @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
                    :handleCellClassName="handleCellClassName" @selectChange="selectChange"
                    @emitAblFilter="emitAblFilter">
                    <template slot="bizStatus" slot-scope="scope">
                        <span :class="'scStatus-' + scope.value">{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}</span>
                    </template>
                    <template slot="isOverPicking" slot-scope="scope">
                        <span :style="{ color: scope.value == '1' ? 'red' : '' }">{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}</span>
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <orderDetail ref="orderDetailRef" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';

import { getList, exportList } from '@/api/projectManagement/productionReviewQuery'
import orderDetailType from '@/views/components/orderDetailType'
import orderDetail from '@/views/components/orderDetail'
import FormUnitId from '@/views/components/form-unitId'

export default {
    name: "productionReviewQuery",
    mixins: [indexMixin],
    components: { orderDetailType, orderDetail, FormUnitId },
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

    data() {
        return {
            menuId: '',
            treeList: {
                deptId: [],
            },
            // 遮罩层
            loading: false,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
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
        };

    },
    created() {
        const query = this.$route.query || {}
        this.formData = query
        this.formDataClick = query
        this.menuProperty()
    },
    methods: {
        handleCellClassName({ row, column, rowIndex, columnIndex }) {
            if (['a', 'needNum', 'inventoryNum', 'lackNum'].includes(column.property)) {
                return 'tableCell01'
            }
            if (['b', 'pickingQuoteNum', 'outQuoteNum', 'outNum'].includes(column.property)) {
                return 'tableCell02'
            }
            if (['c', 'isOverPicking', 'overNum'].includes(column.property)) {
                return 'tableCell03'
            }
            if (['d', 'returnQuoteNum', 'qiNum', 'qiFinishNum', 'totalQualifiedNum', 'totalUnqualifiedNum', 'damageNum', 'inNum'].includes(column.property)) {
                return 'tableCell04'
            }
            return ''
        },
        async searchFormTreeSelected(node, fieldCode) {
        },
        searchFormTreeCleared(fieldCode = "") {
        },
        async menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            const property = await this.$store.dispatch('menuProperty', this.menuId)
            this.listQuery.pageSize = property.defaultPageSize || 30
            this.property = property

            // ...query,
        },
        async getList() {
            try {
                this.loading = true

                const param = {
                    ...this.listQuery,
                    ...this.formData,

                }

                const { data: { list = [], total = 0 } } = await getList(param)
                this.list = list;
                this.total = total;
            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false;
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

        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, { status, bizStatus }) {
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
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const ids = rowArr.map(({ returnId }) => returnId)
            const buttonActions = {
                export: () => {
                    this.handleExport()
                }
            };
            const action = buttonActions[buttonCode];
            action && action();
        },
        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                await exportList(param)
            } catch (err) {
                console.error(err)
            }
        },
        clickLink(row, code) {
            if (['inventoryNum', 'pickingQuoteNum', 'outQuoteNum', 'outNum', 'returnQuoteNum', 'qiNum', 'qiFinishNum',
                'totalQualifiedNum', 'totalUnqualifiedNum', 'damageNum', 'inNum'].includes(code)) {
                const query = code == 'inventoryNum' ? { matlCode: row.matlCode, type: 1 } : { queryType: code, rawMatlId: row.rawMatlId }
                this.$refs.orderDetailRef.init(query, {
                    inventoryNum: 'inventoryNum', // 当前库存量
                    pickingQuoteNum: 'pickingQuoteNum', // 已生成领料单数量(累计)
                    outQuoteNum: 'outQuoteNum', // 已生成出库单数量(累计)
                    outNum: 'outNum', // 已出库完成数量(累计)
                    returnQuoteNum: 'returnQuoteNum', // 已生成退料单数量(累计)
                    qiNum: 'qiNum', // 已生成质检单数量(累计)
                    qiFinishNum: 'qiFinishNum', // 已质检完成数量(累计)
                    totalQualifiedNum: 'totalQualifiedNum', // 质检合格数量
                    totalUnqualifiedNum: 'totalUnqualifiedNum', // 质检不良数量
                    damageNum: 'damageNum', // 质检制损件数量
                    inNum: 'inNum', // 已完成入库单数量(累计)
                }[code])
                return
            }
            const linkConfig = {
                orderCode: { name: 'productionOrderOperate', query: { name: 'productionRejectedQuery', type: 'view', id: row.orderId } },
                produceCode: { name: 'materialArchivesOperate', query: { name: 'productionRejectedQuery', type: 'view', matlCode: row.produceCode } },
                matlCode: { name: 'materialArchivesOperate', query: { name: 'productionRejectedQuery', type: 'view', matlCode: row.matlCode } },
                orderRawCode: { name: 'productionOrderOperate', query: { name: 'productionRejectedQuery', type: 'view', id: row.orderRawId, tableType: 2 } },

            }[code]
            if (!!linkConfig) {
                this.$router.push(linkConfig)
            }
        },
    }
};
</script>

<style scoped lang="scss"></style>
