<template>
  <Dialog class="flex-dialog max-height-dialog" :visible.sync="openDataScope" width="80%" :close-on-click-modal="false"
    append-to-body>
    <div slot="title" class="el-dialog__title">
      {{ title }}
      <div class="flex-dialog-button">
        <el-button plain round class="search-btn" type="primary" @click="handleQuery">查询</el-button>
        <el-button plain round class="search-btn" @click="handleReset">重置</el-button>
      </div>
    </div>
    <el-form ref="elForm" :model="formData" label-width="100px">
      <el-row>
        <el-col :span="6">
          <el-form-item label="所属组织:" class="custom-form-item">
            <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
              :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" :appendToBody="false" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="来源单号:" class="custom-form-item">
            <el-input class="border-radius50" size="small" placeholder="请输入来源单号" clearable v-model="formData.sourceCode"
              @keyup.enter.native="handleQuery"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="物料编码:" class="custom-form-item">
            <el-input class="border-radius50" size="small" placeholder="请输入物料编码" clearable v-model="formData.matlCode"
              @keyup.enter.native="handleQuery"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="物料名称:" class="custom-form-item">
            <el-input class="border-radius50" size="small" placeholder="请输入物料名称" clearable v-model="formData.matlName"
              @keyup.enter.native="handleQuery"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="规格型号:" class="custom-form-item">
            <el-input class="border-radius50" size="small" placeholder="请输入规格型号" clearable v-model="formData.matlType"
              @keyup.enter.native="handleQuery"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目编码:" class="custom-form-item">
            <el-input class="border-radius50" size="small" placeholder="请输入项目编码" clearable
              v-model="formData.projectCode" @keyup.enter.native="handleQuery"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目名称:" class="custom-form-item">
            <el-input class="border-radius50" size="small" placeholder="请输入项目名称" clearable
              v-model="formData.projectName" @keyup.enter.native="handleQuery"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建人:" class="custom-form-item">
            <el-input class="border-radius50" size="small" placeholder="请输入创建人" clearable
              v-model="formData.createUserName" @keyup.enter.native="handleQuery"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建日期:" class="custom-form-item">
            <el-date-picker size="small" v-model="formData.createDate" type="daterange" value-format="yyyy-MM-dd"
              range-separator="-" style="width:100% !important"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-table v-loading="loading" ref="multipleTable" border :row-key="idName" :data="tableData" height="100%"
      @row-dblclick="rowClick" @row-click="rowClick" @selection-change="handleSelectionChange">
      <el-table-column fixed="left" align="center" width="50" v-if="singleMode" key="radio">
        <template v-slot="{ row }">
          <el-radio v-model="selectDataRow" :label="row.sourceDetailId" class="table-radio"></el-radio>
        </template>
      </el-table-column>
      <el-table-column v-else fixed="left" align="center" :selectable="selectable" :reserve-selection="true"
        type="selection" width="55"></el-table-column>
      <el-table-column label="序号" align="left" type="index" width="50" />
      <el-table-column label="来源单号" align="left" prop="sourceCode" min-width="200">
        <template slot-scope="{row}">
          <el-button type="text"
            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: refNameObj[outSource] })">{{
              row.sourceCode }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="来源行号" align="left" prop="sourceRowNum" :show-overflow-tooltip="true"
        min-width="120"></el-table-column>
      <el-table-column label="物料编码" align="left" prop="matlCode" :show-overflow-tooltip="true" min-width="150">
        <template slot-scope="{row}">
          <el-button type="text" size="small"
            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
              row.matlCode }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="物料名称" align="left" prop="matlName" min-width="200">
      </el-table-column>
      <el-table-column label="规格型号" align="left" prop="matlType" min-width="150"></el-table-column>
      <el-table-column label="计量单位" align="left" prop="matlUnit" min-width="150">
        <template slot-scope="{row}">
          <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单据原量" align="left" prop="originalNum" min-width="150"></el-table-column>
      <el-table-column label="已出库数量" align="left" prop="totalOutNum" min-width="150"></el-table-column>
      <el-table-column label="库存数量" align="left" prop="inventoryNum" min-width="150"></el-table-column>
      <!-- <el-table-column label="可支配数量" align="center" prop="outNum" min-width="150"></el-table-column> -->
      <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
      <el-table-column label="项目编码" align="left" prop="projectCode" min-width="150">
        <template slot-scope="{row}">
          <el-button type="text" size="small"
            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
              row.projectCode }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="项目名称" align="left" prop="projectName" min-width="150"></el-table-column>
      <el-table-column prop="createUserName" label="创建人" align="left" show-overflow-tooltip min-width="150" />
      <el-table-column prop="createDate" label="创建日期" align="left" show-overflow-tooltip min-width="150">
        <template slot-scope="{row}">
          <span>{{ parseTime(row.createDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />
    <div slot="footer" class="dialog-footer">
      <el-button plain round type="primary" @click="submitDataScope">确 定</el-button>
      <el-button plain round @click="openDataScope = false">取 消</el-button>
    </div>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
import FormUnitId from '@/views/components/form-unitId'
import { outQuoteList, warehouseLendOutQuoteList } from '@/api/warehouseManage/outboundMaintenance'
import { handleOutQuoteList } from '@/api/prodmgr-inv/scrapHandle'
import { MaRawBatchWhiListById } from '@/api/prodmgr-pu/Ma';
import { getOrderOutQuoteList } from '@/api/projectManagement/productionOrder';
import { deliveryOutQuoteList } from '@/api/prodmgr-sa/delivery';
import { getRefundoutQuoteList } from '@/api/purchasingManagement/return'
import { pickingOutQuoteList } from '@/api/projectManagement/productionReview'
const FORM_DATA = {
  sourceCode: '',
  unitName: '',
  matlCode: '',
  matlName: '',
  matlType: '',
  projectCode: '',
  projectName: '',
  createUserName: '',
  createDate: null,
}
export default {
  name: 'transferOrder',
  mixins: [indexMixin],
  dicts: ['MeasureUnit'],
  components: {
    FormUnitId,
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    singleMode: {
      type: Boolean,
      required: false,
      default: false
    },
    propsFormData: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      default: '选择出库单'
    }
  },
  data() {
    return {
      dialogParam: {},
      loading: false,
      openDataScope: false,
      tableData: [],
      total: 0,
      idName: 'sourceDetailId',
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      formData: { ...FORM_DATA },
      selectRow: [],
      selectDataRow: null,
      multipleSelection: [],
      outSource: '',
      selected: [],
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

    init(row = [], outSource = '') {
      this.formData = { ...FORM_DATA }
      this.openDataScope = true
      this.$nextTick(() => {
        this.$refs.multipleTable.clearSelection()
      })
      this.selectDataRow = null
      this.outSource = outSource
      if (this.singleMode) {
        this.selectRow = []
        this.selected = []
      } else {
        this.selectRow = row || []
        this.selected = row
      }

      this.getList()
    },
    getList() {
      let api = ''
      if (this.outSource == '1') { //维修出库
        api = MaRawBatchWhiListById
      } else if (this.outSource == '2') { //调拨出库
        api = outQuoteList
      } else if (this.outSource == '3') { //报废出库
        api = handleOutQuoteList
      } else if (this.outSource == '4') { //销售出库
        api = deliveryOutQuoteList
      } else if (this.outSource == '5') { //借出出库
        api = warehouseLendOutQuoteList
      } else if (this.outSource == '6') { //用料申请出库
        api = MaRawBatchWhiListById
      } else if (this.outSource == '7') { //领料出库
        api = getOrderOutQuoteList
      } else if (this.outSource == '8') { //退供出库
        api = getRefundoutQuoteList
      } else if (this.outSource == '9') { //生产领料
        api = pickingOutQuoteList
      }
      if (!api) {
        return
      }
      this.loading = true
      const param = Object.assign({}, this.listQuery, this.formData, this.propsFormData, { matlPurpose: this.outSource === '1' ? '1' : null })
      if (Array.isArray(param.createDate) && param.createDate.length) {
        param.createDateStart = param.createDate[0]
        param.createDateEnd = param.createDate[1]
        delete param.createDate
      }
      api(param).then(({ data }) => {
        this.tableData = data.list || []
        this.total = data.total || data.list.length
        // if (this.selectRow.length) {
        //   const selectRowIdGroup = this.selectRow.map(item => item.sourceDetailId)
        //   this.tableData.forEach(item => {
        //     if (selectRowIdGroup.includes(item.sourceDetailId)) {
        //       this.$nextTick(() => {
        //         this.$refs.multipleTable.toggleRowSelection(item)
        //       })
        //     }
        //   })
        // }
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData)
      this.getList()
    },
    submitDataScope() {
      /*需要过滤掉选中的数据*/
      let filterArray = []
      this.multipleSelection.forEach(item => {
        const selectRowIdGroup = this.selectRow.map(item => item.matlCode)
        if (!selectRowIdGroup.includes(item.matlCode)) {
          filterArray.push(item)
        }
      })
      let row = null
      if (this.singleMode) {
        if (!this.selectDataRow) {
          this.$message.warning('请选择')
          return
        }
        const rows = this.tableData.filter(item => item.sourceDetailId == this.selectDataRow)
        row = rows[0]
      }
      this.$emit('orderRow', this.singleMode ? row : filterArray)
      this.openDataScope = false
      this.selectRow = []
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    rowClick(row, column) {
      if (this.singleMode) {
        this.selectDataRow = row.sourceDetailId
      } else {
        const selectRowIdGroup = this.selectRow.map(item => item.sourceDetailId)
        if (selectRowIdGroup.includes(row.sourceDetailId)) {
          return
        }
        const multipleSelectionCodeGroup = this.multipleSelection.map(item => item.sourceDetailId)
        if (multipleSelectionCodeGroup.includes(row.sourceDetailId)) {
          this.$refs.multipleTable.toggleRowSelection(row, false)
        } else {
          this.$refs.multipleTable.toggleRowSelection(row, true)
        }
      }

    },

    selectable(row, index) {
      const selectRowIdGroup = this.selected.map(item => item.sourceDetailId)
      return !selectRowIdGroup.includes(row.sourceDetailId)
    },
    handleReset() {
      this.formData = { ...FORM_DATA }
      this.getList()
    }
  }
}
</script>
