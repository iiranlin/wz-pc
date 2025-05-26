<template>
  <Dialog
    :title="title"
    :visible.sync="openDataScope"
    :close-on-click-modal="false"
    width="1300px"
    append-to-body
    
  >
    <div class="app-container app-container-selection" style="height: 70vh">
      <el-row :gutter="20" class="container_h">
        <el-col :span="4" :xs="24" class="container-left">
            <p class="head-container-h2"><icon-svg icon-class="Left-title" /><span>角色</span></p>

          <div class="head-container ov_head" :loading="roleLoading">
            <el-tree
              class="drawer-tree"
              :indent="0"
              :data="roleOptions"
              :props="defaultProps"
              :expand-on-click-node="false"
              ref="tree"
              :highlight-current="true"
              @node-click="handleNodeClick"
            />
          </div>
        </el-col>
        <!--用户数据-->
        <el-col :span="20" :xs="24" class="container_flex" v-loading="loading">
          <div class="operation-box">
            <div class="form-box">
              <span>用户账号: </span>
              <el-input v-model="queryParams.username" clearable></el-input>
              <span>用户姓名: </span>
              <el-input v-model="queryParams.nickName" clearable></el-input>
            </div>
            <div class="btn-box">
              <el-button class="button-item search" type="primary" @click="getList">
                <icon-svg icon-class="Line-Search"/>
                <span class="button-text">搜索</span>
              </el-button>
                <el-button class="button-item reset" @click="resetQuery">
                <icon-svg icon-class="Line-Refresh" class="icon-svg-blue"/>
                <span class="button-text">重置</span>
                </el-button>
              <el-button class="button-item search" type="primary" @click="add">
                <icon-svg icon-class="LIne-Edit"/>
                <span class="button-text">新增</span>
              </el-button>
            </div>
          </div>
          <div class="table-wrapper">
            <el-table :data="userList" height="100%">
              <el-table-column property="deptName" align="left" label="部门名称"></el-table-column>
              <el-table-column property="username" align="left" label="用户账号"></el-table-column>
              <el-table-column property="nickName" align="left" label="用户姓名"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="scope">
                  <el-button type="text" size="small" @click="handlerCancelAuth(scope.row.id)">取消授权</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
                      @pagination="getList"
          />
        </el-col>
      </el-row>
    </div>
    <select-user ref="selectRef" @getList="getList" :roleId="queryParams.roleId" :deptIds="queryParams.deptIds"/>
  </Dialog>
</template>

<script>
import selectUser from './selectUser'
import { rolePage } from '@/api/system/role'
import { allocatedFlowUserList, cancelAuth } from '@/api/system/dept'

export default {
  name: 'flowAuth',
  components: { selectUser },
  data() {
    return {
      title: '流程权限配置',
      openDataScope: false,
      roleLoading: false,
      roleOptions: undefined,
      defaultProps: {
        children: 'children',
        label: 'roleName'
      },
      userList: [],
      loading: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleId: '',
        deptIds: [],
        username: '',
        nickName: ''
      },
      total: 0
    }
  },
  methods: {
    //初始化
    init(deptIds) {
      this.openDataScope = true
      this.queryParams.deptIds = deptIds
      this.queryParams.roleId = ''
      this.userList = []
      this.loading = false
      this.rolePage()
    },
    //节点单击事件
    handleNodeClick(data) {
      this.queryParams.roleId = data.id
      this.getList()
    },
    rolePage() {
      this.roleLoading = true
      rolePage().then(({ data }) => {
        this.roleOptions = data.list || []
        this.roleLoading = false
      })
    },
    add() {
      if (this.queryParams.roleId != '') {
        this.$refs.selectRef.show()
      } else {
        this.$message('请先选择角色')
      }
    },
    resetQuery () {
        this.queryParams.username = '';
        this.queryParams.nickName = '';
        this.getList();
    },
    getList() {
      this.loading = true
      allocatedFlowUserList(this.queryParams).then(res => {
        this.total = res.data.total
        this.userList = res.data.list || []
        this.loading = false
      })
    },
    handlerCancelAuth(userId) {
      let data = {
        deptIds: this.queryParams.deptIds,
        roleId: this.queryParams.roleId,
        id: userId
      }
      cancelAuth(data).then(({ success }) => {
        if (success) {
          this.$modal.msgSuccess('取消成功')
          this.getList()
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.container-left {
  height: 100%;
  display: flex;
  flex-direction: column;

  .head-container {
    flex: 1;
    overflow: hidden;
    border: 1px solid #dfe6ec;
    padding: 8px 0;

    .drawer-tree {
      height: 100%;
      overflow: auto;
    }
  }
    .head-container-h2{
        margin: 4px;
        .svg-icon-font{
            font-size: 36px;
            color: #959595;
            float: left;
        }
        span{
            display: block;
            float: left;
            margin-top: 6px;
            font-weight: 700;
            font-size: 18px;
        }
    }
}

.container_flex {
  height: 100%;
  display: flex;
  flex-direction: column;

  .head-container-h2 {
    margin-left: 28px;
  }

  .operation-box {
    padding: 0 12px;
    margin-bottom: 8px;
    display: flex;

    .form-box {
      flex: 1;
      display: flex;
      align-items: center;

      span {
        margin-right: 12px;
        color: #1B1E22;
        font-weight: 700;
      }

      .el-input {
        width: 240px;
        margin-right: 20px;

        ::v-deep .el-input__inner {
          height: 34px;
          border-radius: 50px;
        }
      }
    }

    .btn-box {
      display: flex;
      align-items: center;

      // 复制的element-ui.scss文件中的样式
      .button-item {
        height: 34px;
        border-radius: 50px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 5px 24px 5px 44px;
        text-align: right;
        min-width: 100px;
        position: relative;
        margin-right: 6px;
        border-color: #fff;
        font-size: 12px;

        &:hover {
          border-color: initial;

          .icon-svg-blue {
            color: #ffffff;
          }
        }

        .svg-icon-font {
          position: absolute;
          top: 4px;
          left: 24px;
        }

        .button-text {
          margin-left: 11px;
        }
      }
      .reset{
        border: 1px solid #1890ff;
        &:hover {
          background-color: #1890ff;
          color: #ffffff;
          .icon-svg-blue {
            color: #ffffff;
          }
        }
      }
    }
  }

  .table-wrapper {
    flex: 1;
    overflow: hidden;
    .el-table{
        border: 1px solid #dfe6ec;
    }
  }
}
</style>
