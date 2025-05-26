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
            @clickLink="clickLink" @handleButton="handleButton" @emitAblFilter="emitAblFilter">
            <template slot="checkStatus" slot-scope="scope">
                <span :class="'pickingStatus-' + scope.value">{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}</span>
            </template>
            <template slot="checkResult" slot-scope="scope">
                <span
                    :class="scope.value == '1' ? 'check_result_win' : scope.value == '2' ? 'check_result_lose' : ''">{{
                        handleStatus(scope.value, dict.type.checkResult) }}</span>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import orderDetailType from '@/views/components/orderDetailType'
import { getList, getDetailList, exportList } from '@/api/warehouseManage/checkQuery'
import { download } from '@/utils/request'
import { menuConfig } from '@/utils'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
export default {
    name: 'checkQueryList',
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
    components: { orderDetailType, FormUnitId, FormWarehouseCode },
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
        this.menuProperty({ '1': '', '2': menuConfig.MENU_CHECK_DETAIL_QUERY }[this.tableType])
    },
    methods: {
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data;
            });
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
                '1': getList,
                '2': getDetailList
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
                this.$router.push({ name: 'inventorySheetMainDetail', query: { id: this.tableType === '2' ? row.checkId : row.id, type: 'view', name: 'adjustFormReview' } });
            } else if (name === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { id: row.projectId, type: 'view', name: 'adjustFormReview' } });
            }
        },
        handleButtonDisable(button, row) {
            return false
        },
        cleanClick(data) {
            for (const key of data) {
                this.formData[key] = null;
            }
            this.handleQuery();
        },

        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const buttonActions = {
                export: () => {
                    const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                    download(`${exportList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
                },
            }
            const action = buttonActions[buttonCode];
            action && action();
        },

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