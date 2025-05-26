<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery" :formData="formData"/>
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset"
                    @numberChange="numberChange" @cleanClick="cleanClick"></right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableData="roleList" :property="property" :numberShow="numberShow"
                 @handleSelectionChange="handleSelectionChange"
                 @handleButton="handleButton"
                 @selectChange="selectChange"
                 @emitAblFilter="emitAblFilter"/>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
    <operate ref="operate" @operateSuccess="operateSuccess"/>
  </div>
</template>

<script>
import {rolePage, roleDeleteBatch} from '@/api/system/role';
import operate from "./components/operate";
import indexMixin from '@/views/mixins';

export default {
  name: "role",
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
      formDataClick: {},
      property: {},
    };
  },
  created() {
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
    /**给角色分配用户*/
    handleAssignUser(row) {
      this.$router.push({path: '/authUser', query: {roleId: row.id}})
    },
    /** 搜索按钮操作 */
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row)
      this.formDataClick = Object.assign({}, this.formData, row)
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
    /** 查询角色列表 */
    getList() {
      this.loading = true;
    //   if (this.listQuery.orderByColumn === '') {
    //     this.listQuery.orderByColumn = 'updateTime'
    //     this.listQuery.isAsc = "desc"
    //   }
      rolePage(Object.assign({}, this.listQuery, this.formData)).then(({data}) => {
        this.roleList = data.list;
        this.total = data.total;
        this.loading = false;
      })

    },
    handleCreate() {
      this.$refs.operate.init('create');
    },
    handleUpdate(ids) {
      this.$refs.operate.init('update', ids);
    },
    handleDelete(ids) {
      this.$modal.confirm('是否确认删除角色?').then(function () {
        return roleDeleteBatch({ids});
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    //选择框回调
    selectChange(row) {
      let {formData, isWatch} = row;
      if(!isWatch){
        this.handleQuery(formData);
      }else{
        this.formData = Object.assign({}, this.formData, formData);
      }
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode === 'update') {
        this.handleUpdate(idArr[0])
      } else if (buttonCode === 'delete') {
        this.handleDelete(idArr)
      } else if (buttonCode === 'create') {
        this.handleCreate()
      } else if (buttonCode === 'assignUser') {
        this.handleAssignUser(rowArr[0])
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
  }
};
</script>
