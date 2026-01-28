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
    <template #assignmentDate>
      <!-- 下达日期范围，默认选择最近一个月时间段，年月日格式 -->
      <el-date-picker
        v-model="formData.assignmentDate"
        type="daterange"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-value="dateRange"
      />
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
      idName="taskId"
      :tableIndexs="tableIndex"
      :tableData="list"
      :property="property"
      :numberShow="numberShow"
      @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton"
      @emitAblFilter="emitAblFilter"
    >
    <template #date="scope">
       {{ scope.data.createDateStart | formatDate  }} 至 {{ scope.data.createDateEnd | formatDate }}
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
import { getContractPlanStatistics } from "@/api/prodmgr-inv/project/contract.js";
import indexMixin from "@/views/mixins";
import dayjs from "dayjs";
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
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
      formData: {
        assignmentDate: [], // 日期范围
      },
      visible: false,
      metaId: this.$route.meta.id,
      selected: [],
      selectedRow: null,
      globalSearchParams:null
    };
  },
  created() {
    // 初始化默认日期为最近一个月
    this.initDefaultDate();

    this.$store.dispatch("menuProperty", this.metaId).then((data) => {
      this.listQuery.pageSize = data.defaultPageSize || 30;
      this.property = data;
    });
    this.getLineOptions()
  },
  methods: {
     getLineOptions() {
      WzglApi.lineSelectOptions({pageStatus: '1'}).then(({ data }) => {
        this.lineOptions = data.map(x => ({
          label: x.projectName,
          value: x.projectName
        }))
      })
    },
    // 初始化默认日期为最近一个月
    initDefaultDate() {
      const end = dayjs();
      const start = dayjs().subtract(1, 'month');

      this.formData.assignmentDate = [
        start.format('YYYY-MM-DD'),
        end.format('YYYY-MM-DD')
      ];
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
      this.formData = {
        assignmentDate: [],
      };
      // 恢复默认日期为最近一个月
      this.initDefaultDate();
      this.handleQuery();
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

      // 处理日期范围，转换为 startDate 和 endDate
      const params = { ...this.listQuery, ...this.formData };
      if (this.formData.assignmentDate && this.formData.assignmentDate.length === 2) {
        params.createDateStart = this.formData.assignmentDate[0];
        params.createDateEnd = this.formData.assignmentDate[1];
        delete params.assignmentDate; // 移除原始日期范围字段
      }

      this.globalSearchParams = params;

      getContractPlanStatistics(params).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
        this.loading = false;
      });
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
        await FileApi.customDownload({ businessType:109,businessData:  JSON.stringify(this.globalSearchParams) });
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
