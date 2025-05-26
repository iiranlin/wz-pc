<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField"></form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
            @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
            @emitAblFilter="emitAblFilter" @clickLink="clickLink">
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
import { arrivedList, exportDetailList } from '@/api/prodmgr-pu/arrived';
import normalDelivery from './components/normalDelivery'
import { download } from '@/utils/request'
import fileList from '@/views/components/fileList/index'

export default {
    name: "arrivalDetails",
    mixins: [indexMixin],
    components: { normalDelivery, fileList },
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
        const { query = {} } = this.$route
        this.formData = Object.assign({}, this.formData, query)
        this.$nextTick(() => {
            this.menuProperty();
            this.getList();
        })

    },
    methods: {
        menuProperty() {
            let id = '1830773314321489920';
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data;
            });
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
          if(button.buttonCode === 'push'){
            return row.isQi != '1' || row.bizStatus != '0'
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
                download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
                return
            }
            if (buttonCode === 'push') {
              this.$router.push({ name: 'qualityTestingOperate', query: { name: 'arrivalDetails', type: buttonCode, qiSource: '1', ids: idArr.join()} })
            }
            
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            arrivedList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.list = data.list
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        clickLink(row, code) {
            const codePush = {
                'purOrderCode': { name: 'purchaseOrderOperate', query: { type: 'view', id: row.purOrderId, name: 'arrivalDetails' } },
                'matlCode': { name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'arrivalDetails' } },
                'projectCode': { name: 'projectManagementOperate', query: { type: "view", id: row.projectId, name: 'arrivalDetails' } },
                'suCode': { name: 'supplierOperate', query: { type: "view", id: row.suId, name: 'arrivalDetails' } },
                'batchNo': () => {
                    this.$refs.normalDelivery.init('arrivalDetails', { ...row, id: row.purOrderDetailId })
                },
            }
            codePush[code] && typeof codePush[code] === 'function' ? codePush[code]() : this.$router.push(codePush[code]);
        },
        linkClick(scope) {
            this.$refs.fileList.init(scope.value)
        }
    }
};
</script>