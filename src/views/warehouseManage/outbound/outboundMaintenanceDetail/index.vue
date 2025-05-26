<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
                :button-disable="handleTopButtonDisabled"
    >
    </button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
      <template v-slot:unitName="{data, i18nData}">
        <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
      <template v-slot:warehouseId="{ data, i18nData }">
        <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
    </form-data>

    <el-row type="flex" class="container_h">
      <!--用户数据-->
      <el-col :span="18" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                       :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                       @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset"
                       @numberChange="numberChange"
                       @cleanClick="cleanClick"
        ></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                     :buttonDisable="handleButtonDisable"
                     :property="property" :numberShow="false" @handleSelectionChange="handleSelectionChange"
                     @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter"
                     @clickLink="clickLink"
        >
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                    @pagination="getList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import {
  warehouseOrderAutoOffShelf,
  warehouseOrderOutFinish,
  queryList,
  warehouseRemoveDetail,
  exportQueryList
} from '@/api/warehouseManage/outboundMaintenance'
import { download } from '@/utils/request'
import {getRouteByOutsource} from '@/utils'
import {
  warehouseOutGetSuggestPlace,
} from '@/api/warehouseManage/outboundMaintenance'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
export default {
  name: 'outboundMaintenanceDetail',
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
      // 表格序号是否展示
      numberShow: true,
      // 页面属性
      property: {},
      total: 0,
      // 查询参数
      listQuery: {
        pageNum: 1,
        pageSize:  30
      },
      // 表单参数
      formData: {},
      formDataClick: {},
      // 部门树选项
      treeLoading: false,
      filterText: '',

      open: false,
      selectedRow: null
    }

  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.menuProperty()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return !!this.$py.match(data.deptName, value) || data.deptCode.indexOf(value) !== -1
    },
    menuProperty() {
      let id = this.$route.meta.id
      this.$store.dispatch('menuProperty', id).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        data.buttonTop.forEach(item => {
          if (item.buttonCode === 'hdown') {
            item.children = [
              {
                'buttonCode': 'handle',
                'buttonName': '手动下架',
                'buttonType': 'primary',
                'buttonMode': '2',
                'status': 0
              },
              {
                'buttonCode': 'auto',
                'buttonName': '自动下架',
                'buttonType': 'primary',
                'buttonMode': '2',
                'status': 0
              }
            ]
          }
        })
        this.property = data
      })
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      if (['update', 'delete'].includes(button.buttonCode) && (row.outStatus === '3' || row.outStatus === '2')) {
        return true
      }
      if (['submit'].includes(button.buttonCode)) {
        return true
      }
      if (['Removed'].includes(button.buttonCode)) {
        return false
      } else if (['unRemoved'].includes(button.buttonCode) && (row.outStatus === '3')) {
        return true
      } else if (['complete'].includes(button.buttonCode) && (row.outStatus === '3' || row.outStatus === '1')) {
        return true
      } else if (['auto', 'handle'].includes(button.buttonCode) && row.outStatus !== '1') {
        return true
      }
      return false
    },
    numberChange(val) {
      this.numberShow = val
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange(columns) {
      this.$refs.tableIndex.init(columns)
    },
    clickReset() {
      this.handleQuery()
    },
    clickLink(row, code) {
      if (code === 'outCode') {
        this.$router.push({
          name: 'outboundMaintenanceOperate',
          query: { type: 'view', id: row.outId, name: 'outboundMaintenanceDetail' }
        })
      } else if (code === 'matlCode') {
        this.$router.push({
          name: 'materialArchivesOperate',
          query: { type: 'view', matlCode: row.matlCode, name: 'outboundMaintenanceDetail' }
        })
      } else if (code === 'sourceCode') {  /*来源单号*/
        const name = getRouteByOutsource(row.outSource)
        this.$router.push({
          name: name,
          query: { type: 'view', id: row.sourceId, name: 'outboundMaintenanceDetail' }
        })
      }else if(code === 'projectCode') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'outboundMaintenanceDetail', type: 'view', id: row.projectId } })
      } else if(code === 'batchNo') {
        this.$router.push({ name: 'batchNoDetail', query: { name: 'outboundMaintenanceDetail', type: 'view', id: row.batchNo } })
      }
    },
    //选择框回调
    selectChange(row) {
      let { formData, isWatch } = row
      if (!isWatch) {
        this.handleQuery(formData)
      } else {
        this.formData = Object.assign({}, this.formData, formData)
      }
    },
    cleanClick(data) {
      for (const key of data) {
        if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
          this.$refs.formData.resetQueryDateRange(key)
        }
        this.formData[key] = null
      }
      this.handleQuery()
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row)
      this.formDataClick = Object.assign({}, this.formData, row)
      this.getList()
    },
    operateSuccess() {
      this.handleQuery()
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery()
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
      if (buttonCode == 'update') {
        this.$router.push({ name: 'outboundMaintenanceOperate', query: { type: buttonCode, id: idArr } })
      } else if (buttonCode === 'delete') {
        this.$modal.confirm('是否确定删除?').then(() => {
          return warehouseRemoveDetail({ ids: idArr })
        }).then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        }).catch(() => {
        })
      } else if (buttonCode === 'create') {
        this.$router.push({ name: 'outboundMaintenanceOperate', query: { type: buttonCode } })
      } else if (buttonCode === 'unRemoved') {
        this.$refs.offShelfRef.init(rowArr)
      } else if (buttonCode === 'Removed') {
        this.$refs.offShelfRef.init(rowArr, '', true)
      } else if (buttonCode === 'complete') {
        this.complete()
      } else if (buttonCode === 'handle') {
        this.dropdownItem(buttonCode)
      } else if (buttonCode === 'auto') {
        this.dropdownItem(buttonCode)
      } else if (buttonCode === 'export') {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter( item => !item.isHides && item.isHide != 1).map( item => item.fieldCode)
        download(`${exportQueryList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
      }
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      queryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /*出库完成*/
    complete() {
      const ids = this.ids
      warehouseOrderOutFinish({
        ids
      }).then(res => {
        this.$modal.msgSuccess('出库成功')
        this.getList()
      })
    },
    async dropdownItem(name) {
      if (name === 'auto') {  /*自动下架*/
        this.$modal.confirm('自动下架系统默认按先进先出原则自动下架,是否确定?').then(() => {
          return warehouseOrderAutoOffShelf({ ids: this.ids })
        }).then(() => {
          this.getList()
          this.$modal.msgSuccess('下架成功')
        })
      } else {   /*手动下架*/
        const ids = this.selection.map(({id}) => id)
      const {success, message} =   await  warehouseOutGetSuggestPlace({ ids: ids })
        if(success) {
          this.$refs.offShelfRef.init(this.selection)
        }else {
          this.$modal.msgError(message)
        }
     
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.flex-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .search-input {
    width: 80%
  }

  .plus-icon {
    cursor: pointer;
    margin-right: 5px;
    color: #52A2FF;
    font-size: 24px;
  }
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.icon-size {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  margin-right: 3.5px;
}


.custom_button {
  transform: translateY(-1px);
  background: #ffffff !important;
  border-radius: 50px;
  font-size: 12px;
  text-align: center;
  height: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 5px 30px 5px 24px;
  position: relative;
  min-width: 100px;
  margin-right: 6px;
  border: 1px solid #1890ff;
  box-sizing: border-box;
  line-height: 22px;
  color: #1b1e22;

  &:hover {
    color: #1890ff
  }
}

</style>
