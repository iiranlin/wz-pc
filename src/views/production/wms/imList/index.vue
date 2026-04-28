<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :buttonDisable="buttonDisabledTop"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
      :formData="formData" @handleResetField="onResetField">
      <template #storeStatus="data">
        <el-select class="select-box" v-model="formData.statusList" :placeholder="($t(`please_select`) || '请选择') +
          i18nData(data.data, 'field', 'fieldCode', 'fieldName')
          " clearable style="width: 100%" size="small" multiple>
          <el-option v-for="(item, key) in options" :key="key" :label="item.name" :value="item.code" />
        </el-select>
      </template>
      <!-- 建设物资 -->
      <template #projectName="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择建设项目'
          " clearable filterable style="width: 100%" size="small">
          <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.label" />
        </el-select>
      </template>
             <!-- 日期范围搜索 -->
      <template #date>
        <el-date-picker
          v-model="formData.dateRange"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
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
          :row-class-name="tableRowClassName" :button-disable="buttonDisabled">
          <template #storeStatus="scope">
            {{ storeStatus[scope.value] }}
          </template>
          <!-- 入库单号 -->
          <template #storeNumber="scope">
            <el-button type="text" @click="toIm(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 收货单号 -->
          <template #takeNumber="scope">
            <el-button type="text" @click="toReceive(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/wms.js";
import indexMixin from "@/views/mixins";
import workFlowView from "@/components/workFlowView";
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'

