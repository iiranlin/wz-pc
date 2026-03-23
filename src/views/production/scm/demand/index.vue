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
          <!-- 供应需求ID -->
          <template #planNumber="scope">
            <el-button type="text" @click="toGyxq(scope.data)">
              {{ scope.value }}
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
    <confirm ref="confirm" :id="id" @createSuccess="getList" />
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import indexMixin from "@/views/mixins";
import Confirm from "./components/confirm.vue";
import fileUpload from "@/components/upload";
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
import { findByBusinessType } from '@/utils/index.js'
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
export default {
  // 建设项目
  name: "demand",
  components: { Confirm, fileUpload },
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
      lineOptions:[],
      status: {
        2: "未确认",
        3: "已确认",
        4: "供货中",
        5: "已完成",
        6: "已完成",
        7: "已撤回",
      },
      options: [
        {
          code: "2",
          name: "未确认",
        },
        {
          code: "3",
          name: "已确认",
        },
        {
          code: "4",
          name: "供货中",
        },
        {
          code: "5",
          name: "已完成",
        }
      ],
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
      id: "",
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
      this.$set(this.formData, 'bigScreenFlag', null);
    },
    /** 搜索栏“重置”按钮触发的事件 */
    onResetField () {
      this.clearUrlQueryFields();
    },
    getLineOptions() {
      WzglApi.lineSelectOptions({ pageStatus: '0' }).then(({ data }) => {
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
      Api.demandList(Object.assign({}, this.listQuery, this.formData))
        .then(({ data }) => {
          this.total = data.total;
          this.list = data.list.map((x) => ({
            ...x,
            // fileList: x.fileList.length > 0 ? x.fileList[0].fileList : [],
            fileList: findByBusinessType(x.fileList, '51'),
          }));
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
          if (rowArr[0].status == "2") {
            this.id = idArr[0];
            this.$refs.confirm.init();
          } else {
            this.$modal.msgError("已确认！");
          }

          break;
        case "send":
          if (rowArr[0].status == "2") {
            this.$modal.msgError("请先确认需求！");
            return;
          }
          if (rowArr[0].status == "5") {
            this.$modal.msgError("已验收！");
            return;
          }
          if (rowArr[0].status == "6") {
            this.$modal.msgError("已完成！");
            return;
          }
          this.$router.push({
            name: "addSend",
            query: {
              id: idArr[0],
              type: "create",
              planId: idArr[0],
            },
          });
          break;
        case "logistics":
          if (
            rowArr[0].status != "4" &&
            rowArr[0].status != "5" &&
            rowArr[0].status != "6"
          ) {
            this.$modal.msgError("状态为供货中|已验收|已完成才可以操作");
            return;
          }
          this.$router.push({
            name: "logisticsView_scm",
            query: { id: idArr[0], type: "view" },
          });
          break;
        case "download":
          this.handleDonwload(idArr[0]);
          break;
        case "export":
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
        await FileApi.customDownload({businessType:132,businessData : JSON.stringify({...this.formData,idList}) });
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
    },
    async handleDonwload(id) {
      try {
        this.loading = true;
        await FileApi.customDownload({ businessType:3,businessData:id });
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
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
    //物流按钮控制
    buttonDisabled(button, row) {
      if (button.buttonCode == "logistics" && (row.status == "2" || row.status == "3")) {
        return true;
      }
    },
    //上方按钮控制
    buttonDisabledTop(button) {
      //未确认状态才能点击确认按钮
      if (button.buttonCode == "confirm") {
        return this.selection[0].status != "2";
      }
      //已确认或供货中才能点击发货按钮,数量不等于0
      if (button.buttonCode == "send") {
        // 未确认禁用及数量0禁用
        return this.selection[0].status == "2" || this.selection[0].remainTotal <= 0;
        // return this.selection[0].status != "4" && this.selection[0].status != "3";
      }
      // 已完成才能下载
      if (button.buttonCode == "download") {
        return this.selection[0].status != "5";
      }
    },
    //跳转需求供应详情
    toGyxq(row) {
      this.$router.push({
        name: "freightDetail",
        query: {
          type: "view",
          id: row.id,
        },
      });
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
