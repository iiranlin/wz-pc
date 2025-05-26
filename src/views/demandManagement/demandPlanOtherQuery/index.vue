<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
      <template slot="planAttribute" slot-scope="scope">
        <el-form-item label="计划属性" prop="planAttribute" class="custom-form-item">
          <el-select class="select-box" v-model="planAttribute" disabled placeholder="请选择计划属性" style="width:100%"
            size="small">
            <el-option label="全部" value="-1" />
            <el-option v-for="(item, key) in scope.data.fieldFormatArr" :key="key" :label="item.name"
              :value="item.code" />
          </el-select>
        </el-form-item>
      </template>
    </form-data>
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
      :showSearch.sync="showSearch" :menuId="menuId" :columns="property.fields" @queryTable="handleQuery"
      @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
      @cleanClick="cleanClick">
    </right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
      :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
      @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
      @emitAblFilter="emitAblFilter" @clickLink="clickLink">
    </table-index>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { getList, exportQueryList } from '@/api/prodmgr-mm/demandPlanOtherQuery'
export default {
  name: "demandPlanOtherQuery",
  mixins: [indexMixin],
  dicts: ['planAttribute'],
  data() {

    return {
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
      // 表格数据
      list: [],
      //列表选中数据
      selection: [],
      // 表格序号是否展示
      numberShow: false,
      // 页面属性
      property: {},
      total: 0,
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageSize: 30,
      },
      // 表单参数
      formData: {},
      formDataClick: {},
      menuId: '',
    };

  },
  async created() {
    await this.menuProperty()
  },
  methods: {
    menuProperty(id = '') {
      this.menuId = id || this.$route.meta.id;
      this.$store.dispatch('menuProperty', this.menuId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        this.property = data;
      });
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      return false
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
    clickReset() {
      this.handleQuery();
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
    cleanClick(data) {
      for (const key of data) {
        if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
          this.$refs.formData.resetQueryDateRange(key);
        }
        this.formData[key] = null;
      }
      this.handleQuery();
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row);
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList();
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery();
    },
    handleSelectionChange(ids, single, multiple, row) {
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selection = row
    },
    handleResetField() {
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      this[`${buttonCode}Operation`] && this[`${buttonCode}Operation`](buttonCode, idArr, rowArr);
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      const param = Object.assign({}, this.listQuery, this.formData)
      getList(param).then(async ({ data }) => {
        this.list = data.list || [];
        this.total = data.total || 0;
      }).finally(() => {
        this.loading = false;
      })
    },
    queryBomOperation(bcode, ids, rows) {
      const [row] = rows
      this.$router.push({ name: 'BOMAdministration', query: { matlCode: row.matlCode } });
    },
    async exportOperation() {
      try {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
        const param = Object.assign({}, this.listQuery, this.formData, { exportColumns })
        await exportQueryList(param)
      } catch (err) {
        console.error(err)
      }
    },
    clickLink(row, code) {
      const objPush = {
        matlCode: () => {
          this.$router.push({ name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'demandPlanWorkbench', isQuery: 'query' } })
        },
      }
      objPush[code] && objPush[code]()
    },
    linkClick(scope) {
      this.$refs.fileList.init(scope.value)
    },
  }
};
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
  margin-left: 20px;
  margin-top: 16px;
}
</style>