export default {
  // 建设项目
  name: "imList",
  components: { workFlowView },
  mixins: [indexMixin],
  computed:{
    deptName(){
      return this.$route.query?.deptName || ''
    },
    deptId(){
      return this.$route.query?.deptId || ''
    },
    startDate(){
      return this.$route.query?.startDate || ''
    },
    endDate(){
      return this.$route.query?.endDate || ''
    },
    projectId(){
      return this.$route.query?.projectId || ''
    },
    projectName(){
      return this.$route.query?.projectName || ''
    },
    fromUrl(){
      return this.$route.query?.fromUrl  || ''
    },
    statusList(){
      return this.$route.query?.statusList  || ''
    }

  },
  data() {
    return {
      storeStatus: {
        0: "已驳回",
        1: "待检测",
        2: "部分退货",
        3: "检测通过",
        4: "已退货",
        5: "审核中",
      },
      options: [
        {
          code: "1",
          name: "待检测",
        },
        {
          code: "2",
          name: "部分退货",
        },
        {
          code: "3",
          name: "检测通过",
        },
        {
          code: "4",
          name: "已退货",
        },
        {
          code: "5",
          name: "审核中",
        },
        {
          code: "0",
          name: "已驳回",
        },
      ],
      lineOptions:[],
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
      },
      formDataClick: {},
      total: 0,
      selection: [],
      hasOwn: true,
      workFlowViewVisible: false,
      selectedRow: null,
    };
  },
  activated() {
    this.getList();
  },
  async created() {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
    });
    this.getLineOptions()
    this.setQuery();
  },

  methods: {
    // 将Url参数赋值到搜索内（使用 $set 保证响应式）
     setQuery(){
      if(this.deptId){
        this.$set(this.formData, 'constructionUnitId', this.deptId)
      }
      if(this.deptName){
        this.$set(this.formData, 'constructionUnitName', this.deptName)
      }
      if(this.startDate){
        this.$set(this.formData, 'startDate', this.startDate)
        this.$set(this.formData, 'dateRange', [this.startDate, this.endDate])
      }
      if(this.endDate){
        this.$set(this.formData, 'endDate', this.endDate)
      }
      if(this.projectId){
        this.$set(this.formData, 'projectId', this.projectId)
      }
      if(this.projectName){
        this.$set(this.formData, 'projectName', this.projectName)
      }
      if(this.fromUrl){ // 如果fromUrl=largeScreen 则表示是大屏-传1给后端，否则传0
        this.$set(this.formData, 'bigScreenFlag', this.fromUrl === 'largeScreen'?'1':'0')
      }
      if(this.statusList){
        this.$set(this.formData, 'statusList', this.statusList)
      }
     },
      /** 清空 URL 参数设置的搜索字段 */
    clearUrlQueryFields () {
      this.$set(this.formData, 'constructionUnitId', null);
      this.$set(this.formData, 'constructionUnitName', null);
      this.$set(this.formData, 'startDate', null);
      this.$set(this.formData, 'endDate', null);
      this.$set(this.formData, 'projectId', null);
      this.$set(this.formData, 'projectName', null);
      this.$set(this.formData, 'constructionUnit', null);
      this.$set(this.formData, 'dateRange', null);
      this.$set(this.formData, 'bigScreenFlag', null);
      this.$set(this.formData, 'statusList', null);
    },
    /** 搜索栏“重置”按钮触发的事件 */
    onResetField () {
      this.clearUrlQueryFields();
    },
    getLineOptions() {
      WzglApi.afterLineSelectOptions().then(({ data }) => {
        this.lineOptions = data.map(x => ({
          label: x.projectName,
          value: x.projectName
        }))
      })
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
      // 如果projectName为空，则projectId也为空
      if(!this.formData.projectName){
        this.$set(this.formData, 'projectId', null)
      }
      // 如果constructionUnitName为空，则constructionUnitId也为空
      if(!this.formData.constructionUnitName){
        this.$set(this.formData, 'constructionUnitId', null)
      }

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
      Api.listStore(Object.assign({}, this.listQuery, this.formData))
        .then(({ data }) => {
          this.list = data.list;
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
        case "ruku":
          this.$router.push({
            name: "imPage",
            query: {
              id: idArr[0],
              supplyId: rowArr[0].planId,
              type: "create",
              storeStatus: rowArr[0].storeStatus,
              from:'list'
            },
          });
          //撤回
          break;
        case "withdraw":
          this.handleRecall(idArr[0]);
          //流程查看
          break;
        case "process":
          this.workFlowViewVisible = true;
          this.selectedRow = { businessId: rowArr[0].storeMiddleId ? rowArr[0].storeMiddleId : idArr[0] };
          break;
        case "download":
          this.handleDonwload(idArr[0])
          break;
        case "spokCheck": // 抽检
           this.$router.push({
            name: "addSpok",
            query: {
              id: idArr[0],
              type:"create"
            },
          });
          break;
        case 'export':
          this.export()
          break;
      }
    },
    async export() {
      try {
        this.loading = true;
        const isAllSelected = this.selection.length > 0 && this.selection.length === this.list.length;
        const isNoneSelected = this.selection.length === 0;
        const idList = (isAllSelected || isNoneSelected) ? null : this.ids;
        await FileApi.customDownload({businessType:134,businessData : JSON.stringify({...this.formData,idList}) });
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
    },
    async handleDonwload(id) {
      try {
        this.loading = true;
        await FileApi.customDownload({ businessType: 5, businessData: id });

      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
        console.error('下载入库单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    // 撤回
    handleRecall(id) {
      this.$modal
        .confirm("是否确认撤回?")
        .then(function () {
          return Api.recall({ businessId: id, businessType: 'RKLC' });
        })
        .then(() => {
          this.$modal.msgSuccess("撤回成功");
          this.getList();
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
    //入库单号
    toIm(row) {
      this.$router.push({
        name: "imPage",
        query: { id: row.id, type: "view", storeStatus: row.storeStatus, from:'list' },
      });
    },
    //收货单
    toReceive(row) {
      this.$router.push({
        name: "receivePageCrk",
        query: { id: row.id, type: "view", takeStatus: row.takeStatus },
      });
    },
    //收货超过20天未入库显示红色
    tableRowClassName({ row, rowIndex }) {
      var time = 20 * 24 * 60 * 60 * 1000;
      var dateTime = new Date(row.takeDate).getTime();
      const timestamp = new Date().getTime();
      if (Number(timestamp) - Number(dateTime) > time && row.storeStatus == "1") {
        return "highlight-row-red";
      }
      return "";
    },
    //上方按钮控制
    buttonDisabledTop(button) {
      //入库审核按钮控制  （未入库和已驳回才能点击）
      if (button.buttonCode == "ruku") {
        return (
          this.selection[0].storeStatus != "1" && this.selection[0].storeStatus != "0"
        );
      }
      //撤回按钮控制（审核中才能撤回）
      if (button.buttonCode == "withdraw") {
        return (
          this.selection[0].storeStatus != "5"
        );
      }
      // 下载按钮控制（检测通过和部分退货和已退货）
      if (button.buttonCode == "download") {
        return (
          !['3', '2', '4'].includes(this.selection[0].storeStatus)
        );
      }
      // 抽检按钮控制（检测通过和部分退货）
      if (button.buttonCode == "spokCheck") {
        return (
          !['3', '2'].includes(this.selection[0].storeStatus)
        );
      }
    },
    //查看流程按钮控制
    buttonDisabled(button, row) {
      if (button.buttonCode == "process" && row.storeStatus == "1") {
        return true;
      }
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
