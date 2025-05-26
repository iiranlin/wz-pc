<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            :button-disable="handleTopButtonDisabled" @newButton="newButton"></button-top>
        <form-data ref="formData" :formData="formData" :showSearch="showSearch" :searchArr="property.search || []"
            @handleQuery="handleQuery" />
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" idName="id" :loading="loading" :tableData="dataList" :property="property"
            :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" :buttonDisable="handleButtonDisable"
            @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter">
            <template slot-scope="scope">
                <previewImg :data="scope.data"></previewImg>
            </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <operate ref="operate" @operateSuccess="handleQuery" />
    </div>
</template>

<script>
import { sysBillsRuleList, sysBillsRuleBatchRemove } from '@/api/system/bills-rule';
import indexMixin from '@/views/mixins';
import operate from './components/operate'
import previewImg from './components/previewImg'

export default {
    name: "receiptRule",
    mixins: [indexMixin],
    components: { operate, previewImg },
    data() {
        return {
            // 遮罩层
            loading: false,
            // 顶部搜索labelWidth
            labelWidth: '',
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 总条数
            total: 0,
            // 表格数据
            dataList: [],
            // 表格序号是否展示
            numberShow: true,
            // 表单参数
            formData: {},
            formDataClick: {},
            // 菜单按钮、字段等数据
            property: {},
            // 列表选中数据
            selection: []
        };
    },
    created() {
        this.menuProperty();
    },
    methods: {
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
            this.menuProperty();
            this.handleQuery();
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        /** 搜索按钮操作 */
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1;
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.property = data;
            });
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery);
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.single = single;
            this.multiple = multiple;
            this.selection = selection;
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
        /** 查询角色列表 */
        getList() {
            this.loading = true;
            sysBillsRuleList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.dataList = data.list;
                this.total = data.total;
                this.loading = false;
            })

        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            switch (buttonCode) {
                case 'create':
                    this.handleCreate();
                    break;
                case 'update':
                    this.handleUpdate(rowArr[0]);
                    break;
                case 'delete':
                    this.handleDelete(idArr);
                    break;
                default:
                    break;
            }
        },
        handleCreate() {
            this.$refs.operate.init('create');
        },
        handleUpdate(data) {
            this.$refs.operate.init('update', data);
        },
        handleDelete(ids) {
            this.$modal.confirm('是否确认删除?').then(() => {
                return sysBillsRuleBatchRemove({ ids });
            }).then(() => {
                this.handleQuery();
                this.$modal.msgSuccess('删除成功');
            })
        }
    }
};
</script>
