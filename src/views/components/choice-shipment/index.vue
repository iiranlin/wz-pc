<template>
  <Dialog class="flex-dialog max-height-dialog" title="选择出货单" :visible.sync="visible" :close-on-click-modal="false"
    width="1300px">
    <div slot="title" class="el-dialog__title">
      选择出货单
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
          <el-form-item label="出货单号" prop="sourceCode" class="border-radius50">
            <el-input v-model="formData.sourceCode" placeholder="请输入出货单号" clearable @keyup.enter.native="searchData" />
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
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="规格型号" prop="matlType" class="border-radius50">
            <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目名称" prop="projectName" class="border-radius50">
            <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="合同名称" prop="ctName" class="border-radius50">
            <el-input v-model="formData.ctName" placeholder="请输入合同名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="客户名称" prop="cuName" class="border-radius50">
            <el-input v-model="formData.cuName" placeholder="请输入客户名称" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="发货人" prop="deliveryUser" class="border-radius50">
            <el-input v-model="formData.deliveryUser" placeholder="请输入发货人" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="收货人" prop="receiveUser" class="border-radius50">
            <el-input v-model="formData.receiveUser" placeholder="请输入收货人" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="收货电话" prop="receiveTel" class="border-radius50">
            <el-input v-model="formData.receiveTel" placeholder="请输入收货电话" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建日期" prop="createDate" class="border-radius50">
            <el-date-picker v-model="createDate" value-format="yyyy-MM-dd" type="daterange" style="width: 100%"
              range-separator="-" start-placeholder="起始日期" end-placeholder="截止日期">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="table-wrapper">
      <el-table ref="tableRef" :data="dataList" border height="100%" v-loading="loading" @row-click="rowClick"
        @sort-change="sortableColumnChange" @row-dblclick="dbClick" :row-style="changeDisabled"
        @selection-change="(data) => { selectData = data }" row-key="sourceDetailId">
        <el-table-column fixed="left" align="center" :selectable="isSelectable" :reserve-selection="true"
          key="selectable" type="selection" width="50" />
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="sourceCode" label="出货单号" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="left" show-overflow-tooltip min-width="170">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: 'saleShipmentMaintainOperate' })">{{
                row.sourceCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="sourceRowNum" label="出货单行号" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlCode" label="物料编码" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, id: row.matlId, refName: 'materialArchivesOperate' })">{{
                row.matlCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlType" label="规格型号" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="originalNum" label="出货数量" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="receiveUser" label="收货人" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="receiveTel" label="收货人电话" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="receiveAddress" label="收货地址" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="deliveryUser" label="发货人" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="deliveryTel" label="发货人电话" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="150">
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
        <el-table-column prop="cuCode" label="客户编码" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                row.cuCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="cuName" label="客户名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="createDate" label="创建日期" align="center" show-overflow-tooltip min-width="150">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
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
import { deliveryReturnQuoteList } from '@/api/prodmgr-sa/delivery'

export default {
  dicts: ['MeasureUnit'],
  mixins: [indexMixin, inMixin],
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
      visible: false,
      dialogParam: {},
      formData: {
        sourceCode: '',
        matlCode: '',
        matlName: '',
        matlType: '',
        projectName: '',
        ctName: '',
        cuName: '',
        deliveryUser: '',
        receiveUser: '',
        receiveTel: '',
        createDateStart: '',
        createDateEnd: '',
        unitName: '',
      },
      createDate: null,
      loading: false,
      tableData: [],
      total: 0,
      selectData: [],
      saleOrderDetails: []
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
    init(saleOrderDetails = []) {
      this.createDate = null
      this.saleOrderDetails = saleOrderDetails
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
      if (!this.selectData.length) {
        this.$message.warning('请选择订单')
        return
      }
      const sourceId = this.saleOrderDetails.length ? this.saleOrderDetails[0].sourceId : this.selectData[0].sourceId;
      const flag = this.selectData.some(item => item.sourceId != sourceId)
      if (flag) {
        this.$message.warning('只能选同一个主单的数据')
        return
      }
      this.$emit('change', this.selectData)
      this.visible = false
    },
    dbClick(row) {
      const flag = this.saleOrderDetails.some(item => item.sourceDetailId === row.sourceDetailId)
      if (flag) {
        this.$message.warning('此条数据已经添加')
        return
      }
      if (this.saleOrderDetails.length && row.sourceId != this.saleOrderDetails[0].sourceId) {
        this.$message.warning('只能选同一个主单的数据')
        return
      }
      this.$emit('change', [row])
      this.visible = false
    },
    rowClick(row) {
      const idList = this.saleOrderDetails.map((item) => item.sourceDetailId)
      if (idList.includes(row.sourceDetailId)) {
        return
      }
      // 多选选中行
      // 根据id判断当前点击的是否被选中
      const selected = this.selectData.some(item => item.sourceDetailId === row.sourceDetailId)
      if (!selected) {
        // 选择
        this.selectData.push(row)
        this.$refs.tableRef.toggleRowSelection(row, true)
      } else {
        // 取消
        var finalArr = this.selectData.filter((item) => {
          return item.sourceDetailId !== row.sourceDetailId
        })
        // 取消后剩余选中的
        this.selectData = finalArr
        this.$refs.tableRef.toggleRowSelection(row, false)
      }
    },
    // 查询物资
    getList() {
      const createDate = this.createDate
      if (createDate && createDate.length) {
        this.formData.createDateStart = createDate[0]
        this.formData.createDateEnd = createDate[1]
      } else {
        this.formData.createDateStart = ''
        this.formData.createDateEnd = ''
      }
      this.loading = true
      deliveryReturnQuoteList(Object.assign({}, this.formData, this.listQuery, this.propsFormData)).then(({ data }) => {
        this.tableData = data?.list || []
        this.dataList = data?.list || []
        this.total = data?.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    // 重置物资列表查询
    resetSearch() {
      this.$refs.elForm.resetFields()
      this.createDate = null
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

  .el-table {
    margin: 0;
  }
}
</style>