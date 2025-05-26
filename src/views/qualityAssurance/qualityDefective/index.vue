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
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <purchaseOrderShipping ref="purchaseOrderShipping"></purchaseOrderShipping>
        <unqualifiedNumList ref="unqualifiedNumList"></unqualifiedNumList>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { qiUnqualityList, exportUnqualityList } from '@/api/prodmgr-inv/qi'
import purchaseOrderShipping from '@/views/purchasingManagement/purchaseOrder/components/purchaseOrderShipping';
import { download } from '@/utils/request'
import unqualifiedNumList from '../qualityTesting/components/unqualifiedNumList';
import FormUnitId from '@/views/components/form-unitId'

export default {
    name: "qualityDefective",
    mixins: [indexMixin],
    components: { purchaseOrderShipping, unqualifiedNumList, FormUnitId },
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
            sourceDetails: {
                '1': 'purchaseOrderOperate',
                '2': 'salesReturnOperate',
                '3': 'createTransferOutOrder',
                '4': 'lendReturnOrder',
                '7': 'productionRejectedOperate',
            }
        };

    },
    created() {
        this.menuProperty();
    },
    methods: {
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
                download(`${exportUnqualityList}`, Object.assign({}, this.formData, this.listQuery, { isUnqualifiedQuery: '1', exportColumns }));
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            qiUnqualityList(Object.assign({}, this.listQuery, this.formData, { isUnqualifiedQuery: '1' })).then(({ data }) => {
                this.list = data.list;
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        async handleChange(val) {
            await this.menuProperty();
            this.getList();
        },
        clickLink(row, name) {
            if (name == 'batchNo') {
                this.$refs.purchaseOrderShipping.init(row, 'view');
                return
            }
            if (name == 'unqualifiedNum') {
                this.$refs.unqualifiedNumList.init(row.id)
                return
            }
            if (name === 'sourceCode') {
                if (this.sourceDetails[row.qiSource]) {
                    this.$router.push({ name: this.sourceDetails[row.qiSource], query: { type: 'view', id: row.sourceId, name: 'qualityDefective' } })
                }
                return
            }
            const qiSourceObj = {
                'matlCode': { name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'qualityDefective' } },
                'qiCode': { name: 'qualityTestingOperate', query: { type: "view", id: row.qiOrderId, name: 'qualityDefective' } },
                'projectCode': { name: 'projectManagementOperate', query: { type: "view", id: row.projectId, name: 'qualityDefective' } },
                'suCode': { name: 'supplierOperate', query: { type: "view", id: row.suId, name: 'qualityDefective' } },
            }
            const qiSource = qiSourceObj[name]
            qiSource && this.$router.push(qiSource)
        },
    }
};
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
    margin-left: 20px;
    margin-top: 16px;
}
</style>
