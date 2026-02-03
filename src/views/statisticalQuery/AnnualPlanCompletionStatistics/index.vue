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
      <!-- date 计划年度搜索,年选择器，并且保存后端为字符串 -->
      <template #year="data">
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
      idName="taskId"
      :tableData="list"
      :property="property"
      :numberShow="numberShow"
      @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton"
      @emitAblFilter="emitAblFilter"
    >
      <!-- <template #date="scope">
         {{ scope.data.createDateStart | formatDate  }} 至 {{ scope.data.createDateEnd | formatDate }}
       </template>-->
      <!-- 标段投资计划明细 -->
      <template #sectionDetail="scoped">
        <el-button type="text" @click="
              () => {
                  $refs.sectionDialogRef.open(scoped.data.contractIdList);
              }
            ">
          展开
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
    <SectionDialog ref="sectionDialogRef" />
  </div>
</template>
<script>
  import indexMixin from "@/views/mixins";
  import dayjs from "dayjs";
  import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
  import * as FileApi from "@/api/prodmgr-inv/project/file.js";
  import SectionDialog from './components/sectionDialog'
  // Mock 数据
  const mockListData = {
    records: [
      {
        id: '1',
        date: '2026',
        projectName: '新建南京北站站房',
        sectionTotal: 25392,
        constructionUnit: 1706169600000,
        createUserName: '超级管理员',
        total: 25392,
        contractIdList: ['contract1', 'contract2']
      },
      {
        id: '2',
        date: '2026',
        projectName: '新建南京上元门过江通道铁路',
        sectionTotal: 18500,
        constructionUnit: 1706256000000,
        createUserName: '超级管理员',
        total: 18500,
        contractIdList: ['contract3']
      },
      {
        id: '3',
        date: '2026',
        projectName: '新建上海至南京至合肥高速铁路',
        sectionTotal: 32100,
        constructionUnit: 1706342400000,
        createUserName: '超级管理员',
        total: 32100,
        contractIdList: []
      }
    ],
    total: 3
  };
  export default {
    name: "ProjectSettlementStatistics",
    mixins: [indexMixin],
    components: { SectionDialog },
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
          year: '', // 日期
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
        globalSearchParams:null
      }
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
    methods:{
      // 初始化默认上一年
      initDefaultDate() {
        const currentDate = dayjs(); // 获取当前日期
        const lastYear = currentDate.subtract(1, 'year');
        this.formData.year = lastYear.format('YYYY')
      },

      getLineOptions() {
        WzglApi.lineSelectOptions({pageStatus: '1'}).then(({ data }) => {
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
        this.formData.year = ''
        this.initDefaultDate();
        this.handleQuery();
      },
      emitAblFilter(listQuery) {
        this.listQuery = Object.assign({}, this.listQuery, listQuery);
        this.handleQuery();
      },
      handleQuery(row = {}) {
        this.listQuery.pageNum = 1;
        this.formData = Object.assign({}, this.formData, row);
        this.formDataClick = Object.assign({}, this.formData, row);
        this.getList();
      },
      /** 查询菜单列表 */
      getList() {
        /*this.loading = true;

        // 处理日期范围，转换为 startDate 和 endDate
        const params = { ...this.listQuery, ...this.formData };

        this.globalSearchParams = params;

        getContractPlanStatistics(params).then(({ data }) => {
          this.list = data.list;
          this.total = data.total;
          this.loading = false;
        });*/

        // 使用mock数据
        setTimeout(() => {
          this.list = mockListData.records
          this.total = mockListData.total
          this.loading = false
        }, 300)
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
