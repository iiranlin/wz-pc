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
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :menuId="menuId"
      :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
      @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
      @cleanClick="cleanClick">
      <template v-slot:tab>
        <orderDetailType :value="tableType" @input="handleTableTypeChange" />
      </template>
    </right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
      :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
      @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
      @emitAblFilter="emitAblFilter" @clickLink="clickLink">
      <template slot="status" slot-scope="scope">
        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
      fieldFormat(scope.fieldFormatArr) }}
      </template>
      <template slot="fileList" slot-scope="scope">
        <el-link :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
          :disabled="!scope.data.fileList || !scope.data.fileList.length" @click.stop="linkClick(scope)">查看</el-link>
      </template>
    </table-index>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <fileList ref="fileList" />
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { deliveryQueryList, deliveryDetailQueryList, exportDetailQueryList, deliverySaveFile } from '@/api/prodmgr-sa/delivery'
import fileList from '@/views/components/fileList/index'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import { download } from '@/utils/request'
import attachmentTable from '@/views/components/attachmentTable'
import FormUnitId from '@/views/components/form-unitId'
export default {
  name: "saleShipmentMaintainQuery",
  mixins: [indexMixin],
  props: {
    tableType: {
      type: String,
      default: '1'
    },
    tabChange: {
      type: Function,
      default: null
    }
  },
  components: { fileList, orderDetailType, attachmentTable, FormUnitId },
  data() {
    return {
      // 遮罩层
      loading: false,
      treeLoading: false,
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
      formData: {
        matlClassifyId: '',
      },
      formDataClick: {},
      menuId: '',
    };

  },
  created() {
    this.menuProperty({ '1': '', '2': menuConfig.MENU_XSCHWH_BRANCH_CX }[this.tableType])
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
    handleSelectionChange(ids, single, multiple, selection) {
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selection = selection
    },
    handleResetField() {
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode === 'export') {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
        download(`${exportDetailQueryList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
        return
      }
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      if (this.tableType == '1') {
        deliveryQueryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
          this.list = data.list || [];
          this.total = data.total || 0;
        }).finally(() => {
          this.loading = false;
        })
      } else {
        deliveryDetailQueryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
          this.list = data.list || [];
          this.total = data.total || 0;
        }).finally(() => {
          this.loading = false;
        })
      }
    },
    clickLink(row, fieldCode) {
      const pushObj = {
        deliveryCode: { name: 'saleShipmentMaintainOperate', query: { type: "view", id: this.tableType == '1' ? row.id : row.deliveryId, isQuery: 'query' } },
        projectCode: { name: 'projectManagementOperate', query: { type: "view", id: row.projectId, name: 'saleShipmentMaintain', isQuery: 'query' } },
        ctCode: { name: 'contractManagementOperate', query: { type: "view", id: row.ctId, name: 'saleShipmentMaintain', isQuery: 'query' } },
        cuCode: { name: 'customerProfileAdd', query: { type: "view", id: row.cuId, name: 'saleShipmentMaintain', isQuery: 'query' } },
        matlCode: { name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'saleShipmentMaintain' } },
        saleOrderCode: { name: 'saleOrderOperate', query: { type: "view", id: row.saleOrderId, name: 'saleShipmentMaintain', isQuery: 'query' } }
      }
      pushObj[fieldCode] && this.$router.push(pushObj[fieldCode]);
    },
    linkClick(scope) {
      this.$refs.fileList.init(scope.value)
    }
  }
};
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
  margin-left: 20px;
  margin-top: 16px;
}

.ov_head {
  flex: 1;
  height: 100%;
  overflow-y: scroll;
}
</style>
