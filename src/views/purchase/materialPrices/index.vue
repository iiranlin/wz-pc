<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :buttonDisable="handleButtonDisabled"></button-top>
    <form-data ref="formData" label-width="150px" :showSearch="showSearch" :searchArr="property.search || []"
      @handleQuery="handleQuery" :formData="formData">
      <!-- 对比市场价 -->
      <template #rate>
        <el-select v-model="formData.rate" filterable clearable placeholder="请选择" style="width: 100%">
          <el-option v-for="item in Object.keys(rate).map((x) => ({
            label: rate[x],
            value: x,
          }))" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </template>
      <!-- 日期范围搜索 -->
      <template #date>
        <el-date-picker v-model="formData.dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" />
      </template>
    </form-data>
    <el-row type="flex" class="container_h">
      <!--用户数据-->
      <el-col :span="20" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
          @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
          @selectChange="selectChange" @emitAblFilter="emitAblFilter" @handleButton="handleButton"
          :buttonDisable="handleTableButtonDisable" :row-class-name="tableRowClassName">
          <template #rate="scope">
            {{ scope.value }}%
          </template>



          <template #date="scope">
            <span>
              {{ scope.data.startTime | formatDate }} ~ {{ scope.data.endTime | formatDate }}
            </span>
          </template>

          <!-- 近一年采购合同 -->
          <template #recentYearCount="scope">
            <el-button type="text" @click="
              () => {
                if (scope.value) {
                  $refs.sectionDialogRef.open(
                    // 合同编号:合同名称；  string 类型，分号隔开
                    scope.data.recentYearContractName.split(';').map(x => ({
                      number: x.split(':')[0],
                      name: x.split(':')[1],
                      sectionName: x.split(':')[2],
                      buyer: x.split(':')[3]
                    }))
                  );
                }
              }
            ">
              {{ scope.value }}
            </el-button>
          </template>


        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    <Add ref="addRef" @createSuccess="onDialogOk" />
    <SectionDialog ref="sectionDialogRef" />
  </div>
</template>

<script>
import * as Api from '@/api/purchase/selfContractList.js'
import indexMixin from "@/views/mixins";
import workFlowView from "@/components/workFlowView";
import Add from "./components/add.vue";
import * as FileApi from '@/api/prodmgr-inv/project/file.js'
import SectionDialog from "./components/sectionDialog.vue";
export default {
  // 甲供物资审核
  name: "materialPrices",
  components: { workFlowView, Add, SectionDialog },
  mixins: [indexMixin],
  computed: {
    id() {
      return this.$route.query?.id || ''
    }
  },

  data() {
    // 状态
    const rate = {
      '2': "低于10%",
      '1': "低于20%",
      '3': "高于10%",
      '4': "高于20%",
    };
    return {
      rate,
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
        rate: '1',
      },
      formDataClick: {},
      total: 0,
      selection: [],
      hasOwn: true,
      workFlowViewVisible: false,
      selectedRow: null,
    };
  },
  filters: {
    formatArr(value) {
      if (!value || !Array.isArray(value)) return 0;
      return value.length;
    },
  },
  activated() {
    this.getList();
  },
  async created() {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      if (data.fields) {
        const item = data.fields.find((x) => x.fieldCode == "recentYearCount");
        if (item) item.fixedColumn = "right";
      }
      this.property = data;
    });
  },

  methods: {
    //对比市场价低于20 就变红色
    tableRowClassName({ row, rowIndex }) {
      if (row.rate < -20) {
        return "highlight-row-red";
      }
    },
    onDialogOk(data) {
      this.getList();
    },
    handleTableButtonDisable(item, row) {
      // 已提交、已生效、修改后同意、已驳回、允许查看流程
      if (item.buttonCode === "flowSee") {
        return !["0", "3", "2", "4"].includes(row.status);
      }
      return false;
    },
    handleButtonDisabled(item) {
      // 仅铁路专用产品可以新增
      if (item.buttonCode === "create") {
        return this.selection[0]?.railwaySpecial != 1;

      }

      return false;
    },
    onGoDetail(row) {
      this.$router.push({
        name: "itemAuditDetail",
        query: {
          type: "view",
          id: row.id,
        },
      });
    },
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
      if (this.formData.dateRange && this.formData.dateRange.length > 0) {
        this.formData.starDate = this.formData.dateRange[0];
        this.formData.endDate = this.formData.dateRange[1];
      }
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      Api.itemPrice(Object.assign({ contractId: this.id }, this.listQuery, this.formData))
        .then(({ data }) => {
          this.list = data.records;
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
        case "create":
          this.$refs["addRef"].updateInit(idArr[0]);
          break;
        case "export":
          this.handleDonwload(idArr[0])
          break;
      }
    },
    async handleDonwload(id) {
      try {
        this.loading = true;
        await FileApi.customDownload({ businessType: 2, businessData: JSON.stringify(this.formData) });
        // this.$modal.msgSuccess("下载验收单成功");
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
    },
    // 提交审核
    handleExamine(ids, planType, rate) {
      this.$modal.confirm("是否确认提交审核?").then(() => {
        this.$reviewerDialog({
          type: "WZML",
          multiple: false,
          needSelectAssignee: false,
          success: async (assignee) => {
            this.loading = true;

            await Api.itemSubmit({ ids, planType, assignee });
            this.$modal.msgSuccess("提交审核成功");
            this.getList();

            this.loading = false;
          },
        });
      });
    },
    // 撤回
    handleRecall(id) {
      this.$modal
        .confirm("是否确认撤回?")
        .then(function () {
          return Api.recall({ id });
        })
        .then(() => {
          this.$modal.msgSuccess("撤回成功");
          this.getList();
        });
    },
    handleDelete(ids) {
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