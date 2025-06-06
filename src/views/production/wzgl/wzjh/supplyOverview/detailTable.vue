<template>
  <div class="material-search-table">
    <el-table :data="tableData" border style="width: 100%">
      <!-- 序号 -->
      <el-table-column type="index" label="序号" align="center" width="80px">
      </el-table-column>
      <el-table-column
        prop="updateContent"
        label="供应商"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="updateType"
        label="物资名称"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column prop="updateBefore" label="规格型号" align="center">
      </el-table-column>
      <el-table-column prop="updateAfter" label="计量单位" align="center">
      </el-table-column>
      <el-table-column prop="updateAfter" label="合同数量" align="center">
      </el-table-column>
      <el-table-column
        prop="updateAfter"
        label="累计计划量（含本次）"
        align="center"
      >
      </el-table-column>
      <el-table-column prop="updateAfter" label="本次计划数量" align="center">
      </el-table-column>
      <el-table-column prop="updateAfter" label="已发货" align="center">
      </el-table-column>
      <el-table-column prop="updateAfter" label="已验收" align="center">
      </el-table-column>
      <el-table-column prop="updateAfter" label="已入库" align="center">
      </el-table-column>
      <el-table-column prop="updateAfter" label="已出库" align="center">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import dayjs from 'dayjs';
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
    formatDate (value, format = 'YYYY-MM-DD') {
      if (!value) return '';
      return dayjs(value).format(format);
    }
  },
  methods: {


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
</style>