<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
            :formData="formData">
             <!-- 建设物资 -->
        <template #projectId="data">
          <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择建设项目'
            " clearable filterable style="width: 100%" size="small">
            <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.value" />
          </el-select>
        </template>

        </form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @cleanClick="cleanClick"
            @numberChange="numberChange"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableData="roleList" :property="property"
            :numberShow="numberShow" :buttonDisable="handleButtonDisable" :customnDisabled="true"
            @handleSelectionChange="handleSelectionChange" @selectChange="selectChange" @handleButton="handleButton"
            @emitAblFilter="emitAblFilter">
         
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />

            <!-- 新增编辑 -->
        <operate ref="operate" @operateSuccess="operateSuccess" />
    </div>
</template>

<script>
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import { list, batchRemove} from "@/api/system/projectSite";

import operate from "./components/operate";
import indexMixin from "@/views/mixins";

export default {
    name: "projectSite",
    mixins: [indexMixin],
    components: { operate },
    data() {
        return {
            listQuery: {
               pageNum: 1,
               pageSize: 30,
            },
            lineOptions:[],
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
            // 页面属性
            property: {},
            // 是否展示序号
            numberShow: true,
            // 表单参数
            formData: {},
            formDataClick: {},
            //列表选中的数据
            selection: [],
        };
    },
    created() {
        this.menuProperty();
        this.getLineOptions();
    },
    methods: {
         getLineOptions() {
           LineApi.lineSelectOptions().then(({ data }) => {
              this.lineOptions = data.map(x => ({
               label: x.projectName,
               value: x.id 
             }))
           })
      },
        handleTopButtonDisabled(button) {
            // 如果没有选中行，禁用修改和删除按钮
          if ((!this.selection || this.selection.length === 0) && (button.buttonCode == 'update' || button.buttonCode == 'delete')) {
            return true;
          }
        },
        handleButtonDisable(button, row) {
            return false
        },
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
        clickReset() {
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
        operateSuccess() {
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.single = single;
            this.multiple = multiple;
            this.selection = selection;
        },
        /** 查询角色列表 */
        getList() {
            this.loading = true;
            list(Object.assign({}, this.listQuery, this.formData)).then(
                ({ data }) => {
                    this.roleList = data.list;
                    this.total = data.total;
                    this.loading = false;
                }
            );
        },
        handleCreate() {
            this.$refs.operate.init("create");
        },
        handleUpdate(id) {
            this.$refs.operate.init("update", id);
        },
        handleDelete(ids) {
            this.$modal
                .confirm("是否确认删除站点?")
                .then(function () {
                    return batchRemove({ ids });
                })
                .then(() => {
                    if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                        this.listQuery.pageNum -= 1
                    }
                    this.getList();
                    this.$modal.msgSuccess("删除成功");
                })
                .catch(() => { });
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode === "update") {
                this.handleUpdate(idArr[0]);
            } else if (buttonCode === "delete") {
                this.handleDelete(idArr);
            } else if (buttonCode === "create") {
                this.handleCreate();
            }
        },
    },
};
</script>
