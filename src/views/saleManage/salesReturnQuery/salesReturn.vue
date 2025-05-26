<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
      <template v-slot:unitName="{data, i18nData}">
        <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
    </form-data>
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :showSearch.sync="showSearch"
      :columns="property.fields" @queryTable="handleQuery" @handleCheckAllChange="handleCheckAllChange" :menuId="menuId"
      @clickReset="clickReset" @numberChange="numberChange" @cleanClick="cleanClick">
      <template v-slot:tab>
        <orderDetailType :value="tableType" @input="handleTableTypeChange" :options="tableOptions" />
      </template>
    </right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
      :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
      @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
      @emitAblFilter="emitAblFilter" @clickLink="clickLink">
      <template slot="status" slot-scope="scope">
        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value | fieldFormat(scope.fieldFormatArr) }}
      </template>
      <template slot="fileList" slot-scope="scope">
        <el-link :disabled="!scope.data.fileList || !scope.data.fileList.length"
          :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
          @click.stop="handlePreview(scope.data.fileList)">查看</el-link>
      </template>
    </table-index>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <fileList ref="fileList" />
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { menuConfig } from '@/utils'

import orderDetailType from '@/views/components/orderDetailType'
import fileList from '@/views/components/fileList/index'
import FormUnitId from '@/views/components/form-unitId'

import { returnQueryList, returnDetailQueryList, exportDetailQueryList } from '@/api/prodmgr-sa/return'
const TABLE_TYPE = {
  MASTER: 'MASTER', // 主单
  BRANCH: 'BRANCH'  // 主单+明细
}
export default {
  name: "salesReturnQuery",
  mixins: [indexMixin],
  props: {
    tableType: {
      type: String,
      default: 'MASTER'
    },
    tabChange: {
      type: Function,
      default: null
    }
  },
  components: { orderDetailType, fileList, FormUnitId },
  data() {
    return {
      tableOptions: [
        { value: TABLE_TYPE.MASTER, label: '主单' },
        { value: TABLE_TYPE.BRANCH, label: '主单+明细' },
      ],
      menuId: '',
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
        pageSize:  30,
      },
      // 表单参数
      formData: {},
      formDataClick: {},
      workFlowViewVisible: false,
      selectedRow: null
    };

  },
  created() {
    this.menuProperty({ [TABLE_TYPE.MASTER]: '', [TABLE_TYPE.BRANCH]: menuConfig.MENU_SALES_RETURN_CX }[this.tableType])
  },
  methods: {
    async handlePreview(fileList) {
      try {
        this.$refs.fileList.init(fileList)
      } catch (err) {
        console.error(err)
      }
    },
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
      const methodObj = {
        'export': () => {
          this.exportOperation()
        },
      }
      methodObj[buttonCode] && methodObj[buttonCode]()
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      const func = { [TABLE_TYPE.MASTER]: returnQueryList, [TABLE_TYPE.BRANCH]: returnDetailQueryList }[this.tableType]

      func(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      })
    },
    async exportOperation() {
      try {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
        const param = { ...this.formData, exportColumns }
        await exportDetailQueryList(param)
      } catch (err) {
        console.error(err)
      }
    },
    clickLink(row, name) {
      if (name === 'returnCode') {
        this.$router.push({ name: 'salesReturnOperate', query: { type: "view", id: this.tableType == TABLE_TYPE.MASTER ? row.id : row.returnId, isQuery: 'query' } })
      } else if (name === 'projectCode') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'salesReturn', type: 'view', id: row.projectId, isQuery: 'query' } })
      } else if (name === 'ctCode') {
        this.$router.push({ name: 'contractManagementOperate', query: { name: 'salesReturn', type: 'view', id: row.ctId, isQuery: 'query' } })
      } else if (name === 'cuCode') {
        this.$router.push({ name: 'customerProfileAdd', query: { name: 'salesReturn', type: 'view', id: row.cuId, isQuery: 'query' } })
      } else if (name === 'sourceCode') {
        this.$router.push({ name: 'saleShipmentMaintainOperate', query: { name: 'salesReturn', type: 'view', id: row.sourceId, isQuery: 'query' } })
      } else if (name === 'matlCode') {
        this.$router.push({ name: 'materialArchivesOperate', query: { name: 'salesReturn', type: 'view', matlCode: row.matlCode, isQuery: 'query' } })
      } else if (name === 'outCode'){
        this.$router.push({ name: 'outboundMaintenanceOperate', query: { name: 'salesReturn', type: 'view', id: row.outId } })
      }
    },
  }
};
</script>

<style scope>
.icon-size {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  margin-right: 3.5px;
}
</style>
