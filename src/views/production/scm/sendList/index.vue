<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="buttonDisabledTop"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
      :formData="formData" @handleResetField="onResetField">
      <template #status="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="($t(`please_select`) || '请选择') +
          i18nData(data.data, 'field', 'fieldCode', 'fieldName')
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in options" :key="key" :label="item.name" :value="item.code" />
        </el-select>
      </template>
       <!-- 建设物资 -->
      <template #projectName="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择建设项目'
          " clearable style="width: 100%" size="small">
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
          :button-disable="buttonDisabled">
          <template #status="scope">
            {{ status[scope.value] }}
          </template>
          <!-- 发货单号 -->
          <template #shipmentBatchNumber="scope">
            <el-button type="text" @click="toFhd(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 供应需求ID -->
          <template #planNumber="scope">
            <el-button type="text" @click="toGyxq(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 物流单号 -->
          <template #oddNumbers="scope">
            <el-button type="text" @click="toWuliu(scope.data)">
              {{ scope.value || "其它" }}
            </el-button>
          </template>
          <!-- 附件 -->
          <template #fileList="scope">
            <fileUpload v-model="scope.data.fileList" :preview="true" :limit="9999" />
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    <add-adress ref="addAdress" :shipmentBatchNumber="shipmentBatchNumber" />
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import indexMixin from "@/views/mixins";
import AddAdress from "./components/addAdress.vue";
import fileUpload from "@/components/upload";
import workFlowView from '@/components/workFlowView'
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
export default {
  // 建设项目
  name: "sendList",
  components: { AddAdress, fileUpload, workFlowView },
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
    }
  },
  data() {
    return {
      status: {
        1: "未发货",
        2: "货运中",
        3: "已完成",
        8: "审核中",
        9: "驳回"
      },
      options: [
        {
          code: "1",
          name: "未发货",
        },
        {
          code: "2",
          name: "货运中",
        },
        {
          code: "3",
          name: "已完成",
        },
        {
          code: "8",
          name: "审核中",
        },
        {
          code: "9",
          name: "驳回"
        }
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
      shipmentBatchNumber: "",
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
      Api.sendList(Object.assign({}, this.listQuery, this.formData))
        .then(({ data }) => {
          this.total = data.total;
          this.list = data.list.map((x) => ({
            ...x,
            fileList: x.fileByList ? JSON.parse(x.fileByList).fhd || [] : [], //发货单
          }));
          console.log(this.list);
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
        case "confirm":
          this.handleSend(idArr, rowArr);
          break;
        case "update":
          // if (rowArr[0].status != "1") {
          //   this.$modal.msgError("已发货，无法修改！");
          //   return;
          // }
          this.$router.push({
            name: "addSend",
            query: { id: idArr[0], type: rowArr[0].status == 2 ? 'view' : "update", planId: rowArr[0].planId, status: rowArr[0].status },
          });
          break;
        case "delete":
          this.handleDelete(idArr, rowArr);
          break;
        case "addAdress":
          this.shipmentBatchNumber = rowArr[0].shipmentBatchNumber;
          this.$nextTick(() => {
            this.$refs.addAdress.init();
          });
          break;
        case 'flowSee':
          this.workFlowViewVisible = true
          this.selectedRow = { businessId: idArr[0] }
          break;
         case 'export':
          this.handleDonwload()
          break;
      }
    },
    async handleDonwload() {
      try {
        this.loading = true;
        await FileApi.customDownload({businessType:125,businessData : JSON.stringify(this.formData) });
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
    },
    handleDelete(ids, rowArr) {
      for (var i in rowArr) {
        if (rowArr[i].status != "1") {
          this.$modal.msgError("已发货，无法删除！");
          return;
        }
      }
      this.$modal
        .confirm("是否确认删除?")
        .then(function () {
          return Api.batchRemove({ ids });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        });
    },
    //确认发货
    handleSend(ids, rowArr) {
      for (var i in rowArr) {
        if (rowArr[i].status != "1" && rowArr[i].status != "9") {
          this.$modal.msgError("已发货！");
          return;
        }
      }
      this.$modal
        .confirm("是否确认提交发货审核?")
        .then(function () {
          return Api.modify({ id: ids[0], status: "2" });
        })
        .then(() => {
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
    //跳转需求供应详情
    toGyxq(row) {
      this.$router.push({
        name: "freightDetail",
        query: {
          type: "view",
          id: row.planId,
        },
      });
    },
    // 物流
    toWuliu(row) {
      this.$router.push({
        name: "logisticsView_scm",
        query: { id: row.planId, type: "view", batch: row.shipmentBatchNumber },
      });
    },
    //发货单
    toFhd(row) {
      this.$router.push({
        name: "addSend",
        query: {
          type: "view",
          id: row.id,
        },
      });
    },
    //物流按钮控制
    buttonDisabled(button, row) {
      if (button.buttonCode == "addAdress" && (row.oddNumbers || row.status != "2")) {
        return true;
      }
      //状态不是未发货,不能查看流程
      if (button.buttonCode == 'flowSee') {
        return row.status == 1;
      }
    },
    //上方按钮控制
    buttonDisabledTop(button) {
      if (!this.selection || !this.selection.length) return false;
      //状态不是未发货，按钮全不能操作,审核中也不能操作
      if (button.buttonCode == 'update') {
        return this.selection[0].status == 3 || this.selection[0].status == 8;
      }
      // 驳回后允许确认发货
      if (button.buttonCode == "confirm") {
        return this.selection[0].status != 1 && this.selection[0].status != 9;
      }
      return this.selection[0].status != 1;
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
