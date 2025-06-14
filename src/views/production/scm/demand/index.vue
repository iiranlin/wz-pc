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
      <template #status="data">
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
          :button-disable="buttonDisabled"
        >
          <template #status="scope">
            {{ status[scope.value] }}
          </template>
          <!-- 供应需求ID -->
          <template #planNumber="scope">
            <el-button type="text" @click="toGyxq(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 附件 -->
          <template #fileList="scope">
            <fileUpload v-model="scope.data.fileList" :preview="true" />
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
    <confirm ref="confirm" :id="id" @createSuccess="getList" />
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import indexMixin from "@/views/mixins";
import Confirm from "./components/confirm.vue";
import fileUpload from "@/components/upload";
export default {
  // 建设项目
  name: "demand",
  components: { Confirm, fileUpload },
  mixins: [indexMixin],

  data() {
    return {
      status: {
        2: "未确认",
        3: "已确认",
        4: "供货中",
        5: "已验收",
        6: "已完成",
      },
      options: [
        {
          code: "2",
          name: "未确认",
        },
        {
          code: "3",
          name: "已确认",
        },
        {
          code: "4",
          name: "供货中",
        },
        {
          code: "5",
          name: "已验收",
        },
        {
          code: "6",
          name: "已完成",
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
      id: "",
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
      Api.demandList(Object.assign({}, this.listQuery, this.formData))
        .then(({ data }) => {
          this.total = data.total;
          this.list = data.list.map((x) => ({
            ...x,
            fileList: x.fileList.length > 0 ? x.fileList[0].fileList : [],
          }));
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
        case "confirm":
          if (rowArr[0].status == "2") {
            this.id = idArr[0];
            this.$refs.confirm.init();
          } else {
            this.$modal.msgError("已确认！");
          }

          break;
        case "send":
          if (rowArr[0].status == "2") {
            this.$modal.msgError("请先确认需求！");
            return;
          }
          if (rowArr[0].status == "5") {
            this.$modal.msgError("已验收！");
            return;
          }
          if (rowArr[0].status == "6") {
            this.$modal.msgError("已完成！");
            return;
          }
          this.$router.push({
            name: "addSend",
            query: {
              id: idArr[0],
              type: "create",
            },
          });
          break;
        case "logistics":
          if (
            rowArr[0].status != "4" &&
            rowArr[0].status != "5" &&
            rowArr[0].status != "6"
          ) {
            this.$modal.msgError("状态为供货中|已验收|已完成才可以操作");
            return;
          }
          this.$router.push({
            name: "logisticsView",
            query: { id: idArr[0], type: "view" },
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
    //物流按钮控制
    buttonDisabled(button, row) {
      if (button.buttonCode == "logistics" && (row.status == "2" || row.status == "3")) {
        return true;
      }
    },
    //跳转需求供应详情
    toGyxq(row) {
      this.$router.push({
        name: "freightDetail",
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
