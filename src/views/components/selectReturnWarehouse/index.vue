<template>
  <Dialog tabindex='1' v-if="visible" class="flex-dialog max-height-dialog" title="选择数据" :visible.sync="visible"
    :close-on-click-modal="false" append-to-body width="1300px">
    <div slot="title" class="el-dialog__title">
      选择数据
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </div>
    </div>
    <el-form ref="elForm" :model="formData" label-width="110px">
      <el-row>
        <el-col :span="6">
          <el-form-item label="出库单号" prop="outCode" class="border-radius50">
            <el-input v-model="formData.outCode" placeholder="请输入出库单号" clearable @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="来源单号" prop="sourceCode" class="border-radius50">
            <el-input v-model="formData.sourceCode" placeholder="请输入来源单号" clearable @keyup.enter.native="searchData"
              :disabled="sourceCodeDisabled" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="所属组织" prop="unitName" class="border-radius50">
            <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
              :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
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
          <el-form-item label="出库负责人" prop="outUserName" class="border-radius50">
            <el-input v-model="formData.outUserName" placeholder="请输入出库负责人" clearable
              @keyup.enter.native="searchData" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建日期" prop="createDate" class="border-radius50">
            <el-date-picker v-model="formData.createDate" type="daterange" value-format="yyyy-MM-dd" range-separator="-"
              style="width:100%"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="table-wrapper">
      <el-table ref="tableRef" :data="tableData" border :row-key="rowKey" v-loading="loading" @row-click="rowClick"
        height="100%" :row-style="changeDisabled" @row-dblclick="dbClick" @selection-change="handleSelect"
        @sort-change="sortableColumnChange">
        <el-table-column fixed="left" align="center" key="selectable" :reserve-selection="true" type="selection"
          width="50" :selectable="isSelectable" />
        <el-table-column label="序号" align="center" type="index" :index="tableIndex" width="60" />
        <el-table-column label="出库来源" prop="outSource" key="outSource" sortable="custom" align="center"
          :show-overflow-tooltip="true" min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.outSource | orderTypeFilter(dict.type.outSource) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源单号" prop="sourceCode" key="sourceCode" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="center" :show-overflow-tooltip="true" min-width="180">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: refNameObj[row.outSource] })">
              {{ row.sourceCode }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="出库单号" prop="outCode" key="outCode" sortable="custom" :filters="[]"
          :render-header="(h, obj) => renderSpecNameHeader(h, obj, { fieldType: 'String', fieldFormatArr: [], fieldFormat: '' })"
          align="center" :show-overflow-tooltip="true" min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.outId, refName: 'outboundMaintenanceOperate' })">
              {{ row.outCode }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column label="物料编码" prop="matlCode" key="matlCode" :show-overflow-tooltip="true" align="center"
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
        <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" sortable="custom" align="center"
          :show-overflow-tooltip="true" min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="本次出库数量" prop="returnNum" key="returnNum" align="right" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="项目编码" prop="projectCode" key="projectCode" :show-overflow-tooltip="true" align="center"
          min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                row.projectCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="项目名称" prop="projectName" key="projectName" align="left" :show-overflow-tooltip="true"
          min-width="150" />
        <el-table-column label="出库负责人" prop="outUserName" key="outUserName" align="left" :show-overflow-tooltip="true"
          min-width="150" />
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
import { returnWarehouseList } from '@/api/warehouseManage/returnManage'
import { returnQuoteOutList } from '@/api/projectManagement/productionOrder'

export default {
  mixins: [indexMixin, inMixin],
  dicts: ['MeasureUnit', 'outSource'],
  components: {
    FormUnitId: () => import('@/views/components/form-unitId'),
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    rowKey: {
      type: String,
      default: 'outDetailId'
    },
    sourceCodeDisabled: {
      type: Boolean,
      default: false
    },
    propsFormData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      dialogParam: {},
      visible: false,
      formData: {
        outCode: '',
        sourceCode: '',
        matlCode: '',
        matlName: '',
        matlType: '',
        projectName: '',
        projectCode: '',
        outUserName: '',
        createDate: [],
        unitName: ''
      },

      loading: false,
      tableData: [],
      total: 0,
      selectData: [],
      saleOrderDetails: [],
      refNameObj: {
        '1': 'materialApplicationOperate',  //维修出库
        '2': 'createTransferOutOrder',  //调拨出库
        '3': 'scrapHandleOperate',  //报废出库
        '4': 'saleShipmentMaintainOperate',  //销售出库
        '5': 'createLendOrder',  //借出出库
        '6': 'materialApplicationOperate',  //用料申请出库
        '7': 'productionOrderOperate',  //领料出库
        '8': 'purchaseReturnOperate',  //退供出库
        '9': 'productionReceiveOperate',  //生产领料
      }
    }
  },
  methods: {
    changeDisabled({ row }) {
      const idList = this.saleOrderDetails.map((item) => item[this.rowKey])
      return idList.includes(row[this.rowKey]) ? {
        opacity: "0.5",
        pointerEvents: "none"
      } : {}
    },
    isSelectable(row) {
      const idList = this.saleOrderDetails.map((item) => item[this.rowKey])
      return !idList.includes(row[this.rowKey])
    },
    init(detailsList = []) {
      this.saleOrderDetails = detailsList
      this.visible = true;
      this.selectData = []
      if (this.propsFormData) {
        this.formData = Object.assign({}, this.formData, this.propsFormData)
      }
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
        this.$message.warning('请选择出库单')
        return
      }
      // if (this.selectData.length > 1) {
      //   this.$message.warning('只能选择一条数据')
      //   return
      // }
      const unitId = this.selectData[0].unitId
      const flag = this.selectData.some(item => item.unitId != unitId)
      if (flag) {
        this.$message.warning('只能选择同一个所属组织的数据')
        return
      }
      const projectId = this.selectData[0].projectId
      const flagA = this.selectData.some(item => item.projectId != projectId)
      if (flagA) {
        this.$message.warning('只能选择同一个项目的数据')
        return
      }
      const outCode = this.selectData[0].outCode
      const flagB = this.selectData.some(item => item.outCode != outCode)
      if (flagB) {
        this.$message.warning('只能选择同一个出库单的数据')
        return
      }
      this.$emit('change', this.selectData)
      this.visible = false
    },
    // 物资列表双击添加
    dbClick(row) {
      const flag = this.saleOrderDetails.some(item => item[this.rowKey] === row[this.rowKey])
      if (flag) {
        this.$message.warning('此条数据已经添加')
        return
      }
      this.$emit('change', [row])
      this.visible = false
    },
    rowClick(row) {
      // 多选选中行
      const idList = this.saleOrderDetails.map((item) => item[this.rowKey])
      if (idList.includes(row[this.rowKey])) {
        return
      }
      // 根据id判断当前点击的是否被选中
      const selected = this.selectData.some(item => item[this.rowKey] === row[this.rowKey])
      if (!selected) {
        // 选择
        this.selectData.push(row)
        this.$refs.tableRef.toggleRowSelection(row, true);
      } else {
        // 取消
        var finalArr = this.selectData.filter((item) => {
          return item[this.rowKey] !== row[this.rowKey]
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
      const api = { productionRejected: returnQuoteOutList }[this.type] || returnWarehouseList

      api(Object.assign({}, this.formData, this.listQuery, timeObj, { createDate: null })).then(({ data }) => {
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