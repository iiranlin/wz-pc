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
      :searchArr="property.search || []"
      @handleQuery="handleQuery"
      @handleResetField="handleResetField"
      :formData="formData"
    >
      <template #projectId="data">
        <el-select class="select-box" v-model="formData[data.data.fieldCode]" :placeholder="'请选择单位 '
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
import * as Api from '@/api/statisticalQuery/MaterialsPlans.js'
import * as FileApi from "@/api/prodmgr-inv/project/file.js";
import * as LineApi from '@/api/prodmgr-inv/project/line.js'
import indexMixin from "@/views/mixins";
export default {
  // 物资明细查询
  name: "materialDetailsQuery",
  mixins: [indexMixin],
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
      // 查询参数
      formData: {},
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

    // 获取填报单位
    this.getUnitOptions()
  },
  methods: {
     getUnitOptions() {
       LineApi.lineSelectOptions().then(({ data }) => {
        this.lineOptions = data.map(x => ({
          label: x.projectName,
          value: x.id
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
      Api.materialDetailsQueryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
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
    
    handleButton (buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case "export":
          this.handleDonwload()
          break;
      }
    },
    async handleDonwload() {
      try {
        this.loading = true;
        const isAllSelected = this.selection.length > 0 && this.selection.length === this.list.length;
        const isNoneSelected = this.selection.length === 0;
        const ids = (isAllSelected || isNoneSelected) ? null : this.ids;
        await FileApi.customDownload({businessType:15, businessData: JSON.stringify({...this.formData,ids})});
      } catch (error) {
        this.$modal.msgError("下载失败，请重试");
      } finally {
        this.loading = false;
      }
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