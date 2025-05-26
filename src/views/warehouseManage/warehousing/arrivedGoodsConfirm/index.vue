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
        <table-index ref="tableIndex" idName="puOrderRawId" :loading="loading" :tableIndexs="tableIndex"
            :tableData="list" :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
            @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
            @emitAblFilter="emitAblFilter" @clickLink="clickLink">
            <template slot="arrivedStatus" slot-scope="scope">
                <span :class="'demandStatuss-' + scope.value">{{ scope.value |
                    fieldFormat(scope.fieldFormatArr) }}</span>
            </template>
            <template slot="fileList" slot-scope="scope">
                <el-link :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
                    :disabled="!scope.data.fileList || !scope.data.fileList.length"
                    @click.stop="linkClick(scope)">查看</el-link>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <normalDelivery ref="normalDelivery" @normalDeliverySuccess="getList"></normalDelivery>
        <fileList ref="fileList" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { detailAllList, exportDetailList } from '@/api/prodmgr-pu/order'
import { arrivedBatchArrived } from '@/api/prodmgr-pu/arrived'
import normalDelivery from './components/normalDelivery'
import { download } from '@/utils/request'
import fileList from '@/views/components/fileList/index'
import FormUnitId from '@/views/components/form-unitId'

export default {
    name: "arrivedGoodsConfirm",
    mixins: [indexMixin],
    components: { normalDelivery, fileList, FormUnitId },
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
            selectedRow: null
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
            if (['batchDelivery', 'normalDelivery'].includes(button.buttonCode)) {
                return !(['0', '1'].includes(row.arrivedStatus))
            }
            if (button.buttonCode === 'reissueDelivery') {
                return ['2'].includes(row.arrivedStatus)
            }
            if (['arrivalDetails'].includes(button.buttonCode)) {
                if (this.selection.length) {
                    const purCode = this.selection[0].purCode
                    const flagA = this.selection.some(item => item.purCode != purCode)
                    return flagA
                }
                return !['1', '2'].includes(row.arrivedStatus)
            }
            if(['deliveryAdjustment'].includes(button.buttonCode)){
                return  !['2'].includes( row.arrivedStatus)
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
        handleButton(buttonCode, idArr, rowArr, { type, buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode === 'batchDelivery') {
                this.sendCreateAll(rowArr);
            }else if (buttonCode === 'arrivalDetails' && type === 'top') {
                let query = {}
                if (!!rowArr.length) {
                    query.purOrderCode = rowArr[0].purCode
                }
                this.$router.push({ name: 'arrivalDetails', query })
            }else  if (buttonCode === 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportDetailList}`, Object.assign({ status: 3 }, this.formData, this.listQuery, { exportColumns }));
            } else if(buttonCode === 'normalDelivery') {
                this.$refs.normalDelivery.init(buttonCode, rowArr[0])
            }
            // if(buttonCode === 'normalDelivery'){
            //     this.$refs.normalDelivery.init(buttonCode, rowArr[0]);
            //     return
            // }
            // if(buttonCode === 'reissueDelivery'){
            //     this.$refs.normalDelivery.init(buttonCode, rowArr[0]);
            //     return
            // }
            // if(buttonCode === 'deliveryAdjustment'){
            //     this.$refs.normalDelivery.init(buttonCode, rowArr[0]);
            //     return
            // }
            // if(buttonCode === 'arrivalDetails'){
            //     this.$refs.normalDelivery.init(buttonCode, rowArr[0]);
            //     return
            // }
        
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            detailAllList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        clickLink(row, code) {
            const codePush = {
                'purCode': { name: 'purchaseOrderOperate', query: { type: 'view', id: row.purOrderId, name: 'arrivedGoodsConfirm' } },
                'matlCode': { name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'arrivedGoodsConfirm' } },
                'projectCode': { name: 'projectManagementOperate', query: { type: "view", id: row.projectId, name: 'arrivedGoodsConfirm' } },
                'suCode': { name: 'supplierOperate', query: { type: "view", id: row.suId, name: 'arrivedGoodsConfirm' } },
            }
            codePush[code] && this.$router.push(codePush[code]);
        },
        sendCreateAll(rowArr) {
            this.$modal.confirm('到货数量默认=单据数量，确定后不可修改是否确定？', '批量到货').then(() => {
                const ids = rowArr.map(({ id }) => id)
                return arrivedBatchArrived({ ids });
            }).then((data) => {
                if (data.success) {
                    this.$modal.msgSuccess(data.message);
                } else {
                    this.$modal.msgError(data.message);
                }
                this.getList();
            })
        },
        linkClick(scope) {
            this.$refs.fileList.init(scope.value)
        }
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
