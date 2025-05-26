<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"></button-top>
    <form-data :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery" />
    <right-toolbar ref="rightToolbar" :formData="formData" :searchArr="property.search || []" :showSearch.sync="showSearch"
      :columns="property.fields" @queryTable="handleQuery" @handleCheckAllChange="handleCheckAllChange"
      @clickReset="clickReset" @numberChange="numberChange"></right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list" :property="property"
      :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
      @selectChange="selectChange" @emitAblFilter="emitAblFilter" />
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <operate ref="operate" :property="property" @success="success" />
  </div>
</template>
  
<script>
import { list,detail,remove } from '@/api/form/form-joining';
import operate from "./components/operate";
import indexMixin from '@/views/mixins';
export default {
  name: "joining",
  mixins: [indexMixin],
  components: { operate },
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
      // 日期范围status
      dateRange: [],
      // 表格序号是否展示
      numberShow: false,
      // 页面属性
      property: { fields: [{ isAdd: 1, isEdit: 1 }] },
      total: 0,
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageSize: 30,
      },
      // 表单参数
      formData: {
        menuName: '',
      },
      visible: false,
    };
  },
  created() {
    let id = this.$route.meta.id;
    this.$store.dispatch('menuProperty', id).then((data) => {
      this.listQuery.pageSize = data.defaultPageSize || 30
      this.property = data;
    });
    this.getList();
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
      this.handleQuery();
    },
    clearSearch() {
      this.formData.menuName = '';
      this.getList();
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row)
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    emitAblFilter() {
      this.dateRange = [];
      this.getList();
    },
    success() {
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple) {
      this.single = single
      this.multiple = multiple
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      list(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
        this.loading = false;
      })
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode == 'update') {
        this.$refs.operate.init('update', idArr[0]);
      } else if (buttonCode === 'delete') {
        this.$modal.confirm('是否确认删除?').then(() => {
          return remove({ ids: idArr });
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => { });
      } else if (buttonCode === 'create') {
        this.$refs.operate.init('create', this.formData.parentId);
      } else if (buttonCode === 'preview') {
        detail(idArr[0]).then(({ data }) => {
        this.$refs.operate.previewForm(data.childForm);
      });
        
      }
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
};
</script>