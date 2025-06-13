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
    >
    </form-data>
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
          :row-class-name="tableRowClassName"
        >
          <!-- 出库单号 -->
          <template #outNumber="scope">
            <el-button type="text" @click="toOm(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 需求ID -->
          <template #supplyNumber="scope">
            <el-button type="text" @click="toGyxq(scope.data)">
              {{ scope.value }}
            </el-button>
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
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/wms.js";
import indexMixin from "@/views/mixins";
export default {
  // 建设项目
  name: "omList",
  components: {},
  mixins: [indexMixin],

  data() {
    return {
      storeStatus: {
        1: "未入库",
        2: "部分退货",
        3: "已入库",
      },
      options: [
        {
          code: "1",
          name: "未入库",
        },
        {
          code: "2",
          name: "部分退货",
        },
        {
          code: "3",
          name: "已入库",
        },
      ],
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
  async created() {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
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
    //选择框回调
    selectChange(row) {
      let { formData, isWatch } = row;
      if (!isWatch) {
        this.handleQuery(formData);
      } else {
        this.formData = Object.assign({}, this.formData, formData);
      }
    },

    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    handleQuery(row = {}, type = "") {
      if (type === "queryForm") {
        this.treeCurrentKey = "";
        this.formData.parentId = "";
        this.$refs.tree.setCurrentKey(null);
      }
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      Api.listOut(Object.assign({}, this.listQuery, this.formData))
        .then(({ data }) => {
          this.list = data.list;
          this.total = data.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = ids;
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData);
      switch (buttonCode) {
        case "ruku":
          if (rowArr[0].storeStatus != "1") {
            this.$modal.msgError("未入库状态才能入库");
            return;
          }
          this.$router.push({
            name: "imPage",
            query: { id: idArr[0], type: "create" },
          });
          break;
      }
    },

    clickReset() {
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
    //入库单号
    toIm(row) {
      this.$router.push({
        name: "imPage",
        query: { id: row.id, type: "view" },
      });
    },
    //收货单
    toReceive(row) {
      this.$router.push({
        name: "receivePage",
        query: { id: row.id, type: "view" },
      });
    },
    //收货超过20天未入库显示红色
    tableRowClassName({ row, rowIndex }) {
      var time = 20 * 24 * 60 * 60 * 1000;
      var dateTime = new Date(row.takeDate).getTime();
      const timestamp = new Date().getTime();
      if (Number(timestamp) - Number(dateTime) > time && row.storeStatus == "1") {
        return "highlight-row-red";
      }
      return "";
    },
    //跳转需求供应详情
    toGyxq(row) {
      this.$router.push({
        name: "requestSupplyDetail",
        query: {
          type: "view",
          id: row.id,
        },
      });
    },
    // 出库单号
    toOm(row) {
      this.$router.push({
        name: "omDetail",
        query: { id: row.id, type: "view" },
      });
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
<style>
.highlight-row-red {
  color: red;
}
</style>
