<template>
  <div class="material-search-table">
    <!-- 搜索框 -->
    <div class="search-container">
      <div style="font-size: 20px; font-weight: bold">
        <!-- 选择需要修改的物资科目（系统会对应到提报人，请线下联系提报人进行修改操作） -->
      </div>
    </div>
    <!-- 表格 -->
    <el-table
      ref="tableRef"
      :data="tableData"
      style="width: 100%"
      border
      @selection-change="handleSelectionChange"
      max-height="400"
    >
      <!-- 增加多选 -->
      <!-- <el-table-column
        type="selection"
        width="55"
        align="center"
        fixed="left"
      ></el-table-column> -->
      <!-- 序号 -->
      <el-table-column
        type="index"
        align="center"
        label="序号"
        width="60"
        fixed
      ></el-table-column>
      <el-table-column
        prop="sellerName"
        label="供应商"
        align="center"
        width="120"
        fixed
      ></el-table-column>
      <el-table-column
        prop="materialName"
        label="物资名称"
        align="center"
        width="120"
        fixed
      ></el-table-column>
      <el-table-column
        prop="specModel"
        label="规格型号"
        align="center"
        width="150"
        fixed
      ></el-table-column>
      <el-table-column
        prop="unit"
        label="计量单位"
        align="center"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="amount"
        label="合同数量"
        align="center"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="cumulativeAmount"
        label="累计计划量（含本次）"
        align="center"
        width="200"
      >
      </el-table-column>
      <el-table-column
        prop="planAmount"
        label="本次计划数量"
        align="center"
        width="120"
      >
      </el-table-column>
      <el-table-column
        align="center"
        prop="supplyDate"
        label="供应时间"
        min-width="200"
      >
        <template slot-scope="scope">
          {{ scope.row.supplyDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        prop="addr"
        label="使用地点"
        align="center"
        min-width="200"
      >
      </el-table-column>
      <el-table-column
        prop="receiver"
        label="收货人及联系方式"
        align="center"
        min-width="250"
      >
      </el-table-column>
      <el-table-column
        prop="field0"
        label="投资方"
        align="center"
        min-width="200"
      >
      </el-table-column>
      <el-table-column
        prop="field1"
        label="投资比例"
        align="center"
        min-width="200"
      >
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注"
        align="center"
        min-width="200"
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
      console.log(value, 'date')
      if (!value) return '';
      return dayjs(value).format(format);
    }
  },
  computed: {
  },
  methods: {
    handleSelectionChange (selection) {
      // 把当前选中的数据抛出给父组件
      this.$emit('selectionChange', selection);
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