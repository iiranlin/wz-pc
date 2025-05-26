<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
                :button-disable="handleTopButtonDisabled"
    ></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
      @handleQuery="handleQuery" @handleResetField="handleResetField" @fieldClick="handleFieldClick">
      <template v-slot:unitName="{data, i18nData}">
        <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
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
                     :property="property" idName="ctId" :numberShow="numberShow"
                     @handleSelectionChange="handleSelectionChange"
                     @handleButton="handleButton" @selectChange="selectChange" @emitAblFilter="emitAblFilter"
                     @clickLink="clickLink"
        >
          <template slot="status"  slot-scope="scope">
            <icon-svg :class="iconClassSize(scope.value)" :icon-class="iconClass(scope.value)"/>{{ scope.value | fieldFormat(scope.fieldFormatArr) }}
          </template>
          <template slot="isProject"  slot-scope="scope">
            <span :class="rowSetStyle(scope.value)">{{ scope.value | fieldFormat(scope.fieldFormatArr) }}</span>
          </template>
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                    @pagination="getList"
        />
      </el-col>
    </el-row>

    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible"/>
    <activiti-assignee ref="activitiAssignee" :multiple="false" @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    <relative-operate ref="relativeOperate" @relativeOperateSelected="relativeOperateSelected"></relative-operate>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { PuCtList, PuCtBatchRemove, PuCtSubmit,contractResetContractMtStatus } from '@/api/projectManagement/contractManagement'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import FormUnitId from '@/views/components/form-unitId'
import relativeOperate from './components/relativeOperate'
export default {
  name: 'contractManagement',
  mixins: [indexMixin],
  components: { activitiAssignee, workFlowView, FormUnitId, relativeOperate },
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
    rowSetStyle(isProject){
      if(isProject === '0'){
        return 'span_red'
      }
      return ''
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
        // let search = data.search.filter(item => item.fieldCode != "isProject")
        // const isProjectSearch = data.search.filter(item => item.fieldCode == "isProject")
        // data.search = search.concat(isProjectSearch)
        this.property = data
      })
    },
    handleTopButtonDisabled(button) {
      return this.selection.some(row => this.handleButtonDisable(button, row))
    },
    handleButtonDisable(button, row) {
      if (['withdraw'].includes(button.buttonCode)) {
       return !['2'].includes(row.status)
      }
      if (button.buttonCode === 'delete' || button.buttonCode === 'update') {
        return row.status === '2' || row.status === '3'
      } else if (button.buttonCode === 'submit' && (['2', '3'].includes(row.status) || (row.isProject === '1' && !row.projectId))) {
        return true
      }else if(button.buttonCode === 'reject'){
        return row.status != '2'
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
      const objPush = {
        ctCode: () => {
          this.$router.push({ name: 'contractManagementOperate', query: { type: 'view', id: row.ctId } })
        },
        projectCode: () => {
          this.$router.push({ name: 'projectManagementOperate', query: { name: 'purchaseOrder', type: 'view', id: row.projectId } })
        }
      }
      objPush[code] && objPush[code]()
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
        this.$router.push({ name: 'contractManagementOperate', query: { type: buttonCode, id: rowArr[0].ctId } })
      } else if (buttonCode === 'delete') {
        this.$modal.confirm('是否确定删除?').then(() => {
          return PuCtBatchRemove({ ids: idArr })
        }).then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        }).catch(() => {
        })
      } else if (buttonCode === 'create') {
        this.$router.push({ name: 'contractManagementOperate', query: { type: buttonCode } })
      } else if (buttonCode === 'flowSee') {
        this.workFlowViewVisible = true
        this.selectedRow = { id: rowArr[0].ctId, businessId: rowArr[0].ctId }
      } else if (buttonCode === 'export') {
        this.$refs.exportList.init()
      } else if (buttonCode == 'submit') {
        this.ids = idArr
        this.handleSubmit(ACTIVITI_ASSUGNEE.PU_CT)
      } else if(buttonCode === 'withdraw') {
        this.handleWithdraw({businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.PU_CT,})
      } else if (buttonCode === 'reset') {
        this.$modal.confirm('是否重置合同状态?').then(() => {
          const orderIds = this.selection.map( (item) => item.ctId);
          this.handleReset(orderIds);
        }).catch((err) => {
          
        })
      }
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      PuCtList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    submitSuccess(ids) {
      this.ids = ids
      this.submitList()
    },
    //提交
    submit(assignee = '') {
        this.loading = true;
        PuCtSubmit({ids: this.ids, assignee: assignee}).then(({ success, data, message }) => {
            if (success) {
                this.$modal.msgSuccess('提交成功')
                this.getList()
            } else {
                this.$modal.msgError(message)
            }
        }).finally( () => {
            this.loading = false;
        })
    },
    handleFieldClick(key, value){
        if (key === 'relativeName') {
           this.$refs.relativeOperate.init()
        }
    },
    relativeOperateSelected(data, type){
        if(type == '1'){
            this.formData.relativeName = data.cuName;
        }else if(this.type == '2'){
            this.formData.relativeName = data.suName;
        }
    },
    handleReset(ids) {

      contractResetContractMtStatus(ids).then((res) => {
        this.$modal.msgSuccess('操作成功');
        this.getList();
      }).catch((err) => {
        
      })
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

.icon-size{
  width: 16px;
  height: 16px;
  margin-left: 4px;
  margin-right: 3.5px;
}
.span_red{
  color: red;
}
</style>

