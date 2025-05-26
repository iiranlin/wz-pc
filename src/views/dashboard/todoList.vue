<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single"
      @newButton="newButton"></button-top>
    <form-data ref="formData" :showSearch="showSearch" :formData="formData" :searchArr="property.search || []"
      @handleQuery="handleQuery" @handleResetField="handleResetField" />
    <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
      :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
      @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
      @cleanClick="cleanClick"></right-toolbar>
    <table-index ref="tableIndex" :loading="loading" idName="businessId" :tableData="dataList" :property="property"
      :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
      @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
    </table-index>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
  </div>
</template>

<script>
import mixins from '@/views/mixins'
import workFlowView from '@/components/workFlowView'
import { auditList } from '@/api/system/workflow'
import { FLOW_ROUTE } from '@/utils/constant'
import { menuConfig } from '@/utils'
export default {
  name: "todoList",
  mixins: [mixins],
  components: {
    workFlowView
  },
  data() {
    return {
      formDataClick: {},
      //是否展示序号
      numberShow: false,
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
      dataList: [],
      // 弹出层标题
      title: "",
      //列表显示字段
      property: {},
      // 查询参数
      formData: {},
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 30,
      },
      // 勾选的数据
      selected: [],
      // 按钮状态
      disableFields: {},
      // 勾选的id
      ids: [],
      statusMap: {},
      workFlowViewVisible: false,
      selectedRow: null
    }
  },
  created() {
    this.menuProperty()
  },
  mounted() { },
  methods: {
    // 获取页面的属性
    menuProperty() {
      let id = menuConfig.MENU_EVENT_FQ;
      this.$store.dispatch('menuProperty', id).then((data) => {
        this.listQuery.pageSize = data.defaultPageSize || 30
        this.property = data;
      }).finally(() => {
      });
    },
    // 展示序号
    numberChange(val) {
      this.numberShow = val
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange(columns) {
      this.$refs.tableIndex.init(columns)
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
    // 节点单击事件
    handleNodeClick(data) {
      this.handleQuery()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      for (let key in this.formData) {
        this.formData[key] = null
      }
      this.handleQuery()
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery()
    },
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row)
      // this.setCacheParams()
      this.formDataClick = Object.assign({}, this.formData, row);
      this.getList()
    },
    handleSelectionChange(ids, single, multiple, selected) {
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selected = selected
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      if (buttonCode == 'flowSee') {
        this.workFlowViewVisible = true
        this.selectedRow = rowArr[0]
      }
    },
    clickReset() {
      this.handleQuery()
    },
    // 获取流程列表数据
    getList() {
      this.loading = true
      auditList({...this.listQuery,...this.formData}).then((res) => {
        this.loading = false
        if (res.success && Array.isArray(res.data.list)) {
          let { list, total } = res.data
          this.dataList = list
          this.total = total
        } else {
          this.dataList = []
          this.total = 0
        }
      })
    },
    clickLink(row) {
      const name = FLOW_ROUTE[row.businessType];
      this.$router.push({ name, query: { type: 'view', id: row.businessId, name: 'handle' } });
    },
  },
}
</script>
<style lang="scss">
::v-deep {
  .el-button.is-disabled {
    -webkit-filter: none;
    color: none;
  }
}
</style>