<template>
  <div class="tab-table-container">

    <div style="margin-left: auto; width: 266px;">
      <el-input v-model="searchKeyword" class="table-search" size="small" clearable placeholder="请输入关键词搜索" /></div>
    <div>
      <el-tabs class="table-tabs" v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="建设项目" name="total"></el-tab-pane>
        <el-tab-pane v-for="section in sectionList" :key="section.id" :label="section.projectShortName"
          :name="section.id"></el-tab-pane>
      </el-tabs>
    </div>

    <el-table :data="filteredTableData" border style="width: 100%" max-height="350" v-loading="loading"
      :row-key="getRowKey" @selection-change="handleSelectionChange" ref="dataTable">
      <el-table-column type="index" :index="indexMethod" label="序号" width="55" align="center" fixed="left"  show-overflow-tooltip/>
      <el-table-column prop="projectShortName" label="标段项目名称" min-width="200" align="center"
        show-overflow-tooltip fixed></el-table-column>

      <!-- 条件渲染：仅在总表中显示 -->
      <!-- <el-table-column v-if="activeTab === 'total'" prop="projectShortName" label="标段项目名称" width="200" align="center" fixed="left" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-select v-if="scope.row.isManual && type !== 'view'" v-model="scope.row.sectionId" placeholder="请选择标段项目名称"
            size="mini" style="width: 100%" filterable @change="handleFieldChange('sectionId', scope.row)">
            <el-option v-for="item of options['setcionOptions']" :key="item.value" :label="item.label"
              :value="item.value"></el-option>
          </el-select>
          <span v-else>{{ scope.row.projectShortName }}</span>
        </template>
