<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled">
      <div slot="dropdown">
      </div>
    </button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
      <template v-slot:unitName="{ data, i18nData }">
        <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
      <template v-slot:quWarehouseId="{ data, i18nData }">
        <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
      <template v-slot:unquWarehouseId="{ data, i18nData }">
        <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
    </form-data>
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
      :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
      @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
      @cleanClick="cleanClick"></right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
      :buttonDisable="handleButtonDisable" :property="property" :numberShow="false"
      @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
      @emitAblFilter="emitAblFilter" @clickLink="clickLink">
      <template slot="inStatus" slot-scope="scope">
        <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconClass(scope.value)" />{{ scope.value |
          fieldFormat(scope.fieldFormatArr) }}
      </template>
      <template slot="sourceRowNum" slot-scope="scope">
        <span>{{ scope.data.inSource == '99' ? '' : scope.data.sourceRowNum }}</span>
      </template>
    </table-index>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { queryList, inMaintenanceDelete, inMaintenanceUp, inMaintenanceComplete, exportQueryList } from '@/api/warehouseManage/inventoryMaintenance'
import { getProfileSubmit } from '@/api/saleManage/customerProfile'
import { download } from '@/utils/request'
import { getRouteByInsource } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
export default {
  name: "inventoryMaintenanceDetail",
  mixins: [indexMixin],
  components: { FormUnitId, FormWarehouseCode },
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
      selectedRow: null
    };

  },
  created() {
    this.menuProperty();
  },
  methods: {
    menuProperty() {
      let id = this.$route.meta.id;
      this.$store.dispatch('menuProperty', id).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        this.property = data;
      });
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      if (row.inStatus == '1' && ['adjustGrounding', 'viewGrounding'].includes(button.buttonCode)) {
        return true
      }
      if (row.inStatus == '2' && ['update', 'delete', 'autoGrounding', 'maulGrounding'].includes(button.buttonCode)) {
        return true
      }
      if (!['2'].includes(row.inStatus) && ['upinComplete'].includes(button.buttonCode)) {
        return true
      }
      if (row.inStatus == '3' && ['update', 'delete', 'autoGrounding', 'maulGrounding', 'upinComplete', 'adjustGrounding'].includes(button.buttonCode)) {
        return true
      }
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
      this.ids = row.map(item => item.saleOrderId)
      this.single = single
      this.multiple = multiple
      this.selection = row
    },
    handleResetField() {
    },
    getFieldDeep(tree) {
      for (let i = 0; i < tree.length; i++) {
        const item = tree[i]
        if (!item.isHides) {
          if (Array.isArray(item.children) && !!item.children.length) {
            this.getFieldDeep(item.children)
          } else {
            this._exportColumns.push(item.fieldCode)
          }
        }
      }
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      const buttonActions = {
        update: () => { this.$router.push({ name: 'createInventoryMaintenance', query: { type: 'update', id: idArr.join(',') } }); },
        delete: () => { this.handleDelete(idArr); },
        create: () => { this.$router.push({ name: 'createInventoryMaintenance', query: { type: 'create' } }); },
        upinComplete: () => { this.upinComplete(idArr) },
        autoGrounding: () => { this.handleButtonUp(idArr); },
        maulGrounding: () => { this.handleButtonMaulUp(rowArr); },
        adjustGrounding: () => { this.handleButtonAdjustUp(rowArr); },
        viewGrounding: () => { this.handleButtonViewUp(rowArr); },
        export: () => {
          this._exportColumns = []
          this.getFieldDeep(this.property.fields)
          download(`${exportQueryList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns: this._exportColumns }));
        }
      };
      const action = buttonActions[buttonCode];
      action && action();
    },
    upinComplete(idArr) {
      inMaintenanceComplete({ ids: idArr }).then(res => {
        if (res.success) {
          this.getList();
          this.$modal.msgSuccess("入库已完成");
        } else {
          this.getList();
          this.$modal.msgError(res.message);
        }
      })
    },
    handleButtonMaulUp(rowArr) {
      this.$refs.maulUp.open(rowArr);
    },
    handleButtonAdjustUp(rowArr) {
      this.$refs.maulUp.open(rowArr, 'update');
    },
    handleButtonViewUp(rowArr) {
      this.$refs.maulUp.open(rowArr, 'view');
    },
    handleButtonUp(idArr) {
      this.$modal.confirm('自动上架系统后台自动分配空闲货位，适用于不强调货位管理的物料，是否确定?').then(() => {
        inMaintenanceUp({ ids: idArr }).then(data => {
          if (data.success) {
            this.getList();
            this.$modal.msgSuccess("上架成功");
          } else {
            this.getList();
            this.$modal.msgError(data.message);
          }
        })
      }).then(() => { }).catch(() => { });
    },
    handleDelete(idArr) {
      this.$modal.confirm('是否删除该入库单?').then(() => {
        inMaintenanceDelete({ ids: idArr }).then(data => {
          if (data.success) {
            this.getList();
            this.$modal.msgSuccess("删除成功");
          } else {
            this.getList();
            this.$modal.msgError(data.message);
          }
        })
      }).then((data) => {
      }).catch(() => { });
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      queryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      })
    },
    //提交
    submitList() {
      const ids = this.ids /*去重*/
      const data = {
        businessId: ids[0],
        businessType: ACTIVITI_ASSUGNEE.SA_XSD
      }
      getProfileSubmit({
        ...data
      }).then(res => {
        if (res.success) {
          this.$modal.msgSuccess("提交成功");
          this.getList()
          this.ids = []
        } else {
          this.$modal.msgError(res.message);
          this.ids = []
        }
      })
    },
    clickLink(row, name) {
      if (name === 'inCode') {
        this.$router.push({ name: 'createInventoryMaintenance', query: { type: 'view', id: row.inId } });
      } else if (name === 'matlCode') {
        this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'inventoryMaintenanceDetail' } });
      } else if (name === 'sourceCode') {
        // 目前只有采购订单，跳转到采购订单页
        const name = getRouteByInsource(row.inSource)
        this.$router.push({ name: name, query: { type: 'view', id: row.sourceId, name: 'inventoryMaintenanceDetail' } });
      } else if (name === 'qiCode') {
        this.$router.push({ name: 'qualityTestingOperate', query: { name: 'inventoryMaintenanceDetail', type: "view", id: row.qiOrderId } })
      } else if (name === 'projectCode') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'inventoryMaintenanceDetail', type: 'view', id: row.projectId } })
      } else if (name === 'quBatchNo') {
        this.$router.push({ name: 'batchNoDetail', query: { name: 'inventoryMaintenanceDetail', type: 'view', id: row.quBatchNo } })
      }
    },
  }
};
</script>
