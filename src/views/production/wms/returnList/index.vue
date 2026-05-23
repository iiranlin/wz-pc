<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
      @newButton="newButton"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
      :formData="formData" @handleResetField="onResetField">
           <template #isQualNode="data">
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
          @selectChange="selectChange" @emitAblFilter="emitAblFilter" @handleButton="handleButton">
             <template #isQualNode="scope">
            {{ status[scope.value] }}
          </template>
          <!-- 退货单号 -->
          <template #backQualNumber="scope">
            <el-button type="text" @click="toThd(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
        <!-- 入库单号 -->
          <template #storeNumber="scope">
            <el-button type="text" @click="toRkd(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
            <!-- 抽检单号 -->
          <template #samplingNumber="scope">
            <el-button type="text" @click="toCjd(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>

                  <!-- 需求ID -->
          <template #planNumber="scope">
            <el-button type="text" @click="toXqid(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
    

          <!-- 收货单号 -->
          <template #takeNumber="scope">
            <el-button type="text" @click="toShd(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 发货单号 -->
          <template #shipmentBatchNumber="scope">
            <!-- <el-button type="text" @click="toFhd(scope.data)"> -->
            {{ scope.value }}
            <!-- </el-button> -->
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/wms.js";
import indexMixin from "@/views/mixins";
import { getUserInfo } from "@/utils/user-info";
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
export default {
  // 建设项目
  name: "returnList_im",
  components: {},
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
        1: "收货不通过",
        2: "质检不通过",
        3: "抽检不通过",
      },
      options: [
        // {
        //   code: "1",
        //   name: "收货不通过",
        // },
        {
          code: "2",
          name: "质检不通过",
        },
        {
          code:"3",
          name: "抽检不通过"
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
      const userInfo = getUserInfo();
      Api.listCrRetreat(Object.assign({ deptId: userInfo.deptId }, this.listQuery, this.formData))
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
      switch (buttonCode) {
        case "export":
          this.handleDonwload(idArr[0],rowArr);
          break;
      }
     },
    async handleDonwload(id,rowArr) {
      try {
        this.loading = true;
        await FileApi.customDownload({ businessType:rowArr[0].isQualNode == 3 ? 13 : 9,businessData:id });
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
    //退货单
    toThd(row) {
      if(row.isQualNode == 3){
        this.$router.push({
          name:'addSpok',
          query:{
            id:row.id,
            type:'view',
            from:'THXQ'
          }
        })
      }else{
      this.$router.push({
        name: "returnDetail_im",
        query: { id: row.id, type: "view" },
      });
    }
    },
    toRkd(row){
      this.$router.push({
            name: 'imPage',
            query: {
              id: row.cirId,
              storeStatus: row.storeStatus,
              type: 'view',
            }
          })
    },
    toCjd(row){
        this.$router.push({
          name:'addSpok',
          query:{
            id:row.id,
            type:'view',
            from:'THXQ'
          }
        })
    },
    toXqid(row){
      this.$router.push({
            name: 'requestDetail',
            query: {
              id: row.planId,
              type: 'view',
            }
          })
    },
    //跳转货运详情
    toFhd(row) {
      this.$router.push({
        name: "addSend",
        query: { id: row.id, type: "view" },
      });
    },
    //跳转收货单
    toShd(row) {
      this.$router.push({
        name: "receivePage",
        query: { id: row.isQualNode == 3 ? row.cirId: row.id, type: "view", takeStatus: row.takeStatus },
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
