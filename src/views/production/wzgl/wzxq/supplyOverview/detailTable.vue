<template>
  <div class="material-search-table">
    <el-table :data="tableData" border style="width: 100%" max-height="350">
      <!-- 序号 -->
      <el-table-column type="index" label="序号" align="center" width="80px" fixed show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="sellerName" label="供应商" align="center" width="200" show-overflow-tooltip fixed>
      </el-table-column>
      <el-table-column prop="materialName" label="物资名称" align="center" width="200" show-overflow-tooltip fixed>
      </el-table-column>
      <el-table-column prop="specModel" label="规格型号" align="center" width="200" show-overflow-tooltip fixed>
      </el-table-column>
      <el-table-column prop="unit" label="计量单位" align="center" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="amount" label="合同数量" align="center" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="cumulativeAmount" label="累计计划量（含本次）" align="center" width="200px" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="planAmount" label="本次计划数量" align="center" width="200" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="taxPrice" label="价格" align="center" width="200" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="planAmountTotalPrice" label="本次计划金额" align="center" width="200" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="sendTotal" label="已发货" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="link" @click="goDetail(scope.row.sendTotal, 'sendList')" style="color:#409EFF;cursor:pointer;">
            {{ scope.row.sendTotal }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="sendTotalTotalPrice" label="已发货金额" align="center" width="200" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="putTotal" label="已收货" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="link" @click="goDetail(scope.row.putTotal, 'receiveList')" style="color:#409EFF;cursor:pointer;">
            {{ scope.row.putTotal }}
          </span>
        </template>
      </el-table-column>

      <el-table-column prop="putTotalTotalPrice" label="已收货金额" align="center" width="200" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="storeTotal" label="已入库" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="link" @click="goDetail(scope.row.storeTotal, 'imList')" style="color:#409EFF;cursor:pointer;">
            {{ scope.row.storeTotal }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="storeTotalTotalPrice" label="已入库金额" align="center" width="200" show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="outCkTotal" label="已出库" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="link" @click="goDetail(scope.row.outCkTotal, 'omList')" style="color:#409EFF;cursor:pointer;">
            {{ scope.row.outCkTotal }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="outCkTotalTotalPrice" label="已出库金额" align="center" width="200" show-overflow-tooltip>
      </el-table-column>
    </el-table>


    <div class="summary-info" v-if="tableData.length > 0">
      <div class="summary-item">
        <span class="summary-label">总条数：</span>
        <span class="summary-value amount-text">{{ tableData.length }} 条</span>
      </div>
      <!-- 总数量 -->
      <div class="summary-item">
        <span class="summary-label">总数量：</span>
        <span class="summary-value amount-text">{{ totalNum }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">计划数量：</span>
        <span class="summary-value amount-text">{{ totalPlanAmount}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">计划金额：</span>
        <span class="summary-value amount-text">{{totalPlanAmountTotalPrice.toFixed(2)}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">发货数量：</span>
        <span class="summary-value amount-text">{{ totalSendCount }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">发货金额：</span>
        <span class="summary-value amount-text">{{totalSendTotalTotalPrice.toFixed(2)}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">收货数量：</span>
        <span class="summary-value amount-text">{{ totalPutTotal}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">收货金额：</span>
        <span class="summary-value amount-text">{{totalPutTotalTotalPrice.toFixed(2)}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">入库量：</span>
        <span class="summary-value amount-text">{{ totalStoreCount}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">入库金额：</span>
        <span class="summary-value amount-text">{{totalStoreTotalTotalPrice.toFixed(2)}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">出库量：</span>
        <span class="summary-value amount-text">{{totalOutCount}}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">出库金额：</span>
        <span class="summary-value amount-text">{{totalOutCkTotalTotalPrice.toFixed(2)}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import Decimal from 'decimal.js';
export default {
  // 需求详情表格数据
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
  },
  filters: {
    // 日期格式化过滤器
    formatDate(value, format = 'YYYY-MM-DD') {
      if (!value) return '';
      return dayjs(value).format(format);
    }
  },
  computed:{

    // 计算总数量（使用 decimal.js 精确加法避免浮点数精度问题，只累加正数）
    totalNum() {
      return this.tableData.reduce((sum, item) => {
        const amount = new Decimal(item.amount || 0);
        // 只累加正数，忽略负数和零
        if (amount.greaterThan(0)) {
          return sum.plus(amount);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 本次计划数量总计（只累加正数）
    totalPlanAmount() {
      return this.tableData.reduce((sum, item) => {
        const planAmount = new Decimal(item.planAmount || 0);
        // 只累加正数，忽略负数和零
        if (planAmount.greaterThan(0)) {
          return sum.plus(planAmount);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },

    // 本次计划金額（只累加正数）
    totalPlanAmountTotalPrice() {
      return this.tableData.reduce((sum, item) => {
        const planAmountTotalPrice = parseFloat(item.planAmountTotalPrice) || 0;
        // 只累加正数，忽略负数和零
        if (planAmountTotalPrice > 0) {
          return sum + planAmountTotalPrice;
        }
        return sum;
      }, 0);
    },

    // 计算累计发货数量（只累加正数）
    totalSendCount() {
      return this.tableData.reduce((sum, item) => {
        const sendTotal = new Decimal(item.sendTotal || 0);
        // 只累加正数，忽略负数和零
        if (sendTotal.greaterThan(0)) {
          return sum.plus(sendTotal);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算累计发货金額（只累加正数）
    totalSendTotalTotalPrice() {
      return this.tableData.reduce((sum, item) => {
        const sendTotalTotalPrice = parseFloat(item.sendTotalTotalPrice) || 0;
        // 只累加正数，忽略负数和零
        if (sendTotalTotalPrice > 0) {
          return sum + sendTotalTotalPrice;
        }
        return sum;
      }, 0);
    },
    // 计算累计收货数量（只累加正数）
    totalPutTotal() {
      return this.tableData.reduce((sum, item) => {
        const putTotal = new Decimal(item.putTotal || 0);
        // 只累加正数，忽略负数和零
        if (putTotal.greaterThan(0)) {
          return sum.plus(putTotal);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算累计收货金額（只累加正数）
    totalPutTotalTotalPrice() {
      return this.tableData.reduce((sum, item) => {
        const putTotalTotalPrice = parseFloat(item.putTotalTotalPrice) || 0;
        // 只累加正数，忽略负数和零
        if (putTotalTotalPrice > 0) {
          return sum + putTotalTotalPrice;
        }
        return sum;
      }, 0);
    },
    // 计算累计入库量（只累加正数）
    totalStoreCount() {
      return this.tableData.reduce((sum, item) => {
        const storeTotal = new Decimal(item.storeTotal || 0);
        // 只累加正数，忽略负数和零
        if (storeTotal.greaterThan(0)) {
          return sum.plus(storeTotal);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算累计入库金額（只累加正数）
    totalStoreTotalTotalPrice() {
      return this.tableData.reduce((sum, item) => {
        const storeTotalTotalPrice = parseFloat(item.storeTotalTotalPrice) || 0;
        // 只累加正数，忽略负数和零
        if (storeTotalTotalPrice > 0) {
          return sum + storeTotalTotalPrice;
        }
        return sum;
      }, 0);
    },
    // 计算累计出库量（只累加正数）
    totalOutCount() {
      return this.tableData.reduce((sum, item) => {
        const outTotal = new Decimal(item.outTotal || 0);
        // 只累加正数，忽略负数和零
        if (outTotal.greaterThan(0)) {
          return sum.plus(outTotal);
        }
        return sum;
      }, new Decimal(0)).toNumber();
    },
    // 计算累计出金額（只累加正数）
    totalOutCkTotalTotalPrice() {
      return this.tableData.reduce((sum, item) => {
        const outCkTotalTotalPrice = parseFloat(item.outCkTotalTotalPrice) || 0;
        // 只累加正数，忽略负数和零
        if (outCkTotalTotalPrice > 0) {
          return sum + outCkTotalTotalPrice;
        }
        return sum;
      }, 0);
    },
  },
  watch: {
    'tableData': {
      deep: true, // 深度观察对象内部的值的变化
      handler() {
        this.calculateAmounts(); // 数据变化时重新计算金额
      },
      immediate:true,
    }
  },
  methods: {
    calculateAmounts() {
      this.tableData.forEach(item => {
        item.planAmountTotalPrice = (item.taxPrice * item.planAmount).toFixed(2)
        item.sendTotalTotalPrice = (item.taxPrice * item.sendTotal).toFixed(2)
        item.putTotalTotalPrice = (item.taxPrice * item.putTotal).toFixed(2)
        item.storeTotalTotalPrice = (item.taxPrice * item.storeTotal).toFixed(2)
        item.outCkTotalTotalPrice = (item.taxPrice * item.outCkTotal).toFixed(2)
      })
    },

    goDetail(num, routername) {
      if (num == 0) {
        return;
      }
      this.$router.push({
        name: routername
      })
    },
  },
};
</script>

<style lang="scss" scoped>
.material-search-table {
  .search-container {
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

<style>
.my-label {
  background: #f2f2f2 !important;
  min-height: 38px !important;
  width: 150px !important;
  font-size: 14px !important;
  color: #1b1e22 !important;
}

.my-content {
  background: #fff;
  width: calc(33.33%-150px) !important;
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
</style>
