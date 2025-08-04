<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="property.buttonTop"
      :multiple="multiple"
      :single="single"
      @newButton="newButton"
      :buttonDisable="buttonDisabledTop"
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
          :buttonDisable="buttonDisabledTable"
        >
          <template #takeStatus="scope">
            {{ status[scope.value] }}
          </template>
          <!-- 收货单号 -->
          <template #takeNumber="scope">
            <el-button type="text" @click="toReceive(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 发货单号 -->
          <template #shipmentBatchNumber="scope">
            <el-button type="text" @click="toFhd(scope.data)">
            {{ scope.value }}
            </el-button>
          </template>
          <!-- 物流单号 -->
          <template #oddNumbers="scope">
            <el-button type="text" @click="toWuliu(scope.data)">
              {{ scope.value || "其它" }}
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
         <workFlowView
          :bill-data="selectedRow"
         :work-flow-view-visible.sync="workFlowViewVisible"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/receive.js";
import * as wmsApi from "@/api/prodmgr-inv/project/wms.js";
import indexMixin from "@/views/mixins";
import fileUpload from "@/components/upload";
import workFlowView from "@/components/workFlowView";
export default {
  // 建设项目
  name: "receive",
  components: { fileUpload ,workFlowView},
  mixins: [indexMixin],

  data() {
    return {
      status: {
        1: "未收货",
        2: "已收货",
        3: "部分退货",
        4: "已退货",
        5: "审核中",
      },
      options: [
        {
          code: "1",
          name: "未收货",
        },
        {
          code: "2",
          name: "已收货",
        },
        {
          code: "3",
          name: "部分退货",
        },
        {
          code: "4",
          name: "已退货",
        },
        {
          code: "5",
          name: "审核中",
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
      workFlowViewVisible: false,
      selectedRow: null,
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
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      Api.listTake(Object.assign({}, this.listQuery, this.formData))
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
        case "receive":
          if (rowArr[0].takeStatus != "1") {
            this.$modal.msgError("未收货状态才能收货");
            return;
          }
          this.$router.push({
            name: "receivePage",
            query: { id: idArr[0], supplyId: rowArr[0].supplyId, type: "create",takeStatus:rowArr[0].takeStatus },
          });
          break;
        case "withdraw":
          this.handleRecall(idArr[0]);
          break;
          //流程查看
        case "flowSee":
          this.workFlowViewVisible = true;
          this.selectedRow = { businessId: rowArr[0].backMiddleId?rowArr[0].backMiddleId:idArr[0]};
          break;
        case "download":
          this.handleDonwload(idArr[0])
          break;
      }
    },
        // 撤回
    handleRecall(id) {
      this.$modal
        .confirm("是否确认撤回?")
        .then(function () {
          return wmsApi.recall({ businessId:id,businessType:'SHLC' });
        })
        .then(() => {
          this.$modal.msgSuccess("撤回成功");
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
    //收货单
    toReceive(row) {
      this.$router.push({
        name: "receivePage",
        query: { id: row.id, type: "view",takeStatus:row.takeStatus },
      });
    },
    //跳转货运详情
    toFhd(row) {
      this.$router.push({
        name: "addSendCy",
        query: { id: row.id, type: "view" },
      });
    },
    //跳转物流
    toWuliu(row) {
      this.$router.push({
        name: "logisticsView_receive",
        query: { id: row.planId, type: "view",batch:row.shipmentBatchNumber },
      });
    },
    //上方按钮控制
    buttonDisabledTop(button) {
      //状态不是未收货，按钮全不能操作
      if(button.buttonCode == "receive"){
        return this.selection[0].takeStatus != 1;
      }
      // 非审核中不允许撤回
      if(button.buttonCode == "withdraw"){
        return this.selection[0].takeStatus != 5; 
      }
      // 未收货不能下载
      if( button.buttonCode == "download"){
        return this.selection[0].takeStatus == 1 || this.selection[0].takeStatus == 5;
      }
      
    },
    buttonDisabledTable(button, row) {
      // 未收货不允许查看流程
      if (button.buttonCode == "flowSee"  ) {
        return row.takeStatus == "1"
      }
      
    },
   async handleDonwload(id) {
    await Api.exportDetailList({id})
    this.$modal.msgSuccess("下载验收单成功");
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
