<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :buttonDisable="buttonDisabledTop"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
      :formData="formData">
      <template #cjResult="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="($t(`please_select`) || '请选择') +
          i18nData(data.data, 'field', 'fieldCode', 'fieldName')
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in options" :key="key" :label="item.name" :value="item.code" />
        </el-select>
      </template>

      <!-- 退货日期范围 -->
      <template #date>
        <el-date-picker
          v-model="formData.date"
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
          :button-disable="buttonDisabled" :customnDisabled="true">
          <template #storeStatus="scope">
         {{scope.value == '1'?'未提交':scope.value == '2'?'审核中':scope.value == '3'?'已驳回':scope.value == '4'?'已通过':''}}
          </template>
          <!-- 抽检单号 -->
           <template #spokNo="scope">
            <el-button type="text" @click="toCJ(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 入库单号 -->
          <template #storeNumber="scope">
            <el-button type="text" @click="toIm(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <!-- 发货单号 -->
          <template #sendNumber="scope">
            <el-button type="text" @click="toSend(scope.data)">
              {{ scope.value }}
            </el-button>
          </template>
          <template #fileList="scope">
            <fileUpload v-if="scope.value" :value="scope.value" :limit="9999" :fileSize="500" :fileType="['pdf']"
              :preview="'view'" />
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
import fileUpload from '@/components/upload';
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
import * as WzglApi from '@/api/prodmgr-inv/project/wzgl.js'
// Mock 数据
 const mockListData = {
    records: [
      {
        djID: '1111',
        date: '2026',
        projectName: '新建南京北站站房',
        sectionTotal: 25392,
        constructionUnit: 1706169600000,
        createUserName: '超级管理员',
        total: 25392,
        storeStatus: '1',
        spokNo:'我是抽检单号1111',
        storeNumber:'我是入库单号111',
        sendNumber:'我是发货单号111',
        fileList:'我是文件列表111',
      },
      {
        djID: '2222',
        date: '2026',
        projectName: '新建南京上元门过江通道铁路',
        sectionTotal: 18500,
        constructionUnit: 1706256000000,
        createUserName: '超级管理员',
        total: 18500,
         storeStatus: '2',
        spokNo:'我是抽检单号2222',
        storeNumber:'我是入库单号222',
        sendNumber:'我是发货单号222',
        fileList:'我是文件列表222',
      },
      {
        djID: '4444',
        date: '2026',
        projectName: '新建上海至南京至合肥高速铁路',
        sectionTotal: 32100,
        constructionUnit: 1706342400000,
        createUserName: '超级管理员',
        total: 32100,
        storeStatus: '3',
        spokNo:'我是抽检单号3333',
        storeNumber:'我是入库单号333',
        sendNumber:'我是发货单号333',
        fileList:'我是文件列表333',
      },
      {
        djID: '88888',
        date: '2026',
        projectName: '新建上哈哈哈铁路',
        sectionTotal: 32100,
        constructionUnit: 1706342400000,
        createUserName: '超级管理员',
        total: 32100,
        storeStatus: '4',
        spokNo:'我是抽检单号4444',
        storeNumber:'我是入库单号444',
        sendNumber:'我是发货单号444',
        fileList:'我是文件列表444',
      }
    ],
    total: 4
 }
export default {
  // 建设项目
  name: "imList",
  components: { workFlowView , fileUpload},
  mixins: [indexMixin],

  data() {
    return {
      options: [
        {
          code: "1",
          name: "合格",
        },
      
        {
          code: "2",
          name: "不合格",
        },
        {
          code: "3",
          name: "部分合格",
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
      // 查询参数
      formData: {
        date: null,
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
  },

  methods: {
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
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      // 使用mock数据
        setTimeout(() => {
          this.list = mockListData.records
          this.total = mockListData.total
          this.loading = false
        }, 300)
      // Api.listStore(Object.assign({}, this.listQuery, this.formData))
      //   .then(({ data }) => {
      //      data.list.map((item, i) => {
      //       item.spokNo = '抽检单号' + i
      //     })
      //     this.list = data.list;
      //     this.total = data.total;
      //     console.log('我是数组哈哈哈哈')
      //    console.log(this.list)
      //   })
      //   .finally(() => {
      //     this.loading = false;
      //   });
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = ids;
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData);
      const ids = rowArr.map(item => item.id)
      switch (buttonCode) {
        case "revoke":
          this.handleRecall(idArr[0]);
          break;
        case "delete":
          this.handleDelete(idArr[0]);
          break;
        case "flowSee":
          this.workFlowViewVisible = true;
          this.selectedRow = { businessId: rowArr[0].storeMiddleId ? rowArr[0].storeMiddleId : idArr[0] };
          break;
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
    handleDelete(ids, rowArr) {
      // for (var i in rowArr) {
      //   if (rowArr[i].status != "1") {
      //     this.$modal.msgError("已发货，无法删除！");
      //     return;
      //   }
      // }
      this.$modal.confirm("是否确认删除?")
        .then(function () {
          return Api.batchRemove({ ids });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
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
    // 抽检单号
    toCJ(){
      // 等待跳转
    },
    //入库单号
    toIm(row) {
      this.$router.push({
        name: "imPage",
        query: { id: row.id, type: "view", storeStatus: row.storeStatus },
      });
    },
    //发货单
    toSend(row) {
      // this.$router.push({
      //   name: "跳转到收获单详情页",
      //   query: { id: row.id, type: "view", takeStatus: row.takeStatus },
      // });
    },
    //顶部按钮控制
    /**
     * 状态 1-未提交 2-审核中 3-已驳回 4-已通过
     * 未提交可操作: 删除
     * 审核中可操作: 撤回
     * 已驳回可操作: 删除 和 撤回
     * 
     */
    buttonDisabledTop(button) {
    // 如果没有选中行，禁用所有按钮
    if (!this.selection || this.selection.length === 0) {
      return true;
    }
    const status = this.selection[0].storeStatus;
    
    switch (button.buttonCode) {
      case 'delete':
        // 未提交和已驳回可以删除
        return !['1', '3'].includes(status);
      case 'revoke':
        // 审核中和已驳回可以撤回
        return !['2', '3'].includes(status);
      default:
        return true;
    }
    },
    //查看流程按钮控制
    buttonDisabled(button, row) {
      const status = row.storeStatus;
      
      switch (button.buttonCode) {
        case 'flowSee':
          // 审核中、已驳回、已通过可以查看流程
          return !['2', '3', '4'].includes(status);
        default:
          return true;
      }
    },
  },
};
</script>
