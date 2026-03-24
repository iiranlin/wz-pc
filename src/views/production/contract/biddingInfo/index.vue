<template>
  <div class="app-container container_flex">
    <button-top
      :buttonTopData="property.buttonTop"
      :multiple="multiple"
      :single="single"
      @newButton="newButton"
      :buttonDisable="buttonDisable"
    ></button-top>
    <form-data
      ref="formData"
      :showSearch="showSearch"
      :searchArr="property.search || []"
      @handleQuery="handleQuery"
      @handleResetField="handleResetField"
      :formData="formData"
    >
      <template #tenderProjectName="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.value" />
        </el-select>
      </template>
      <template #tenderYear="data">
        <el-date-picker v-model="formData[data.data.fieldCode]" type="year" placeholder="选择年份" size="small" value-format="yyyy" style="width: 100%" />
      </template>
      <template #materialCategory="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择'
          " clearable style="width: 100%" size="small">
          <el-option v-for="(item, key) in lineOptions" :key="key" :label="item.label" :value="item.value" />
        </el-select>
      </template>
    </form-data>
    <el-row type="flex" class="container_h">
      <!--用户数据-->
      <el-col :span="20" :xs="24" class="container_flex">
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
          :tableData="list"
          :property="property"
          :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange"
          @selectChange="selectChange"
          @emitAblFilter="emitAblFilter"
          @handleButton="handleButton"
          :customnDisabled="true"
        >
          <!-- 单据明细 -->
      <template #tenderProjectName="scoped">
        <el-button type="text" @click="getDtail(scoped.data.id)">
          {{scoped.data.tenderProjectName}}
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
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { list, deptTree, deptDeleteBatch,newListByDeptCode } from "@/api/system/dept";
import * as Api from '@/api/prodmgr-inv/project/contract.js'
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import indexMixin from "@/views/mixins";
export default {
  // 招标信息列表
  name: "biddingInfoList",
  mixins: [indexMixin],
  activated() {
    this.getList();
  },
  data () {
    return {
      // 页面属性
      property: { fields: [{ isAdd: 1, isEdit: 1 }] },
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
      lineOptions: [],
    };
  },
  created () {
    let id = this.$route.meta.id;
    this.$store.dispatch("menuProperty", id).then((data) => {
      this.property = data;
    });

    // 获取供应商指挥部树
    this.getLineOptions()
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
    numberChange (val) {
      this.numberShow = val;
    },
    newButton (buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange (columns) {
      this.$refs.tableIndex.init(columns);
    },
    //选择框回调
    selectChange (row) {
      let { formData, isWatch } = row;
      if (!isWatch) {
        this.handleQuery(formData);
      } else {
        this.formData = Object.assign({}, this.formData, formData);
      }
    },
    emitAblFilter (listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery);
      this.handleQuery();
    },
    handleQuery (row = {}, type = '') {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    /** 查询菜单列表 */
    getList () {
      this.loading = true
      Api.biddingInfo(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleSelectionChange (ids, single, multiple, selection) {
      this.ids = ids;
      this.single = single;
      this.multiple = multiple;
      this.selection = selection;
    },
    getDtail(id){
        this.$router.push({name: 'addBidInfo', query: {type: 'view', id: id}})
    },
    buttonDisable (btn) {
      // 如果没有选中行，删除和修改按钮禁止点击
      if (this.selection.length === 0) {
        if (btn.buttonCode === 'delete' || btn.buttonCode === 'update') {
          return true;
        }
      }
      // 修改按钮只能允许一条数据的修改
      if (btn.buttonCode === 'update' && this.selection.length > 1) {
        return true;
      }
      return false;
    },
    handleButton (buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case "create":
          this.$router.push({name: 'addBidInfo', query: {type: 'create'}})
          break;
        case "update":
          this.$router.push({name: 'addBidInfo', query: {type: 'update', id: rowArr[0].id}})
          break;
        case "delete":
          this.handleDelete(idArr)
          break;
        case "export":
          this.handleDonwload()
          break;
      }
    },
     async handleDonwload() {
      try {
        this.loading = true;
        await FileApi.customDownload({ businessType: 136, businessData:JSON.stringify(this.formData) });

      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
        console.error('下载入库单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handleDelete (ids) {
      this.$modal.confirm("是否确认删除?").then(function () {
        return Api.biddingInfoRemove({ ids });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      })
    },
    /** right-toolbar 触发的重置 */
    clickReset () {
      this.handleQuery();
    },
    // 重置表单时恢复默认日期
    handleResetField() {
      this.handleQuery();
    },
    cleanClick (data) {
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