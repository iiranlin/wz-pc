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
      :searchArr="property.search || []"
      @handleQuery="handleQuery"
      :formData="formData"
    />
    <el-row type="flex" class="container_h">
      <!--用户数据-->
      <el-col :span="20" :xs="24" class="container_flex">
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
          :property="property"
          :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange"
          @selectChange="selectChange"
          @emitAblFilter="emitAblFilter"
          @handleButton="handleButton"
        >
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
  </div>
</template>

<script>

import * as Api from '@/api/prodmgr-inv/project/wzgl.js'
import indexMixin from "@/views/mixins";
export default {
  // 线路项目
  name: "wzxqList",
  components: {  },
  mixins: [indexMixin],

  data () {
    return {
      treeCurrentKey: "",
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
      // 表格序号是否展示
      numberShow: true,
      // 表格数据
      list: [],
      // 弹出层标题
      title: "",

      //列表显示字段
      property: {},
      defaultProps: {
        children: "children",
        label: "deptName",
      },
      // 查询参数
      formData: {
        parentId: null,
      },
      formDataClick: {},
      total: 0,
      selection: [],
      hasOwn: true,

    };
  },
  async created () {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
    });


  },

  methods: {

    numberChange (val) {
      this.numberShow = val;
    },
    newButton (buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange (columns) {
      this.$refs.tableIndex.init(columns);
    },
    //选择框回调
    selectChange (row) {
      let { formData, isWatch } = row;
      if (!isWatch) {
        this.handleQuery(formData);
      } else {
        this.formData = Object.assign({}, this.formData, formData);
      }
    },


    emitAblFilter (listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    handleQuery (row = {}, type = '') {
      if (type === 'queryForm') {
        this.treeCurrentKey = '';
        this.formData.parentId = '';
        this.$refs.tree.setCurrentKey(null);
      }
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    /** 查询菜单列表 */
    getList () {
      this.loading = true
      Api.itemList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleSelectionChange (ids, single, multiple, selection) {
      this.ids = ids;
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    handleButton (buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case "create":
          this.$router.push({ name: 'addContract', query: { type: 'create' } })
          break;
        case "update":
          this.$router.push({ name: 'addContract', query: { id: idArr[0], type: 'update', projectId: rowArr[0].projectId } })
          break;
        case "delete":
          this.handleDelete(idArr)
          break;
        case 'logisticsView':
          this.$router.push({ name: 'logisticsView', query: { id: idArr[0], type: 'view' } })
          break;

      }
    },
    handleDelete (ids) {
      this.$modal.confirm("是否确认删除?").then(function () {
        return Api.batchRemove({ ids });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      })
    },

    clickReset () {
      this.handleQuery();
    },
    cleanClick (data) {
      for (const key of data) {
        if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
          this.$refs.formData.resetQueryDateRange(key);
        }
        this.formData[key] = null;
      }
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