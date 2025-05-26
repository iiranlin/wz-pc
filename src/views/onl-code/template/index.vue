<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
            @newButton="newButton"></button-top>
        <form-data :property="property" :showSearch="showSearch" :searchArr="property.search || []"
            @handleQuery="handleQuery" />
        <right-toolbar ref="rightToolbar" :property="property" :formData="formData" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset"
            @numberChange="numberChange"></right-toolbar>
        <table-index ref="tableIndex" :property="property" :loading="loading" :tableData="roleList"
            :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
            @selectChange="selectChange" @emitAblFilter="emitAblFilter" />
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <operate ref="operate" @operateSuccess="operateSuccess" />
    </div>
</template>

<script>
import mixins from '@/views/mixins'
import operate from './components/operate'
import { onlCodeTemplateList } from '@/api/onl-code/code-template'
export default {
    name: "codeTemplate",
    components: {
        operate,
    },
    mixins: [mixins],
    data() {
        return {
            property: {},
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
            roleList: [],
            // 表格序号是否展示
            numberShow: false,
            // 表单参数
            formData: {},
        };
    },
    created() {
        this.$store.dispatch('menuProperty', this.$route.meta.id).then((data) => {
            this.property = data;
        });

    },
    methods: {
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            switch (buttonCode) {
                case 'create':
                    this.$refs['operate'].init('create');
                    break;
                case 'update':
                    this.$refs['operate'].init('update', idArr[0]);
                    break;
                case 'delete':
                    break;
                default:
                    break;
            }
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
        /** 搜索按钮操作 */
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
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
        /** 查询角色列表 */
        getList() {
            this.loading = true;
            onlCodeTemplateList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                this.roleList = data.list;
                this.total = data.total;
                this.loading = false;
            })

        },
        handleCreate() {

        },
        handleUpdate(ids) {

        },
        handleDelete(ids) {
            this.$modal.confirm('是否确认删除角色?').then(function () {
                return roleDeleteBatch({ ids });
            }).then(() => {
                this.getList();
                this.$modal.msgSuccess("删除成功");
            }).catch(() => {
            });
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
    }
}
</script>

<style lang="scss" scoped></style>