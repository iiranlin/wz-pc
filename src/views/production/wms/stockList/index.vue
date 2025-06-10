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
      <template #takeStatus="data">
        <el-select
          class="select-box"
          v-model="formData[data.data.fieldCode]"
          :placeholder="
            ($t(`please_select`) || '请选择') +
            i18nData(data.data, 'field', 'fieldCode', 'fieldName')
          "
          clearable
          style="width: 100%"
          size="small"
        >
          <el-option
            v-for="(item, key) in options"
            :key="key"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
      </template>
      <template #takeStatus="data">
        <el-select
          class="select-box"
          v-model="formData[data.data.fieldCode]"
          :placeholder="
            ($t(`please_select`) || '请选择') +
            i18nData(data.data, 'field', 'fieldCode', 'fieldName')
          "
          clearable
          style="width: 100%"
          size="small"
        >
          <el-option
            v-for="(item, key) in kucunOptions"
            :key="key"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
      </template>
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
        >
          <template #takeStatus="scope">
            {{ status[scope.value] }}
          </template>
          <template #takeStatus="scope">
            {{ status[scope.value] }}
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
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import indexMixin from "@/views/mixins";
export default {
  // 线路项目
  name: "stockList",
  components: {},
  mixins: [indexMixin],

  data() {
    return {
      status: {
        1: "未完成",
        2: "已完成",
      },
      kucunStatus: {
        1: "无",
        2: "有",
      },
      options: [
        {
          code: "1",
          name: "为完成",
        },
        {
          code: "2",
          name: "已完成",
        },
      ],
      kucunOptions: [
        {
          code: "1",
          name: "无",
        },
        {
          code: "2",
          name: "有",
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
      Api.listStock(Object.assign({ status: 2 }, this.listQuery, this.formData))
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
        case "om":
          this.$router.push({
            name: "omPage",
            query: {
              type: "create",
              id: idArr[0],
            },
          });
          break;
        case "stockDetail":
          this.$router.push({
            name: "stockDetail",
            query: {
              type: "view",
              id: idArr[0],
            },
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
    //跳转需求详情
    toGyxq(row) {
      this.$router.push({
        name: "requestSupplyDetail",
        query: {
          type: "view",
          id: row.id,
        },
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
