<template>
  <Dialog :title="title" :visible.sync="visible" v-if="visible" :show-close="true" :close-on-click-modal="false"
    :close-on-press-escape="false" :append-to-body="true" :destroy-on-close="true" class="dialog-route" width="1200px">
    <div class="form-render-wrapper" style="margin-top: 16px">
      <el-row :gutter="10">
        <el-col :span="24" v-if="clickNum == 1" class="container_table_div" v-loading="loading">
          <!-- <div class="filter-container">
            <div>
              <el-input v-model="userName" placeholder="请输入用户名称" clearable
                style="margin-right: 10px; width: 240px;"></el-input>
            </div>

            <div>
              <el-button size="small" type="primary" icon="el-icon-search" @click="handleQuery"
                style="margin-left: 10px;">
                查询
              </el-button>
            </div>
          </div> -->

          <el-table ref="multipleTable" :data="tableData" style="width: 100%; margin-top: 20px;"
            height="calc(100vh - 320px)" border fit highlight-current-row @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column label="序号" type="index" width="80" align="center">
              <template slot-scope="{ row, $index }">
                {{ (pageNum - 1) * pageSize + $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="loginid" label="用户编号" align="center" />
            <el-table-column prop="lastname" label="用户名称" align="center" />
          </el-table>
          <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize"
            @pagination="fetchDataTwo" />
        </el-col>
        <el-col :span="24" v-else class="container_table_div" v-loading="loading">
          <!-- <div class="filter-container">
            <div>
              <el-input v-model="userNameTwo" placeholder="请输入用户名称" style="margin-right: 10px; width: 240px;"
                clearable></el-input>
            </div>

            <div>
              <el-button size="small" type="primary" icon="el-icon-search" @click="handleQueryTwo"
                style="margin-left: 10px;">
                查询
              </el-button>
            </div>
          </div> -->

          <el-table ref="multipleTable" v-loading="loading" :data="appTableData" height="calc(100vh - 320px)"
            style="width: 100%; margin-top: 20px;" border fit highlight-current-row
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column label="序号" type="index" width="80" align="center">
              <template slot-scope="{ row, $index }">
                {{ (pageNumTwo - 1) * pageSizeTwo + $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="userCode" label="用户编号" align="center" />
            <el-table-column prop="userName" label="用户名称" align="center" />
          </el-table>
          <pagination v-show="totalTwo > 0" :total="totalTwo" :page.sync="pageNumTwo" :limit.sync="pageSizeTwo"
            @pagination="fetchAppDataTwo" />
        </el-col>
      </el-row>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button round type="primary" @click="handleCreate" :loading="loading" :disabled="loading">确认</el-button>
      <el-button round @click="handleCancel">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { getSystemPersonList, getExternalPersonList, updStaffTypeOutList } from '@/api/system/CloudSSO.js'
export default {
  name: "binding",

  props: {
    clickNum: {
      type: Number,
      default: 0
    },
    currentRow: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      title: '绑定用户',
      visible: false,

      total: 0,
      pageNum: 1,
      pageSize: 10,
      totalTwo: 0,
      pageNumTwo: 1,
      pageSizeTwo: 10,
      userName: '',
      userNameTwo: '',
      loading: false,
      tableData: [],
      appTableData: [],
      multipleSelection: [],
    }
  },
  methods: {
    //初始化
    init() {
      this.visible = true;
      if (this.clickNum == 1) {
        this.userName = '';
        this.pageNum = 1;
        this.pageSize = 10;
      } else {
        this.userNameTwo = '';
        this.pageNumTwo = 1;
        this.pageSizeTwo = 10;
      }

      this.clickNum == 0 ? this.fetchAppDataTwo() : this.fetchDataTwo();
      this.$nextTick(() => {
        this.title = "绑定用户";
      });
    },

    // 云平台查询
    handleQuery() {
      this.pageNum = 1
      this.fetchDataTwo();
    },
    async fetchDataTwo() {
      this.loading = true
      try {
        const res = await getSystemPersonList({
          lastname: this.userName,
          bindStatus: 0,
          userCode: this.currentRow?.userCode,
          pageNum: this.pageNum,
          pageSize: this.pageSize
        })
        if (res.code === 0) {
          this.tableData = res.data?.list || [];
          this.total = res.data.total || 0;
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
    async fetchAppDataTwo() {
      this.loading = true
      try {

        const res = await getExternalPersonList({
          userName: this.userNameTwo,
          bindStatus: 0,
          userCode: this.currentRow?.loginid,
          pageNum: this.pageNumTwo,
          pageSize: this.pageSizeTwo
        })
        if (res.code === 0) {
          this.appTableData = res.data?.list || [];
          this.totalTwo = res.data.total || 0;
        }
      } catch (error) {
        console.error('获取数据失败', error)
      } finally {
        this.loading = false
      }
    },

    handleSelectionChange(val) {
      if (val.length > 1) {
        // 找到新勾选的那条（当前数组最后一项）
        const newRow = val[val.length - 1]
        // 清空所有选中
        this.$refs.multipleTable.clearSelection()
        // 只勾选最新点击的这一行
        this.$refs.multipleTable.toggleRowSelection(newRow, true)
      }
      this.multipleSelection = val;
    },

    // 绑定
    handleCreate() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请选择要绑定的用户');
        return;
      }
      this.$confirm('确定绑定该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.loading = true;
        const wzBindUser = this.clickNum == 0 ? this.multipleSelection[0]?.userCode : this.currentRow?.userCode;
        const casBindUser = this.clickNum == 0 ? this.currentRow?.loginid : this.multipleSelection[0]?.loginid;

        try {
          const res = await updStaffTypeOutList({
            wzBindUser,
            casBindUser,
            clickNum: this.clickNum
          })
          if (res.code === 0) {
            this.$message.success('绑定成功');
            this.$emit('fetchData');
            this.$emit('fetchAppData');
            this.visible = false;
          } else {
            this.$message.error(res.msg);
          }
        } catch (error) {
          console.error('绑定失败', error)
          this.$message.error('绑定失败');
        } finally {
          this.loading = false;
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消绑定'
        });
      }).finally(() => {
        this.loading = false;
      })
    },
    //取消
    handleCancel() {
      this.visible = false;
    },
  },
}
</script>

<style lang="scss" scoped>
.filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 15px;
}

::v-deep .el-table__header-wrapper .el-checkbox {
  display: none;
}

.container_table_div {
  margin-bottom: 10px;
}

.el-table {
  margin: 0 auto !important;
}

::v-deep .container_table_div .el-table--border .el-table__cell:first-child .cell {
  padding-left: 20px !important;
}
</style>