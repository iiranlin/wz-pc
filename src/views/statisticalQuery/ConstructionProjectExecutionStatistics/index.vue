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
    <!-- 枢纽指挥部 -->
      <template #constructionUnitId="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择枢纽指挥部'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in constructionUnitOptions" :key="key" :label="item.label" :value="item.value" />
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
      idName="taskId"
      :tableIndexs="tableIndex"
      :tableData="list"
      :property="property"
      :numberShow="numberShow"
      @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton"
      @emitAblFilter="emitAblFilter"
    >
      <template #projectName="scoped">
        <el-button
          type="text"
          @click="toDetail(scoped.data)"
        >
          {{ scoped.data.projectName }}
        </el-button>
      </template>
      <template #planAmountRatio="scoped">
        {{scoped.data.planAmountRatio || 0}}%
      </template>
      <template #outAmountRatio="scoped">
        {{scoped.data.outAmountRatio || 0}}%
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
import {performStatistics} from "@/api/statisticalQuery/SegmentProject.js"
import { newListByDeptCode } from '@/api/system/dept.js'
import indexMixin from "@/views/mixins";
import dayjs from "dayjs";
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
export default {
  name: "planAssignmentStatistics",
  mixins: [indexMixin],
  data() {
    return {
      lineOptions:[],
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
      numberShow: true,
      // 页面属性
      property: { fields: [{ isAdd: 1, isEdit: 1 }] },
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 30,
      },
      formData: {},
      visible: false,
      metaId: this.$route.meta.id,
      selected: [],
      selectedRow: null,
      globalSearchParams:null,
      constructionUnitOptions:[]
    };
  },
  async created() {
    this.constructionUnitOptions = await this.getDeptTree('SN')
    this.$store.dispatch("menuProperty", this.metaId).then((data) => {
      this.listQuery.pageSize = data.defaultPageSize || 30;
      this.property = data;
    });
    this.getLineOptions()
  },
  methods: {
    getLineOptions() {
      LineApi.lineSelectOptions().then(({ data }) => {
        this.lineOptions = data.map(x => ({
          label: x.projectName,
          value: x.id
        }))
      })
    },
    // 加载枢纽
    async getDeptTree (deptCodePrefix ,status = '') {
      const res = await newListByDeptCode({
        deptCodePrefix,
        status
      })
      const data = res.data.map(item => {
        return {
          value: item.id,
          label: item.deptName
        }
      })
      return Promise.resolve(data)
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
    clickReset() {
      this.handleQuery();
    },
    clearSearch() {
      this.getList();
    },
    // 重置表单时恢复默认日期
    handleResetField() {
      this.formData = {};
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
      const params = { ...this.listQuery, ...this.formData };
      this.globalSearchParams = params;
      performStatistics(params).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
        this.loading = false;
      });
    },
    toDetail(row){
      this.$router.push({ name: 'detailLine', query: { id: row.projectId, type: 'view' } })
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData);
      switch (buttonCode) {
        case "export":
          this.handleDonwload(idArr[0]);
          break;
        default:
          break;
      }
    },
    async handleDonwload(id) {
      try {
        this.loading = true;
        await FileApi.customDownload({ businessType:112,businessData:  JSON.stringify(this.globalSearchParams) });
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
