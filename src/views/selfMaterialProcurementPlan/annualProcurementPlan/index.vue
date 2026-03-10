<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="property.buttonTop"
      :multiple="multiple"
      :single="single"
      @newButton="newButton"
      :buttonDisable="buttonDisable"
    ></button-top>
    <form-data
      ref="formData"
      :showSearch="showSearch"
      :formData="formData"
      :searchArr="property.search || []"
      @handleQuery="handleQuery"
      @handleResetField="handleResetField"
      label-width="120px"
    >
      <!-- year 计划年度搜索,年选择器，并且保存后端为字符串 -->
      <template #planYear="data">
        <el-date-picker v-model="formData[data.data.fieldCode]" type="year" placeholder="选择年份" size="small" value-format="yyyy" style="width: 100%" />
      </template>
      <!-- 建设物资 -->
      <template #projectName="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择建设项目'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.label" />
        </el-select>
      </template>
    </form-data>

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
      :customnDisabled="true"
      @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton"
      @emitAblFilter="emitAblFilter"
      @selectChange="selectChange"
      :buttonDisable="handleTableButtonDisable"
    >

      <template #status="scoped">
        {{scoped.data.status == 1?'未提交':scoped.data.status == 2?'已提交':scoped.data.status == 3?'已通过':scoped.data.status == 4?'修改同意后':scoped.data.status == 5?'已撤回':scoped.data.status == 0?'已驳回':''}}
      </template>
      <!-- 单据明细 -->
      <template #planNumber="scoped">
        <el-button type="text" @click="getDtail(scoped.data.id)">
          {{scoped.data.planNumber}}
        </el-button>
      </template>
      <!-- 已采购数量详情 -->
      <template #totalOrderedQty="scoped">
        <el-button type="text" @click="
              () => {
                  $refs.detailDialogRef.open(scoped.data.id);
              }
            ">
          {{scoped.data.totalOrderedQty}}
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

    <!--展开弹窗-->
    <DetailDialog ref="detailDialogRef" />
    <PlanQAdjustmentDialog ref="planQAdjustmentDialogRef" @createSuccess="createSuccess"/>
    <RelevantContractlDialog ref="relevantContractlDialogRef" @save-success="handleMasterMaterialSaveSuccess" />
    <!--流程查看-->
    <workFlowView
      :bill-data="selectedRow"
      :work-flow-view-visible.sync="workFlowViewVisible"
    />
  </div>
