<template>
  <div class="app-container container_flex">
    <table-index ref="tableIndex" :selectShow="false" :loading="loading" idName="taskId" :tableIndexs="tableIndex"
      :tableData="list" :property="property" :numberShow="numberShow" @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink"
      :button-disable="buttonDisabled" />
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <operate ref="operate" :property="property" @menuSuccess="menuSuccess" />
    <review ref="toBereview"></review>
    <div>
      <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    </div>
  </div>
</template>

<script>
import { auditList } from "@/api/system/workflow.js";
import operate from "./components/operate";
import review from "./components/toBeReviewed";
import indexMixin from "@/views/mixins";
import workFlowView from "@/components/workFlowView";
import { FLOW_ROUTE } from "@/utils/constant";
import { withoutRollbackButton } from "@/utils/workflow-review";
import { findMenuByUrl } from "@/utils/index";
import { getUserMenu } from '@/api/system/menu'

export default {
  name: "audit",
  dicts: ["flowBusinessType"],
  mixins: [indexMixin],
  components: { operate, review, workFlowView },
  data() {
    return {
      formDataClick: {},
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
      // 日期范围
      dateRange: [],
      // 表格序号是否展示
      numberShow: false,
      // 页面属性
      property: { fields: [{ isAdd: 1, isEdit: 1 }] },
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 30,
      },
      formData: {
        status: "2",
      },
      visible: false,
      metaId: this.$route.meta.id,
      selected: [],
      workFlowViewVisible: false,
      selectedRow: null,
    };
  },
  mounted() {
    getUserMenu().then(menu => {

      console.log(menu.data, 'sidebarMenu');
      const menuId = findMenuByUrl(menu.data, 'audit')?.id;
      this.$store.dispatch("menuProperty", menuId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30;
        this.property = withoutRollbackButton(data);
      });
    })
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
    clickReset() {
      this.handleQuery();
    },
    clearSearch() {
      this.getList();
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    emitAblFilter(listQuery) {
      // this.dateRange = [];
      // this.getList();
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    menuSuccess() {
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple, selected) {
      this.single = single;
      this.multiple = multiple;
      this.selected = selected;
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      this.$emit("loading-change", true);
      auditList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
        this.$emit("loading-change", false);
      });
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData);
      switch (buttonCode) {
        case "create":
          this.$refs.operate.init("create", this.formData.parentId);
          break;
        case "update":
          this.$refs.operate.init("update", idArr[0]);
          break;
        case "delete":
          break;
        case "submit":
          this.submitHandle();
          break;
        case "flowSee":
          this.workFlowViewVisible = true;
          this.selectedRow = rowArr[0];
          break;
        case "pass":
          this.$refs.toBereview.init("pass", rowArr);
          break;
        case "reject":
          this.$refs.toBereview.init("reject", rowArr);
          break;
        case "passEdit":
          // 修改后同意直接跳转详情
          this.$refs.toBereview.init("passEdit", rowArr);
          break;
        default:
          break;
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
    submitHandle() {
      this.$modal
        .confirm("确定提交所选的缺陷记录?")
        .then(() => {
          this.$ajax
            .post("submitDefectRecord", { ids: this.ids })
            .then((res) => {
              let status = res.success ? "success" : "error";
              this.$message[status](res.message);
              if (res.success) {
                this.getList();
              }
            })
            .catch(() => { });
        })
        .catch(() => { });
    },
    clickLink(row) {
      const name = FLOW_ROUTE[row.businessType];
      const auditArr = [
        {
          businessId: row.businessId,
          businessType: row.businessType,
          businessCode: row.businessCode,
          taskId: row.taskId,
          procInstId: row.procInstId,
          urgentFlag: row.urgentFlag,
          prevIsStartNodeFlag: row.prevIsStartNodeFlag,
        },
      ];
      this.$router.push({
        name,
        query: {
          type: "view",
          name: "audit",
          id: row.businessId,
          auditArr: JSON.stringify(auditArr),
        },
      });
    },
    //入库审核不能操作修改后同意
    buttonDisabled(button, row) {
      if (button.buttonCode == "passEdit" && ['RKLC', 'WZML', 'SHLC', 'CGWJ', 'CGHT', 'FHLC','WZCJ','ZGCGJH','ZGCGJHXG'].includes(row.businessType)) {
        return true;
      }
    },
  },
};
</script>
