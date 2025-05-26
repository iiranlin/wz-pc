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
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
      :showSearch.sync="showSearch" :menuId="menuId" :columns="property.fields" @queryTable="handleQuery"
      @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
      @cleanClick="cleanClick">
      <template v-slot:tab>
        <orderDetailType :value="tableType" @input="handleTableTypeChange" />
      </template>
    </right-toolbar>
    <table-index ref="tableIndex" :idName="tableType == '1' ? 'puPanId' : 'puPlanRawId'" :loading="loading"
      :tableIndexs="tableIndex" :tableData="list" :buttonDisable="handleButtonDisable" :property="property"
      :numberShow="numberShow" :menuId="menuId" @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
      <template slot="status" slot-scope="scope">
        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />
        {{ scope.value | fieldFormat(scope.fieldFormatArr) }}
      </template>
      <template slot="bizStatus" slot-scope="scope">
        <span :class="'saleStatus-' + scope.value">{{ scope.value |
          fieldFormat(scope.fieldFormatArr) }}</span>
      </template>
      <template v-if="tableType === '1'" slot="fileList" slot-scope="scope">
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
import indexMixin from '@/views/mixins'
import { PuPlanQueryList, PuPlanRawQueryList, exportDetailQueryList } from '@/api/purchasingManagement/plan'
import fileList from '@/views/components/fileList/index'
import { download } from '@/utils/request'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import FormUnitId from '@/views/components/form-unitId'
export default {
  name: 'purchasePlanQuery',
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
  components: { fileList, orderDetailType, FormUnitId },
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
      menuId: ''
    }

  },
  created() {
    this.menuProperty({ '1': '', '2': menuConfig.MENU_CGJHWH_BRANCH_CX }[this.tableType])
  },
  methods: {
    menuProperty(id = '') {
      this.menuId = id || this.$route.meta.id
      this.$store.dispatch('menuProperty', this.menuId).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        this.property = data
      })
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
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
      if (buttonCode === 'export') {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
        download(`${exportDetailQueryList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
        return
      }
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      if (this.tableType === '1') {
        PuPlanQueryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
          this.list = data.list
          this.total = data.total
        }).finally(() => {
          this.loading = false
        })
      } else {
        PuPlanRawQueryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
          this.list = data.list
          this.total = data.total
        }).finally(() => {
          this.loading = false
        })
      }
    },
    handleChange(val) {
      this.menuProperty()
      this.getList()
    },
    linkClick(scope) {
      this.$refs.fileList.init(scope.value)
    },
    clickLink(row, name) {
      const tableType = this.tableType;
      if (name === 'planCode') {
        this.$router.push({
          name: 'purchasePlanOperate',
          query: {
            type: 'view',
            id: this.tableType == '2' ? row.planId : row.id,
            isQuery: 'query'
          }
        })
      } else if (name === 'projectCode') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'purchasePlan', type: 'view', id: row.projectId, isQuery: 'query' } })
      } else if (name === 'matlCode') {
        this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'purchasePlan', isQuery: 'query' } });
      } else if (name === 'sourceCode') {
        //接口没有来源id暂放
        if (row.sourceType == '1') {
          this.$router.push({ name: 'demandPlanWorkbenchOperate', query: { name: 'purchasePlan', type: 'view', id: row.sourceRawId, tableType, isQuery: 'query' } })
        } else {
          this.$router.push({ name: 'requirementPlanMaintenanceOperate', query: { name: 'purchasePlan', type: 'view', id: row.sourceRawId, tableType, isQuery: 'query' } })
        }
      }
    }
  }
}
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
  margin-left: 20px;
  margin-top: 16px;
}
</style>
