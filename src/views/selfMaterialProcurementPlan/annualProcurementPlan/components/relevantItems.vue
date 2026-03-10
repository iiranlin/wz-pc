<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="buttonTop"
      @newButton="handleButtonClick"
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
    >

      <template #relateStatus="scoped">
        {{scoped.data.relateStatus == 0?'未关联':scoped.data.relateStatus == 1?'已关联':scoped.data.relateStatus == 2?'部分关联':''}}
      </template>
    </table-index>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
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
        selectedRow:null,
        // 顶部按钮配置
      buttonTop: [
        { buttonName: "取消", buttonCode: "cancel", buttonIcon: "Blue-Cancel", type: "create, update" },
        { buttonName: "保存", buttonCode: "save", buttonIcon: "Blue-Save", type: "create, update" },
      ],
      }
    },
    created() {
      this.$store.dispatch("menuProperty", this.metaId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30;
        this.property = data;
      });
    },
    computed: {
      contractId() { // 采购合同id
        return this.$route.query?.contractId || "";
      },
      purseId() { // 采购计划id
        return this.$route.query?.purseId || "";
      },
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
        this.getList();
      },
      /** 计划量调整列表 */
      getList() {
        this.loading = true;
        const params = { ...this.listQuery, ...this.formData,contractId:this.contractId };
        this.globalSearchParams = params;
        PurchasePlanApi.materialList(params).then(({ data }) => {
          this.list = data.list;
          this.total = data.total;
          this.loading = false;
        });
      },
      /** 顶部按钮点击 */
      handleButtonClick(buttonCode) {
        const actions = {
          cancel: () => this.$router.go(-1),
          save: () => this.handleSubmit(),
        };
        actions[buttonCode]?.();
      },
      /** 提交 */
    handleSubmit() {
       this.loading = true;
        try {
          if(!this.ids.length){
            this.$modal.msgWarning('请选择物资进行关联！');
            return;
          }
          PurchasePlanApi.saveRelationship({
            id: this.purseId,
            itemIdList: this.ids,
          }).then((res) => {
            this.$modal.msgSuccess(res.message);
            this.$router.go(-1);
          })
        } finally {
          this.loading = false;
        }
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
        console.log('啊哈哈哈啊哈ids')
        console.log(this.ids)
      },
      handleButton(buttonCode, idArr, rowArr, { buttonData }) {
        
      },
     
    }
  }
</script>
