<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        请设置物资需求信息（合计
        <i style="color: red">{{ tableData.length }}</i> 项）
      </div>
      <el-button @click="onGoView"> 选择需求物资 </el-button>
    </div>

    <!-- 表格 -->
    <el-table ref="tableRef" :data="tableData" style="width: 100%" border max-height="350">
      <el-table-column type="index" align="center" label="序号" width="60" fixed show-overflow-tooltip></el-table-column>
      <el-table-column prop="sellerName" label="供应商" align="center" width="120" show-overflow-tooltip fixed></el-table-column>
      <el-table-column prop="materialName" label="物资名称" align="center" width="120" show-overflow-tooltip fixed></el-table-column>
      <el-table-column prop="specModel" label="规格型号" align="center" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="unit" label="计量单位" align="center" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="amount" label="合同数量" align="center" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="cumulativeAmount" label="累计计划量（含本次）" align="center" width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          {{
            +scope.row.cumulativeAmount -
            +scope.row.backPlanAmount +
            +(scope.row.planAmount || 0)
          }}
        </template>
      </el-table-column>
      <el-table-column prop="planAmount" label="本次计划数量" align="center" width="120" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.planAmount" :min="0" :precision="4" size="mini"
            style="width: 100%"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column prop="supplyDate" label="计划使用时间" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-date-picker v-model="scope.row.supplyDate" type="date" size="mini" style="width: 100%"
            value-format="yyyy-MM-dd" :clearable="false"></el-date-picker>
        </template>
      </el-table-column>
      <el-table-column prop="addr" label="使用地点" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-model="scope.row.addr" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="receiver" label="收货人及联系方式" min-width="250" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-model="scope.row.receiver" size="mini" style="width: 100%"></el-input>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  data() {
    return {
      tableData: [],
    };
  },
  computed: {
    ...mapState(['requestUpdate']),
    id() {
      return this.$route.query?.id || ''
    }
  },
  mounted() {
    this.tableData = this.getSelectedMaterialList()
  },
  methods: {
    setTableData(data) {
      this.tableData = data
    },
    onGoView() {
      this.$router.push({
        name: 'requestViewUpdate',
        query: {
          type: 'create',
          id: this.id,
        }
      })
    },
    setSelectedMaterialList(data) {
      this.$store.dispatch('requestUpdate/setSelectedMaterialList', data)
    },
    getSelectedMaterialList(data) {
      return this.requestUpdate.selectedMaterialList
    }
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
