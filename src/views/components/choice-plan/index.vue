<template>
  <Dialog :title="title" class="max-height-dialog flex-dialog" :visible.sync="openDataScope" tabindex="1"
    :close-on-click-modal="false" width="1300px" append-to-body v-dialogFullScreen>
    <div slot="title" class="el-dialog__title">
      {{ title }}
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </div>
    </div>
    <div class="app-container">
      <el-row type="flex" class="container_h">
        <el-col :span="24" :xs="24" class="container_flex">
          <el-form :model="formData" ref="queryForm" size="small" label-width="98px">
            <el-col :span="6">
              <el-form-item label="计划单号" prop="sourcePlanCode" class="border-radius50">
                <el-input v-model="formData.sourcePlanCode" placeholder="请输入计划单号" clearable
                  @keyup.enter.native="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
                <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable
                  @keyup.enter.native="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="物料名称" prop="matlName" class="border-radius50">
                <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable
                  @keyup.enter.native="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="规格型号" prop="matlType" class="border-radius50">
                <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                  @keyup.enter.native="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="项目名称" prop="sourceProjectName" class="border-radius50">
                <el-input v-model="formData.sourceProjectName" placeholder="请输入项目名称" clearable
                  @keyup.enter.native="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="客户名称" prop="cuName" class="border-radius50">
                <el-input v-model="formData.cuName" placeholder="请输入客户名称" clearable @keyup.enter.native="handleQuery" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="计划开始日期" prop="planStartDate" class="border-radius50">
                <el-date-picker v-model="formData.planStartDate" type="daterange" placeholder="请选择计划开始日期"
                  value-format="yyyy-MM-dd" range-separator="-" style="width: 100%"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-form>
          <el-table ref="tableRef" class="container_table" v-loading="loading" border row-key="sourcePlanCode"
            v-if="openDataScope" :data="dataList" height="100%" @row-click="rowClick" @row-dblclick="dbClick"
            :row-style="changeDisabled" @selection-change="handleSelect" :tree-props="{ children: 'rows' }">
            <el-table-column align="center" width="50" v-if="singleMode" key="radio">
              <template v-slot="{ row }">
                <el-radio v-model="selectDataRow" :label="row.matlCode" class="table-radio"></el-radio>
              </template>
            </el-table-column>
            <el-table-column v-else align="center" :selectable="isSelectable" key="selectable" :reserve-selection="true"
              type="selection" width="50" />
            <el-table-column label="计划单号" prop="sourcePlanCode" :show-overflow-tooltip="true" align="center"
              min-width="150">
              <template slot-scope="{row}">
                <el-button type="text" size="small"
                  @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourcePlanId, refName: 'demandPlanWorkbenchOperate' })">{{
                    row.sourcePlanCode }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="物料编码" prop="matlCode" :show-overflow-tooltip="true" align="center" min-width="150">
              <template slot-scope="{row}">
                <el-button type="text" size="small"
                  @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                  row.matlCode }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="物料名称" prop="matlName" align="left" :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="规格型号" prop="matlType" align="left" :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="计量单位" prop="matlUnit" align="center" :show-overflow-tooltip="true" min-width="150">
              <template slot-scope="{row}">
                <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="计划数量" prop="planNum" align="right" :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="计划开始日期" prop="planStartDate" align="center" :show-overflow-tooltip="true"
              min-width="150" />
            <el-table-column label="计划完成日期" prop="planEndDate" align="center" :show-overflow-tooltip="true"
              min-width="150" />
            <el-table-column label="来源项目编码" prop="sourceProjectCode" align="center" :show-overflow-tooltip="true"
              min-width="150">
              <template slot-scope="{row}">
                <el-button type="text" size="small"
                  @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceProjectId, refName: 'projectManagementOperate' })">{{
                    row.sourceProjectCode }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="来源项目名称" prop="sourceProjectName" align="left" :show-overflow-tooltip="true"
              min-width="150" />
            <el-table-column label="来源需求类型" prop="sourceType" align="center" :show-overflow-tooltip="true"
              min-width="150">
              <template slot-scope="{row}">
                <span>{{ row.sourceType | orderTypeFilter(dict.type.demandPlanSourceType) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="来源需求单号" prop="sourceCode" align="center" :show-overflow-tooltip="true"
              min-width="150" />
            <el-table-column label="来源需求行号" prop="rawNo" align="center" :show-overflow-tooltip="true" min-width="150" />
            <el-table-column label="客户编码" prop="cuCode" align="center" :show-overflow-tooltip="true" min-width="150">
              <template slot-scope="{row}">
                <el-button type="text" size="small"
                  @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                  row.cuCode }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="客户名称" prop="cuName" align="left" :show-overflow-tooltip="true" min-width="150" />
          </el-table>
          <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button plain round type="primary" @click="handleClick" v-preventReClick>确 定</el-button>
      <el-button plain round @click="openDataScope = false">取 消</el-button>
    </div>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>
import { classTree } from '@/api/prodmgr-mm/matlClass'
import { produceQuoteListForOrder } from '@/api/prodmgr-mm/demandPlan'
import indexMixin from '@/views/mixins';
import moment from 'moment';
export default {
  mixins: [indexMixin],
  dicts: ['MeasureUnit', 'demandPlanSourceType'],
  components: {
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    singleMode: {
      type: Boolean,
      required: false,
      default: false
    },
    isLend: {
      type: Boolean,
      required: false,
      default: false
    },
    isPlan: {
      type: Boolean,
      required: false,
      default: false
    },
    unitId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      title: '选择计划单',
      openDataScope: false,
      treeLoading: false,
      loading: false,
      // 部门树选项
      defaultProps: {
        children: 'children',
        label: 'matlClassifyName'
      },
      formData: {
        matlCode: '',
        matlName: '',
        matlType: '',
        bizStatus: '0',
        matlClassifyId: '',
        sourcePlanCode: '',
        planStartDate: null,
        cuName: '',
        sourceProjectName: ''
      },
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 30
      },
      dataList: [],
      treeCurrentKey: '',
      filterText: '',
      selectData: [],
      saleOrderDetails: [],
      selectDataRow: null,
      matlCodeArr: [],
      selected: [],
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  mounted() {
  },
  methods: {
    changeDisabled({ row }) {
      const idList = this.selected.map((item) => item.sourceCode)
      return idList.includes(row.sourceCode) ? {
        opacity: "0.5",
        pointerEvents: "none"
      } : {}
    },
    isSelectable(row) {
      const idList = this.selected.map((item) => item.sourceCode)
      return !idList.includes(row.sourceCode)
    },
    filterNode(value, data) {
      if (!value) return true
      return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1
    },
    init(id = null, saleOrderDetails = [], matlCodeArr = []) {
      this.selectData = []
      this.saleOrderDetails = []
      this.selectDataRow = null
      this.openDataScope = true
      this.matlCodeArr = matlCodeArr
      this.selected = matlCodeArr
      this.$nextTick(() => {
        this.$refs.queryForm.resetFields()
        if (this.singleMode) {
          this.selectDataRow = id
        } else {
          this.saleOrderDetails = saleOrderDetails
        }
        this.getList()
      })
    },

    async getList() {
      try {
        this.loading = true
        const timeTemp = {}
        if (Array.isArray(this.formData.planStartDate) && !!this.formData.planStartDate.length) {
          timeTemp.planStartDateStart = this.formData.planStartDate[0]
          timeTemp.planStartDateEnd = this.formData.planStartDate[1]
        }
        const param = Object.assign({}, this.listQuery, this.formData, timeTemp, { planAttribute: 1, unitId: this.unitId })
        delete param.planStartDate
        const { data } = await produceQuoteListForOrder(param)
        this.dataList = data.list.map(({ planEndDate = '', planStartDate = '', ...other }) => ({
          ...other,
          planEndDate: planEndDate ? moment(planEndDate).format("YYYY-MM-DD") : '',
          planStartDate: planStartDate ? moment(planStartDate).format("YYYY-MM-DD") : '',
        }))
        this.total = data.total || data.list.length
        this.loading = false
        // if (this.matlCodeArr.length) {
        //   const selectRowIdGroup = this.matlCodeArr.map(item => item.matlCode)
        //   this.dataList.forEach(item => {
        //     if (selectRowIdGroup.includes(item.matlCode)) {
        //       this.$refs.tableRef.toggleRowSelection(item)
        //     }
        //   })
        // }
      } catch (err) {

      } finally {
        this.loading = false
      }

    },
    handleSelect(selectData) {
      this.selectData = selectData
    },
    rowClick(row) {
      if (this.singleMode) {
        // 单选选中行
        this.selectDataRow = row.sourceCode
      } else {
        if (this.matlCodeArr.includes(row.sourceCode)) {
          return false
        }
        const idList = this.saleOrderDetails.map((item) => item.sourceCode)
        if (idList.includes(row.sourceCode)) {
          return
        }
        // 多选选中行
        // 根据id判断当前点击的是否被选中
        const selected = this.selectData.some(item => item.sourceCode === row.sourceCode)
        if (!selected) {
          // 选择
          this.selectData.push(row)
          this.$refs.tableRef.toggleRowSelection(row, true)
        } else {
          // 取消
          var finalArr = this.selectData.filter((item) => {
            return item.sourceCode !== row.sourceCode
          })
          // 取消后剩余选中的
          this.selectData = finalArr
          this.$refs.tableRef.toggleRowSelection(row, false)
        }
      }
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleClick() {
      if (this.singleMode) {
        if (this.selectDataRow == null) {
          this.$message.warning('请选择物料')
          return
        }
        const data = this.dataList.find(item => item.sourceCode === this.selectDataRow)
        this.$emit('change', data)
      } else {
        if (!this.selectData.length) {
          this.$message.warning('请选择物料')
          return
        }
        this.$emit('change', this.selectData)
      }
      this.openDataScope = false
    },
    dbClick(row) {
      if (!this.singleMode) {
        const flag = this.saleOrderDetails.some(item => item.sourceCode === row.sourceCode)
        if (flag) {
          this.$message.warning('此条数据已经添加')
          return
        }
      }
      this.$emit('change', this.singleMode ? row : [row])
      this.openDataScope = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%;

  .container_flex_overflow {
    width: 210px;
  }
}
</style>
