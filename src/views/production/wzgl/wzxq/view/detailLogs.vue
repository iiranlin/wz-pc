<template>
    <!-- 表格 -->
    <el-table ref="tableRef" height="350" :data="tableData" style="width: 100%" border>
      <el-table-column
        type="index"
        align="center"
        label="序号"
        width="60"
      ></el-table-column>
      <el-table-column
        prop="logName"
        label="事件"
        align="center"
        min-width="150"
      ></el-table-column>
      <el-table-column
        prop="deptName"
        label="事件组织"
        align="center"
        min-width="300"
      ></el-table-column>
      <el-table-column
        prop="createUserName"
        label="操作人"
        align="center"
        width="150"
      ></el-table-column>
      <el-table-column
        prop="createDate"
        label="时间"
        align="center"
        width="200"
      >
        <template slot-scope="scope">
          {{ scope.row.createDate | formatDate }}
        </template>
      </el-table-column>
      <el-table-column
        prop="amount"
        label="备注"
        align="center"
        width="200"
      ></el-table-column>
    </el-table>
</template>

<script>
import dayjs from 'dayjs';
import * as LogsApi from '@/api/prodmgr-inv/project/logs.js'

export default {
  // 需求详情日志表格数据

  filters: {
    // 日期格式化过滤器
    formatDate (value, format = 'YYYY-MM-DD HH:mm') {
      if (!value) return '';
      return dayjs(value).format(format);
    }
  },
  data () {
    return {
      tableData: [],
    }
  },
  created(){
    this.getLogs()
  },
  computed: {
    id () {
      return this.$route.query?.id || ''
    }
  },
  methods: {
    async getLogs () {
      await LogsApi.itemList({
        businessId: this.id
      }).then(({ data }) => {
        this.tableData = data
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