<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery"></form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @numberChange="numberChange"
            @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableData="dataList" :property="property"
            :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
            id-name="i18nCode" @selectChange="selectChange" @emitAblFilter="emitAblFilter" />
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <operate ref="operate" @operateSuccess="operateSuccess" />
        <opt-type ref="optType"></opt-type>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { i18nList, getDataList, i18nDataDelete } from '@/api/system/i18n'
import operate from './components/operate.vue';
import optType from './components/opt-type.vue';

export default {
    name: "i18n",
    mixins: [indexMixin],
    components: {
        operate, optType
    },
    data() {
        return {
            // 遮罩层
            loading: false,
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 总条数
            total: 0,
            // 角色表格数据
            dataList: [],
            // 表格序号是否展示
            numberShow: false,
            // 表单参数
            formData: {},
            formDataClick: {},
            property: {},
        };
    },
    created() {
        this.menuProperty();
    },
    methods: {
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.property = data;
                i18nList({ status: 0 }).then(res => {
                    const data = res.data;
                    const fields = data.map((item) => {
                        return {
                            "id": item.id,
                            "fieldCode": item.i18nType,
                            "fieldName": `${item.i18nType}(${item.i18nName})`,
                            "isHide": 0
                        }
                    })
                    this.property.fields?.push(...fields)
                })
            });
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
            this.formData = Object.assign({}, this.formData, row)
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },

        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        operateSuccess() {
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple) {
            this.single = single
            this.multiple = multiple
        },
        getList() {
            this.loading = true;
            getDataList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.dataList = data.list;
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })

        },
        handleCreate() {
            this.$refs.operate.init('create');
        },
        handleUpdate(ids) {
            this.$refs.operate.init('update', ids);
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
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            switch (buttonCode) {
                case "create":
                    this.$refs['operate'].init(buttonCode)
                    break;
                case "update":
                    this.$refs['operate'].init(buttonCode, rowArr[0])
                    break;
                case "delete":
                    this.$modal.confirm('是否确认删除?').then(function () {
                        i18nDataDelete({ i18nCodeList: idArr })
                    }).then(() => {
                        this.getList();
                        this.$msg.success("删除成功");
                    });
                    break;
                case "i18nType":
                    this.$refs['optType'].init()
                    break;
                default:
                    break;
            }
        },
    }
};
</script>