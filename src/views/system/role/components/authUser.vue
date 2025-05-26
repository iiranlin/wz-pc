<template>
  <div class="app-container">
    <el-row class="container_flex_button">
      <el-col :span="1.5">
        <el-button class="custom_button" plain size="mini" @click="openSelectUser">
          <icon-svg icon-class="Blue-NewDepartment" />添加用户
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button class="custom_button" plain size="mini" :disabled="multiple" @click="cancelAuthUserAll">
          <div class="small-icon-svg">
            <icon-svg icon-class="State-Scrap" />
          </div>批量取消授权
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button class="custom_button" plain size="mini" @click="handleClose">
          <icon-svg icon-class="Blue-Cancel" />关闭
        </el-button>
      </el-col>
    </el-row>
    <el-form class="container-form" :model="queryParams" ref="queryForm" size="small" :inline="true"
      v-show="showSearch">
      <div class="form-content-box" v-show="showSearchDetail">
        <el-form-item class="custom-form-item" label="用户账号" prop="username">
          <el-input v-model="queryParams.username" placeholder="请输入用户账号" clearable style="width: 240px"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item class="custom-form-item" label="用户昵称" prop="nickName">
          <el-input v-model="queryParams.nickName" placeholder="请输入用户昵称" clearable style="width: 240px"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
      </div>
      <el-form-item class="search-control">
        <el-button class="search" size="mini" @click="handleQuery" v-show="showSearchDetail">
          <icon-svg icon-class="Line-Search" />搜索
        </el-button>
        <el-button class="reset" size="mini" @click="resetQuery" v-show="showSearchDetail">
          <icon-svg icon-class="Line-Refresh" class="icon-svg-blue" />重置
        </el-button>
        <el-button class="toggleClose" size="mini" @click="toggleOpen" v-show="!showSearchDetail">
          <icon-svg icon-class="Line-Search" class="icon-svg-blue" />
          <span class="search-btn-text">展开搜索</span>
          <i class="el-icon-caret-bottom el-icon--right"></i>
        </el-button>
        <el-button class="toggleOpen" size="mini" @click="toggleClose" v-show="showSearchDetail">
          收起
          <i class="el-icon-caret-top el-icon--right"></i>
        </el-button>
      </el-form-item>
    </el-form>
    <right-toolbar :formData="queryParams" :searchArr="[]" :showSearch.sync="showSearch"
      @queryTable="getList"></right-toolbar>

    <el-table v-loading="loading" :data="userList" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户账号" prop="username" :show-overflow-tooltip="true" align="left" min-width="150" />
      <!--<el-table-column label="用户编号" prop="userCode" sortable="custom" align="center"-->
      <!--                 :show-overflow-tooltip="true" min-width="150"/>-->
      <el-table-column label="用户昵称" prop="nickName" sortable="custom" align="left" :show-overflow-tooltip="true"
        min-width="150" />
      <el-table-column label="所属部门" prop="deptName" sortable="custom" align="left" :show-overflow-tooltip="true"
        min-width="150" />
      <el-table-column label="角色" prop="roleName" sortable="custom" align="left" :show-overflow-tooltip="true"
        min-width="150" />
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-circle-close" @click="cancelAuthUser(scope.row)">取消授权
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <select-user ref="select" :roleId="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>

<script>
import { allocatedUserList, authUserCancel } from "@/api/system/role";
import selectUser from "./selectUser";

