<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"></button-top>
    <form-data :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery" />
    <right-toolbar ref="rightToolbar" :formData="formData" :searchArr="property.search || []" :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
      @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange">
    </right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableData="roleList" :property="property" :numberShow="numberShow"
      @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
      @emitAblFilter="emitAblFilter" />
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <operate ref="operate" @operateSuccess="operateSuccess" />
  </div>
</template>

<script>
import { formDataList, formDataDeleteBatch } from '@/api/form/form-data'
import operate from "./components/operate";
import indexMixin from '@/views/mixins';

export default {
  name: "business",
  mixins: [indexMixin],
  components: { operate },
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
      roleList: [],
      // 表格序号是否展示
      numberShow: false,
      // 表单参数
      formData: {},
      property: {},
    };
  },
  created() {
    this.getList();
    this.menuProperty();
  },
  methods: {
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
    menuProperty() {
      let id = this.$route.meta.id;
      this.$store.dispatch('menuProperty', id).then((data) => {
        
        this.property = data;
      });
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
    //选择框回调
    selectChange(row) {
      let { formData, isWatch } = row;
      if (!isWatch) {
        this.handleQuery(formData);
      } else {
        this.formData = Object.assign({}, this.formData, formData);
      }
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      formDataList(Object.assign({}, this.listQuery, this.formData), this.$route.meta.busCode).then(({ data }) => {
        this.roleList = data.list;
        this.total = data.total;
        this.loading = false;
      })

    },
    handleCreate(buttonCode) {
      this.$refs.operate.init(buttonCode, this.$route.meta.busCode);
    },
    handleUpdate(buttonCode, id) {
      this.$refs.operate.init(buttonCode, this.$route.meta.busCode, id);
    },
    handleDelete(buttonCode, id) {
      this.$modal.confirm('是否确认删除表单?').then( () => {
        return formDataDeleteBatch({ ids: id }, this.$route.meta.busCode);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    handleDetail (buttonCode, id) {
      this.$refs.operate.init(buttonCode, this.$route.meta.busCode, id);
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode === 'update') {
        this.handleUpdate(buttonCode, idArr[0])
      } else if (buttonCode === 'delete') {
        this.handleDelete(buttonCode, idArr)
      } else if (buttonCode === 'create') {
        this.handleCreate(buttonCode)
      } else if (buttonCode === 'detail') {
        this.handleDetail(buttonCode, idArr[0])
      }
    },
  }
};
</script>

