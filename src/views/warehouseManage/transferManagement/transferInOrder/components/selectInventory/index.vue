<template>
    <Dialog class="flex-dialog max-height-dialog" title="选择数据" :visible.sync="visible" :close-on-click-modal="false" :close-on-press-escape="false" width="1300px" >
      <select-header ref="formData" :showSearch="true" :showPanel="false" :searchArr="searchButton || []" :formData="formData"
              @handleQuery="handleQuery" @handleResetField="handleResetField"></select-header>
  
      <div class="table-wrapper">
        <el-table :data="tableData" border height="400px" v-loading="loading" v-if="visible" @selection-change="handleSelectionChange">
          <el-table-column fixed="left" align="center" width="50" :reserve-selection="true" type="selection"/>
          <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60"/>
          <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip min-width="150"/>
          <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150"/>
          <el-table-column prop="placeCode" label="货位编码" align="left" show-overflow-tooltip min-width="130"/>
          <el-table-column prop="inventoryNum" label="库存数量" align="left" show-overflow-tooltip min-width="130"/>
          <el-table-column prop="batchNo" label="批次号" align="left" show-overflow-tooltip min-width="150"/>
          <el-table-column prop="totalQualifiedNum" label="库存状态" align="center" show-overflow-tooltip min-width="150"/>
          <el-table-column prop="areaName" label="地区" align="left" show-overflow-tooltip min-width="150"/>
          <el-table-column prop="warehouseName" label="仓库" align="left" show-overflow-tooltip min-width="150"/>
          <el-table-column prop="storageName" label="储区" align="left" show-overflow-tooltip min-width="150"/>
          <el-table-column prop="manufactureDate" label="生产日期" align="center" show-overflow-tooltip min-width="150"/>
          <el-table-column prop="expireDate" label="失效日期" align="center" show-overflow-tooltip min-width="150"/>
          <el-table-column prop="qualityPeriod" label="保质期天数" align="left" show-overflow-tooltip min-width="150"/>
        </el-table>
      </div>
  
        <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList"/>
  
      <template #footer>
        <el-button class="confirm" @click="saveSelection">确定</el-button>
        <el-button class="cancel" @click.native="visible = false">取消</el-button>
      </template>
    </Dialog>
  </template>
  
  <script>
  
  import indexMixin from '@/views/mixins'
  import { getStockList } from '@/api/warehouseManage/transferOrder'
  import selectHeader from '../../../../warehousing/inventoryMaintenance/components/selectHeader'
  
  export default {
    name: 'selectDetail',
    mixins: [indexMixin],
    components: {selectHeader},
    data() {
      return {
        visible: false,
        warehouseId: '',
        searchInfo: {},
        searchButton:[
          { "fieldCode": "warehouseName", "fieldName": "仓库" },
          { "fieldCode": "matlCode", "fieldName": "物料编码" },
          { "fieldCode": "matlName", "fieldName": "物料名称" },
          { "fieldCode": "placeCode", "fieldName": "货位编码" },
          { "fieldCode": "batchNo", "fieldName": "批次号" },
          { "fieldCode": "suCode", "fieldName": "库存状态" }
        ],
        formData: {},
        loading: false,
        tableData: [],
        selectRowId: '',
        selectRow: {},
        selectRowList: [],
        total: 0
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
      open(warehouseId) {
        this.visible = true
        this.warehouseId = warehouseId
      },
      handleSelectionChange(val) {
        this.selectRowList = val
      },
      handleQuery(formData, type) {
        this.searchInfo = formData ? formData : this.this.searchInfo
        this.listQuery.pageNum = 1
        this.getList()
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
        getStockList(Object.assign({warehouseId: this.warehouseId, type: 1}, this.searchInfo, this.listQuery)).then(({data}) => {
          this.tableData = data?.list || []
          this.total = data?.total || 0
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
  .search,
  .reset,
  .toggleClose{
      border: 1px solid #1890ff;
  }
  ::v-deep .el-form-item__label{
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
    min-width: 100px
  }
  
  .cancel {
    height: 34px;
    border-radius: 50px;
    min-width: 100px;
    margin-left: 10px;
  }
  </style>
  