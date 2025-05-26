<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled" />
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
      @handleCheckAllChange="handleCheckAllChange" :menuId="menuId" @clickReset="clickReset"
      @numberChange="numberChange" @cleanClick="cleanClick">
      <template v-slot:tab>
        <orderDetailType :value="tableType" @input="handleTableTypeChange" :options="tableOptions" />
      </template>
    </right-toolbar>
    <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
      :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
      @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
      @emitAblFilter="emitAblFilter" @clickLink="clickLink">
      <template slot="inStatus" slot-scope="scope">
        <span :class="'inStatus-' + scope.value">{{ scope.value |
          fieldFormat(scope.fieldFormatArr) }}</span>
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
import { inOrderList, inDetailList, exportDetailList, warehouseInCancelFinish } from '@/api/warehouseManage/inventoryMaintenance'
import { getRouteByInsource } from '@/utils'
import { download } from '@/utils/request'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'

const TABLE_TYPE = {
  MASTER: 'MASTER', // 主单
  BRANCH: 'BRANCH'  // 主单+明细
}

export default {
  name: "inQuery",
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
  components: { orderDetailType, fileList, FormUnitId, FormWarehouseCode },

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
        pageSize: 30,
      },
      // 表单参数
      formData: {},
      formDataClick: {},
    };
  },
  activated() {
    if(this.$route.params && this.$route.params.inCode){
      this.handleTableTypeChange('BRANCH')
    }
  },
  created() {
    if(this.$route.params && this.$route.params.inCode){
      this.formData = this.$route.params
      this.formDataClick = this.$route.params
    }
    this.menuProperty({ [TABLE_TYPE.MASTER]: '', [TABLE_TYPE.BRANCH]: menuConfig.MENU_RKD_QUERY }[this.tableType])
  },
  methods: {
    async handlePreview(fileList) {
      try {
        this.$refs.fileList.init(fileList)
      } catch (err) {
        console.error(err)
      }
    },
    iconClassSize(value) {
      if (value !== '3') {
        return "icon-size"
      }
      return "icon-size"
    },
    iconClass(value) {
      const classObj = {
        0: "State-Fail", //待提交
        1: "State-Waiting", //审核中
        2: "State-Audit", //审核通过
        3: "State-Success"
      }
      return `${classObj[value]}`
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
      if (['cancelFinish'].includes(button.buttonCode) && row.inStatus != '3') {
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
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selection = row
    },
    handleResetField() {

    },
    handleButton(buttonCode, idArr, rowArr, { formId, buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode == 'export') {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
        download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
      } else if (buttonCode == 'cancelFinish') {
        this.cancelFinish(idArr)
      }
      // else if(buttonCode == 'print') {
      //   const tmpls = buttonData.printTemplateId.split(',')
      //     let arr = rowArr[0].inSource === '1' ? [tmpls[0]] : [tmpls[1]]
      //     this.handlePrint(arr, rowArr)
      // }
    },
    /*取消完成*/
    cancelFinish(ids) {
      this.$modal.confirm('是否撤销登卡?').then(() => {
        return warehouseInCancelFinish({ ids })
      }).then(() => {
        this.$modal.msgSuccess('撤销成功')
        this.getList()
      })
    },
    getList() {
      this.loading = true;
      const func = { [TABLE_TYPE.MASTER]: inOrderList, [TABLE_TYPE.BRANCH]: inDetailList }[this.tableType]

      func(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list;
        this.total = data.total;
      }).finally(() => {
        this.loading = false;
      })
    },
    clickLink(row, name) {
      if (name === 'inCode') {
        const id = this.tableType === 'MASTER' ? row.id : row.inId
        this.$router.push({ name: 'createInventoryMaintenance', query: { type: 'view', id } });
      } else if (name === 'matlCode') {
        this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'inventoryMaintenanceQuery' } });
      } else if (name === 'sourceCode') {
        if (row.sourceCode && row.sourceCode.split(',').length > 1) {
          this.$modal.msgError(`多个来源单号无法查看详情`)
          return
        }
        const name = getRouteByInsource(row.inSource)
        const obj = {}
        if (['1'].includes(row.inSource)) {
          obj.inSource = row.inSource
        }
        // 目前只有采购订单，跳转到采购订单页
        this.$router.push({ name: name, query: { type: 'view', id: row.sourceId, name: 'inventoryMaintenanceQuery', ...obj } });
      } else if (name === 'qiCode') {
        this.$router.push({ name: 'qualityTestingOperate', query: { name: 'inventoryMaintenanceQuery', type: "view", id: row.qiOrderId } })
      } else if (name === 'projectCode') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'inventoryMaintenanceQuery', type: 'view', id: row.projectId } })
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

.range-input {
  width: 47% !important;
}
</style>
