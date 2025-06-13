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
        >
          <template #status="scope">
            {{ status[scope.value] }}
          </template>
          <!-- 发货单号 -->
          <template #shipmentBatchNumber="scope">
            <el-button type="text" @click="toFhd(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 供应需求ID -->
          <template #planNumber="scope">
            <el-button type="text" @click="toGyxq(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 物流单号 -->
          <template #oddNumbers="scope">
            <el-button type="text" @click="toWuliu(scope.data)">
              {{ scope.value||'其它' }}
            </el-button>
          </template>
            <!-- 附件 -->
          <template #fileList="scope">
            <fileUpload :valve="scope.value" :preview="true" />
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
    <add-adress ref="addAdress" :shipmentBatchNumber="shipmentBatchNumber" />
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import indexMixin from "@/views/mixins";
import AddAdress from "./components/addAdress.vue";
import fileUpload from "@/components/upload";
export default {
  // 建设项目
  name: "sendList",
  components: { AddAdress,fileUpload },
  mixins: [indexMixin],

  data() {
    return {
      status: {
        1: "未发货",
        2: "货运中",
        3: "已完成",
      },
      options: [
        {
          code: "1",
          name: "未发货",
        },
        {
          code: "2",
          name: "货运中",
        },
        {
          code: "3",
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
      shipmentBatchNumber: "",
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
      Api.sendList(Object.assign({}, this.listQuery, this.formData))
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
        case "confirm":
          this.handleSend(idArr, rowArr);
          break;
        case "update":
          if (rowArr[0].status != "1") {
            this.$modal.msgError("已发货，无法修改！");
            return;
          }
          this.$router.push({
            name: "addSend",
            query: { id: idArr[0], type: "update",planId:rowArr[0].planId },
          });
          break;
        case "delete":
          this.handleDelete(idArr, rowArr);
          break;
        case "addAdress":
          if (!rowArr[0].oddNumbers && rowArr[0].status == "2") {
            this.shipmentBatchNumber = rowArr[0].shipmentBatchNumber;
            this.$nextTick(() => {
              this.$refs.addAdress.init();
            });
          } else {
            this.$modal.msgError("没有物流单号且状态为货运中的才能添加货运位置");
          }
          break;
      }
    },
    handleDelete(ids, rowArr) {
      for (var i in rowArr) {
        if (rowArr[i].status != "1") {
          this.$modal.msgError("已发货，无法删除！");
          return;
        }
      }
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
    //确认发货
    handleSend(ids, rowArr) {
      for (var i in rowArr) {
        if (rowArr[i].status != "1") {
          this.$modal.msgError("已发货！");
          return;
        }
      }
      this.$modal
        .confirm("是否确认发货?")
        .then(function () {
          return Api.modify({ id: ids[0], status: "2" });
        })
        .then(() => {
          this.getList();
        });
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
    // 物流
    toWuliu(row) {
      this.$router.push({
        name: "logisticsView",
        query: { id: row.id, type: "view" },
      });
    },
    //发货单
    toFhd(row) {
      this.$router.push({
        name: "addSend",
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