</template>
<script>
  import indexMixin from "@/views/mixins";
  import dayjs from "dayjs";
  import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
  import * as PurchasePlanApi from "@/api/prodmgr-inv/project/annualProcurementPlan.js";
  import DetailDialog from './components/detailDialog'
  import PlanQAdjustmentDialog from './components/planQAdjustment'
  import workFlowView from '@/components/workFlowView'
  import RelevantContractlDialog from './components/relevantContractlDialog.vue';
  export default {
    name: "annualProcurementPlan",
    mixins: [indexMixin],
    components: { DetailDialog,PlanQAdjustmentDialog, workFlowView, RelevantContractlDialog },
    data() {
      return {
        // 页面属性
        property: { fields: [{ isAdd: 1, isEdit: 1 }] },
        metaId: this.$route.meta.id,
        total: 0,
        loading:false,
        listQuery: {
          pageNum: 1,
          pageSize: 30,
        },
        formData: {
          planYear: '', // 日期
        },
        formDataClick: {},
        lineOptions:[],
        // 表格数据
        list: [],
        // 日期范围
        dateRange: [],
        // 表格序号是否展示
        numberShow: true,
        // 显示搜索条件
        showSearch: true,
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        ids: [],
        selection: [],
        globalSearchParams:null,
        selectedRow:null,
        workFlowViewVisible:false
      }
    },
    created() {
      // 初始化默认
      this.initDefaultYear();

      this.$store.dispatch("menuProperty", this.metaId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30;
        this.property = data;
      });
      this.getLineOptions()
    },

    methods:{
      // 初始化默认当前年
      initDefaultYear() {
        const currentYear = dayjs().year()
        this.formData.planYear = currentYear.toString()
      },
      getLineOptions(){
        WzglApi.lineSelectOptions({pageStatus: '0'}).then(({ data }) => {
          this.lineOptions = data.map(x => ({
            label: x.projectName,
            value: x.projectName
          }))
        })
      },
      newButton(buttonCode, formId, buttonData) {
        this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData);
      },
      // 重置表单时恢复默认日期
      handleResetField() {
        this.formData.planYear = ''
        this.initDefaultYear();
        this.handleQuery();
      },
      emitAblFilter(listQuery) {
        this.listQuery = Object.assign({}, this.listQuery, listQuery);
        this.handleQuery();
      },
      selectChange(row) {
        let { formData, isWatch } = row;
        if (!isWatch) {
          this.handleQuery(formData);
        } else {
          this.formData = Object.assign({}, this.formData, formData);
        }
      },
      handleQuery(row = {}) {
        this.listQuery.pageNum = 1;
        this.formData = Object.assign({}, this.formData, row);
        this.formDataClick = Object.assign({}, this.formData, row);
        this.getList();
      },
      /** 查询菜单列表 */
      getList() {
        this.loading = true;

        // 处理日期范围，转换为 startDate 和 endDate
        const params = { ...this.listQuery, ...this.formData };

        this.globalSearchParams = params;

        PurchasePlanApi.purchasePlanList(params).then(({ data }) => {
          this.list = data.records;
          this.total = data.total;
          this.loading = false;
        });
      },
      handleCheckAllChange(columns) {
        this.$refs.tableIndex.init(columns);
      },
      clickReset() {
        this.handleQuery();
      },
      numberChange(val) {
        this.numberShow = val;
      },
      cleanClick(data) {
        for (const key of data) {
          if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
            this.$refs.formData.resetQueryDateRange(key);
          }
          this.formData[key] = null;
        }
        this.handleQuery();
      },
      handleSelectionChange(ids, single, multiple, selected) {
        this.ids = ids;
        this.single = single;
        this.multiple = multiple;
        this.selection = selected;
      },

      createSuccess(){
        this.handleQuery();
      },

      /**
       * 处理主合同物资保存成功事件
       */
      handleMasterMaterialSaveSuccess(savedData) {
        // 更新当前行的 masterDetailId
        if (savedData && savedData.id && savedData.masterDetailId) {
          const rowIndex = this.list.findIndex(item => item.id === savedData.id);
          if (rowIndex !== -1) {
            // 更新 masterDetailId，这样该行就不再可点击
            this.$set(this.list[rowIndex], 'masterDetailId', savedData.masterDetailId);
          }
        }

        // 触发父组件刷新数据（可选，如果父组件需要知道数据变化）
        this.$emit('refresh-data');
        this.$message.success('关联成功，已更新状态');
      },

      /**
       * 获取计划详情
       */
      getDtail(id) {
        this.$router.push({ name: 'addAnnualProcurementPlan', query: { id: id, type: 'view' } })
      },
      // 顶部按钮控制
      buttonDisable(btn) {
        /**
         * 状态 1-未提交 2-已提交 0-已驳回 3-已通过
         * 未提交可操作: 新增计划，提交审核，修改，删除，关联物资
         * 已提交可操作: 新增计划，撤回，关联物资，流程查看
         * 已驳回可操作: 新增计划，提交审核，修改，删除，关联物资，流程查看
         * 已通过可操作：新增计划，计划量调整，关联物资，流程查看
         */
         // 新增计划按钮均可点
        if (btn.buttonCode === 'create') {
          return false;
        }
        // 如果没有选中行，禁用所有按钮
        if (!this.selection || this.selection.length === 0) {
          return true;
        }

        const status = this.selection[0].status;

        // 提交审核按钮在未提交、已驳回状态下可用
        if (btn.buttonCode === 'submit') {
          return ![1, 0].includes(status);
        }

        // 撤回按钮在已提交状态下可用
        if (btn.buttonCode === 'revoke') {
          return status !== 2;
        }

        // 修改按钮在未提交、已驳回状态下可用
        if (btn.buttonCode === 'update') {
          return ![1, 0].includes(status);
        }

        // 计划量调整按钮在已通过状态下可用
        if (btn.buttonCode === 'planAdjustment') {
          return status !== 3;
        }

        // 删除按钮在未提交、已驳回状态下可用
        if (btn.buttonCode === 'delete') {
          return ![1, 0].includes(status);
        }

        // 默认允许
        return false;
      },
      // 列表按钮控制
      handleTableButtonDisable (item, row) {
        // 已提交、已生效、修改后同意、已驳回、允许查看流程
        if (item.buttonCode === 'flowSee') {
          return ![2, 3, 0].includes(row.status)
        }
        return false
      },
      // 按钮事件逻辑操作
      handleButton(buttonCode, idArr, rowArr, { buttonData }) {
        this.proxyPrint(buttonCode, rowArr, buttonData);
        console.log('rowArr 哈哈哈哈');
        console.log(idArr);
        switch (buttonCode) {
          case "create":
            this.$router.push({ name: 'addAnnualProcurementPlan', query: { type: 'create' } })
            break;
          case "submit":
            this.handleExamine(idArr)
            break;
          case "revoke":
            this.handleRevoke(idArr)
            break;
          case "update":
            this.$router.push({ name: 'addAnnualProcurementPlan', query: { id: idArr[0], type: 'update' } })
            break;

          case "planAdjustment":
            this.$refs["planQAdjustmentDialogRef"].init( rowArr[0]);
            break;
          case "delete":
            this.handleDelete(idArr)
            break;
          case "relatedMaterials":
            // 打开关联物资弹窗
            // this.$refs.relevantContractlDialogRef.open(this.parentId, rowArr[0]);
            this.$router.push({ name: 'relevantPurchaseContract', query: { id: idArr[0]} })
            break;
          case "flowSee":
            this.workFlowViewVisible = true
            this.selectedRow = { businessId: idArr[0] }
            break;
        }
      },
       // 提交审核
    handleExamine (ids) {
      this.$modal.confirm("是否确认提交审核?").then(function () {
        return PurchasePlanApi.submit({ ids });
      }).then(() => {
        this.$modal.msgSuccess("提交审核成功");
        this.getList();
      })
    },
    // 撤回
    handleRevoke (ids) {
      this.$modal.confirm("是否确认撤回?").then(function () {
        return PurchasePlanApi.recall({ ids });
      }).then(() => {
        this.$modal.msgSuccess("撤回成功");
        this.getList();
      })
    },
    // 删除
    handleDelete(ids) {
      this.$modal
          .confirm("是否确认删除该条数据?")
          .then(function () {
              return PurchasePlanApi.batchRemove({ ids });
          })
          .then(() => {
              if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                  this.listQuery.pageNum -= 1
              }
              this.getList();
              this.$modal.msgSuccess("删除成功");
          })
          .catch(() => { });
      }
    }
  }
</script>
