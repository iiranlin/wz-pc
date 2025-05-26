<template>
  <div class="table-wrapper-box">
    <div class="table-wrapper">
      <el-table ref="tableRef" row-key="uId" :data="tableData" :row-style="changeDisabled" border height="100%" v-loading="loading" @row-click="rowClick"
        @selection-change="handleSelectionChange" @row-dblclick="dbClick">
        <el-table-column fixed="left" :selectable="isSelectable" align="center" width="50" type="selection" />
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <template v-if="radioType == '2'">
          <el-table-column prop="sourceCode" label="来源单号" align="left" show-overflow-tooltip min-width="200">
            <template slot-scope="{row}">
              <el-button type="text"
                @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: refNameObj[inSource] })">{{ row.sourceCode }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="qiCode" label="质检单号" align="left" show-overflow-tooltip min-width="150">
            <template slot-scope="{row}">
              <el-button type="text"
                @click="clickRouterInDialog($refs.detailDialogRef, { id: row.qiOrderId, refName: 'qualityTestingOperate' })">{{ row.qiCode }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip min-width="150">
            <template slot-scope="{row}">
              <el-button type="text" size="small"
                @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{ row.matlCode }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip min-width="130" />
          <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="130">
            <template slot-scope="{row}">
              <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="originalNum" label="采购原量" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="qualifiedInNum" label="总合格数量" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="unqualifiedInNum" label="总不良品数量" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="150">
            <template slot-scope="{row}">
              <el-button type="text" size="small"
                @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{ row.projectCode }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="suCode" label="供应商编码" align="left" show-overflow-tooltip min-width="150">
            <template slot-scope="{row}">
              <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, { id: row.suId, refName: 'supplierOperate' })">{{ row.suCode }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="suName" label="供应商名称" align="left" show-overflow-tooltip min-width="150" />
        </template>
        <template v-else>
          <el-table-column prop="purCode" label="来源单号" align="left" show-overflow-tooltip min-width="200">
            <template slot-scope="{row}">
              <el-button type="text" @click="clickRouterInDialog($refs.detailDialogRef, { id: row.id, refName: refNameObj['1'] })">{{ row.purCode }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="purName" label="采购名称" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="150">
            <template slot-scope="{row}">
              <el-button type="text" size="small"
                @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{ row.projectCode }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="projectCode" label="合同编码" align="left" show-overflow-tooltip min-width="150">
            <template slot-scope="{row}">
              <el-button type="text" size="small"
                @click="clickRouterInDialog($refs.detailDialogRef, { id: row.ctId, refName: 'contractManagementOperate' })">{{ row.ctCode }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="ctName" label="合同名称" align="left" show-overflow-tooltip min-width="150" />
          <el-table-column prop="suCode" label="供应商编码" align="left" show-overflow-tooltip min-width="150">
            <template slot-scope="{row}">
              <el-button type="text" size="small"
                @click="clickRouterInDialog($refs.detailDialogRef, { id: row.suId, refName: 'supplierOperate' })">{{ row.suCode }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="suName" label="供应商名称" align="left" show-overflow-tooltip min-width="150" />
        </template>
      </el-table>
    </div>
    <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="pagination" />
    <detail-dialog ref="detailDialogRef" />
  </div>
</template>

<script>

import indexMixin from '@/views/mixins'
export default {
  dicts: ['MeasureUnit'],
  mixins: [indexMixin],
  components: {
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    inSource: {
      type: String,
      default: ''
    },
    radioType: {
      type: String,
      default: '1'
    },
    tableData: {
      type: Array,
      default: []
    },
    selected: {
      type: Array,
      default: []
    },
    total: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      loading: false,
      selectRowList: [],
      refNameObj: {
        '1': 'purchaseOrderOperate',  //采购订单
        '2': 'salesReturnOperate',  //销退单
        '3': 'createTransferOutOrder',  //调拨单
        '4': 'lendReturnOrder',  //归还单
        '5': 'productionOrderOperate',  //生产订单
        '7': 'productionRejectedOperate',  //生产退料
      },
    }
  },
  methods: {
    changeDisabled({ row }) {
      if(this.radioType == '1'){
        const selected = this.selected.filter((item) => item.quoteDt)
        const idList = selected.map((item) => item.sourceId)
        return idList.includes(row.id) ? {
          opacity: "0.5",
          pointerEvents: "none"
        } : {}
      }else{
        const idList = this.selected.map((item) => item.sourceDetailId + item.arrivedId)
        return idList.includes(row.sourceDetailId + row.arrivedId) ? {
          opacity: "0.5",
          pointerEvents: "none"
        } : {}
      }
    },
    isSelectable(row) {
      if(this.radioType == '1'){
        const selected = this.selected.filter((item) => item.quoteDt)
        const idList = selected.map((item) => item.sourceId)
        return !idList.includes(row.id)
      }else{
        const idList = this.selected.map((item) => item.sourceDetailId + item.arrivedId)
        return !idList.includes(row.sourceDetailId + row.arrivedId)
      }
    },
    handleSelectionChange(val) {
      this.selectRowList = val
    },
    dbClick(row) {
      this.$emit('dbClick', row)
    },
    rowClick(row) {
      const selectedA1 = this.selected.filter((item) => item.quoteDt)
      const idList = this.radioType == '1'?selectedA1.map((item) => item.sourceId):this.selected.map((item) => item.sourceDetailId + item.arrivedId)
      if (idList.includes(this.radioType == '1'?row.id:row.sourceDetailId + row.arrivedId)) {
        return
      }
      // 多选选中行
      // 根据id判断当前点击的是否被选中
      const selected = this.radioType == '1'? this.selectRowList.some(item => item.id === row.id): this.selectRowList.some(item => item.sourceDetailId + item.arrivedId === row.sourceDetailId + row.arrivedId)
      if (!selected) {
        // 选择
        this.selectRowList.push(row)
        this.$refs.tableRef.toggleRowSelection(row, true)
      } else {
        // 取消
        var finalArr = this.selectRowList.filter((item) => {
          return this.radioType == '1'? item.id !== row.id :item.sourceDetailId + item.arrivedId !== row.sourceDetailId + row.arrivedId
        })
        // 取消后剩余选中的
        this.selectRowList = finalArr
        this.$refs.tableRef.toggleRowSelection(row, false)
      }
    },
    pagination () {
      this.$emit('pagination')
    }
  }
}
</script>

<style scoped lang="scss">
.table-wrapper-box{
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100% - 220px);
  .table-wrapper{
    flex: 1;
  }
}
::v-deep .form-content-box-defaultSearch {
  max-height: none;
}

.search,
.reset,
.toggleClose {
  border: 1px solid #1890ff;
}

::v-deep .el-form-item__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.flex-dialog {

  .el-dialog {
    display: flex;
    flex-direction: column;
  }

  .el-dialog__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.max-height-dialog {
  .el-dialog {
    height: 80%;
    min-height: 500px;
  }
}

.confirm {
  height: 34px;
  border-radius: 50px;
  background: #227aff;
  color: #ffffff;
  min-width: 100px;
  padding: 0;
}

.cancel {
  height: 34px;
  border-radius: 50px;
  min-width: 100px;
  margin-left: 10px;
  padding: 0;
}

.link {
  cursor: pointer;
  color: #1890ff;
}
</style>
