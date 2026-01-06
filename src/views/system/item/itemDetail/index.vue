<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="property.buttonTop"
      :multiple="multiple"
      :single="single"
      @newButton="newButton"
      :button-disable="handleTopButtonDisabled"
    ></button-top>
    <form-data
      ref="formData"
      :showSearch="showSearch"
      :searchArr="property.search || []"
      :formData="formData"
      @handleQuery="handleQuery"
      @handleResetField="handleResetField"
    >
      <!-- 大类 -->
      <template #speciesCode>
        <el-select
          v-model="formData.speciesCode"
          placeholder="请选择"
          style="width: 100%"
          filterable
          clearable
        >
          <el-option
            v-for="item in dict.type.WZDL"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>
      <!-- 种类 -->
      <template #categoriesCode>
        <el-select
          v-model="formData.categoriesCode"
          placeholder="请选择"
          style="width: 100%"
          filterable
          clearable
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>
      <!-- 细目 -->
      <template #providedDetailCode>
        <!-- 使用细目下拉 -->
        <el-select
          v-model="formData.detailName"
          placeholder="请选择"
          style="width: 100%"
          filterable
          clearable
        >
          <el-option
            v-for="item in detailOptions"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>
    </form-data>

    <el-row type="flex" class="container_h">
      <!--用户数据-->
      <el-col :span="18" :xs="24" class="container_flex">
        <right-toolbar
          ref="rightToolbar"
          :formData="formDataClick"
          :searchArr="property.search || []"
          :showSearch.sync="showSearch"
          :columns="property.fields"
          @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange"
          @clickReset="clickReset"
          @numberChange="numberChange"
          @cleanClick="cleanClick"
        ></right-toolbar>

        <table-index
          ref="tableIndex"
          :loading="loading"
          :tableIndexs="tableIndex"
          :tableData="list"
          :buttonDisable="handleButtonDisable"
          :property="property"
          :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange"
          @handleButton="handleButton"
          @selectChange="selectChange"
          @emitAblFilter="emitAblFilter"
        >
          <template slot="status" slot-scope="scope">
            <icon-svg
              :class="iconClassSize({ 0: 3, 1: 0 }[scope.value])"
              :icon-class="iconEnableStautsClass({ 0: 3, 1: 0 }[scope.value])"
            />{{ scope.value | fieldFormat(scope.fieldFormatArr) }}
          </template>
        </table-index>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="listQuery.pageNum"
          :limit.sync="listQuery.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <Add ref="addRef" @createSuccess="getList" />
    <BatchDialog ref="batchDialogRef" @onOk="onDialogOk" />
  </div>
</template>

