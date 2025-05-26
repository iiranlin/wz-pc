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
      :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery" :menuId="menuId"
      @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
      @cleanClick="cleanClick">
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
      <template slot="sourceRowNum" slot-scope="scope">
        <span>{{ scope.data.inSource == '99' ? '' : scope.data.sourceRowNum }}</span>
      </template>
    </table-index>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <maul-up ref="maulUp" @refresh="getList"></maul-up>
    <library-up ref="LibraryUp" @refresh="getList"></library-up>
    <activitiyTmpl ref="activitiyTmpl" @confirm="handleTmplConfirm"></activitiyTmpl>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { inMaintenanceList, inMaintenanceDelete, inMaintenanceUp, inMaintenanceComplete, exportList, inCancelGrounding, warehouseInCancelFinish } from '@/api/warehouseManage/inventoryMaintenance'
import { getProfileSubmit } from '@/api/saleManage/customerProfile'
import MaulUp from './components/maulUp/index.vue'
import { download } from '@/utils/request'
import { getRouteByInsource } from '@/utils'
import activitiyTmpl from '@/views/print/activitiyTmpl'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
import orderDetailType from '@/views/components/orderDetailType'
import LibraryUp from './components/libraryUp'
import { menuConfig } from '@/utils'
const TABLE_TYPE = {
  MASTER: 'MASTER', // 普通库
  BRANCH: 'BRANCH'  // 立体库
}
export default {
  name: "inventoryMaintenance",
  mixins: [indexMixin],
  components: { MaulUp, activitiyTmpl, FormUnitId, orderDetailType, LibraryUp, FormWarehouseCode },
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
  data() {
    return {
      tableOptions: [
        { value: TABLE_TYPE.MASTER, label: '普通库' },
        { value: TABLE_TYPE.BRANCH, label: '立体库' },
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
      selectedRow: null
    };

  },
  created() {
    this.menuProperty({ [TABLE_TYPE.MASTER]: '', [TABLE_TYPE.BRANCH]: menuConfig.MENU_RKD_LTK }[this.tableType])
  },
  methods: {
    menuProperty (id) {
      this.menuId = id || this.$route.meta.id;
      this.$store.dispatch('menuProperty', this.menuId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        if(this.tableType === 'MASTER'){
          data.buttonTop.forEach(item => {
            if (item.buttonCode === 'grounding') {
              item.children = [
                {
                  "buttonCode": "autoGrounding",
                  "buttonName": "自动上架",
                  "buttonType": "primary",
                  "buttonMode": '2',
                  'buttonIcon': 'Blue-SubmitResult',
                  "status": 0,
                },
                {
                  "buttonCode": "maulGrounding",
                  "buttonName": "手动上架",
                  "buttonType": "primary",
                  "buttonMode": '2',
                  'buttonIcon': 'Blue-InvalidReplacement',
                  "status": 0,
                }
              ]
            }
          });
        }
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
     if(button.buttonCode == 'up' || button.buttonCode == 'grounding') {
      return row.inStatus != '1' 
     }
      if (row.inStatus == '1' && ['adjustGrounding', 'viewGrounding', 'cancelListing'].includes(button.buttonCode)) {
        return true
      }
      if (row.inStatus == '2' && ['update', 'delete', 'autoGrounding', 'maulGrounding'].includes(button.buttonCode)) {
        return true
      }
      if (!['2'].includes(row.inStatus) && ['upinComplete'].includes(button.buttonCode)) {
        return true
      }
      if (row.inStatus == '3' && ['update', 'delete', 'autoGrounding', 'maulGrounding', 'upinComplete', 'adjustGrounding', 'cancelListing'].includes(button.buttonCode)) {
        return true
      }
      return false
    },
    numberChange(val) {
      this.numberShow = val;
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
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      const buttonActions = {
        up: () => {
          if(this.tableType === 'MASTER'){
            this.handleButtonMaulUp(rowArr)
          }else{
            this.$refs.LibraryUp.init('up', rowArr)
          }
        },
        update: () => { this.$router.push({ name: 'createInventoryMaintenance', query: { type: 'update', id: idArr.join(',') } }); },
        delete: () => { this.handleDelete(idArr); },
        create: () => { this.$router.push({ name: 'createInventoryMaintenance', query: { type: 'create' } }); },
        upinComplete: () => { this.upinComplete(idArr) },
        autoGrounding: () => { this.handleButtonUp(idArr); },
        maulGrounding: () => { this.handleButtonMaulUp(rowArr); },
        adjustGrounding: () => { this.handleButtonAdjustUp(rowArr); },
        viewGrounding: () => {
          if(this.tableType === 'MASTER'){
            this.handleButtonViewUp(rowArr)
          }else{
            this.$refs.LibraryUp.init('view', rowArr)
          }
        },
        export: () => {
          const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
          download(`${exportList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns, detailMode: this.tableType === 'MASTER'?'1':'2' }));
        },
        cancelListing: () => { this.inCancelGrounding(idArr) },
        grounding: () => {
          const isGroundingMode = rowArr.every((item, index, arr) => {
            return item.groundingMode == '2' || item.groundingMode == ''
          })
          if (!isGroundingMode) {
            this.$modal.msgError('所选数据存在“已在行上操作过上架”，请“先将行上架操作完”或“不选此类数据”。')
            return
          }
          this.$refs.LibraryUp.init('grounding', rowArr)
        },
        cancelFinish: () => {
          const isCreateDate = rowArr.every(item => {
            const date1 = new Date("2025-4-14")
            const date2 = new Date(item.createDate)
            const num = 24*60*60*1000
            const cha = date2.getTime() - date1.getTime()
            return cha > num
          })
          if(!isCreateDate){
            this.$modal.msgError('请联系运维人员进行手工处理');
            return
          }
          this.cancelFinish(idArr)
        }
      };
      const action = buttonActions[buttonCode];
      action && action();
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

    inCancelGrounding(ids) {
      this.$modal.confirm('取消上架请将已上架的实物做好归位处理；是否确定取消上架?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        inCancelGrounding({ ids }).then(({ message }) => {
          this.$modal.msgSuccess(message);
          this.getList();
        })
      })
    },
    upinComplete(idArr) {
      this.$modal.confirm('是否入库完成?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        inMaintenanceComplete({ ids: idArr }).then(res => {
          if (res.success) {
            this.getList();
            this.$modal.msgSuccess("入库已完成");
          } else {
            this.getList();
            this.$modal.msgError(res.message);
          }
        })
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
      inMaintenanceList(Object.assign({}, this.listQuery, this.formData, {detailMode: this.tableType === 'MASTER'?'1':'2'})).then(({ data }) => {
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
        this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'inventoryMaintenance' } });
      } else if (name === 'sourceCode') {
        const name = getRouteByInsource(row.inSource)
        const obj = {}
        if (['1'].includes(row.inSource)) {
          obj.inSource = row.inSource
        }
        // 目前只有采购订单，跳转到采购订单页
        this.$router.push({ name: name, query: { type: 'view', id: row.sourceId, name: 'inventoryMaintenance', ...obj } });
      } else if (name === 'qiCode') {
        this.$router.push({ name: 'qualityTestingOperate', query: { name: 'inventoryMaintenance', type: "view", id: row.qiOrderId } })
      } else if (name === 'projectCode') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'inventoryMaintenance', type: 'view', id: row.projectId } })
      }
    },
  }
};
</script>
