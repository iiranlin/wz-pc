<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :buttonDisable="handleButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
      :formData="formData">
      <template #status>
        <el-select v-model="formData.status" filterable clearable placeholder="请选择" style="width:100%">
          <el-option v-for="item in Object.keys(status).map((x) => ({
            label: status[x],
            value: x,
          }))" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
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
          :buttonDisable="handleTableButtonDisable">
          <template #status="scope">
            {{ status[scope.value] }}
          </template>
          <template #planNumber="scope">
            <el-button type="text" @click="onGoDetail(scope.data)">
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
    <Add ref="addRef" @createSuccess="onSuccess" />
    <DemandBack ref="demandBackRef" @createSuccess="onSuccess" />
  </div>
</template>

<script>

import * as Api from '@/api/prodmgr-inv/project/planRest.js'
import indexMixin from "@/views/mixins";
import Add from './components/add.vue'
import fileUpload from '@/components/upload'
import DemandBack from './components/demandBack.vue'
import { findByBusinessType } from '@/utils/index.js'
export default {
  // 供应需求列表
  name: "wzxqList",
  components: { Add, fileUpload, DemandBack },
  mixins: [indexMixin],

  data() {
    // 计划状态(1-未提交 2-审核中 3-修改后通过 4-已驳回 5-已撤回 6-发货中 7-收货完成 8-已入库 9-已出库)
    const status = {
      '0': '未提交',
      '2': '未确认',
      '3': '已确认',
      '4': '供货中',
      '5': '已完成',
    }
    return {
      status: status,
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
  },

  methods: {
    handleTableButtonDisable(item, row) {
      // 已提交、已生效、修改后同意、已驳回、允许查看流程
      if (item.buttonCode === 'flowSee') {
        return !['0', '3', '2', '4'].includes(row.planStatus)
      }
      // 供应中、收货完成、已入库、已完成允许物流查看
      if (item.buttonCode === 'logisticsView') {
        return !['6', '7', '8', '9'].includes(row.planStatus)
      }
      // 供应中、收货完成、已入库、已完成允许供应概览
      if (item.buttonCode === 'supplyView') {
        return !['6', '7', '8', '9'].includes(row.planStatus)
      }
      return false
    },
    onSuccess() {
      this.getList()
    },
    handleButtonDisabled(item) {
      // 删除按钮，只能未提交和已驳回的才可以删除
      if (item.buttonCode === 'delete') {
        return this.selection.some(item => {
          // return item.status !== '1' && item.status !== '4'
        })
      }
      // 已提交允许退回
      if (item.buttonCode === 'backup') {
        return this.selection.some(item => {
          return item.status != 0
        })
      }
      // 未确认允许撤回
      if (item.buttonCode === 'recall') {
        return this.selection.some(item => {
          return item.status != '2'
        })
      }
      // 未提交允许提交供应商
      if (item.buttonCode === 'create') {
        return this.selection.some(item => {
          return item.status != '0'
        })
      }
      return false;
    },
    onGoDetail(row) {
      this.$router.push({
        name: 'requestDetail',
        query: {
          type: 'view',
          id: row.id
        }
      })
    },
    numberChange(val) {
      this.numberShow = val;
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
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
    handleQuery(row = {}, type = '') {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      Api.itemList(Object.assign({
        pageStatus: '1'
      }, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list.map((x) => ({
          ...x,
          // fileList: x.fileList.length > 0 ? x.fileList[0].fileList : [],
          fileList: findByBusinessType(x.fileList, '51'),
        }));
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = ids;
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case "create":
          this.$refs['addRef'].updateInit(idArr[0])
          break;
        case "download":
          this.handleExport(rowArr[0])
          break;
        case "backup":
          this.demandBack(rowArr[0].id)
          break;
        case 'recall':
          this.handleRecall(rowArr[0].id)
          break;
        case 'supplyView':
          this.$router.push({
            name: 'supplyOverview',
            query: {
              id: idArr[0],
              type: 'view'

            }
          })
          break;
        case 'flowSee':
          this.workFlowViewVisible = true
          this.selectedRow = { businessId: idArr[0] }
          break;
        case 'logisticsView':
          this.$router.push({ name: 'logisticsView', query: { id: idArr[0], type: 'view' } })
          break;
      }
    },
    demandBack(id) {
      this.$refs.demandBackRef.updateInit(id)
      // this.$modal.confirm("是否确认退回？").then(() => {
      //   return Api.demandBack({ id })
      // }).then(() => {
      //   this.getList()
      // })
    },
    // 提交审核
    handleExamine(id) {
      this.$modal.confirm("是否确认提交审核?").then(function () {
        return Api.examine({ id });
      }).then(() => {
        this.$modal.msgSuccess("提交审核成功");
        this.getList();
      })
    },
    // 撤回
    handleRecall(id) {
      this.$modal.confirm("是否确认撤回?").then(function () {
        return Api.recall({ id });
      }).then(() => {
        this.$modal.msgSuccess("撤回成功");
        this.getList();
      })
    },
    handleDelete(ids) {
      this.$modal.confirm("是否确认删除?").then(function () {
        return Api.batchRemove({ ids });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      })
    },
    handleExport(obj) {
      Api.downloadPlan(obj.id)
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