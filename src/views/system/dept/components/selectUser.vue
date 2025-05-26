<template>
  <!-- 授权用户 -->
  <Dialog class="pop-dialog" :visible.sync="visible" width="1300px" :close-on-click-modal="false" append-to-body >
    <div slot="title" class="dialog-title">
      <span class="title">选择用户</span>
      <div class="button-top">
        <el-button class="button-item search" type="primary" @click="handleQuery">
          <icon-svg icon-class="Line-Search"/>
          <span class="button-text">搜索</span>
        </el-button>
        <el-button class="button-item reset" @click="resetQuery">
          <icon-svg icon-class="Line-Refresh" class="icon-svg-blue"/>
          <span class="button-text">重置</span>
        </el-button>
        <!--        <el-button class="button-item toggle" @click="handleMore" v-show="!showDetail">-->
        <!--          <span class="button-text">展开更多</span><i class="el-icon-caret-bottom el-icon&#45;&#45;right"></i>-->
        <!--        </el-button>-->
        <!--        <el-button class="button-item toggle" @click="handleClose" v-show="showDetail">-->
        <!--          <span class="button-text">收起更多</span><i class="el-icon-caret-top el-icon&#45;&#45;right"></i>-->
        <!--        </el-button>-->
      </div>
    </div>
    <el-form class="pop-form" :style="formHeight" :model="queryParams" ref="queryForm" size="small" :inline="true"
             label-width="85px"
    >
      <el-form-item class="form-item" label="用户账号" prop="username">
        <el-input v-model="queryParams.username" placeholder="请输入用户账号" clearable style="width: 240px" @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item class="form-item" label="用户昵称" prop="nickName">
        <el-input v-model="queryParams.nickName" placeholder="请输入用户昵称" clearable style="width: 240px" @keyup.enter.native="handleQuery"/>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" ref="table" :data="userList" @selection-change="handleSelectionChange"
                height="65vh"
      >
        <el-table-column type="selection" :reserve-selection="true" width="55" align="center"/>
        <el-table-column label="用户账号" prop="username" :show-overflow-tooltip="true" align="left" min-width="150"/>
        <!--<el-table-column label="用户编号" prop="userCode" align="center"-->
        <!--                 :show-overflow-tooltip="true" min-width="150"/>-->
        <el-table-column label="用户昵称" prop="nickName" align="left" :show-overflow-tooltip="true"
                         min-width="150"
        />
        <el-table-column label="所属部门" prop="deptName" align="left" :show-overflow-tooltip="true"
                         min-width="150"
        />
        <el-table-column label="所在岗位" prop="positionName" align="left" :show-overflow-tooltip="true"
                         min-width="150"
        />
        <el-table-column label="角色" prop="roleName" align="left" :show-overflow-tooltip="true"
                         min-width="150"
        />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <div class="pagination-container">
        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
                    @pagination="getList"
        />
      </div>
      <div class="pop-btn-box">
        <el-checkbox v-model="isCover" true-label="1" false-label="0">覆盖</el-checkbox>
        <el-checkbox v-model="isApplyChildDept" true-label="1" false-label="0" style="margin-right: 20px" :disabled="deptIds && deptIds.length > 1">应用于下级部门</el-checkbox>
        <el-button class="pop-button sure" @click="handleSelectUser">确 定</el-button>
        <el-button class="pop-button" @click="visible = false">取 消</el-button>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { authFlowUser, unallocatedFlowUserList } from '@/api/system/dept'

export default {
  props: {
    // 角色编号
    roleId: {
      type: [Number, String]
    },
    deptIds: Array
  },
  data() {
    return {
      showDetail: false,
      formHeight: 'height: 48px',
      // 遮罩层
      visible: false,
      // 选中数组值
      userIds: [],
      // 总条数
      total: 0,
      // 未授权用户数据
      userList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleId: undefined,
        username: undefined,
        nickName: undefined,
        deptIds: [],
        isCover: '0',
        isApplyChildDept: '0'
      },
      isCover: '0',
      isApplyChildDept: '0'
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.userIds = []
        this.queryParams = {
          pageNum: 1,
          pageSize: 10,
          roleId: undefined,
          username: undefined,
          nickName: undefined,
          deptIds: []
        }
        this.isCover = '0'
        this.isApplyChildDept = '0'
      }
    }
  },
  methods: {
    handleMore() {
      this.showDetail = true
      this.formHeight = 'height: auto'
    },
    handleClose() {
      this.showDetail = false
      this.formHeight = 'height: 48px'
    },
    // 显示弹框
    show() {
      this.queryParams.roleId = this.roleId
      this.queryParams.deptIds = this.deptIds
      this.getList()
      this.visible = true
    },
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.userIds = selection.map(item => item.id)
    },
    // 查询表数据
    getList() {
      unallocatedFlowUserList(this.queryParams).then(res => {
        this.userList = res.data.list
        this.total = res.data.total
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 选择授权用户操作 */
    handleSelectUser() {
      if (this.userIds.length === 0) {
        this.$modal.msgError('请选择要分配的用户')
        return
      }
      let data = {
        roleId: this.roleId,
        deptIds: this.deptIds,
        ids: this.userIds,
        isCover: this.isCover,
        isApplyChildDept: this.isApplyChildDept
      }
      authFlowUser(data).then(res => {
        if (res.success) {
          this.$modal.msgSuccess('分配成功')
          this.visible = false
          this.$emit('getList')
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.pop-btn-box {
  ::v-deep .el-checkbox {
    font-weight: 700;
  }
}
</style>
