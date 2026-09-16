<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :buttonDisable="buttonDisable"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
      :formData="formData" labelWidth="110px">
      <template #validityGuarantee>
        <el-date-picker style="width: 100% !important" v-model="formData.validityGuarantee" type="daterange"
          start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" />
      </template>
      <template #projectName="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择建设项目'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.label" />
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
          @selectChange="selectChange" @emitAblFilter="emitAblFilter" @handleButton="handleButton">
          <!-- 合同编号 -->
          <template #contractNo="scoped">
            <el-button type="text"
              @click="$router.push({ name: 'addValidityGuarantee', query: { id: scoped.data.id, type: 'view' } })">
              {{ scoped.data.contractNo }}
            </el-button>
          </template>
          <template #validityGuarantee="scope">
            {{ scope.data.validityGuarantee | formatDate }} 至
            {{ scope.data.validityGuaranteeEnd | formatDate }}
          </template>
          <!-- 合同数量 -->
          <template #contractIdList="scoped">
            <el-button type="text" @click="
              () => {
                if (scoped.data.contractIdList.length)
                  $refs.sellerDialogRef.open(scoped.data.contractIdList);
              }
            ">
              {{ scoped.data.contractIdList.length }}
            </el-button>
          </template>
          <template #materialUsedRatio="scoped">
            {{ scoped.data.materialUsedRatio || 0 }}%
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <SellerDialog ref="sellerDialogRef" />
  </div>
</template>

<script>
import { list, deptTree, deptDeleteBatch } from "@/api/system/dept";
import * as Api from "@/api/prodmgr-inv/project/validityGuarantee.js";
import indexMixin from "@/views/mixins";
import Add from "./components/add.vue";
import SellerDialog from "./components/sellerDialog.vue";
import dayjs from "dayjs";
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
export default {
  // 保函有效期列表
  name: "validityGuarantee",
  components: { Add, SellerDialog },
  mixins: [indexMixin],
  filters: {
    formatDate(value) {
      if (!value) return "";
      return dayjs(value).format("YYYY-MM-DD");
    },
  },
  data() {
    return {
      lineOptions: [],
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
      // 部门树选项
      deptOptions: undefined,
      // 部门树遮罩
      treeLoading: false,
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
      filterText: "",
      selection: [],
      hasOwn: true,
    };
  },
  activated() {
    this.getList();
  },
  created() {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
    });
    this.getLineOptions()
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    getLineOptions() {
      LineApi.lineSelectOptions().then(({ data }) => {
        this.lineOptions = data.map(x => ({
          label: x.projectName,
          value: x.projectName
        }))
      })
    },
    buttonDisable(btn) {
      // 没有合同物资才允许删除
      if (btn.buttonCode === "delete") {
        return this.selection.some((x) => x.contractIdList.length != 0);
      }
      return false;
    },
    filterNode(value, data) {
      if (!value) return true;
      return (
        !!this.$py.match(data.deptName, value) ||
        data.deptCode.indexOf(value) !== -1
      );
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
    deptTree() {
      this.treeLoading = true;
      this.formData.parentId = null;
      deptTree().then(({ data }) => {
        this.deptOptions = data;
        this.treeLoading = false;
      });
    },
    // 节点单击事件
    handleNodeClick(data) {
      if (data.id === this.treeCurrentKey) {
        // 再次点击当前节点取消选中,查询全部
        this.formData.parentId = null;
        this.$refs.tree.setCurrentKey(null);
        this.treeCurrentKey = "";
      } else {
        this.treeCurrentKey = data.id;
        this.formData.parentId = data.id;
      }
      this.getList();
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    handleQuery(row = {}, type = "") {
      this.listQuery.pageNum = 1;
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      if (this.formData.validityGuarantee) {
        this.formData.startDate = this.formData.validityGuarantee[0];
        this.formData.endDate = this.formData.validityGuarantee[1];
      }
      this.getList();
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      Api.itemList(Object.assign({}, this.listQuery, this.formData))
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
        case "create":
          this.$router.push({ name: "addSection", query: { type: "create" } });
          break;
        case "update":
          this.$router.push({
            name: "addValidityGuarantee",
            query: { id: idArr[0], contractId: rowArr[0].contractId, type: "update" },
          });
          break;
        case "delete":
          this.handleDelete(idArr);
          break;
        case "view":
          this.$router.push({
            name: "addValidityGuarantee",
            query: { id: idArr[0], type: "view" },
          });
          break;
        case 'export':
          this.handleDonwload()
          break;
      }
    },
    async handleDonwload() {
      try {
        this.loading = true;
        await FileApi.customDownload({businessType:124,businessData : JSON.stringify(this.formData) });
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
    },
    handleDelete(ids) {
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
    deptSuccess() {
      this.handleQuery();
      this.deptTree();
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