</el-table-column> -->

      <!-- 其他列 -->
      <el-table-column prop="sellerName" label="卖方名称" width="120" align="center"
        show-overflow-tooltip></el-table-column>
      <el-table-column prop="materialName" label="物资名称" width="250" align="center" fixed="left" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-select v-if="scope.row.isManual && type !== 'view'" v-model="scope.row.materialId" placeholder="请选择物资名称"
            size="mini" style="width: 100%" filterable @change="handleFieldChange('materialId', scope.row)">
            <el-option v-for="unit of options['itemOptions']" :key="unit.value" :label="unit.label"
              :value="unit.value"></el-option>
          </el-select>
          <span v-else>{{ scope.row.materialName }} </span>
        </template>
      </el-table-column>
      <el-table-column prop="specModel" label="规格型号" width="200" align="center" fixed="left" show-overflow-tooltip>
      </el-table-column>

      <!-- 可选择计量单位 -->
      <el-table-column prop="unit" label="计量单位" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.unit }}</span>
        </template>
      </el-table-column>

      <!-- 可编辑amount -->
      <el-table-column prop="amount" label="合同数量" width="180" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input-number v-if="type !== 'view'" v-model="scope.row.amount" :min="0" :precision="4" size="mini"
            @change="handleFieldChange('amount', scope.row)" style="width: 100%"></el-input-number>
          <span v-else>{{ scope.row.amount }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="cumulativeAmount" label="累计计划量" width="120" align="center" show-overflow-tooltip></el-table-column>

      <el-table-column prop="price" label="到站不含税单价(元)" width="160" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input-number v-if="type !== 'view'" v-model="scope.row.price" :min="0" :precision="2" size="mini"
            @change="handleFieldChange('price', scope.row)" style="width: 100%"></el-input-number>
          <span v-else>{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="vatRate" label="物资增值税率（%）" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input-number v-if="type !== 'view' && scope.row.id.split('-').length != 1 || scope.row.type == 'add'"
            v-model="scope.row.vatRate" :min="0" :precision="2" size="mini" style="width: 100%"
            @change="handleFieldChange('vatRate', scope.row)"></el-input-number>
          <span v-else>{{ scope.row.vatRate }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="taxPrice" label="到站含税单价(元)" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.taxPrice ? scope.row.taxPrice.toFixed(2) : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="到站合价含税(元)" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.totalAmount ? scope.row.totalAmount.toFixed(2) : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="deliveryLocation" label="交货地点" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-if="type !== 'view' && scope.row.id.split('-').length != 1 || scope.row.type == 'add'"
            v-model="scope.row.deliveryLocation" size="mini" style="width: 100%"></el-input>
          <span v-else>{{ scope.row.deliveryLocation }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="receiver" label="收货人" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-if="type !== 'view' && scope.row.id.split('-').length != 1 || scope.row.type == 'add'"
            v-model="scope.row.receiver" size="mini" style="width: 100%"></el-input>
          <span v-else>{{ scope.row.receiver }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deliveryStatus" label="交货状态" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-if="type !== 'view' && scope.row.id.split('-').length != 1 || scope.row.type == 'add'"
            v-model="scope.row.deliveryStatus" size="mini" style="width: 100%"></el-input>
          <span v-else>{{ scope.row.deliveryStatus }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deliveryTerms" label="交货条件" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-if="type !== 'view' && scope.row.id.split('-').length != 1 || scope.row.type == 'add'"
            v-model="scope.row.deliveryTerms" size="mini" style="width: 100%"></el-input>
          <span v-else>{{ scope.row.deliveryTerms }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deliveryDate" label="交货期" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-if="type !== 'view' && scope.row.id.split('-').length != 1 || scope.row.type == 'add'"
            v-model="scope.row.deliveryDate" size="mini" style="width: 100%"></el-input>
          <span v-else>{{ scope.row.deliveryDate }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="cumulativeRatio" label="计划金额比例" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.cumulativeRatio }}%</span>
        </template>
      </el-table-column>

      <el-table-column prop="cumulativeAmount" label="累计下达数量" width="150" align="center" show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="sendTotal" label="发货数量" width="150" align="center" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="sendRatio" label="发货比例" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.sendRatio }}%
        </template>
      </el-table-column>
      <el-table-column prop="storeTotalRates" label="已收货金额" width="150" align="center" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="storeTotal" label="累计入库量" width="150" align="center" show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="outTotal" label="累计出库量" width="150" align="center" show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="outTotalRates" label="出库金额" width="150" align="center" show-overflow-tooltip>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination v-if="total > 0" :current-page="pageNum" :page-size="pageSize" :page-sizes="[50, 100, 200, 500]"
      layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
      @current-change="handlePageChange" style="margin-top: 12px; text-align: right;" />

    <!-- 统计信息 -->
    <div class="summary-info" v-if="list.length > 0">
      <div class="summary-item">
        <span class="summary-label">总条数：</span>
        <span class="summary-value amount-text">{{ total }} 条</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">到站合价含税合计：</span>
        <span class="summary-value amount-text">{{ (summaryData.totalAmount || 0) }}</span>
      </div>
      <!-- 总数量 -->
      <div class="summary-item">
        <span class="summary-label">总数量：</span>
        <span class="summary-value amount-text">{{ summaryData.amount || 0 }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">下达数量：</span>
        <span class="summary-value amount-text">{{ summaryData.cumulativeAmount || 0 }}</span>
      </div>

      <div class="summary-item">
        <span class="summary-label">发货数量：</span>
        <span class="summary-value amount-text">{{ summaryData.sendTotal || 0 }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">收货数量：</span>
        <span class="summary-value amount-text">{{ summaryData.putTotal || 0 }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">收货金额：</span>
        <span class="summary-value amount-text">{{ (summaryData.putTotalRates || 0).toFixed(2) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">入库量：</span>
        <span class="summary-value amount-text">{{ summaryData.storeTotal || 0 }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">入库金额：</span>
        <span class="summary-value amount-text">{{ (summaryData.storeTotalRates || 0).toFixed(2) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">出库量：</span>
        <span class="summary-value amount-text">{{ summaryData.outTotal || 0 }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">出库金额：</span>
        <span class="summary-value amount-text">{{ (summaryData.outTotalRates || 0).toFixed(2) }}</span>
      </div>
    </div>


  </div>
</template>

<script>
import Decimal from 'decimal.js';
import { materialDetailsQueryList, latestVersionTotal } from '@/api/statisticalQuery/MaterialsPlans.js';
export default {
  name: 'tabTable',
  dicts: ['MeasureUnit'],
  props: {
    // 标段列表，用于渲染 Tab（由父组件 detail.vue 传入）
    sectionList: {
      type: Array,
      default: () => []
    },
    // 建设项目 ID（取自路由 query.id）
    projectId: {
      type: String,
      default: ''
    },
    sellerName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeTab: 'total', // 当前激活的 tab
      list: [],           // 当前页数据
      loading: false,
      pageNum: 1,
      pageSize: 50,
      total: 0,
      summaryData: {},    // 存储接口返回的汇总统计数据
      options: {},
      searchKeyword: '',
    }
  },
  computed: {
    // 保持 filteredTableData 命名，供部分可能存在的逻辑引用
    filteredTableData() {
      const keyword = this.searchKeyword.trim().toLowerCase()
      if (!keyword) {
        return this.list
      }

      return this.list.filter(item => this.isRowMatched(item, keyword))
    },
    type() {
      return this.$route.query.type
    }
  },
  watch: {
    // projectId prop 变化时重新初始化
    projectId(val) {
      if (val) {
        this.activeTab = 'total';
        this.pageNum = 1;
        this.fetchList();
      }
    }
  },
  mounted() {
    if (this.projectId) {
      this.fetchList();
    }
  },
  methods: {
    // ==================== 数据获取 ====================

    // 获取列表数据（分页）
    async fetchList() {
      this.loading = true;
      try {
        const params = { pageNum: this.pageNum, pageSize: this.pageSize };
        if (this.activeTab === 'total') {
          params.projectId = this.projectId;
        } else {
          params.sectionId = this.activeTab;
        }

        // 并行请求列表数据和统计汇总数据
        const [listRes, totalRes] = await Promise.all([
          materialDetailsQueryList(params),
          latestVersionTotal(params)
        ]);

        this.list = listRes.data.list || [];
        this.total = listRes.data.total || 0;
        this.summaryData = totalRes.data || {};
      } catch (e) {
        this.list = [];
        this.total = 0;
        this.summaryData = {};
      } finally {
        this.loading = false;
      }
    },

    // ==================== Tab & 分页 ====================

    // 处理 Tab 点击
    handleTabClick(tab) {
      this.activeTab = tab.name;
      this.pageNum = 1;
      this.fetchList();
    },

    // 处理页码变化
    handlePageChange(val) {
      this.pageNum = val;
      this.fetchList();
    },

    // 处理每页条数变化
    handleSizeChange(val) {
      this.pageSize = val;
      this.pageNum = 1;
      this.fetchList();
    },

    // ==================== 表格基础 ====================

    // 自定义序号计算，实现跨页连续
    indexMethod(index) {
      return (this.pageNum - 1) * this.pageSize + index + 1;
    },

    // 返回唯一行 key
    getRowKey(row) {
      return `${row.id}`;
    },

    // 处理表格的勾选变化
    handleSelectionChange(selection) {
      // view 模式下无需处理
    },

    isRowMatched(row, keyword) {
      return Object.values(row || {}).some(value => {
        if (value === null || value === undefined) {
          return false
        }
        return String(value).toLowerCase().includes(keyword)
      })
    },

    // ==================== 字段计算（编辑模式保留）====================

    handleFieldChange(fieldType, row) {
      switch (fieldType) {
        case 'materialId':
          const selectedItem = this.options.itemOptions?.find(item => item.value === row.materialId);
          if (selectedItem) {
            row.specModel = selectedItem.specModel;
            row.unit = selectedItem.unit;
            row.materialName = selectedItem.materialName;
          }
          break;
        case 'sectionId':
          const selectedSection = this.options.setcionOptions?.find(item => item.value === row.sectionId);
          if (selectedSection) {
            this.$set(row, 'projectShortName', selectedSection.projectShortName);
            this.$set(row, 'sectionName', selectedSection.sectionName);
          }
          break;
        case 'vatRate':
          this.calculateTaxPrice(row);
          break;
        case 'price':
          this.calculateTaxPrice(row);
          break;
        case 'amount':
          this.calculateTotalAmount(row);
          break;
        case 'taxPrice':
          this.calculateTotalAmount(row);
          break;
      }
    },
    calculateTaxPrice(row) {
      if (row.vatRate && row.price) {
        const taxPrice = (100 + row.vatRate) * row.price / 100;
        row.taxPrice = taxPrice;
        this.calculateTotalAmount(row);
      }
    },
    calculateTotalAmount(row) {
      if (row.amount && row.taxPrice) {
        const totalAmount = row.amount * row.taxPrice;
        row.totalAmount = totalAmount;
      }
    },

    // ==================== 验证（编辑模式保留）====================

    onCheck() {
      const validationErrors = this.validateTableData();
      if (validationErrors.length === 0) {
        return true;
      } else {
        const errorMessage = this.formatValidationErrors(validationErrors);
        this.$message({
          message: errorMessage,
          type: 'error',
          duration: 8000,
          dangerouslyUseHTMLString: true
        });
        return false;
      }
    },
    validateTableData() {
      const errors = [];
      this.list.forEach((row, index) => {
        const rowErrors = [];
        const displayIndex = index + 1;
        if (!row.amount || row.amount <= 0) rowErrors.push('数量');
        if (row.isManual && (!row.materialId || !row.materialName)) rowErrors.push('物资名称');
        if (!row.unit || row.unit.trim() === '') rowErrors.push('计量单位');
        if (!row.sectionId || row.sectionId.trim() === '') rowErrors.push('标段名称');
        if (!row.price || row.price <= 0) rowErrors.push('到站不含税单价');
        if (!row.vatRate || row.vatRate <= 0) rowErrors.push('物资增值税率');
        if (rowErrors.length > 0) {
          errors.push({ rowIndex: displayIndex, rowData: row, missingFields: rowErrors });
        }
      });
      return errors;
    },
    formatValidationErrors(errors) {
      const currentTabName = this.activeTab === 'total' ? '总数据' :
        this.sectionList.find(s => s.id === this.activeTab)?.sectionName || '当前标签页';
      let message = `<div style="text-align: left;"><strong>${currentTabName} 数据验证失败：</strong><br/>`;
      errors.forEach(error => {
        const fieldsText = error.missingFields.join('、');
        message += `<div style="margin: 5px 0; color: #f56c6c;">• 第 ${error.rowIndex} 行：${fieldsText} 未填写</div>`;
      });
      message += '</div>';
      return message;
    },
    highlightErrorRows(errors) {
      this.clearRowHighlight();
      errors.forEach(error => {
        const rowIndex = error.rowIndex - 1;
        this.$nextTick(() => {
          const tableRef = this.$refs.dataTable;
          if (tableRef && tableRef.$el) {
            const rows = tableRef.$el.querySelectorAll('.el-table__body tr');
            if (rows[rowIndex]) {
              rows[rowIndex].style.backgroundColor = '#fef0f0';
              rows[rowIndex].style.border = '1px solid #f56c6c';
            }
          }
        });
      });
    },
    clearRowHighlight() {
      this.$nextTick(() => {
        const tableRef = this.$refs.dataTable;
        if (tableRef && tableRef.$el) {
          const rows = tableRef.$el.querySelectorAll('.el-table__body tr');
          rows.forEach(row => {
            row.style.backgroundColor = '';
            row.style.border = '';
          });
        }
      });
    },
  },
}
</script>


<style scoped>
.table-tabs {
  flex: 1;
  min-width: 0;
}

.table-search {
  width: 260px;
  flex-shrink: 0;
}

::v-deep .el-tabs__header {
  margin-bottom: 20px;
}

::v-deep .el-tabs__item {
  font-weight: 500;
  transition: all 0.3s ease;
}

::v-deep .el-tabs__item.is-active {
  color: #2196f3;
  font-weight: 600;
}

::v-deep .el-tabs__active-bar {
  background-color: #2196f3;
}

/* 表格样式优化 */
::v-deep .el-table {
  border-radius: 8px;
  overflow: hidden;
}

::v-deep .el-table__body-wrapper {
  max-height: 600px;
  overflow-y: auto;
}

::v-deep .el-table tbody tr:hover>td {
  background-color: #f5f7fa !important;
}

/* 金额文字样式 */
.amount-text {
  color: #e6a23c;
  font-weight: 600;
}

/* 统计信息样式 */
.summary-info {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.summary-item {
  min-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;
}

.summary-label {
  color: #666;
  font-size: 14px;
  margin-right: 8px;
}

.summary-value {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

::v-deep .el-select {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-table-container {
    padding: 10px;
  }

  .table-toolbar {
    flex-direction: column;
  }

  .table-search {
    width: 100%;
  }

  .summary-info {
    padding: 15px;
  }

  .summary-item {
    margin-bottom: 10px;
    flex-direction: column;
    text-align: center;
  }

  .summary-label {
    margin-right: 0;
    margin-bottom: 5px;
  }
}

/* 加载动画 */
::v-deep .el-loading-mask {
  border-radius: 8px;
}

/* 滚动条样式 */
::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

<style>
.app-container>div+div {
  overflow: auto;
}
</style>
