<template>
  <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择销售订单" :visible.sync="visible"
    :close-on-click-modal="false" append-to-body width="1300px">
    <div slot="title" class="el-dialog__title">
      选择销售订单
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>
    <el-form ref="elForm" :model="formData" label-width="110px">
      <el-row>
        <el-col :span="6">
          <el-form-item label="所属组织" prop="unitName" class="border-radius50">
            <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
              :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="订单单号" prop="sourceCode" class="border-radius50">
            <el-input v-model="formData.sourceCode" placeholder="请输入订单单号" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
            <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="物料名称" prop="matlName" class="border-radius50">
            <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="规格型号" prop="matlType" class="border-radius50">
            <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目编码" prop="projectCode" class="border-radius50">
            <el-input v-model="formData.projectCode" placeholder="请输入项目编码" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目名称" prop="projectName" class="border-radius50">
            <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="客户编码" prop="cuCode" class="border-radius50">
            <el-input v-model="formData.cuCode" placeholder="请输入客户编码" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="客户名称" prop="cuName" class="border-radius50">
            <el-input v-model="formData.cuName" placeholder="请输入客户名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="合同编码" prop="contractCode" class="border-radius50">
            <el-input v-model="formData.contractCode" placeholder="请输入合同编码" clearable
              @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="合同名称" prop="contractName" class="border-radius50">
            <el-input v-model="formData.contractName" placeholder="请输入合同名称" clearable
              @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="销售部门" prop="saleDeptName" class="border-radius50">
            <el-input v-model="formData.saleDeptName" placeholder="请输入销售部门" clearable
              @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="销售负责人" prop="saleName" class="border-radius50">
            <el-input v-model="formData.saleName" placeholder="请输入销售负责人" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="计划属性" prop="planAttribute" class="custom-form-item">
            <el-select class="select-box" v-model="formData.planAttribute" placeholder="请选择计划属性" style="width:100%" size="small">
              <el-option v-for="(item, key) in dict.type.planAttribute" :key="key" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建日期" prop="createDate" class="border-radius50">
            <el-date-picker v-model="formData.createDate" type="daterange" value-format="yyyy-MM-dd" range-separator="-"
              style="width:100% !important"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="table-wrapper">
      <el-table ref="tableRef" :data="tableData" border row-key="sourceDetailId" v-loading="loading"
        @row-click="rowClick" height="100%" :row-style="changeDisabled" @row-dblclick="dbClick"
        @selection-change="handleSelect" @sort-change="sortableColumnChange">
        <el-table-column fixed="left" align="center" key="selectable" :reserve-selection="true" type="selection"
          width="50" :selectable="isSelectable" />
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <el-table-column v-if="propsFormData.unitId" prop="unitName" label="所属组织" align="left" show-overflow-tooltip
          min-width="150" />
        <el-table-column label="订单单号" prop="sourceCode" key="sourceCode" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="left" :show-overflow-tooltip="true" min-width="180">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: 'saleOrderOperate' })">
              {{ row.sourceCode }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="订单行号" prop="rowNum" key="rowNum" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="left" :show-overflow-tooltip="true" min-width="150" />
        <el-table-column label="物料编码" prop="matlCode" key="matlCode" :show-overflow-tooltip="true" align="left"
          min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">
              {{ row.matlCode }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="物料名称" prop="matlName" key="matlName" sortable="custom" align="left"
          :show-overflow-tooltip="true" min-width="150" />
        <el-table-column label="规格型号" prop="matlType" key="matlType" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="left" :show-overflow-tooltip="true" min-width="150" />
        <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" sortable="custom" align="left"
          :show-overflow-tooltip="true" min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="计划属性" prop="planAttribute" key="planAttribute"
            align="center" :show-overflow-tooltip="true" min-width="150">
            <template slot-scope="{row}">
              <span :class="'planAttribute-' + row.planAttribute">{{ row.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="需求数量" prop="demandNum" key="demandNum" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="需求日期" prop="arriveDate" key="arriveDate" align="center" :show-overflow-tooltip="true"
          min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.arriveDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单价(含税,单位:元)" prop="taxPrice" key="taxPrice" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="税率(%)" prop="taxRate" key="taxRate" align="left" :show-overflow-tooltip="true"
          min-width="180" />
        <el-table-column label="总金额(不含税,单位:元)" prop="amount" key="amount" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="总金额(含税,单位:元)" prop="taxAmount" key="taxAmount" align="left"
          :show-overflow-tooltip="true" min-width="150" />
        <el-table-column label="项目编码" prop="projectCode" key="projectCode" :show-overflow-tooltip="true" align="left"
          min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                row.projectCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="项目名称" prop="projectName" key="projectName" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="合同编码" prop="contractCode" key="contractCode" :show-overflow-tooltip="true" align="left"
          min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.contractId, refName: 'contractManagementOperate' })">{{
                row.contractCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="合同名称" prop="contractName" key="contractName" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="客户编码" prop="cuCode" key="cuCode" :show-overflow-tooltip="true" align="left"
          min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                row.cuCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="客户名称" prop="cuName" key="cuName" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="销售部门" prop="saleDeptName" key="saleDeptName" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="销售负责人" prop="saleName" key="saleName" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="单据日期" prop="receiptDate" key="receiptDate" align="center" :show-overflow-tooltip="true"
          min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.receiptDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" prop="createDate" key="createDate" align="center" :show-overflow-tooltip="true"
          min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.createDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />

    <template #footer>
      <el-button plain round type="primary" @click="saveSelection" v-preventReClick>确定</el-button>
      <el-button plain round @click.native="visible = false">取消</el-button>
    </template>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { saleOrderPurPlanQuoteList } from '@/api/saleManage/saleOrder'

export default {
  mixins: [indexMixin, inMixin],
  dicts: ['MeasureUnit', 'planAttribute'],
  components: {
    FormUnitId: () => import('@/views/components/form-unitId'),
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    propsFormData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogParam: {},
      visible: false,
      formData: {
        sourceCode: '',
        matlCode: '',
        matlName: '',
        matlType: '',
        projectName: '',
        projectCode: '',
        cuCode: '',
        cuName: '',
        contractCode: '',
        contractName: '',
        saleDeptName: '',
        saleName: '',
        createDate: [],
        unitName: '',
        planAttribute: '2'
      },
      loading: false,
      tableData: [],
      total: 0,
      selectData: [],
      saleOrderDetails: [],
    }
  },
  methods: {
    changeDisabled({ row }) {
      const idList = this.saleOrderDetails.map((item) => item.sourceDetailId)
      return idList.includes(row.sourceDetailId) ? {
        opacity: "0.5",
        pointerEvents: "none"
      } : {}
    },
    isSelectable(row) {
      const idList = this.saleOrderDetails.map((item) => item.sourceDetailId)
      return !idList.includes(row.sourceDetailId)
    },
    init(detailsList = []) {
      this.saleOrderDetails = detailsList
      this.visible = true;
      this.selectData = []
      this.$nextTick(() => {
        this.$refs.elForm.resetFields()
        this.tableData = []
        this.listQuery.pageNum = 1
        this.listQuery.pageSize = 30
        this.getList()
      })
    },
    handleSelect(selectData) {
      this.selectData = selectData;
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 保存选择
    saveSelection() {
      if (!this.selectData.length) {
        this.$message.warning('请选择销售订单')
        return
      }
      this.$emit('change', this.selectData)
      this.visible = false
    },
    // 物资列表双击添加
    dbClick(row) {
      const flag = this.saleOrderDetails.some(item => item.sourceDetailId === row.sourceDetailId)
      if (flag) {
        this.$message.warning('此条数据已经添加')
        return
      }
      this.$emit('change', [row])
      this.visible = false
    },
    rowClick(row) {
      // 多选选中行
      const idList = this.saleOrderDetails.map((item) => item.sourceDetailId)
      if (idList.includes(row.sourceDetailId)) {
        return
      }
      // 根据id判断当前点击的是否被选中
      const selected = this.selectData.some(item => item.sourceDetailId === row.sourceDetailId)
      if (!selected) {
        // 选择
        this.selectData.push(row)
        this.$refs.tableRef.toggleRowSelection(row, true);
      } else {
        // 取消
        var finalArr = this.selectData.filter((item) => {
          return item.sourceDetailId !== row.sourceDetailId
        })
        // 取消后剩余选中的
        this.selectData = finalArr
        this.$refs.tableRef.toggleRowSelection(row, false);
      }
    },
    // 查询物资
    getList() {
      this.loading = true
      const createDate = this.formData.createDate || []
      const timeObj = {}
      if (!!createDate.length) {
        timeObj.createDateStart = createDate[0]
        timeObj.createDateEnd = createDate[1]
      }
      saleOrderPurPlanQuoteList(Object.assign({}, this.formData, this.listQuery, timeObj, this.propsFormData)).then(({ data }) => {
        this.tableData = data?.list || []
        this.total = data?.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    // 重置物资列表查询
    resetSearch() {
      this.$refs.elForm.resetFields()
      this.getList()
    },
    emitAblFilter() {
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 1;
}
</style>