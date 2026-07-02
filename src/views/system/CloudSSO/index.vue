<template>
  <div class="login-stats-container">

    <el-card class="box-card" v-loading="loading">
      <div slot="header" class="clearfix">
        <span>云平台用户列表</span>
      </div>
      <div class="filter-container">
        <div>
          <el-input v-model="userName" placeholder="请输入用户名称" clearable
            style="margin-right: 10px; width: 240px;"></el-input>
          <el-select v-model="dateRange" placeholder="请选择" clearable>
            <el-option v-for="item in userTypeOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>

        <div>
          <el-button size="small" type="primary" icon="el-icon-search" @click="handleQuery" style="margin-left: 10px;">
            查询
          </el-button>
          <el-button size="small" icon="el-icon-sort" :loading="syncLoading" @click="syncUser()">
            同步用户
          </el-button>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%; margin-top: 20px;" height="400" border fit highlight-current-row>
        <el-table-column label="序号" type="index" width="80" align="center">
          <template slot-scope="{ row, $index }">
            {{ (pageNum - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="loginid" label="用户编号" align="center" />
        <el-table-column prop="lastname" label="用户名称" align="center" />
        <el-table-column prop="bindUser" label="绑定用户" align="center" />
        <!-- <el-table-column label="状态" align="center">
          <template slot-scope="{ row }">
            {{ row.bindStatus == 0 ? "未绑定" : "已绑定" }}
          </template>
</el-table-column> -->
        <el-table-column label="操作" width="120px" align="center">
          <template slot-scope="{ row, $index }">
            <el-button size="mini" type="text" @click="binding(row, 0)"> {{ row.bindStatus == 0 ? "绑定" : "已绑定"
            }}</el-button>
            <!-- <el-divider direction="vertical" />
            <el-button size="mini" type="text" :disabled="row.bindStatus == 0" style="color: #ff4d4f"
              @click="unbind(row, 0)">解绑</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize"
        @pagination="fetchData" />
    </el-card>

    <el-card class="box-card" v-loading="appLoading">
      <div slot="header" class="clearfix">
        <span>物资平台用户列表</span>
      </div>
      <div class="filter-container">
        <div>
          <el-input v-model="userNameTwo" placeholder="请输入用户名称" style="margin-right: 10px; width: 240px;"
            clearable></el-input>
          <el-select v-model="appDateRange" placeholder="请选择" clearable>
            <el-option v-for="item in userTypeOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>

        <div>
          <el-button size="small" type="primary" icon="el-icon-search" @click="handleQueryTwo"
            style="margin-left: 10px;">
            查询
          </el-button>
          <el-button size="small" icon="el-icon-sort" :loading="syncLoadingTwo" @click="syncUserTwo()">
            同步用户
          </el-button>
        </div>

      </div>

      <el-table :data="appTableData" height="400" style="width: 100%; margin-top: 20px;" border fit
        highlight-current-row>
        <el-table-column label="序号" type="index" width="80" align="center">
          <template slot-scope="{ row, $index }">
            {{ (pageNumTwo - 1) * pageSizeTwo + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="userCode" label="用户编号" align="center" />
        <el-table-column prop="userName" label="用户名称" align="center" />
        <el-table-column prop="bindUser" label="绑定用户" align="center" />
        <!-- <el-table-column label="状态" align="center">
          <template slot-scope="{ row }">
            {{ row.bindStatus == 0 ? "未绑定" : "已绑定" }}
          </template>
        </el-table-column> -->
        <el-table-column label="操作" width="120px" align="center">
          <template slot-scope="{ row, $index }">
            <el-button size="mini" type="text" @click="binding(row, 1)">{{ row.bindStatus == 0 ? "绑定" : "已绑定"
            }}</el-button>
            <!-- <el-divider direction="vertical" />
            <el-button size="mini" type="text" :disabled="row.bindStatus == 0" style="color: #ff4d4f"
              @click="unbind(row, 1)">解绑</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="totalTwo > 0" :total="totalTwo" :page.sync="pageNumTwo" :limit.sync="pageSizeTwo"
        @pagination="fetchAppData" />
    </el-card>

    <!-- 绑定 -->
    <binding ref="bindingDialog" :clickNum="clickNum" :currentRow="currentRow" @fetchData="fetchData"
      @fetchAppData="fetchAppData" />
  </div>
</template>

<script>
import binding from '@/views/system/CloudSSO/binding.vue'
import { getSystemPersonList, getExternalPersonList, updStaffTypeOutList, insStaffTypeOutList, getCasUserByDepartmentId } from '@/api/system/CloudSSO.js'

export default {
  name: 'CloudSSO',

  components: {
    binding,
  },

  data() {
    return {
      syncLoading: false,
      syncLoadingTwo: false,
      clickNum: 0,
      currentRow: null,
      total: 0,
      pageNum: 1,
      pageSize: 10,
      totalTwo: 0,
      pageNumTwo: 1,
      pageSizeTwo: 10,
      userTypeOptions: [
        {
          value: '0',
          label: '未绑定'
        },
        {
          value: '1',
          label: '已绑定'
        }
      ],
      userName: '',
      userNameTwo: '',
      loading: false,
      dateRange: '',
      tableData: [],
      appLoading: false,
      appDateRange: '',
      appTableData: []
    }
  },
  mounted() {
    this.fetchData();
    this.fetchAppData();
  },
  methods: {
    // 云平台查询
    handleQuery() {
      this.pageNum = 1
      this.fetchData();
    },
    async fetchData() {
      this.loading = true
      try {
        const res = await getSystemPersonList({
          lastname: this.userName,
          bindStatus: this.dateRange,
          pageNum: this.pageNum,
          pageSize: this.pageSize
        })
        if (res.code === 0) {
          this.tableData = res.data?.list || [];
          this.total = res.data?.total || 0;
        }
      } catch (error) {
        console.error('获取数据失败', error)
      } finally {
        this.loading = false
      }
    },
    // 物资平台查询
    handleQueryTwo() {
      this.pageNumTwo = 1
      this.fetchAppData();
    },
    async fetchAppData() {
      this.appLoading = true
      try {

        const res = await getExternalPersonList({
          userName: this.userNameTwo,
          bindStatus: this.appDateRange,
          pageNum: this.pageNumTwo,
          pageSize: this.pageSizeTwo
        })
        if (res.code === 0) {
          this.appTableData = res.data?.list || [];
          this.totalTwo = res.data?.total || 0;
        }
      } catch (error) {
        console.error('获取数据失败', error)
      } finally {
        this.appLoading = false
      }
    },
    // 绑定
    binding(row, num) {
      // num 0:云平台用户列表 1:物资平台用户列表
      this.clickNum = num;

      this.currentRow = { ...row };

      this.$nextTick(() => {
        this.$refs.bindingDialog.init();
      });
    },
    // 解绑
    unbind(row, num) {
      this.$confirm('确定解绑该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 同时开启loading,防止不同表格重复点击
        this.loading = true;
        this.appLoading = true;
        const wzBindUser = num == 0 ? "" : row?.userCode;
        const casBindUser = num == 0 ? row?.loginid : "";

        try {
          const res = await updStaffTypeOutList({
            wzBindUser,
            casBindUser,
            clickNum: num
          })
          if (res.code === 0) {
            this.$message.success('解绑成功');
            this.fetchData();
            this.fetchAppData();
          } else {
            this.$message.error(res.msg);
          }
        } catch (error) {
          console.error('解绑失败', error)
          this.$message.error('解绑失败');
        } finally {
          this.loading = false
          this.appLoading = false
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消解绑'
        });
      }).finally(() => {
        this.loading = false
        this.appLoading = false
      })
    },
    // 同步云平台用户
    async syncUser() {
      this.$confirm('确定同步云平台用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.syncLoading = true;
        try {
          const formData = new FormData();
          formData.append('allFlag', 'addCasUser');

          const res = await getCasUserByDepartmentId(formData)
          if (res.code === 0) {
            this.$message.success('同步成功');
            this.fetchData();
          } else {
            this.$message.error(res.msg);
          }
        } catch (error) {
          console.error('同步失败', error)
        } finally {
          this.syncLoading = false;
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消同步'
        });
      }).finally(() => {
        this.syncLoading = false;
      })
    },
    // 同步物资平台用户
    async syncUserTwo() {
      this.$confirm('确定同步物资平台用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.syncLoadingTwo = true;
        try {
          const res = await insStaffTypeOutList({});
          if (res.code === 0) {
            this.$message.success('同步成功');
            this.fetchAppData();
          } else {
            this.$message.error(res.msg);
          }
        } catch (error) {
          console.error('同步失败', error)
        } finally {
          this.syncLoadingTwo = false;
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消同步'
        });
      }).finally(() => {
        this.syncLoadingTwo = false;
      })
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

.filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.el-table {
  margin: 0 auto !important;
}
</style>
