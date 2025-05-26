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

    <el-row type="flex" class="container_h">
      <el-col :span="18" :xs="24" class="container_flex">
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :showSearch.sync="showSearch"
          :columns="property.fields" @queryTable="handleQuery" @handleCheckAllChange="handleCheckAllChange"
          @clickReset="clickReset" @numberChange="numberChange" @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
          :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow"
          @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
          @emitAblFilter="emitAblFilter" @clickLink="clickLink">
          <template slot="status" slot-scope="scope">
            <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconClass(scope.value)" />{{ scope.value |
              fieldFormat(scope.fieldFormatArr) }}
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <selectContract ref="contract" :singleMode="true" :filterCondition="filterCondition" @selections="handleContract">
    </selectContract>
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
    <activiti-assignee ref="activitiAssignee" :multiple="false" @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { projectDetail, projectRelatedContract, projectList, projectRemove, projectSubmit, projectExport, } from '@/api/projectManagement/projectManager'
import selectContract from '@/views/components/selectContract'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import FormUnitId from '@/views/components/form-unitId'
export default {
  name: 'projectManager',
  mixins: [indexMixin],
  components: {
    selectContract,
    activitiAssignee,
    workFlowView,
    FormUnitId
  },
  data() {
    return {
      filterCondition: {
        isProjectQuery: '1',
        isProject: '1',
        status: '1',
        unitId:'',
      },
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
        pageSize:  30
      },
      // 表单参数
      formData: {},
      formDataClick: {},
      // 部门树选项
      treeLoading: false,
      filterText: '',

      open: false,
      rules: {
        dataTime: [
          { required: true, message: '同步日期不能为空', trigger: 'blur' }
        ]
      },
      workFlowViewVisible: false,
      selectedRow: null,
      buttonTop: [
        { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' }]
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
    // 加载详情
    async loadDetail(id) {
      const { data: {contractList} } = await projectDetail(id)
      return contractList || []
    },
    // 选择合同
    async handleContract(rows) {
      try {
        const [node] = this._rowArr
        const param = {
          ...node,
          contractList: rows
        }
        this._rowArr = undefined
        const { success, message } = await projectRelatedContract(param)
        if (success) {
          this.getList()
          this.$modal.msgSuccess('关联成功')
        } else {
          this.$modal.msgError(message)
        }
      } catch (err) {
        this.$modal.msgError(err.message)
      }
    },
    iconClassSize(value) {
      if (value !== '3') {
        return 'icon-size'
      }
      return 'icon-size'
    },
    filterNode(value, data) {
      if (!value) return true
      return !!this.$py.match(data.deptName, value) || data.deptCode.indexOf(value) !== -1
    },
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
      let flag = false
      if (['withdraw'].includes(button.buttonCode)) {
       return !['2'].includes(row.status)
      }
      if (['2', '3'].includes(row.status) && ['update', 'delete', 'submit'].includes(button.buttonCode)) {
        flag = true
      }
      if (['2', '1', '0'].includes(row.status) && ['contract'].includes(button.buttonCode)) {
        flag = true
      }
      return flag
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
    clickLink(row) {
      this.$router.push({ name: 'projectManagementOperate', query: { name: 'projectManager', type: 'view', id: row.id } })
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
    async handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      const ids = rowArr.map(({ id }) => id)
      if (buttonCode == 'update') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'projectManager', type: buttonCode, id: rowArr[0].id } })
      } else if (buttonCode === 'delete') {
        this.$modal.confirm('是否确定删除?').then(() => {
          return this.handleRemove(ids)
        })
      } else if (buttonCode === 'create') {
        this.$router.push({ name: 'projectManagementOperate', query: { name: 'projectManager', type: buttonCode } })
      } else if (buttonCode === 'flowSee') {
        this.workFlowViewVisible = true
        this.selectedRow = { id: rowArr[0].id, businessId: rowArr[0].id }
      } else if (buttonCode === 'export') {
        this.handleExport()
      } else if (buttonCode == 'submit') {
        this.ids = idArr
        this.handleSubmit(ACTIVITI_ASSUGNEE.PU_PROJECT)
      } else if (buttonCode === 'contract') {
        this._rowArr = rowArr
        const arr = await this.loadDetail(this._rowArr[0].id)
        this.filterCondition.unitId = this.selection[0].unitId;
        this.$refs.contract.init(null, arr);
      } else if(buttonCode === 'withdraw') {
        this.handleWithdraw({businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.PU_PROJECT,})
      }
    },
    // 删除事件处理器
    async handleRemove(ids = []) {
      try {
        const { success, message } = await projectRemove({ ids: ids })
        if (success) {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        } else {
          this.$modal.msgError(message)
        }
      } catch (err) {
        this.$modal.msgError(err.message)
      }
    },
    // 导出事件处理器
    async handleExport() {
      try {
        const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter( item => !item.isHides && item.isHide != 1).map( item => item.fieldCode)
        const param = { ...this.formData, exportColumns }
        await projectExport(param)
      } catch (err) {
        this.$modal.msgError(err.message)
      }
    },
    // 列表数据
    async getList() {
      try {
        this.loading = true
        const param = Object.assign({}, this.listQuery, this.formData)
        const { data: { list, total } } = await projectList(param)
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
        projectSubmit({ids: this.ids, assignee}).then(({ success, data, message }) => {
            if (success) {
                this.$modal.msgSuccess('提交成功')
                this.getList()
            } else {
                this.$modal.msgError(message)
            }
        }).finally( () => {
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
