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
      <!-- 建设物资 -->
      <template #projectName="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择建设项目'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.value" />
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
      <!-- 明细 -->
      <template #businessNumber="scoped">
        <el-button type="text" @click="
              () => {
                  $refs.DetailDialogRef.init(scoped.data);
              }
            ">
          {{scoped.data.businessNumber}}
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
    <DetailDialog ref="DetailDialogRef"/>
    <!--流程查看-->
    <workFlowView
      :bill-data="selectedRow"
      :work-flow-view-visible.sync="workFlowViewVisible"
    />
  </div>
</template>
<script>
  import indexMixin from "@/views/mixins";
  import * as FileApi from "@/api/prodmgr-inv/project/file.js";
  import * as PurchasePlanApi from "@/api/prodmgr-inv/project/annualProcurementPlan.js";
  import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
  import DetailDialog from './components/detail';
  import workFlowView from '@/components/workFlowView'

  export default {
    name: "annualProcurementPlan",
    mixins: [indexMixin],
    components: { DetailDialog , workFlowView},
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
        selection: [],
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
        globalSearchParams:null,
        workFlowViewVisible: false,
        selectedRow:null
      }
    },
    created() {
      this.$store.dispatch("menuProperty", this.metaId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30;
        this.property = data;
      });
      this.getLineOptions()
    },
    methods:{
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
      /** 计划量调整列表 */
      getList() {
        this.loading = true;
        // 处理日期范围，转换为 startDate 和 endDate
        const params = { ...this.listQuery, ...this.formData };
        this.globalSearchParams = params;
        PurchasePlanApi.planQtyList(params).then(({ data }) => {
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

      buttonDisable(btn) {
        /**
         * 状态 1-未提交 2-已提交 3-已通过 0-已驳回
         * 未提交可操作: 删除
         * 已提交可操作: 撤回，流程查看
         * 已驳回可操作: 删除，流程查看
         * 审核通过可操作：流程查看
         */
        // 如果没有选中行，禁用所有按钮
        if (!this.selection || this.selection.length === 0) {
          return true;
        }

        const status = this.selection[0].status;
         // 提交按钮在未提交,已撤回状态下可用
        if (btn.buttonCode === 'submit') {
          return ![1, 0].includes(status);
        }
        
        // 撤回按钮在已提交状态下可用
        if (btn.buttonCode === 'revoke') {
          return status !== 2;
        }

        // 删除按钮在未提交、已驳回状态下可用
        if (btn.buttonCode === 'delete') {
          return ![1, 0].includes(status);
        }
        // 默认禁用
        return true;
      },

       // 列表按钮控制
      handleTableButtonDisable (item, row) {
        // 已提交 已通过、已驳回允许查看流程
        if (item.buttonCode === 'flowSee') {
          return ![2, 3, 0].includes(row.status)
        }
        return false
      },
      handleButton(buttonCode, idArr, rowArr, { buttonData }) {
        switch (buttonCode) {
          case "submit":
            this.handleExamine(idArr)
            break;
          case "revoke":
            this.handleRevoke(idArr)
            break;
          case "delete":
            this.handleDelete(idArr)
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
        return PurchasePlanApi.PlanQtySubmit({ ids });
      }).then(() => {
        this.$modal.msgSuccess("提交审核成功");
        this.getList();
      })
    },
    // 撤回
    handleRevoke (ids) {
      this.$modal.confirm("是否确认撤回?").then(function () {
        return PurchasePlanApi.planQtyRecall({ ids });
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
              return PurchasePlanApi.planQtyBatchRemove({ ids });
          })
          .then(() => {
              if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                  this.listQuery.pageNum -= 1
              }
              this.getList();
              this.$modal.msgSuccess("删除成功");
          })
          .catch(() => { });
      },
      async handleDonwload(id) {
        try {
          this.loading = true;
          await FileApi.customDownload({ businessType:109,businessData:  JSON.stringify(this.globalSearchParams) });
        } catch (error) {
          this.$modal.msgError("下载失败，请重试");
        } finally {
          this.loading = false;
        }
      },
    }
  }
</script>
