<template>
  <el-dialog
    title="负计划补充合同列表"
    :visible.sync="dialogVisible"
    width="70%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 补充合同数据表格 -->
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      max-height="450"
      v-loading="loading"
    >
      <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="sectionName" label="标段名称" width="200" align="center"></el-table-column>
      <el-table-column prop="contractName" label="补充合同名称" min-width="250" align="center"></el-table-column>
      <el-table-column prop="amount" label="合同数量" width="150" align="center">
        <template slot-scope="scope">
          <span :style="{ color: scope.row.amount < 0 ? '#F56C6C' : '' }">
            {{ scope.row.amount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="materialName" label="物资名称" width="200" align="center"></el-table-column>
      <el-table-column prop="specModel" label="规格型号" width="200" align="center"></el-table-column>
    </el-table>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as ContractItemApi from '@/api/prodmgr-inv/project/contractItem.js';

export default {
  name: 'ViewNegativeContractsDialog',
  data() {
    return {
      dialogVisible: false,
      loading: false,
      tableData: [],
      masterDetailId: null
    };
  },
  methods: {
    /**
     * 打开弹窗
     * @param {String|Number} masterDetailId - 主合同物资ID
     */
    async open(masterDetailId) {
      this.dialogVisible = true;
      this.masterDetailId = masterDetailId;
      this.tableData = [];
      
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
          masterDetailId: this.masterDetailId
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
    }
  }
};
</script>

<style scoped>
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
