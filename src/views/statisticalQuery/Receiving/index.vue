<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="property.buttonTop"
      :multiple="multiple"
      :single="single"
      @newButton="newButton"
    ></button-top>
    <form-data
      ref="formData"
      :showSearch="showSearch"
      :formData="formData"
      :searchArr="property.search || []"
      @handleQuery="handleQuery"
      @handleResetField="handleResetField"
      labelWidth="100px"
    />
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
      idName="taskId"
      :tableIndexs="tableIndex"
      :tableData="list"
      :property="property"
      :numberShow="numberShow"
      @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton"
      @emitAblFilter="emitAblFilter"
    />
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { auditList } from "@/api/statisticalQuery/Receiving.js";
import indexMixin from "@/views/mixins";
export default {
  name: "Receiving",
  mixins: [indexMixin],
  data() {
    return {
      formDataClick: {},
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
      // 日期范围
      dateRange: [],
      // 表格序号是否展示
      numberShow: true,
      // 页面属性
      property: { fields: [{ isAdd: 1, isEdit: 1 }] },
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 30,
      },
      formData: {
        status: "2",
      },
      visible: false,
      metaId: this.$route.meta.id,
      selected: [],
      selectedRow: null,
    };
  },
  created() {
    this.$store.dispatch("menuProperty", this.metaId).then((data) => {
      this.listQuery.pageSize = data.defaultPageSize || 30;
      this.property = data;
    });
  },
  methods: {
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
    clearSearch() {
      this.getList();
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    emitAblFilter(listQuery) {
      // this.dateRange = [];
      // this.getList();
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    menuSuccess() {
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple, selected) {
      this.single = single;
      this.multiple = multiple;
      this.selected = selected;
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      auditList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
        this.loading = false;
      });
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData);
      switch (buttonCode) {
        case "download":
          console.log("download");
          break;
        default:
          break;
      }
    },
  },
};
</script>
