<template>
  <Dialog class="flex-dialog max-height-dialog dialog-padding" title="选择数据" :visible.sync="visible"
    :close-on-click-modal="false" :close-on-press-escape="false" width="1300px" >
    <select-header ref="formData" :showSearch="true" :showPanel="false" :searchArr="searchButton || []"
      :formData="formData" @handleQuery="handleQuery" @handleResetField="handleResetField"></select-header>

    <div class="table-wrapper">
      <el-table ref="multipleTable" row-key="matlCode" :row-style="changeDisabled" :data="tableData"
        @row-click="rowClick" @row-dblclick="dbClick" border height="100%" v-loading="loading" v-if="visible"
        @selection-change="handleSelectionChange">
        <el-table-column fixed="left" :selectable="isSelectable" align="center" width="50" :reserve-selection="true"
          type="selection" />
        <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
        <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <el-button type="text" size="small"
              @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                row.matlCode }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
        <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip min-width="130" />
        <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="150">
          <template slot-scope="{row}">
            <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="inventoryNum" label="库存合格数量" align="left" show-overflow-tooltip min-width="130" />
      </el-table>
    </div>

    <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
      @pagination="getList" />

    <template #footer>
      <el-button class="confirm" @click="saveSelection">确定</el-button>
      <el-button class="cancel" @click.native="visible = false">取消</el-button>
    </template>
    <detail-dialog ref="detailDialogRef" />
  </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import { allocateQuoteList } from '@/api/warehouseManage/transferOrder'
import selectHeader from '../../../../warehousing/inventoryMaintenance/components/selectHeader'
export default {
  name: 'selectDetail',
  dicts: ['MeasureUnit'],
  mixins: [indexMixin],
  components: {
    selectHeader,
    DetailDialog: () => import('@/views/components/DetailDialog')
  },
  props: {
    propsFormData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      visible: false,
      warehouseId: '',
      searchInfo: {},
      searchButton: [
        { "fieldCode": "matlCode", "fieldName": "物料编码" },
        { "fieldCode": "matlName", "fieldName": "物料名称" },
        { "fieldCode": "matlType", "fieldName": "规格型号" },
        // { "fieldCode": "unitName", "fieldName": "所属组织" },
        // { "fieldCode": "projectCode", "fieldName": "项目编码" },
        // { "fieldCode": "projectName", "fieldName": "项目名称" },
      ],
      formData: {},
      loading: false,
      tableData: [],
      selectRowId: '',
      selectRow: {},
      selectRowList: [],
      total: 0,
      selected: []
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        // this.$refs.searchInfo.resetFields()
        this.tableData = []
      } else {
        this.$nextTick(() => {
          // this.$refs.searchInfo.resetFields()
          this.tableData = []
          this.selectRow = []
          this.selectRowId = ''
          this.listQuery.pageNum = 1
          this.listQuery.pageSize = 30
          this.getList()
        })
      }
    }
  },
  methods: {
    changeDisabled({ row }) {
      const idList = this.selected.map((item) => item.matlCode)
      return idList.includes(row.matlCode) ? {
        opacity: "0.5",
        pointerEvents: "none"
      } : {}
    },
    isSelectable(row) {
      const idList = this.selected.map((item) => item.matlCode)
      return !idList.includes(row.matlCode)
    },
    open(warehouseId, arr = []) {
      this.visible = true
      this.warehouseId = warehouseId
      this._selected = arr
      this.selected = arr
    },
    handleSelectionChange(val) {
      this.selectRowList = val
    },
    handleQuery(formData, type) {
      this.searchInfo = formData ? formData : this.this.searchInfo
      this.listQuery.pageNum = 1
      this.getList()
    },
    rowClick(row) {
      const idList = this.selected.map((item) => item.matlCode)
      if (idList.includes(row.matlCode)) {
        return
      }
      // 多选选中行
      // 根据id判断当前点击的是否被选中
      const selected = this.selectRowList.some(item => item.matlCode === row.matlCode)
      if (!selected) {
        // 选择
        this.selectRowList.push(row)
        this.$refs.multipleTable.toggleRowSelection(row, true)
      } else {
        // 取消
        var finalArr = this.selectRowList.filter((item) => {
          return item.matlCode !== row.matlCode
        })
        // 取消后剩余选中的
        this.selectRowList = finalArr
        this.$refs.multipleTable.toggleRowSelection(row, false)
      }
    },
    dbClick(row) {
      const flag = this.selectRowList.some(item => item.matlCode === row.matlCode)
      if (flag) {
        this.$message.warning('此条数据已经添加')
        return
      }
      this.$emit('selections', [row])
      this.visible = false
    },
    // 保存选择
    saveSelection() {
      if (!this.selectRowList || this.selectRowList.length === 0) {
        this.$message.warning('请选择明细数据')
        return
      }
      this.$emit('selections', this.selectRowList)
      this.visible = false
    },
    getList() {
      this.loading = true
      allocateQuoteList(Object.assign({ warehouseId: this.warehouseId, type: 1 }, this.searchInfo, this.listQuery, this.propsFormData)).then(({ data }) => {
        this.tableData = data?.list || []
        this.total = data?.total || 0
        //           if(Array.isArray(this._selected) && !!this._selected.length) {
        //             const codes = this._selected.map(({matlCode}) => matlCode)
        //             this.$nextTick(() => {
        //               for(let i=0; i< this.tableData.length; i++) {
        //                 const row = this.tableData[i]
        //                 if(codes.includes(row.matlCode)) {
        //                   this.$refs.multipleTable.toggleRowSelection(row);
        //                 }
        //               }
        //  })
        //           }

      }).finally(() => {
        this.loading = false
      })
    },
    handleResetField() {
      this.$refs.searchInfo.resetFields()
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
.table-wrapper {
  flex: 1;
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
}
</style>