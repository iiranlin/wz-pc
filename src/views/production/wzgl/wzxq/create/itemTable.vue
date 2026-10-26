<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        请设置物资需求信息（已选择
        <i style="color: red">{{ tableData.length }}</i> 项）
      </div>
      <div style="display: flex; gap: 10px;">
        <el-button class="custom_button" small type="primary" @click="onImport"> 导入需求物资 </el-button>
        <el-button class="custom_button" small @click="onGoView"> 选择需求物资 </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table ref="tableRef" :data="tableData" style="width: 100%" border max-height="350">
      <el-table-column type="index" align="center" label="序号" width="60" fixed show-overflow-tooltip></el-table-column>
      <el-table-column prop="sellerName" label="供应商" align="center" width="120" fixed show-overflow-tooltip></el-table-column>
      <el-table-column prop="materialName" label="物资名称" align="center" width="120" fixed show-overflow-tooltip></el-table-column>
      <el-table-column prop="specModel" label="规格型号" align="center" width="150" fixed show-overflow-tooltip></el-table-column>
      <el-table-column prop="unit" label="计量单位" align="center" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="amount" label="合同数量" align="center" width="120" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.amount }}
          <el-tooltip
            v-if="scope.row.negative && scope.row.negative < 0"
            class="el-icon-warning-outline negative-tip-icon clickable"
          >
            <div slot="content">
              <div>原合同数量: {{ getNegativeSummary(scope.row).originalAmount }}</div>
              <div>当前物资存在所有负合同数量总和为: {{ getNegativeSummary(scope.row).negativeAmount }}</div>
            </div>
            <i @click="handleNegativeIconClick(scope.row)" class="el-icon-warning-outline negative-tip-icon"></i>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="cumulativeAmount" label="累计计划量（含本次）" align="center" width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ getCumulativeAmount(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column prop="planAmount" label="本次计划数量" align="center" width="150" show-overflow-tooltip>
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>本次计划数量</span>
        </template>
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.planAmount" :min="0"
            :max="getRemainingAmount(scope.row)" :precision="4" size="mini"
            style="width: 100%"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column prop="supplyDate" label="计划使用时间" min-width="200" show-overflow-tooltip>
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>计划使用时间</span>
          <el-button type="text" icon="el-icon-document-copy" @click="copyLast('supplyDate')"
            style="margin-left: 8px; font-size: 14px">填充</el-button>
        </template>
        <template slot-scope="scope">
          <el-date-picker v-model="scope.row.supplyDate" type="date" size="mini" style="width: 100%"
            value-format="yyyy-MM-dd"></el-date-picker>
        </template>
      </el-table-column>
      <el-table-column prop="addr" label="使用地点" min-width="200" show-overflow-tooltip>
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>使用地点</span>
          <el-button type="text" icon="el-icon-document-copy" @click="copyLast('addr')"
            style="margin-left: 8px; font-size: 14px">填充</el-button>
        </template>
        <template slot-scope="scope">
          <el-input v-model="scope.row.addr" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="field2" label="收货地址" min-width="200" show-overflow-tooltip>
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>收货地址</span>
          <el-button type="text" icon="el-icon-document-copy" @click="copyLast('field2')"
            style="margin-left: 8px; font-size: 14px">填充</el-button>
        </template>
        <template slot-scope="scope">
          <el-input v-model="scope.row.field2" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="receiver" label="收货人及联系方式" min-width="250" show-overflow-tooltip>
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>收货人及联系方式</span>
          <el-button type="text" icon="el-icon-document-copy" @click="copyLast('receiver')"
            style="margin-left: 8px; font-size: 14px">填充</el-button>
        </template>
        <template slot-scope="scope">
          <el-input v-model="scope.row.receiver" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="field0" label="投资方" min-width="200" show-overflow-tooltip>
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>投资方</span>
          <el-button type="text" icon="el-icon-document-copy" @click="copyLast('field0')"
            style="margin-left: 8px; font-size: 14px">填充</el-button>
        </template>
        <template slot-scope="scope">
          <el-input v-model="scope.row.field0" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="field1" label="投资比例" min-width="200" show-overflow-tooltip>
        <template slot="header">
          <span style="color: red; margin-right: 5px">*</span>
          <span>投资比例</span>
          <el-button type="text" icon="el-icon-document-copy" @click="copyLast('field1')"
            style="margin-left: 8px; font-size: 14px">填充</el-button>
        </template>
        <template slot-scope="scope">
          <el-input :value="scope.row.field1" @input="$set(scope.row, 'field1', formatInvestmentRatio($event))"
            size="mini" style="width: 100%">
            <template slot="suffix">%</template>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-model="scope.row.remark" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
    </el-table>
    <!-- 统计信息 -->
    <div class="summary-info" v-if="tableData.length > 0">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="summary-item">
            <span class="summary-label">总条数：</span>
            <span class="summary-value amount-text">{{ tableData.length }} 条</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <span class="summary-label">本次计划数量合计：</span>
            <span class="summary-value amount-text">{{ totalPlanAmount.toFixed(4) }} </span>
          </div>
        </el-col>
      </el-row>
    </div>
    <BatchDialog ref="batchDialogRef" />
    <ViewNegativeContractsDialog ref="viewNegativeContractsDialogRef" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BatchDialog from './batchDialog.vue';
import dayjs from 'dayjs';
import ViewNegativeContractsDialog from '@/views/production/contract/list/components/viewNegativeContractsDialog.vue';
import { getNegativeContractSummary } from '@/utils/negativeContractSummary';
import Decimal from 'decimal.js';
export default {
  // 新增物资填报表格
  data() {
    return {
      tableData: [],
    };
  },
  components: {
    BatchDialog,
    ViewNegativeContractsDialog,
  },
  computed: {
    ...mapState(['request']),
    id() {
      return this.$route.query?.id || ''
    },
    totalPlanAmount() {
      return this.tableData.reduce((sum, item) => {
        return sum.plus(item.planAmount || 0);
      }, new Decimal(0)).toNumber();
    },
  },
  mounted() {
    this.$refs.batchDialogRef.$on('onOk', this.onDialogOk.bind(this)) // ✅

    this.tableData = this.getSelectedMaterialList().map(x => ({
      ...x,
      field1: this.normalizeInvestmentRatio(x.field1),
      // 合同数量 - 累计数量
      planAmount: this.getRemainingAmount(x)
    }))
  },
  methods: {
    normalizeInvestmentRatio(value) {
      return String(value == null ? '' : value).replace(/%/g, '').trim();
    },
    formatInvestmentRatio(value) {
      const cleaned = String(value).replace(/[^\d.]/g, '');
      const [integer, ...decimals] = cleaned.split('.');
      const normalizedInteger = integer.replace(/^0+(?=\d)/, '');
      const formatted = decimals.length
        ? `${normalizedInteger || '0'}.${decimals.join('').slice(0, 2)}`
        : normalizedInteger;
      return Number(formatted) > 100 ? '100' : formatted;
    },
    getCumulativeAmount(row) {
      return new Decimal(row.cumulativeAmount || 0).plus(row.planAmount || 0).toNumber();
    },
    getRemainingAmount(row) {
      return new Decimal(row.amount || 0).minus(row.cumulativeAmount || 0).toNumber();
    },
    getNegativeSummary(row) {
      return getNegativeContractSummary(row);
    },
    /**
     * 处理负数图标点击事件
     * 打开查看补充合同列表弹窗
     */
    handleNegativeIconClick(row) {
      if (!row.uniqueNumber && !row.allocationUniqueNumber) {
        this.$message.warning('数据无效');
        return;
      }

      // 打开查看补充合同弹窗
      this.$refs.viewNegativeContractsDialogRef.open(row.uniqueNumber || row.allocationUniqueNumber, row);
    },
    onDialogOk(data) {
      // 将批量上传的文件，导入到总的数据中
      this.tableData = data.map(x => ({
        ...x,
        field1: this.normalizeInvestmentRatio(x.field1),
        supplyDate: `${dayjs(x.supplyDate).format('YYYY-MM-DD')}`
      }))
      this.setSelectedMaterialList(this.tableData);
      console.log('批量导入的数据', this.tableData);
    },
    onImport() {
      this.$refs.batchDialogRef.open();

    },
    copyLast(name) {
      if (!this.tableData || this.tableData.length === 0) return;

      let lastIndex = -1;
      let lastDate = null;

      for (let i = this.tableData.length - 1; i >= 0; i--) {
        if (this.tableData[i][name]) {
          lastIndex = i;
          lastDate = this.tableData[i][name];
          break;
        }
      }

      if (lastDate === null) return;

      for (let i = lastIndex + 1; i < this.tableData.length; i++) {
        if (!this.tableData[i][name]) {
          this.$set(this.tableData[i], name, lastDate);
        }
      }
    },
    onGoView() {
      this.$router.push({
        name: 'requestView',
        query: {
          type: 'create',
          id: this.id
        }
      })
    },
    setSelectedMaterialList(data) {
      this.$store.dispatch('request/setSelectedMaterialList', data)
    },
    getSelectedMaterialList(data) {
      return this.request.selectedMaterialList
    }
  },
};
</script>

<style lang="scss" scoped>
.custom_button {
    transform: translateY(-1px);
    border-radius: 50px;
    font-size: 14px;
    text-align: center;
    height: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 5px 15px 5px 15px;
    position: relative;
    margin-right: 6px;
    box-sizing: border-box;
    line-height: 22px;
}
.material-search-table {
  .search-container {
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

/* 金额文字样式 */
.amount-text {
  color: #e6a23c;
  font-weight: 600;
}

/* 统计信息样式 */
.summary-info {
  margin-left: 10px;
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

/* 负数提示图标样式 */
.negative-tip-icon {
  margin-left: 5px;
  color: #E6A23C;
  font-size: 16px;
  vertical-align: middle;
}

.negative-tip-icon.clickable {
  cursor: pointer;
}

.negative-tip-icon.clickable:hover {
  color: #D39C2F;
  transform: scale(1.1);
}
</style>
