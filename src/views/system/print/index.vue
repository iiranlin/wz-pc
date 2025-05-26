<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :formData="formData" :showSearch="showSearch" :searchArr="property.search || []"
            @handleQuery="handleQuery" />
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery" @cleanClick="cleanClick"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange">
        </right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="dataList"
            :property="property" :numberShow="numberShow" :buttonDisable="handleButtonDisable"
            @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
            @emitAblFilter="emitAblFilter" />
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <operate ref="operate" @formSuccess="operateSuccess" />
        <design ref="design" @formSuccess="operateSuccess" />
        <role-drawer ref="roleDrawer" @confirm="handleConfirm" />
        <preview ref="preview" />
    </div>
</template>

<script>
import {
    list,
    remove,
} from "@/api/system/print";
import operate from "./components/operate";
import design from "./components/design";
import preview from "./components/preview";
import indexMixin from "@/views/mixins";
import roleDrawer from './components/roleDrawer'
export default {
    mixins: [indexMixin],
    name: "print",
    components: { operate, design, preview, roleDrawer },
    data() {
        return {
            // 遮罩层
            loading: false,
            treeLoading: false,
            treeCurrentKey: "",
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 用户表格数据
            dataList: [],
            // 弹出层标题
            title: "",
            // 部门树选项
            deptOptions: undefined,
            // 表格序号是否展示
            numberShow: false,
            //列表选中的数据
            selection: [],
            // 查询参数
            formData: {},
            formDataClick: {},
            total: 0,
            property: {},
            defaultProps: {
                children: "children",
                label: "name",
            },
            filterText: "",
        };
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
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
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.name, value);
        },
        handlePreview(id) {
            this.$refs.preview.init(id);
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

        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch("menuProperty", id).then((data) => {
                this.property = data;
            });
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery);
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
        handleConfirm() {
            this.getList()
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1;
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },
        formatField(properties) {
            if (!properties) {
                return {}
            }
            return JSON.parse(properties)
        },
        getList() {
            this.loading = true;
            list(Object.assign({}, this.listQuery, this.formData)).then(
                (res) => {
                    const list = res.data.list.map(item => ({ ...item, ...this.formatField(item.properties) }))
                    this.dataList = list;
                    this.total = res.data.total;
                    this.loading = false;
                }
            );
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.single = single;
            this.multiple = multiple;
            this.selection = selection;
        },
        handleCreate() {
            this.$refs.operate.init("create");
        },
        handleUpdate(id) {
            this.$refs.operate.init("update", id);
        },
        handleCopy(id) {
            this.$refs.operate.init("copy", id);
        },
        handleDesign(id) {
            this.$refs.design.init(id);
        },
        handleDelete(ids) {
            this.$modal
                .confirm("是否确认删除模板?")
                .then(function () {
                    return remove({ ids });
                })
                .then(() => {
                    this.handleQuery();
                    this.$modal.msgSuccess("删除成功");
                })
                .catch(() => { });
            //   }
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const ids = rowArr.map(({ id }) => id)
            switch (buttonCode) {
                case "update":
                    this.handleUpdate(ids[0]);
                    break;
                case "preview":
                    this.handlePreview(ids[0]);
                    break;
                case "delete":
                    this.handleDelete(ids);
                    break;
                case "design":
                    this.handleDesign(ids[0]);
                    break;
                case "copy":
                    this.handleCopy(ids[0]);
                    break;
                case "create":
                    this.handleCreate();
                    break;
                case "tmpl":
                    this.$refs.roleDrawer.init(rowArr[0])
                    break;
                default:
                    break;
            }
        },
        operateSuccess() {
            this.handleQuery();
        },
    },
};
</script>
<style lang="scss" scoped>
.ov_head {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
}
</style>