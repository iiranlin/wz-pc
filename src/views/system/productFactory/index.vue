<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="property.buttonTop"
      :multiple="multiple"
      :single="single"
      @newButton="newButton"
      :buttonDisable="handleTopButtonDisabled"
    />
    <form-data
      ref="formData"
      :showSearch="showSearch"
      :searchArr="property.search || []"
      :formData="formData"
      @handleQuery="handleQuery"
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
      @cleanClick="cleanClick"
      @numberChange="numberChange"
    />
    <table-index
      ref="tableIndex"
      :loading="loading"
      :tableData="list"
      :property="property"
      :numberShow="numberShow"
      @handleSelectionChange="handleSelectionChange"
      @selectChange="selectChange"
      @emitAblFilter="emitAblFilter"
      @handleButton="handleButton"
    />
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
    <Add ref="add" @success="handleQuery" />
  </div>
</template>
<script>
import * as Api from "@/api/prodmgr-inv/project/productFactory.js";
import indexMixin from "@/views/mixins";
import Add from "./components/add.vue";
export default {
  name: "productFactory",
  components: { Add },
  mixins: [indexMixin],
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      property: {},
      formData: {},
      formDataClick: {},
      selection: [],
      single: true,
      multiple: true,
      showSearch: true,
      numberShow: true,
      listQuery: { pageNum: 1, pageSize: 30 },
    };
  },
  created() {
    this.$store.dispatch("menuProperty", this.$route.meta.id).then((data) => {
      this.property = data;
    });
  },
  methods: {
    handleTopButtonDisabled(button) {
      return (
        (button.buttonCode === "update" || button.buttonCode === "delete") &&
        !this.selection.length
      );
    },
    newButton(code, formId, data) {
      this.$refs.tableIndex.newButton(code, {}, formId, data);
    },
    handleCheckAllChange(v) {
      this.$refs.tableIndex.init(v);
    },
    numberChange(v) {
      this.numberShow = v;
    },
    selectChange({ formData, isWatch }) {
      if (!isWatch) this.handleQuery(formData);
      else this.formData = Object.assign({}, this.formData, formData);
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    clickReset() {
      this.handleQuery();
    },
    cleanClick(fields) {
      fields.forEach((field) => {
        this.$set(this.formData, field, null);
      });
      this.handleQuery();
    },
    emitAblFilter(query) {
      this.listQuery = Object.assign({}, this.listQuery, query);
      this.handleQuery();
    },
    getList() {
      this.loading = true;
      Api.list(Object.assign({}, this.listQuery, this.formData))
        .then(({ data }) => {
          this.list = data.list || [];
          this.total = data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    handleButton(code, ids) {
      if (code === "create") this.$refs.add.init();
      if (code === "update") this.$refs.add.updateInit(ids[0]);
      if (code === "delete") this.handleDelete(ids);
    },
    handleDelete(ids) {
      this.$modal
        .confirm("是否确认删除厂家?")
        .then(() => Api.batchRemove({ ids }))
        .then(() => {
          this.$modal.msgSuccess("删除成功");
          this.getList();
        });
    },
  },
};
</script>
