<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
                :button-disable="handleTopButtonDisabled"
    ></button-top>
    <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
               @handleQuery="handleQuery" @handleResetField="handleResetField" @fieldClick="handleFieldClick"
    >
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
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
                    @pagination="getList"
        />
      </el-col>
    </el-row>
    <relative-operate ref="relativeOperate" @relativeOperateSelected="relativeOperateSelected"></relative-operate>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { PuCtQqueryList } from '@/api/projectManagement/contractManagement'
import FormUnitId from '@/views/components/form-unitId'
import relativeOperate from '@/views/purchasingManagement/projectManagement/contractManagement/components/relativeOperate'

export default {
  name: 'contractManagementQuery',
  mixins: [indexMixin],
  components: { FormUnitId,relativeOperate },
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
      formData: {
        relativeName:'',
      },
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
    clickLink(row) {
      this.$router.push({ name: 'contractManagementOperate', query: { type: 'view', id: row.ctId, isQuery: 'query' } })
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
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      PuCtQqueryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
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
        }else if(type == '2'){
            this.formData.relativeName = data.suName;
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

.icon-size{
  width: 16px;
  height: 16px;
  margin-left: 4px;
  margin-right: 3.5px;
}
</style>

