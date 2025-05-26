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
            <!-- <template v-slot:tab>
                <orderDetailType :value="tableType" :options="options" @input="handleTableTypeChange">
                    <template v-slot:title>
                        <span class="tab-title">入库完成数量=合同数量</span>
                    </template>
                </orderDetailType>
            </template> -->
        </right-toolbar>
        <table-index ref="tableIndex" idName="id" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
            @handleButton="handleButton" :selectShow="false" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <orderDetail ref="orderDetailRef" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { getPuCtList, exportDetailList } from '@/api/prodmgr-pu/Ct'
import { download } from '@/utils/request'
import orderDetailType from '@/views/components/orderDetailType'
import orderDetail from '@/views/components/orderDetail'
import FormUnitId from '@/views/components/form-unitId'
export default {
    name: 'purchaseTracing',
    mixins: [indexMixin],
    components: { orderDetailType, orderDetail, FormUnitId },
    data() {
        return {
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
                pageSize: 30
            },
            // 表单参数
            formData: {},
            formDataClick: {},
            selectedRow: null,
            menuId: ''
        }

    },
    created() {
        this.menuProperty()
        this.getList()
    },
    methods: {
        menuProperty() {
            this.menuId = this.$route.meta.id
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data
            })
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
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
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key)
                }
                this.formData[key] = null
            }
            this.handleQuery()
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
            this.formDataClick = Object.assign({}, this.formData, row)
            this.getList()
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery()
        },

        handleResetField() {
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode === 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
            }
        },
        getList() {
            this.loading = true
            getPuCtList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list
                this.total = data.total
            }).finally(() => {
                this.loading = false
            })
        },
        handleChange(val) {
            this.menuProperty()
            this.getList()
        },
        clickLink(row, name) {
            if (name === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'purchaseTracing', type: 'view', id: row.projectId } })
            } else if (name === 'ctCode') {
                this.$router.push({ name: 'contractManagementOperate', query: { name: 'purchaseTracing', type: 'view', id: row.ctId } })
            } else if (name === 'relativeCode') {
                this.$router.push({ name: 'supplierOperate', query: { name: 'purchaseTracing', type: 'view', id: row.relativeId } })
            } else if (name === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { name: 'purchaseTracing', type: 'view', matlCode: row.matlCode } })
            } else if (['finishInNum', 'qualifiedInNum', 'puOrderNum'].includes(name)) {
                this.$refs.orderDetailRef.init({ ctRawId: row.ctRawId }, { puOrderNum: 'CG', qualifiedInNum: 'RK', finishInNum: 'HW' }[name])
            }
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
