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
      :formData="formData"
      :searchArr="property.search || []"
      @handleQuery="handleQuery"
      @handleResetField="handleResetField"
      label-width="120px"
    >
      <!-- 关联状态 -->
      <template #relFlag="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择关联状态'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in relateStatusArr" :key="key" :label="item.label" :value="item.value" />
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
      @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton"
      @emitAblFilter="emitAblFilter"
      @selectChange="selectChange"
    >

      <template #relFlag="scoped">
        {{scoped.data.relFlag == 0?'未关联':scoped.data.relFlag == 1?'已关联':scoped.data.relFlag == 2?'部分关联':''}}
      </template>
    </table-index>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getPurchaseContractList"
    />
  </div>
</template>
<script>
  import indexMixin from "@/views/mixins";
  import * as PurchasePlanApi from "@/api/prodmgr-inv/project/annualProcurementPlan.js";
  export default {
    name: "relevantPurchaseContract",
    mixins: [indexMixin],
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
        formData: {},
        formDataClick: {},
        relateStatusArr:[
          {label:'未关联',value:0},
          {label:'已关联',value:1},
          {label:'部分关联',value:2},
        ],
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
        selectedRow:null
      }
    },
    computed: {
      id() {
        return this.$route.query?.id || "";
      }
    },
    created() {
      this.$store.dispatch("menuProperty", this.metaId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30;
        this.property = data;
      });
    },
    methods:{
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
        this.getPurchaseContractList();
      },
      /** 采购合同列表 */
      getPurchaseContractList() {
        this.loading = true;
        const params = { ...this.listQuery, ...this.formData, id:this.id };
        PurchasePlanApi.zgContractListAndRelFlag(params).then(({ data }) => {
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
      handleButton(buttonCode, idArr, rowArr, { buttonData }) {
        switch (buttonCode) {
          case "relatedBuyContract":
            this.$router.push({ name: 'relevantItems', query: { contractId: idArr[0],purseId:this.id } })
            break;
        }
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
              this.getPurchaseContractList();
              this.$modal.msgSuccess("删除成功");
          })
          .catch(() => { });
      },
    }
  }
</script>