<script>
import { itemList } from "@/api/prodmgr-inv/project/itemDetail.js";
import indexMixin from "@/views/mixins";
import * as Api from "@/api/prodmgr-inv/project/itemDetail.js";
import Add from "./components/add.vue";
import BatchDialog from "./components/batchDialog.vue";
import * as TypeApi from "@/api/prodmgr-inv/project/itemType.js";
import * as DetailApi from "@/api/prodmgr-inv/project/itemDetail.js";
export default {
  // 物资种类细目字典
  name: "itemDetail",
  dicts: ["WZDL"],
  mixins: [indexMixin],
  components: {
    Add,
    BatchDialog,
  },
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
      numberShow: true,
      // 页面属性
      property: {},
      total: 0,
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageSize: 30,
      },
      // 表单参数
      formData: {
        areaId: "",
        speciesCode: undefined,
        categoriesCode: undefined,
        detailName: undefined,
      },
      formDataClick: {},
      // 部门树选项
      treeLoading: false,
      filterText: "",
      areaList: [],
      typeOptions: [],
      detailOptions: [],
      isInitializing: true, // 添加初始化标记
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree && this.$refs.tree.filter(val);
    },
  },
  async created() {
    await this.menuProperty();

    // 初始化数据源
    await Promise.all([
      this.getTypeOptions(this.formData.speciesCode || ""),
      this.getDetailOptions(this.formData.categoriesCode || ""),
    ]);

    // 初始化完成
    this.$nextTick(() => {
      this.isInitializing = false;
    });
  },
  watch: {
    // 监听物资大类变化
    "formData.speciesCode": {
      async handler(newVal, oldVal) {
        // 如果是初始化阶段且值相同，则不处理
        if (this.isInitializing && newVal === oldVal) return;

        // 清空子级选项
        this.formData.categoriesCode = undefined;
        this.formData.detailName = undefined;

        // 如果没有值，清空选项并返回
        if (!newVal) {
          this.typeOptions = [];
          this.detailOptions = [];
          return;
        }

        // 获取物资种类选项
        await this.getTypeOptions(newVal);
      },
      immediate: true, // 添加immediate属性，确保初始化时也会触发
    },

    // 监听物资种类变化
    "formData.categoriesCode": {
      async handler(newVal, oldVal) {
        // 如果是初始化阶段且值相同，则不处理
        if (this.isInitializing && newVal === oldVal) return;

        // 清空子级选项
        this.formData.detailName = undefined;

        // 如果没有值，清空选项并返回
        if (!newVal) {
          this.detailOptions = [];
          return;
        }

        // 获取物资细目选项
        await this.getDetailOptions(newVal);
      },
      immediate: true, // 添加immediate属性，确保初始化时也会触发
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return (
        !!this.$py.match(data.deptName, value) ||
        data.deptCode.indexOf(value) !== -1
      );
    },
    async menuProperty() {
      let id = this.$route.meta.id;
      const data = await this.$store.dispatch("menuProperty", id);
      this.listQuery.pageSize = data.defaultPageSize || 30;
      this.property = data;
      return data;
    },
    handleTopButtonDisabled(button) {
      return this.selection.some((row) =>
        this.handleButtonDisable(button, row)
      );
    },
    handleButtonDisable(button, row) {
      if (button.buttonCode === "submit" || button.buttonCode === "delete") {
        return row.status === "2" || row.status === "3";
      } else if (button.buttonCode === "update") {
        return row.status === "2" || row.status === "3";
      }
      return false;
    },
    numberChange(val) {
      this.numberShow = val;
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData);
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
        if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
          this.$refs.formData.resetQueryDateRange(key);
        }
        this.formData[key] = null;
      }
      this.handleQuery();
    },
    handleQuery(row = {}) {
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    operateSuccess() {
      this.handleQuery();
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = ids;
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    handleResetField() {
      // 重置时清空所有选项
      // this.listQuery.pageNum = 1;

      this.formData.speciesCode = undefined;
      this.formData.categoriesCode = undefined;
      this.formData.detailName = undefined;
      this.typeOptions = [];
      this.detailOptions = [];

      // 确保在查询前已经加载了相关选项
      Promise.all([
        this.getTypeOptions(this.formData.speciesCode || ""),
        this.getDetailOptions(this.formData.categoriesCode || ""),
      ]);
    },
    onDialogOk(data) {
      this.getList();
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      if (buttonCode == "update") {
        this.$refs["addRef"].updateInit(idArr[0]);
      } else if (buttonCode === "create") {
        this.$refs["addRef"].init();
      } else if (buttonCode === "delete") {
        this.handleDelete(idArr);
      } else if (buttonCode === "batch") {
        this.$refs.batchDialogRef.open();
      }
    },
    handleDelete(ids) {
      this.$modal
        .confirm("是否确认删除?")
        .then(function () {
          return Api.batchRemove({ ids });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        });
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      itemList(Object.assign({}, this.listQuery, this.formData))
        .then(({ data }) => {
          this.list = data.list;
          this.total = data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /*导出*/
    handleExport(obj) {
      const _this = this;
      let params = {
        pageSize: this.listQuery.pageSize,
        pageNum: this.listQuery.pageNum,
      };
      if (obj.exportType == "1") {
        params.pageNum = -1;
        params.pageSize = -1;
      }
      _this.loading = true;
      getProfileExport(Object.assign({}, obj, params, this.formData))
        .then((response) => {
          const fileName = "客户档案.xlsx";
          if (typeof window.navigator.msSaveBlob !== "undefined") {
            window.navigator.msSaveBlob(new Blob([response.data]), fileName);
          } else {
            let url = window.URL.createObjectURL(new Blob([response.data]));
            let link = document.createElement("a");
            link.style.display = "none";
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); //下载完成移除元素
            window.URL.revokeObjectURL(url); //释放掉blob对象
          }
        })
        .finally(() => {
          _this.loading = false;
        });
    },

    handleClose() {
      this.open = false;
    },
    // 获取物资种类选项（依赖物资大类）
    async getTypeOptions(speciesCode = "") {
      try {
        const params = {
          pageNum: 1,
          pageSize: -1,
          speciesCode: speciesCode,
        };

        const res = await TypeApi.itemList(params);
        this.typeOptions = res.data.list.map((x) => ({
          ...x,
          label: x.materialCategoriesName,
          value: x.materialCategoriesCode,
        }));
      } catch (error) {
        console.error("获取物资种类失败", error);
        this.typeOptions = [];
      }
    },
    // 获取物资细目选项（依赖物资种类）
    async getDetailOptions(categoriesCode) {
      try {
        const params = {
          pageNum: 1,
          pageSize: -1,
          categoriesCode: categoriesCode,
        };

        const res = await DetailApi.itemList(params);
        this.detailOptions = res.data.list.map((x) => ({
          ...x,
          label: x.detailName,
          value: x.detailName,
        }));
      } catch (error) {
        console.error("获取物资细目失败", error);
        this.detailOptions = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
