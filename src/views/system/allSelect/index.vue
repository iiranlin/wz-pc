<template>
  <div class="login-stats-container">
    <div class="top-actions">
      <el-button type="primary" icon="el-icon-download" @click="handleReviewDurationDownload">
        审核耗时统计表下载
      </el-button>
    </div>
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
        height="200"
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

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>应用数据查询</span>
        <el-button type="primary" icon="el-icon-download" @click="handleDownload" style="float: right;">下载</el-button>
      </div>
      <div class="filter-container">
        <el-select
          v-model="constructionUnitId"
          placeholder="请选择枢纽指挥部"
          clearable
          style="width: 220px; margin-right: 10px;"
        >
          <el-option
            v-for="item in constructionUnitOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-date-picker
          v-model="appDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          @change="handleAppDateChange"
        />
        <el-button type="primary" icon="el-icon-search" @click="fetchAppData" style="margin-left: 10px;">
          查询
        </el-button>
      </div>

      <el-table
        v-loading="appLoading"
        :data="appTableData"
        height="300"
        style="width: 100%; margin-top: 20px;"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="序号" type="index" width="80" align="center"/>
        <el-table-column prop="projectName" label="建设项目" align="center"/>
        <el-table-column prop="sectionShortName" label="标段项目简称" width="150" align="center"/>
        <el-table-column prop="submitPlan" label="提交计划累计" width="80" align="center"/>
        <el-table-column prop="submitPlanAdd" label="提交计划新增" align="center"/>
        <el-table-column prop="firstAcceptance" label="初验收货累计" align="center"/>
        <el-table-column prop="firstAcceptanceAdd" label="初验收货新增" align="center"/>
        <el-table-column prop="qualityIn" label="质检入库累计" align="center"/>
        <el-table-column prop="qualityInAdd" label="质检入库新增" align="center"/>
        <el-table-column prop="out" label="出库累计" align="center"/>
        <el-table-column prop="outAdd" label="出库新增" align="center"/>
        <el-table-column prop="selfPurchaseFile" label="自购物资文件累计" align="center"/>
        <el-table-column prop="selfPurchaseFileAdd" label="自购物资文件新增" align="center"/>
        <el-table-column prop="selfPurchaseContract" label="自购合同累计" align="center"/>
        <el-table-column prop="selfPurchaseContractAdd" label="自购合同新增" align="center"/>
      </el-table>
    </el-card>

  </div>
</template>

<script>
import {loginSelect,getSectionProjectReport} from '@/api/system/allSelect.js'
import { newListByDeptCode } from '@/api/system/dept.js'
import * as FileApi from "@/api/prodmgr-inv/project/file.js";

export default {
  name: 'LoginStats',
  data() {
    return {
      // 角色登录信息查询
      loading: false,
      dateRange: [],
      startDate: '',
      endDate: '',
      tableData: [],
      // 应用数据查询
      appLoading: false,
      appDateRange: [],
      appStartDate: '',
      appEndDate: '',
      appTableData: [],
      constructionUnitId: '',
      constructionUnitOptions: []
    }
  },
  created() {
    this.getConstructionUnitOptions()
  },
  methods: {
    async getConstructionUnitOptions() {
      try {
        const res = await newListByDeptCode({
          deptCodePrefix: 'SN',
          status: ''
        })
        this.constructionUnitOptions = (res.data || []).map(item => ({
          value: item.id,
          label: item.deptName
        }))
      } catch (error) {
        console.error('获取枢纽指挥部失败', error)
        this.$message.error('获取枢纽指挥部失败')
      }
    },
    handleDateChange(val) {
      if (val && val.length === 2) {
        this.startDate = val[0]
        this.endDate = val[1]
      } else {
        this.startDate = ''
        this.endDate = ''
      }
    },
    handleAppDateChange(val) {
      if (val && val.length === 2) {
        this.appStartDate = val[0]
        this.appEndDate = val[1]
      } else {
        this.appStartDate = ''
        this.appEndDate = ''
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
    },
    async fetchAppData() {
      this.appLoading = true
      try {
        if(!this.appStartDate || !this.appEndDate) {
          this.$message.warning('请选择开始和结束日期');
          this.appLoading = false
          return;
        }
        const res = await getSectionProjectReport({
          startDateStr: this.appStartDate,
          endDateStr: this.appEndDate,
          constructionUnitId: this.constructionUnitId
        })
        if (res.code === 0) {
          this.appTableData = res.data
        }
      } catch (error) {
        console.error('获取应用数据失败', error)
        this.$message.error('获取应用数据失败');
      } finally {
        this.appLoading = false
      }
    },

    async handleDownload() {
      try {
        this.appLoading = true;
        if(!this.appStartDate || !this.appEndDate) {
          this.$message.warning('请选择开始和结束日期');
          this.appLoading = false;
          return;
        }
        if(this.appTableData.length === 0) {
          this.$message.warning('没有可下载的数据');
          this.appLoading = false;
          return;
        }
        await FileApi.customDownload({
          businessType: 0,
          businessData: JSON.stringify({
            startDateStr: this.appStartDate,
            endDateStr: this.appEndDate,
            constructionUnitId: this.constructionUnitId
          })
        });
      } catch (error) {
        console.error('下载失败', error);
        this.$message.error('下载失败');
      } finally {
        this.appLoading = false;
      }
    },
    async handleReviewDurationDownload() {
      try {
        await FileApi.customDownload({ businessType: 18 })
      } catch (error) {
        console.error('审核耗时统计表下载失败', error)
        this.$message.error('审核耗时统计表下载失败')
      }
    },
  }
}
</script>

<style scoped>
.login-stats-container {
  padding: 20px;
  height: calc(100vh - 90px);
  overflow-y: auto;
}
.top-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.filter-container {
  display: flex;
  align-items: center;
}
.box-card {
  /* min-height: 400px; */
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
