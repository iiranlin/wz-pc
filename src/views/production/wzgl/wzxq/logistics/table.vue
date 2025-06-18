<template>
  <div class="">
    <el-table :data="tableData" border style="width: 100%">
      <!-- 序号 -->
      <el-table-column type="index" label="序号" align="center" width="80px">
      </el-table-column>
      <el-table-column
        prop="createDate"
        label="填写时间"
        align="center"
        width="200px"
      >
       <template slot-scope="scope">
          <span>{{ scope.row.createDate | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="positionInformation"
        label="货运位置"
        align="center"
        min-width="250px"
      >
      </el-table-column>
      <el-table-column prop="createUserName" label="操作人" align="center">
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
    formatDate (value, format = 'YYYY年MM月DD日 HH:mm') {
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