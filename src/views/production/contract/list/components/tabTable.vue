<template>
  <div class="tab-table-container">
    <!-- Action Button -->
    <template>
      <el-button
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="handleButton('create')"
        >添加物资</el-button
      >
      <!-- 批量导入 -->
      <el-button
        type="primary"
        icon="el-icon-upload"
        size="mini"
        @click="handleButton('import')"
        >批量导入</el-button
      >
      <!-- 删除 -->
      <el-button
        type="danger"
        icon="el-icon-delete"
        size="mini"
        @click="onDelete"
        >删除</el-button
      >
    </template>
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="线路项目清单总数据" name="total"></el-tab-pane>
      <el-tab-pane
        v-for="project in projectTabs"
        :key="project.name"
        :label="project.label"
        :name="project.name"
      ></el-tab-pane>
    </el-tabs>

    <el-table
      :data="filteredTableData"
      border
      style="width: 100%"
      :max-height="600"
      v-loading="loading"
      :row-key="getRowKey"
      @selection-change="handleSelectionChange"
      ref="dataTable"
    >
      <!-- 公共列 -->
      <!-- <el-table-column
        prop="id"
        label="id"
        width="80"
        align="center"
        fixed="left"
      ></el-table-column> -->
      <el-table-column
        type="index"
        label="序号"
        width="55"
        align="center"
        fixed="left"
      />
      <!-- ✅ 多选框列 -->
      <el-table-column
        type="selection"
        width="55"
        fixed="left"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="materialName"
        label="物资名称"
        width="180"
        fixed="left"
      ></el-table-column>
      <el-table-column
        prop="projectShortName"
        label="项目简称"
        width="120"
      ></el-table-column>

      <!-- 条件渲染：仅在总表中显示 -->
      <el-table-column
        v-if="activeTab === 'total'"
        prop="sectionName"
        label="标段项目名称"
        width="150"
      ></el-table-column>

      <!-- 其他列 -->
      <el-table-column
        prop="sellerName"
        label="卖方名称"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="specModel"
        label="规格型号"
        width="150"
      ></el-table-column>
      <el-table-column
        prop="standardCode"
        label="标准或图号"
        width="120"
      ></el-table-column>

      <!-- 可选择计量单位 -->
      <el-table-column prop="unit" label="计量单位" width="120" align="center">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.unit"
            placeholder="请选择单位"
            size="mini"
            @change="handleUnitChange(scope.$index, scope.row)"
            style="width: 100%"
          >
            <el-option
              v-for="unit in unitOptions"
              :key="unit.value"
              :label="unit.label"
              :value="unit.value"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>

      <!-- 可编辑amount -->
      <el-table-column prop="amount" label="数量" width="120" align="center">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.amount"
            :min="0"
            :precision="2"
            size="mini"
            @change="handleQuantityChange(scope.$index, scope.row)"
            style="width: 100%"
          ></el-input-number>
        </template>
      </el-table-column>

      <el-table-column
        prop="price"
        label="到站不含税单价(元)"
        width="160"
        align="right"
      >
        <template slot-scope="scope">
          {{ scope.row.price ? scope.row.price.toFixed(2) : '' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="vatRate"
        label="物资增值税率"
        width="120"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="taxPrice"
        label="到站含税单价(元)"
        width="140"
        align="right"
      >
        <template slot-scope="scope">
          {{ scope.row.taxPrice ? scope.row.taxPrice.toFixed(2) : '' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="totalAmount"
        label="到站合价含税(元)"
        width="140"
        align="right"
      >
        <template slot-scope="scope">
          {{ scope.row.totalAmount ? scope.row.totalAmount.toFixed(2) : '' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="deliveryLocation"
        label="交货地点"
        width="150"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="receiver"
        label="收货人"
        width="150"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="deliveryStatus"
        label="交货状态"
        width="150"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="deliveryTerms"
        label="交货条件"
        width="150"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="deliveryDate"
        label="交货期"
        width="150"
        align="center"
      ></el-table-column>
    </el-table>

    <!-- 统计信息 -->
    <div class="summary-info" v-if="currentTableData.length > 0">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="summary-item">
            <span class="summary-label">总金额：</span>
            <span class="summary-value amount-text"
              >{{ totalAmount.toFixed(2) }} 元</span
            >
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnhancedDynamicTabTable',
  props: {
    // 接收外部传入的表格数据
    tableData: {
      type: Array,
      default: () => []
    },
    // 单位选项配置
    unitOptions: {
      type: Array,
      default: () => [
        { label: '吨', value: '吨' },
        { label: '米', value: '米' },
        { label: '公里', value: '公里' },
        { label: '根', value: '根' },
        { label: '套', value: '套' },
        { label: '个', value: '个' },
        { label: '台', value: '台' },
        { label: '批', value: '批' }
      ]
    }
  },
  data () {
    return {
      activeTab: 'total', // 当前激活的tab
      currentTableData: [], // 当前显示的表格数据
      loading: false,
      selectedRowKeys: { total: [] }, // 用户存储当前选择的数据
    }
  },
  computed: {
    filteredTableData () {
      if (this.activeTab === 'total') {
        return this.tableData;
      } else {
        const selectedProject = this.projectTabs.find(p => p.name === this.activeTab);
        if (selectedProject) {
          return this.tableData.filter(item =>
            item.sectionName === selectedProject.projectName
          );
        } else {
          return [];
        }
      }
    },
    // 计算总amount
    totalQuantity () {
      return this.filteredTableData.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
    },
    // 计算总金额
    totalAmount () {
      return this.filteredTableData.reduce((sum, item) => {
        const subtotal = this.calculateSubtotalValue(item);
        return sum + subtotal;
      }, 0);
    },
    projectTabs () {
      const projectNames = [...new Set(this.tableData.map(item => item.sectionName).filter(Boolean))];
      return projectNames.map((name, index) => ({
        name: `project-${index}`,
        label: name,
        projectName: name
      }));
    },
  },

  watch: {
    // 监听外部数据变化
    tableData: {
      handler (newData) {
        this.updateCurrentData();
      },
      immediate: true,
      deep: true
    },
    // 监听activeTab变化
    activeTab () {
      this.updateCurrentData();
    }
  },
  methods: {
    // 批量删除选中数据
    onDelete () {
      this.$confirm('确认删除选中数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 找到当前tab对应的所有选中行
          this.tableData = this.tableData.filter(row => !this.selectedRowKeys[this.activeTab].includes(this.getRowKey(row)))

        })
    },
    // 处理Tab点击事件
    handleTabClick (tab) {
      this.activeTab = tab.name;
      this.loading = false;
      // 切换Tab后恢复选中状态
      this.restoreSelectionAfterTabChange();
      // 向父组件发送事件
      this.$emit('tab-change', {
        activeTab: this.activeTab,
        currentData: this.filteredTableData
      });
    },

    // 切换Tab后恢复选中状态
    restoreSelectionAfterTabChange () {
      const tableRef = this.$refs.dataTable;
      if (!tableRef) return;
      // 获取已经选中所有keys
      const allKeys = Object.keys(this.selectedRowKeys).reduce((acc, key) => {
        return acc.concat(this.selectedRowKeys[key]);
      }, []);

      // 计算当前 tab 应该选中的 key（自身 + total 中包含的 key）
      const shouldBeSelectedKeys = [...new Set(
        allKeys
      )];

      this.currentTableData.forEach(row => {
        const key = this.getRowKey(row);
        const shouldSelect = shouldBeSelectedKeys.includes(key);

        tableRef.toggleRowSelection(row, shouldSelect);
      });
    },

    // 处理amount变化
    handleQuantityChange (index, row) {
      // 向父组件发送数据变化事件
      this.$emit('data-change', {
        type: 'quantity',
        index: this.getOriginalIndex(row),
        row: row,
        newValue: row.amount
      });

      // 触发重新计算
      this.$forceUpdate();
    },

    // 处理单位变化
    handleUnitChange (index, row) {
      // 向父组件发送数据变化事件
      this.$emit('data-change', {
        type: 'unit',
        index: this.getOriginalIndex(row),
        row: row,
        newValue: row.unit
      });
    },

    // 获取原始数据中的索引
    getOriginalIndex (row) {
      return this.tableData.findIndex(item =>
        item.id === row.id && item.materialName === row.materialName
      );
    },

    // 计算小计金额（显示用）
    calculateSubtotal (row) {
      const subtotal = this.calculateSubtotalValue(row);
      return subtotal.toFixed(2);
    },

    // 计算小计金额（数值）
    calculateSubtotalValue (row) {
      const quantity = parseFloat(row.amount) || 0;
      const price = parseFloat(row.taxPrice) || 0;
      return quantity * price;
    },
    // 返回唯一行 key，用于多选保留状态
    getRowKey (row) {
      return `${row.id}`;
    },
    // 处理表格的勾选变化 - 修改版本
    handleSelectionChange (selection) {
      // 第一次进入时，将selectedRowKeys备份
      const currentSelectedKeys = selection.map(row => this.getRowKey(row));
      // 再添加当前选中的key
      this.selectedRowKeys[this.activeTab] = currentSelectedKeys
      this.emitSelectionChange();
    },
    // 新增方法：向父组件发送选中变化事件
    emitSelectionChange () {
      const allSelectedRows = this.tableData.filter(row => this.selectedRowKeys[this.activeTab].includes(this.getRowKey(row)));
    },



    // ✅ 当切换Tab时刷新表格并恢复多选
    updateCurrentData () {
      if (!this.selectedRowKeys[this.activeTab]) {
        this.$set(this.selectedRowKeys, this.activeTab, []);
      }

      if (this.activeTab === 'total') {
        this.currentTableData = [...this.tableData];
      } else {
        const selectedProject = this.projectTabs.find(p => p.name === this.activeTab);
        this.currentTableData = selectedProject
          ? this.tableData.filter(item => item.sectionName === selectedProject.projectName)
          : [];
      }

      this.$nextTick(() => {
        this.restoreSelectionAfterTabChange();
      });
    },
  },
}
</script>

<style scoped>
/* 自定义Tab样式 */
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

::v-deep .el-table tbody tr:hover > td {
  background-color: #f5f7fa !important;
}

/* 金额文字样式 */
.amount-text {
  color: #e6a23c;
  font-weight: 600;
}

/* 统计信息样式 */
.summary-info {
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
.app-container > div + div {
  overflow: auto;
}
</style>