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
    >
      <!-- 买方 -->
      <template #constructionUnitId="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择买方'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in buyerOptions" :key="key" :label="item.label" :value="item.value" />
        </el-select>
      </template>

      <!-- 建设物资 -->
      <template #projectId="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择建设项目'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.value" />
        </el-select>
      </template>
        <!-- 日期范围搜索 -->
      <template #date>
        <el-date-picker
          v-model="formData.dateRange"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
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
      idName="taskId"
      :tableData="list"
      :property="property"
      :numberShow="numberShow"
      @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton"
      @emitAblFilter="emitAblFilter"
    >
      <template #contractNo="scope">
        <el-button type="text" @click="onGoDetail(scope.data)">
          {{ scope.value }}
        </el-button>
      </template>
      <template #planAmountRatio="scoped">
        {{scoped.data.planAmountRatio || 0}}%
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
  import dayjs from "dayjs";
  import * as LineApi from '@/api/prodmgr-inv/project/line.js'
  import * as FileApi from "@/api/prodmgr-inv/project/file.js";
  import {contractPerformStatistics}  from "@/api/statisticalQuery/ContractStatistics.js";
  import { newListByDeptCode } from '@/api/system/dept.js'
  export default {
    name: "ProjectSettlementStatistics",
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
        formData: {
          settlementDate: [], // 日期范围
        },
        formDataClick: {},
        lineOptions:[],
        selected: [],
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
        globalSearchParams:null,
        buyerOptions:[]
      }
    },
    async created() {
      this.$store.dispatch("menuProperty", this.metaId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30;
        this.property = data;
      });
      this.getLineOptions()
      this.getBuyerOptionsOptions()
    },
    methods:{
      getLineOptions() { // 建设项目下拉框读取
        LineApi.lineSelectOptions().then(({ data }) => {
          this.lineOptions = data.map(x => ({
            label: x.projectName,
            value: x.id
          }))
        })
      },
      getBuyerOptionsOptions() { // 买方(枢纽指挥部)下拉框读取
        newListByDeptCode({deptCodePrefix:'SN',status:''}).then(({ data }) => {
          this.buyerOptions = data.map(x => ({
            value: x.id,
            label: x.deptName
          }))
        })
      },
      newButton(buttonCode, formId, buttonData) {
        this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData);
      },
      // 重置表单时恢复默认日期
      handleResetField() {
        this.formData = {
          settlementDate: [],
        };
        this.handleQuery();
      },
      emitAblFilter(listQuery) {
        this.listQuery = Object.assign({}, this.listQuery, listQuery);
        this.handleQuery();
      },
      handleQuery(row = {}) {
        if(this.formData.dateRange && this.formData.dateRange.length > 0){
          this.formData.startDate = this.formData.dateRange[0]
          this.formData.endDate = this.formData.dateRange[1]
        }else{
          this.$set(this.formData, 'startDate', null)
          this.$set(this.formData, 'endDate', null)
        }
        this.listQuery.pageNum = 1;
        this.formData = Object.assign({}, this.formData, row);
        this.formDataClick = Object.assign({}, this.formData, row);
        this.getList();
      },
      /** 查询菜单列表 */
      getList() {
        this.loading = true;
        const params = { ...this.listQuery, ...this.formData };
        this.globalSearchParams = params;
        contractPerformStatistics(params).then(({ data }) => {
          this.list = data.list;
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
        this.single = single;
        this.multiple = multiple;
        this.selected = selected;
      },
      onGoDetail (row) {
        if(row.parentId){
          this.$router.push({ name: 'detailSupplementContract', query: { id: row.contractId, type: 'view' ,parentId:row.parentId} })
        }else{
          this.$router.push({ name: 'detailContract', query: { id: row.contractId, type: 'view' } })
        }
      },
      handleButton(buttonCode, idArr, rowArr, { buttonData }) {
        this.proxyPrint(buttonCode, rowArr, buttonData);
        switch (buttonCode) {
          case "download":
            this.handleDonwload(idArr[0]);

            break;
          default:
            break;
        }
      },
      async handleDonwload(id) {
        try {
          this.loading = true;
          await FileApi.customDownload({ businessType:114,businessData:  JSON.stringify(this.globalSearchParams) });
        } catch (error) {
          this.$modal.msgError("下载失败，请重试");
        } finally {
          this.loading = false;
        }
      },
    }
  }
</script>