export default {
  name: "AuthUser",
  // dicts: ['sys_normal_disable'],
  components: { selectUser },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中用户组
      userIds: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleId: undefined,
        username: undefined,
        nickName: undefined
      },
      sys_normal_disable: [
        {
          value: "0",
          label: "正常"
        },
        {
          value: "1",
          label: "停用"
        },
      ],
      showSearchDetail: false,
    };
  },
  created() {
    const roleId = this.$route.query && this.$route.query.roleId;
    if (roleId) {
      this.queryParams.roleId = roleId;
      this.getList();
    }
  },
  methods: {
    /** 查询授权用户列表 */
    getList() {
      this.loading = true;
      allocatedUserList(this.queryParams).then(res => {
        this.userList = res.data.list;
        this.total = res.data.total;
        this.loading = false;
      }
      );
    },
    handleQuery(row = {}) {
      this.queryParams = Object.assign({}, this.queryParams, row)
      this.getList();
    },
    // 返回按钮
    handleClose() {
      this.$tab.closeOpenPage();
      this.$router.back()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.userIds = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    /** 打开授权用户表弹窗 */
    openSelectUser() {
      this.$refs.select.show();
    },
    /** 取消授权按钮操作 */
    cancelAuthUser(row) {
      const roleId = this.queryParams.roleId;
      this.$modal.confirm('确认要取消该用户授权吗？').then(function () {
        return authUserCancel(roleId, [row.id]);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("取消授权成功");
      }).catch(() => {
      });
    },
    /** 批量取消授权按钮操作 */
    cancelAuthUserAll() {
      const roleId = this.queryParams.roleId;
      this.$modal.confirm('是否取消选中用户授权数据项？').then(
        authUserCancel(roleId, this.userIds)
      ).then(() => {
        this.getList();
        this.$modal.msgSuccess("取消授权成功");
      }).catch(() => {
      });
    },
    //显示搜索
    toggleOpen() {
      this.showSearchDetail = true;
    },
    //隐藏搜索
    toggleClose() {
      this.showSearchDetail = false;
    },
  }
};
</script>
<style lang="scss" scoped>
.elFormBox {
  padding-left: 10px;
}

.container-form {
  padding-left: 10px;
  background-color: #ffffff;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.12);
}

.form-content-box {
  padding: 16px 0 8px 0;
}

.custom-form-item ::v-deep .el-input__inner {
  border-radius: 50px;
  height: 34px;
}

.custom-form-item {
  width: 33%;
  margin: 0 0 8px 0;
}

@media (min-width: 1440px) {
  .custom-form-item {
    width: 25%;
  }
}

::v-deep .custom-form-item .el-form-item__content {
  width: 70%;
}

.custom_button {
  transform: translateY(-1px);
  background: #ffffff !important;
  border-radius: 50px;
  font-size: 12px;
  text-align: right;
  height: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 5px 30px 5px 24px;
  position: relative;
  min-width: 100px;
  margin-right: 6px;
  border: 1px solid #1890ff;
  box-sizing: border-box;
  line-height: 22px;
}

.search-control {
  position: absolute;
  right: 0px;
  top: 11px;
}

.search,
.reset,
.toggleClose {
  border: none;
  border-radius: 50px;
  min-width: 100px;
  height: 32px;
  padding: 5px 24px 5px 44px;
  text-align: right;
  box-shadow: 0px 1px 2px rgba(0, 57, 186, 0.2);
  position: relative;
  margin-right: 6px;

  &:hover {
    border-color: none;

    .icon-svg-blue {
      color: #ffffff;
    }
  }
}

.toggleOpen {
  color: #1b1e22;
  min-width: 100px;
  height: 34px;
  border-radius: 5px 5px 0px 0px;
  border-width: 3px 0px 0px 0px;
  border-color: #ffffff;
  padding-left: 0px;
  padding-right: 0px;
  box-shadow: 0px 1px 2px rgba(0, 57, 186, 0.2);
  margin-right: 6px;

  &:hover {
    background-color: #ffffff;
    color: #3d8aff;
  }

  &::after {
    width: 100%;
    height: 10px;
    display: block;
    content: "";
    background-color: #ffffff;
    transform: translateY(10px);
  }
}

.search {
  background-color: #227AFF;
  color: #ffffff;

  &:hover {
    background-color: #106DF8;
  }
}

.reset {
  background-color: #ffffff;
  color: #1b1e22;

  &:hover {
    color: #ffffff;
    background-color: #106DF8;
  }
}

.toggleClose {
  background-color: #ffffff;
  color: #1b1e22;

  &:hover {
    color: #ffffff;
    background-color: #3d8aff;
  }

  .search-btn-text {
    margin-left: 3px;
  }
}

.search-control .svg-icon-font {
  position: absolute;
  left: 20px;
  top: 3px;
}

.icon-svg-blue {
  color: #3d8aff;
}

.custom_button .svg-icon-font {
  float: left;
  margin-right: 3px;
  transform: translateY(-2px);
}

.small-icon-svg .svg-icon-font {
  font-size: 16px;
  transform: translateY(2px);
}
::v-deep.el-button.is-disabled,
::v-deep.el-button.is-disabled:hover {
    border: 1px solid #ffffff;
}
</style>