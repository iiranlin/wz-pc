<template>
  <div class="">
    <el-table :data="tableData" border style="width: 100%">
      <!-- 序号 -->
      <el-table-column type="index" label="序号" align="center" width="80px">
      </el-table-column>
      <el-table-column
        prop="sectionName"
        label="标段项目名称"
        align="center"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="materialName"
        label="物资名称"
        align="center"
        min-width="250px"
      >
      </el-table-column>
      <el-table-column
        prop="specModel"
        label="规格型号"
        align="center"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="unit"
        label="计量单位"
        align="center"
        width="120px"
      >
      </el-table-column>
      <el-table-column
        prop="amount"
        label="合同数量"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="cumulativeAmount"
        label="累计计划量（含本次）"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="updateBefore"
        label="本次计划数量"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="cumulativeAmount"
        label="累计发货数量（含本次）"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="planAmount"
        label="本批次发货数量"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        prop="supplyDate"
        label="供应时间"
        align="center"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="addr"
        label="使用地点"
        align="center"
        width="200px"
      >
      </el-table-column>
        <el-table-column
        prop="field2"
        label="收货地址"
        align="center"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="receiver"
        label="收货人及联系方式"
        align="center"
        width="200px"
      >
      </el-table-column>
       <el-table-column
        prop="field0"
        label="投资方"
        align="center"
        width="200px"
      >
      </el-table-column>
       <el-table-column
        prop="field1"
        label="投资比例"
        align="center"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注"
        align="center"
        width="200px"
      >
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