<template>
  <div class="login-stats-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>角色登录信息查询</span>
      </div>
      <div class="filter-container">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          @change="handleDateChange"
        />
        <el-button type="primary" icon="el-icon-search" @click="fetchData" style="margin-left: 10px;">
          查询
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%; margin-top: 20px;"
        border
        fit
        highlight-current-row
      >
        <el-table-column
          label="序号"
          type="index"
          width="80"
          align="center"
        />
        <el-table-column
          prop="TYPENAME"
          label="角色"
          align="center"
        />
        <el-table-column
          prop="NUM"
          label="登录次数"
          align="center"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {loginSelect} from '@/api/system/allSelect.js'


export default {
  name: 'LoginStats',
  data() {
    return {
      loading: false,
      dateRange: [],
      startDate: '',
      endDate: '',
      tableData: []
    }
  },
  methods: {
    handleDateChange(val) {
      if (val && val.length === 2) {
        this.startDate = val[0]
        this.endDate = val[1]
      } else {
        this.startDate = ''
        this.endDate = ''
      }
    },
    async fetchData() {
      this.loading = true
      try {
        if(!this.startDate || !this.endDate) {
          this.$message.warning('请选择开始和结束日期');
          this.loading = false
          return;
        }
        const res = await loginSelect({
          startDate: this.startDate,
          endDate: this.endDate
        })
        if (res.code === 0) {
          this.tableData = res.data
        }
      } catch (error) {
        console.error('获取数据失败', error)
        this.$message.error('获取数据失败');
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-stats-container {
  padding: 20px;
}
.filter-container {
  display: flex;
  align-items: center;
}
.box-card {
  min-height: calc(100vh - 90px);
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
</style>
