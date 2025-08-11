<template>
  <Dialog tabindex='1' class="flex-dialog max-height-dialog" :close-on-click-modal="false"
    :close-on-press-escape="false" title="候选用户" :visible.sync="userOpen" width="1200px" append-to-body destroy-on-close>
    <div slot="title" class="el-dialog__title">
      候选用户
      <div class="flex-dialog-button">
        <el-button plain round type="primary" icon="el-icon-search" @click="handleQuery">
          搜索
        </el-button>
        <el-button plain round type="info" icon="el-icon-refresh" @click="resetQuery">重置
        </el-button>
      </div>
    </div>
    <el-form ref="userFormData" label-suffix=":"  :model="userFormData" label-width="110px">
      <el-col :span="6">
        <el-form-item label="用户账号" prop="username">
          <el-input v-model="userFormData.username" placeholder="用户账号"  @keyup.enter.native="handleQuery"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="用户名称" prop="nickName">
          <el-input v-model="userFormData.nickName" placeholder="用户名称"  @keyup.enter.native="handleQuery"></el-input>
        </el-form-item>
      </el-col>
    </el-form>
    <div class="table-wrapper" style="flex: 1;">
        <!--部门数据-->
        <el-col :span="7" style="height: 100%;">
          <el-card shadow="never"  style="height: calc(100% - 20px);overflow: auto;">
            <div slot="header">
              <span>部门列表</span>
            </div>
              <el-tree :data="deptTreeData" :props="deptProps" :expand-on-click-node="false" ref="tree"
                @node-click="handleNodeClick" />
          </el-card>
        </el-col>
        <el-col :span="17" style="height: calc(100% - 34px);">
          <el-table ref="multipleTable" height="100%" :data="userTableList" border row-key="id"
            @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" :reserve-selection="true" align="center" />
            <el-table-column label="用户名" align="left" prop="nickName" />
            <el-table-column label="账号" align="left" prop="username" />
          </el-table>
          <pagination :total="userTotal" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
            @pagination="getUserList" />
        </el-col>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleTaskUserComplete">确 定</el-button>
      <el-button @click="userOpen = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { userListAll } from '@/api/system/user'
import { deptTreeAll } from '@/api/system/dept'

export default {
  name: '',
  components: {

  },
  filters: {

  },
  props: {

  },
  data() {
    return {
      userOpen: false,
      deptOptions: [],
      deptTreeData: [],
      deptProps: {
        children: "children",
        label: "label"
      },
      queryParams: {
        deptId: undefined
      },
      page: {
        pageNum: 1,
        pageSize: 30
      },
      userTotal: 0,
      userTableList: [],
      selectedUserData: [],
      userFormData: {
        username: '',
        nickName: ''
      },
    };
  },
  computed: {

  },
  watch: {

  },
  created() {

  },
  mounted() {

  },
  methods: {
    init() {
      this.userOpen = true;
      this.getDeptTreeData()
      this.userFormData.username = ''
      this.userFormData.nickName = ''
      this.getUserList()
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.pageNum = 1;
      this.queryParams.deptId = data.treeId;
      this.getUserList(this.queryParams);
    },
    /**
     * 查询部门下拉树结构（含部门前缀）
     */
    async getDeptTreeData() {
      function refactorTree(data) {
        return data.map(node => {
          let treeData = {
            ...node,
            id: `DEPT${node.id}`,
            treeId: node.id,
            label: node.deptName,
            // parentId: node.parentId,
            // weight: node.weight
          }
          if (node.children && node.children.length > 0) {
            treeData.children = refactorTree(node.children);
          }
          return treeData;
        });
      }

      deptTreeAll().then(res => {
        if (res?.success) {
          const deptOptions = res.data || [];
          this.deptTreeData = refactorTree(deptOptions) || [];
        } else {
          this.$modal.msgError(res.message);
        }
      })
    },
    /** 查询用户列表 */
    async getUserList(p = {}) {
      const params = {
        ...this.page,
        ...this.userFormData,
        ...this.queryParams  // 添加 queryParams，包含 deptId
      }
      if(p.page) {
        params.pageNum = p.page,
        params.pageSize = p.limit
      }
      userListAll(params).then(res => {
        if (res?.success) {
          this.userTableList = res.data.list;
          this.userTotal = res.data.total;
        } else {
          this.$modal.msgError(res.message);
        }
      })
    },

    // 用户选择弹出框确认按钮
    handleTaskUserComplete() {
      if (!this.selectedUserData || this.selectedUserData.length <= 0) {
        this.$modal.msgError('请选择用户');
        return;
      }
      // this.selectedUserData = _.uniqBy([...this.oldSelectedUserDate, ...this.selectedUserData], 'id')
      // this.orgPickerSelected.length = 0
      // this.orgPickerSelected = this.selectedUserData
      this.$emit('handleTaskUserComplete', this.selectedUserData)
      this.userOpen = false;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectedUserData = selection.map(i => {
        return {
          id: i.id,
          name: i.nickName,
          type: "user",
          sex: false,
          selected: false
        }
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getUserList();  // 移除参数，让方法内部自动合并所有参数
    },
    resetQuery() {
      this.$refs.userFormData.resetFields()
      this.queryParams.pageNum = 1;
      this.queryParams.deptId = undefined;  // 重置时清空部门筛选
      this.getUserList()
    },
  },
};
</script>

<style scoped lang="scss">
.dialog-search {
  margin-right: 50px;
  display: flex;
  justify-content: space-between;
}


.head-container {
  height: 100%;
  overflow: auto;
}
</style>
