<template>
    <Dialog class="flex-dialog max-height-dialog dialog-padding" title="选择数据" :visible.sync="visible" :close-on-click-modal="false" :close-on-press-escape="false" width="1300px" >
      <select-header ref="formData" :showSearch="true" :showPanel="false" :searchArr="searchButton || []" :formData="formData"
              @handleQuery="handleQuery" @handleResetField="handleResetField">
        <template v-slot:unitName="{ data }">
          <el-form-item class="custom-form-item" :label="data.fieldName" :prop="data.fieldCode">
            <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData" :fieldData="data" z-index="99999" />
          </el-form-item>
        </template>        
      </select-header>
      <el-row type="flex" class="container_h">
        <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                <el-input
                    class="search-input"
                    placeholder="输入关键字过滤"
                    v-model="filterText"
                    clearable
                >
                </el-input>
                <div class="head-container ov_head">
                    <span class="ov_head_title">物料分类</span>
                    <el-tree
                        class="drawer-tree"
                        node-key="matlClassifyId"
                        :indent="0"
                        :data="dataOptions"
                        :props="defaultProps"
                        :expand-on-click-node="false"
                        ref="tree"
                        :highlight-current="true"
                        :filter-node-method="filterNode"
                        @node-click="handleNodeClick"
                    />
                </div>
            </el-col>
        <el-col :span="20" :xs="24" style="display: flex;flex-direction: column;">
          <div class="table-wrapper">
            <el-table ref="multipleTable" :data="tableData" row-key="id" border height="100%" v-loading="loading" v-if="visible" @selection-change="handleSelectionChange">
              <el-table-column fixed="left" align="center" width="50" :reserve-selection="true" type="selection"/>
              <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60"/>
              <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip min-width="150" >
                <template slot-scope="{row}">
                  <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {matlCode: row.matlCode, refName: 'materialArchivesOperate'})">{{ row.matlCode }}</el-button>
                </template>
              </el-table-column>
              <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150"/>
              <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="150">
                <template slot-scope="{row}">
                  <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: row.projectId, refName: 'projectManagementOperate'})">{{ row.projectCode }}</el-button>
                </template>
              </el-table-column>
              <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150"/>
              
              <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150"/>
              <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="130">
                <template slot-scope="{row}">
                    <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="placeCode" label="货位编码" align="left" show-overflow-tooltip min-width="130">
              </el-table-column>
              <el-table-column prop="inventoryNum" label="库存数量" align="left" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="batchNo" label="批次号" align="left" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="type" label="合格状态" align="center" show-overflow-tooltip min-width="130">
                <template slot-scope="{row}">
                  <span>{{ row.type | orderTypeFilter(dict.type.inventoryType) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="areaName" label="地区" align="left" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="warehouseName" label="仓库" align="left" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="storageName" label="储区" align="left" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="passageName" label="通道" align="left" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="manufactureDate" label="生产日期" align="center" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="expireDate" label="失效日期" align="center" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="qualityPeriod" label="保质期天数" align="left" show-overflow-tooltip min-width="130"/>
              <el-table-column prop="remainingDays" label="剩余有效天数" align="left" show-overflow-tooltip min-width="130"/>
            </el-table>
          </div>
      
          <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList"/>
  
        </el-col>
      </el-row>
      
      <template #footer>
        <el-button class="confirm" @click="saveSelection">确定</el-button>
        <el-button class="cancel" @click.native="visible = false">取消</el-button>
      </template>
      <detail-dialog ref="detailDialogRef"/>
    </Dialog>
  </template>
  
  <script>

  import indexMixin from '@/views/mixins'
  import selectHeader from '@/components/selectHeader/index'
  import { classTree } from '@/api/prodmgr-mm/matlClass';
  import { getInventoryList } from '@/api/warehouseManage/inventoryManage'
  export default {
    name: 'selectProduct',
    dicts: ['inventoryType', 'MeasureUnit'],
    mixins: [indexMixin],
    components: {
      selectHeader, 
      FormUnitId: () => import('@/views/components/form-unitId'),
      DetailDialog: () => import('@/views/components/DetailDialog')
    },
    data() {
      return {
        visible: false,
        searchInfo: {},
        searchButton:[
          { "fieldCode": "matlName", "fieldName": "物料名称" },
          { "fieldCode": "matlCode", "fieldName": "物料编码" },
          { "fieldCode": "placeCode", "fieldName": "货位编码" },
          { "fieldCode": "batchNo", "fieldName": "批次号" },
          { "fieldCode": "unitName", "fieldName": "所属组织" ,"formSlot": 1 },
          { "fieldCode": "projectCode", "fieldName": "项目编码" },
          { "fieldCode": "projectName", "fieldName": "项目名称" }
        ],
        formData: {},
        loading: false,
        tableData: [],
        selectRowId: '',
        selectRow: {},
        selectRowList: [],
        total: 0,
        dataOptions: undefined,
        defaultProps: {
            children: "children",
            label: "matlClassifyName",
        },
        formData: {},
        treeLoading: false,
        filterText: "",
      }
    },
    watch: {
      visible(val) {
        if (!val) {
          this.tableData = []
        } else {
          this.$nextTick(() => {
          this.tableData = []
          this.selectRow = []
          this.selectRowId = ''
          this.listQuery.pageNum = 1
          this.listQuery.pageSize = 30
          this.getList()
        })
        }
      },
      filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    methods: {
      open(arr = [], param = {}) {
        this.visible = true
        this._param = param
        this._selected = arr
        this.getTreeList()
      },
      handleSelectionChange(val) {
        this.selectRowList = val
      },
      handleQuery(formData, type) {
        this.searchInfo = formData ? formData : this.this.searchInfo
        this.listQuery.pageNum = 1
        this.getList()
      },
      getTreeList () {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.dataOptions = data || [];
            }).finally( () => {
                this.treeLoading = false;
            })
        },
      filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
        },
        handleNodeClick(node){
            this.formData.matlClassifyId = node.matlClassifyId
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
        getInventoryList(Object.assign({}, this.searchInfo, this.listQuery, this.formData, this._param)).then(({data}) => {
          this.tableData = data?.list || []
          this.total = data?.total || 0
          this.$nextTick(() => {
            if(Array.isArray(this._selected) && !!this._selected.length) {
              const ids = this._selected.map(({id}) => id) || []
              this.tableData.forEach(row => {
                if(ids.includes(row.id)) {
                  this.$refs.multipleTable.toggleRowSelection(row);
                }
            
          });
}
          })
          
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
  </style>
  