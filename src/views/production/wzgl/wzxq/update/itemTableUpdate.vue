<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        请设置物资需求信息（合计
        <i style="color: red">{{ tableData.length }}</i> 项）
      </div>
      <div style="display: flex; gap: 10px;">
        <el-button type="primary" @click="onImport"> 导入需求物资 </el-button>
        <el-button @click="onGoView"> 选择需求物资 </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table ref="tableRef" :data="tableData" style="width: 100%" border max-height="400">
      <el-table-column type="index" align="center" label="序号" width="60" fixed></el-table-column>
      <el-table-column prop="sellerName" label="供应商" align="center" width="120" fixed></el-table-column>
      <el-table-column prop="materialName" label="物资名称" align="center" width="120" fixed></el-table-column>
      <el-table-column prop="specModel" label="规格型号" align="center" width="150" fixed></el-table-column>
      <el-table-column prop="unit" label="计量单位" align="center" width="120"></el-table-column>
      <el-table-column prop="amount" label="合同数量" align="center" width="120">
        <template slot-scope="scope">
          {{ scope.row.amount }}
         <el-tooltip
                v-if="scope.row.negative && scope.row.negative < 0"
                class="el-icon-warning-outline negative-tip-icon clickable"
                :content="`当前物资存在所有负合同数量总和为: ${scope.row.negative}`"
                title="点击查看补充合同列表"
              >
             <i  @click="handleNegativeIconClick(scope.row)" class="el-icon-warning-outline negative-tip-icon"></i></el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="cumulativeAmount" label="累计计划量（含本次）" align="center" width="200">
        <template slot-scope="scope">
          {{
            +scope.row.cumulativeAmount -
            +scope.row.backPlanAmount +
            +(scope.row.planAmount || 0)
          }}
        </template>
      </el-table-column>
      <el-table-column prop="planAmount" label="本次计划数量" align="center" width="150">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.planAmount" :min="0"
            :max="+scope.row.amount - +scope.row.cumulativeAmount + +scope.row.backPlanAmount" :precision="4"
            size="mini" style="width: 100%"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column prop="supplyDate" label="供应时间" min-width="200" :render-header="renderHeader">
        <template slot-scope="scope">
          <el-date-picker v-model="scope.row.supplyDate" type="date" size="mini" style="width: 100%"
            value-format="yyyy-MM-dd" :clearable="false"></el-date-picker>
        </template>
      </el-table-column>
      <el-table-column prop="addr" label="使用地点" min-width="200" :render-header="renderHeader">
        <template slot-scope="scope">
          <el-input v-model="scope.row.addr" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="receiver" label="收货人及联系方式" min-width="250" :render-header="renderHeader">
        <template slot-scope="scope">
          <el-input v-model="scope.row.receiver" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="field0" label="投资方" min-width="250" :render-header="renderHeader">
        <template slot-scope="scope">
          <el-input v-model="scope.row.field0" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="field1" label="投资比例" min-width="250" :render-header="renderHeader">
        <template slot-scope="scope">
          <el-input v-model="scope.row.field1" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="250">
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
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BatchDialog from './batchDialog.vue';
import dayjs from 'dayjs';
import ViewNegativeContractsDialog from '@/views/production/contract/list/components/viewNegativeContractsDialog.vue';
export default {
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
    ...mapState(['requestUpdate']),
    id() {
      return this.$route.query?.id || ''
    },
    contractId() {
      return this.$route.query?.contractId || ''
    },
    type() {
      return this.$route.query?.type || ''
    },
    totalPlanAmount() {
      return this.tableData.reduce((sum, item) => {
        return sum + item.planAmount;
      }, 0);
    },
  },
  mounted() {
    this.$refs.batchDialogRef.$on('onOk', this.onDialogOk.bind(this)) // ✅
    this.tableData = this.getSelectedMaterialList()
  },
  methods: {
           /**
     * 处理负数图标点击事件
     * 打开查看补充合同列表弹窗
     */
    handleNegativeIconClick(row) {
      if (!row.id) {
        this.$message.warning('数据无效');
        return;
      }

      // 打开查看补充合同弹窗
      this.$refs.viewNegativeContractsDialogRef.open(row.id);
    },
    onDialogOk(data) {
      // 将批量上传的文件，导入到总的数据中
      this.tableData = data.map(x => ({
        ...x,
        backPlanAmount: 0,
        supplyDate: `${dayjs(x.supplyDate).format('YYYY-MM-DD')}`
      }))
      this.setSelectedMaterialList(this.tableData);
      console.log('批量导入的数据', this.tableData);
    },
    onImport() {
      this.$refs.batchDialogRef.open();

    },
    setTableData(data) {
      this.tableData = data
    },
    onGoView() {
      this.$router.push({
        name: 'requestViewUpdate',
        query: {
          type: 'create',
          id: this.id,
          contractId: this.contractId
        }
      })
    },
    setSelectedMaterialList(data) {
      this.$store.dispatch('requestUpdate/setSelectedMaterialList', data)
    },
    getSelectedMaterialList(data) {
      return this.requestUpdate.selectedMaterialList
    },
    renderHeader(h, { column, $index }) {
      return h("div", [
        h("span", {
          style: { color: "red", marginRight: "5px" }
        }, "*"),
        h("span", {}, column.label),
        this.type !== 'view' ?
          h("el-button", {
            props: {
              type: "text",
              icon: "el-icon-document-copy"
            },
            style: {
              marginLeft: "8px",
              fontSize: "14px"
            },
            on: {
              click: () =>
                this.copyLast(column.property)
            }
          }, "填充") : null
      ]);
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