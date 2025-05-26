<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
      :button-disable="handleTopButtonDisabled"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField">
      <template v-slot:unitName="{ data, i18nData }">
        <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
      </template>
    </form-data>
    <el-row type="flex" class="container_h">
      <el-col :span="18" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
          :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
          @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
          @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
          @emitAblFilter="emitAblFilter" @clickLink="clickLink">
          <template slot="status" slot-scope="scope">
            <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconClass(scope.value)" />{{ scope.value | fieldFormat(scope.fieldFormatArr) }}
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    <activiti-assignee ref="activitiAssignee" :multiple="false" @activitiAssigneeSelected="activitiAssigneeSelected" />
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import FormUnitId from '@/views/components/form-unitId'
import { adjustInList, adjustInRemoveDetail, adjustInSubmit, adjustInExport } from '@/api/prodmgr-inv/adjustIn'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import { getRouteByInsource } from '@/utils'

export default {
  name: 'inventoryAdjustMaintenance',
  mixins: [indexMixin],
  components: {
    activitiAssignee,
    workFlowView,
    FormUnitId,
  },
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
        pageSize: 30
      },

      // 表单参数
      formData: {},
      formDataClick: {},

      workFlowViewVisible: false,
      selectedRow: null,
    }
  },
  async created() {
    await this.menuProperty()
  },
  methods: {
    menuProperty() {
      let id = this.$route.meta.id
      this.$store.dispatch('menuProperty', id).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        this.property = data
      })
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      if(button.buttonCode == 'inventoryQuery'){
        return row.status != '3'
      }
      if (['update', 'delete'].includes(button.buttonCode)) {
        return ['2', '3'].includes(row.status)
      }
      if (['submit'].includes(button.buttonCode)) {
        return !['0', '3'].includes(row.status)
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
      const pushObj = {
        'adjustInCode': { name: 'inventoryAdjustOperate', query: { name: 'inventoryAdjustMaintenance', type: 'view', id: row.adjustInId } },
        'suCode': { name: 'supplierOperate', query: { type: "view", id: row.suId, name: 'inventoryAdjustMaintenance' } },
        'inCode': { name: 'createInventoryMaintenance', query: { type: 'view', id: row.inId, name: 'inventoryAdjustMaintenance' } },
        'matlCode': { name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'inventoryAdjustMaintenance' } },
        'inSourceCode': { name: getRouteByInsource(row.inSource), query: { type: 'view', id: row.inSourceId, name: 'inventoryAdjustMaintenance' } },
        'projectCode': { name: 'projectManagementOperate', query: { type: "view", id: row.projectId, name: 'inventoryAdjustMaintenance' } },
      }
      pushObj[code] && this.$router.push(pushObj[code])
    },
    //选择框回调
    selectChange(row) {
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
    async handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode == 'update') {
        this.$router.push({ name: 'inventoryAdjustOperate', query: { name: 'inventoryAdjustMaintenance', type: buttonCode, id: rowArr[0].adjustInId } })
      } else if (buttonCode === 'delete') {
        this.$modal.confirm('是否确定删除?').then(() => {
          return this.handleRemove(idArr)
        })
      } else if (buttonCode === 'create') {
        this.$router.push({ name: 'inventoryAdjustOperate', query: { name: 'inventoryAdjustMaintenance', type: buttonCode } })
      } else if (buttonCode === 'flowSee') {
        this.workFlowViewVisible = true
        this.selectedRow = { id: rowArr[0].id, businessId: rowArr[0].id }
      } else if (buttonCode === 'export') {
        this.handleExport()
      } else if (buttonCode == 'submit') {
        this.ids = idArr
        this.handleSubmit(ACTIVITI_ASSUGNEE.INV_ADJUST_IN)
      } else if (buttonCode === 'inventoryQuery') {
        const {inCode, matlCode} = rowArr[0]
        this.$router.push({ name: 'inventoryMaintenanceQuery', params: { inCode, matlCode } })
      }
    },
    // 删除事件处理器
    async handleRemove(ids = []) {
      await adjustInRemoveDetail({ ids: ids })
      this.getList()
    },
    // 导出事件处理器
    async handleExport() {
      try {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
        const param = { ...this.formData, exportColumns }
        await adjustInExport(param)
      } catch (err) {
        this.$modal.msgError(err.message)
      }
    },
    // 列表数据
    async getList() {
      try {
        this.loading = true
        const param = Object.assign({}, this.listQuery, this.formData)
        const { data: { list, total } } = await adjustInList(param)
        this.list = list
        this.total = total
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    //提交
    submit(assignee = '') {
      this.loading = true;
      adjustInSubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
        if (success) {
          this.$modal.msgSuccess('提交成功')
          this.getList()
        } else {
          this.$modal.msgError(message)
        }
      }).finally(() => {
        this.loading = false;
      })
    }
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
</style>