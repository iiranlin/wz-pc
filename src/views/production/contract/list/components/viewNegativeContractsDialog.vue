<template>
  <el-dialog
    title="补充合同负数物资"
    :visible.sync="dialogVisible"
    width="70%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="summary-bar">
      <span>原合同数量：{{ summaryData.originalAmount }}</span>
      <span>当前数量：{{ summaryData.currentAmount }}</span>
      <span>负合同数量总和：{{ summaryData.negativeAmount }}</span>
    </div>

    <!-- 补充合同数据表格 -->
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      max-height="450"
      v-loading="loading"
    >
      <el-table-column type="index" label="序号" width="60" align="center" fixed show-overflow-tooltip></el-table-column>
      <el-table-column prop="sectionName" label="标段名称" width="200" align="center" show-overflow-tooltip fixed></el-table-column>
      <el-table-column prop="contractName" label="补充合同名称" min-width="250" align="center" show-overflow-tooltip></el-table-column>
      <el-table-column prop="amount" label="合同数量" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span :style="{ color: scope.row.amount < 0 ? '#F56C6C' : '' }">
            {{ scope.row.amount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="materialName" label="物资名称" width="200" align="center" show-overflow-tooltip fixed></el-table-column>
      <el-table-column prop="specModel" label="规格型号" width="200" align="center" show-overflow-tooltip></el-table-column>
    </el-table>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as ContractItemApi from '@/api/prodmgr-inv/project/contractItem.js';
import { getNegativeContractSummary } from '@/utils/negativeContractSummary';

export default {
  name: 'ViewNegativeContractsDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      tableData: [],
      masterDetailId: null,
      summaryData: getNegativeContractSummary()
    };
  },
  methods: {
    /**
     * 打开弹窗
     * @param {String|Number} masterDetailId - 主合同物资ID
     * @param {Object} summarySource - 汇总展示源数据
     */
    async open(masterDetailId, summarySource = {}) {
      this.dialogVisible = true;
      this.masterDetailId = masterDetailId;
      this.tableData = [];
      this.summaryData = getNegativeContractSummary(summarySource);
      
      // 加载补充合同列表
      await this.loadNegativeContracts();
    },

    /**
     * 加载补充合同列表
     */
    async loadNegativeContracts() {
      if (!this.masterDetailId) {
        this.$message.error('主合同物资ID不能为空');
        return;
      }

      this.loading = true;
      try {
        const res = await ContractItemApi.mainItemList({
          uniqueNumber: this.masterDetailId
        });
        
        if (res.code === 0) {
          this.tableData = res.data.list || res.data || [];
        } else {
          this.$message.error(res.msg || '获取补充合同列表失败');
        }
      } catch (error) {
        console.error('加载补充合同列表失败:', error);
        this.$message.error('加载补充合同列表失败');
      } finally {
        this.loading = false;
      }
    },

    /**
     * 关闭弹窗
     */
    handleClose() {
      this.dialogVisible = false;
      this.tableData = [];
      this.masterDetailId = null;
      this.summaryData = getNegativeContractSummary();
    }
  }
};
</script>

<style scoped>
.summary-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #606266;
  font-weight: 600;
}

::v-deep .el-table {
  border-radius: 8px;
  overflow: hidden;
}

::v-deep .el-table tbody tr:hover > td {
  background-color: #f5f7fa !important;
}

.dialog-footer {
  text-align: right;
}
</style>
