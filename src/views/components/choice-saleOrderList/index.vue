<template>
  <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择需求" :visible.sync="visible"
    :close-on-click-modal="false" append-to-body width="1300px">
    <div slot="title" class="el-dialog__title">
      选择需求
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>
    <el-form ref="elForm" :model="formData" label-width="90px">
      <el-row>
        <el-col :span="6">
          <el-form-item label="采购单号" prop="purCode">
            <el-input v-model="formData.purCode" placeholder="请输入采购单号" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="采购名称" prop="purName">
            <el-input v-model="formData.purName" placeholder="请输入采购名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="采购方式" prop="purType">
            <el-select v-model="formData.purType" placeholder="请选择采购方式" style="width: 100%">
              <el-option v-for="item in dict.type.purchaseMode" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="物料编码" prop="matlCode">
            <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="物料名称" prop="matlName">
            <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="规格型号" prop="matlType">
            <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="业务状态" prop="bizStatus">
            <el-select v-model="formData.bizStatus" placeholder="请选择业务状态" style="width: 100%">
              <el-option v-for="item in orderBizStatus(dict.type.orderBizStatus)" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="合同名称" prop="ctName">
            <el-input v-model="formData.ctName" placeholder="请输入合同名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="供应商名称" prop="suName">
            <el-input v-model="formData.suName" placeholder="请输入供应商名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="采购负责人" prop="purUserName">
            <el-input v-model="formData.purUserName" placeholder="请输入采购负责人" clearable
              @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建方式" prop="sourceType">
            <el-select v-model="formData.sourceType" placeholder="请选择创建方式" style="width: 100%">
              <el-option v-for="item in dict.type.purOrderSourceType" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="单据日期" prop="receiptDate">
            <el-date-picker v-model="formData.receiptDate" type="daterange" value-format="yyyy-MM-dd"
              range-separator="-" style="width: 100%"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建日期" prop="createDate">
            <el-date-picker v-model="formData.createDate" type="daterange" value-format="yyyy-MM-dd" range-separator="-"
              style="width: 100%"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="table-wrapper">
      <el-table ref="tableRef" row-key="sourceDetailId" :data="tableData" border height="100%" v-loading="loading"
        @row-dblclick="dbClick">
        <el-table-column align="center" width="50">
          <template v-slot="{ row }">
            <el-radio v-model="selectRow" :label="row" class="table-radio"></el-radio>
          </template>
        </el-table-column>
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <el-table-column prop="sourceType" label="创建方式" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.sourceType | orderTypeFilter(dict.type.purOrderSourceType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purCode" label="采购单号" align="left" show-overflow-tooltip min-width="160">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.purOrderId, refName: 'purchaseOrderOperate' })">{{
                row.purCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="rowNum" label="采购行号" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                row.matlCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purNum" label="本次采购数量" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="inNum" label="已入库完成数量(累计)" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="status" label="审核状态" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.status | orderTypeFilter(dict.type.flowStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bizStatus" label="业务状态" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.bizStatus | orderTypeFilter(dict.type.orderBizStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="170">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                row.projectCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="ctCode" label="合同编码" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.ctId, refName: 'contractManagementOperate' })">{{
                row.ctCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="ctName" label="合同名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="suCode" label="供应商编码" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.suId, refName: 'supplierOperate' })">{{
                row.suCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="suName" label="供应商名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="price" label="单价(不含税)" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="taxRate" label="税率(%)" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="taxAmount" label="总金额(含税)" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="amount" label="总金额(不含税)" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="arriveDate" label="预计到货日期" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.arriveDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purName" label="采购名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="purType" label="采购方式" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.purType | orderTypeFilter(dict.type.purchaseMode) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purDeptName" label="采购部门" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="purUserName" label="采购负责人" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="receiptDate" label="单据日期" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ parseTime(row.receiptDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createUserName" label="创建人" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="createDate" label="创建时间" align="center" show-overflow-tooltip min-width="150">
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
import { orderListByRefund } from '@/api/prodmgr-pu/order'

export default {
  mixins: [indexMixin],
  dicts: ['purchaseMode', 'MeasureUnit', 'purOrderSourceType', 'orderBizStatus', 'flowStatus'],
  components: {
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
      visible: false,
      formData: {
        purCode: '',
        purName: '',
        purType: '',
        matlCode: '',
        matlName: '',
        matlType: '',
        bizStatus: '',
        projectName: '',
        ctName: '',
        suName: '',
        purUserName: '',
        sourceType: '',
        receiptDate: null,
        createDate: null
      },
      loading: false,
      tableData: [],
      total: 0,
      selectRow: null
    }
  },
  methods: {
    orderBizStatus(list) {
      return list.filter(item => item.value != '1')
    },
    init() {
      this.selectRow = null
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.elForm.resetFields()
        this.tableData = []
        this.listQuery.pageNum = 1
        this.listQuery.pageSize = 30
        this.getList()
      })
    },
    searchData() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    // 保存选择
    saveSelection() {
      if (!this.selectRow) {
        this.$message.warning('请选择需求')
        return
      }
      this.$emit('change', this.selectRow)
      this.visible = false
    },
    // 物资列表双击添加
    dbClick(row) {
      this.$emit('change', row)
      this.visible = false
    },
    // 查询物资
    getList() {
      this.loading = true
      const receiptDate = this.formData.receiptDate || []
      const createDate = this.formData.createDate || []
      orderListByRefund(Object.assign({}, this.formData, this.listQuery, this.propsFormData, {
        receiptDateStart: receiptDate[0] || '', receiptDateEnd: receiptDate[1] || '', receiptDate: null,
        createDateStart: createDate[0] || '', createDateEnd: createDate[1] || '', createDate: null,
      })).then(({ data }) => {
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
    }
  }
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 1;
}
</style>