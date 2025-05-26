<template>
  <Dialog
    :title="title"
    :visible.sync="openDataScope"
    :close-on-click-modal="false"
    width="1100px"
    append-to-body
    destroy-on-close
    
  >
    <div class="app-container">
      <el-row type="flex" :gutter="20" class="container_h">
        <!--部门数据-->
        <el-col :span="4" :xs="24" class="container_flex_overflow">
          <div class="head-container">
            <el-tree
            v-loading="treeLoading"
              class="drawer-tree"
              :indent="0"
              :data="deptOptions"
              :props="defaultProps"
              :expand-on-click-node="false"
              ref="tree"
              :highlight-current="true"
              @node-click="handleNodeClick"
            />
          </div>
        </el-col>
        <el-col :span="20" :xs="24" class="container_flex">
          <el-form :model="formData" ref="queryForm" size="small" :inline="true">
            <el-form-item label="用户账号" prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入用户账号"
                clearable
                style="width: 240px"
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item label="用户账号" prop="userCode">
              <el-input
                v-model="formData.userCode"
                placeholder="请输入用户账号"
                clearable
                style="width: 240px"
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <el-table class="container_table" v-loading="loading" border :data="dataList" height="100%"  @selection-change="handleSelectionChange">
            <el-table-column type="selection" :reserve-selection="true" width="55" align="center"/>
            <el-table-column label="用户账号" prop="username" :show-overflow-tooltip="true" align="left" min-width="150"/>
            <!--<el-table-column label="用户编号" prop="userCode" sortable="custom" align="center"-->
            <!--                 :show-overflow-tooltip="true" min-width="150"/>-->
            <el-table-column label="用户昵称" prop="nickName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150"/>
            <el-table-column label="所属部门" prop="deptName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150"/>
            <el-table-column label="所在岗位" prop="positionName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150"/>
            <el-table-column label="角色" prop="roleName" sortable="custom" align="left"
                            :show-overflow-tooltip="true" min-width="150"/>
            <el-table-column label="创建时间" align="center" prop="createTime" min-width="180">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.createTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-circle-close"
                  @click="cancelAuthUser(scope.row)"
                >取消授权
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="total>0"
            :total="total"
            :page.sync="listQuery.pageNum"
            :limit.sync="listQuery.pageSize"
            @pagination="getList"
          />
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        @click="customUserClick"
        >确 定</el-button
      >
      <el-button @click="openDataScope = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { deptTree } from '@/api/system/dept'
import { userPage } from '@/api/system/user';
export default {
  name: "customUser",
  props: {},
  data() {
    return {
      title: '员工选择',
      openDataScope: false,
      treeLoading: false,
      loading: false,
      // 部门树选项
      deptOptions: undefined,
      defaultProps: {
        children: "children",
        label: "deptName"
      },
      formData: {
        parentId: '',
        username: '',
        userCode: '',
      },
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 30,
      },
      dataList: [],
      selection: null
    };
  },
  mounted () {
  },
  methods: {
    init () {
      this.openDataScope = true;
      this.deptTree();
      this.getList();
    },
    deptTree () {
      this.treeLoading = true;
      deptTree().then( ({data}) => {
        this.deptOptions = data;
        this.treeLoading = false;
      })
    },
    getList () {
      this.loading = true,
      userPage(Object.assign({}, this.listQuery, this.formData)).then(({data}) => {
        this.dataList = data.list;
        this.total = data.total;
        this.loading = false;
      })
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selection = selection;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.formData.parentId = data.id;
      this.getList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
    },
    customUserClick () {
      this.$emit("customUserClick", this.selection)
      this.openDataScope = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container{
  height: 500px;
  .container_flex_overflow{
    width: 210px;
  }
}
</style>