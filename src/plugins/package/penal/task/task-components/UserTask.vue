<template>
  <div>
    <el-row>
      <h4><b>审批人设置</b></h4>
      <el-radio-group
        v-model="dataType"
        @change="changeDataType"
        :disabled="currentUserTaskIndex === 0"
      >
        <el-radio label="USERS">指定用户</el-radio>
        <el-radio label="ROLES">角色</el-radio>
        <el-radio label="DEPTS">部门</el-radio>
        <el-radio label="INITIATOR">发起人</el-radio>
      </el-radio-group>
    </el-row>
    <el-row>
      <div v-if="dataType === 'USERS'">
        <el-tag
          v-for="(userText, index) in selectedUser.text"
          :key="userText"
          closable
          effect="plain"
          @close="deleteUser(index)"
        >
          {{userText}}
        </el-tag>
        <div class="element-drawer__button">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="onSelectUsers()"
          >添加用户</el-button>
        </div>
      </div>
      <div v-if="dataType === 'ROLES'">
        <el-select
          v-model="roleIds"
          multiple
          :multiple-limit="1"
          size="mini"
          placeholder="请选择 角色"
          @change="changeSelectRoles"
        >
          <el-option
            v-for="item in roleOptions"
            :key="item.id"
            :label="item.roleName"
            :value="`ROLE${item.id}`"
          >
            <!--
            :disabled="item.status === 1" -->
          </el-option>
        </el-select>
      </div>
      <div
        v-if="dataType === 'DEPTS'"
        style="visibility: auto;"
      >
        <tree-select
          :width="320"
          :height="400"
          size="mini"
          :data="deptTreeData"
          :defaultProps="deptProps"
          multiple
          clearable
          checkStrictly
          nodeKey="id"
          :checkedKeys="deptIds"
          @checked-change="checkedDeptChange"
        >
        </tree-select>
      </div>
    </el-row>
    <!-- 影藏多实例审批方式 -->
    <el-row>
      <div v-show="showMultiFlog">
        <el-divider />
        <h4><b>多实例审批方式</b></h4>
        <el-radio-group
          v-model="multiLoopType"
          @change="changeMultiLoopType"
        >
          <el-row>
            <el-radio
              disabled
              label="Null"
            >无</el-radio>
          </el-row>
          <el-row>
            <el-radio label="SequentialMultiInstance">会签（需所有审批人同意）</el-radio>
          </el-row>
          <el-row>
            <el-radio label="ParallelMultiInstance">或签（一名审批人同意即可）</el-radio>
          </el-row>
        </el-radio-group>
      </div>
    </el-row>

    <!-- 候选用户弹窗 -->
    <Dialog
      title="候选用户"
      :visible.sync="userOpen"
      width="1200px"
      append-to-body
      
    >
      <el-row
        type="flex"
        :gutter="20"
      >
        <!--部门数据-->
        <el-col :span="7">
          <el-card
            shadow="never"
            style="height: 600px"
          >
            <div slot="header">
              <span>部门列表</span>
            </div>
            <div class="head-container">
              <!-- <el-input
                v-model="deptName"
                placeholder="请输入部门名称"
                clearable
                size="small"
                prefix-icon="el-icon-search"
                style="margin-bottom: 20px"
              /> -->
              <el-tree
                :data="deptTreeData"
                :props="deptProps"
                :expand-on-click-node="false"
                ref="tree"
                @node-click="handleNodeClick"
              />
            </div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-table
            ref="multipleTable"
            height="600"
            :data="userTableList"
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="50"
              align="center"
            />
            <el-table-column
              label="用户名"
              align="left"
              prop="nickName"
            />
            <el-table-column
              label="账号"
              align="left"
              prop="username"
            />
          </el-table>
          <pagination
            :total="userTotal"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            @pagination="getUserList"
          />
        </el-col>
      </el-row>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="handleTaskUserComplete"
        >确 定</el-button>
        <el-button @click="userOpen = false">取 消</el-button>
      </div>
    </Dialog>
  </div>

</template>

<script>
// import { listUser } from "@/api/system/user";
// import { deptTree } from '@/api/system/dept'
// import { treeselect } from '@/api/system/dept'
import uniqBy from "lodash/uniqBy";
import TreeSelect from "@/components/TreeSelect";

const userTaskForm = {
  dataType: '',
  assignee: '',
  candidateUsers: '',
  candidateGroups: '',
  text: '',
  // dueDate: '',
  // followUpDate: '',
  // priority: ''
}

const multiInstanceForm = {
  completionCondition: "",
  loopCardinality: "",
  extensionElements: [],
  asyncAfter: false,
  asyncBefore: false,
  exclusive: false
}

export default {
  name: "UserTask",
  props: {
    id: String,
    type: String
  },
  components: { TreeSelect },
  data () {
    return {
      loading: false,
      dataType: 'USERS',
      selectedUser: {
        ids: [],
        text: []
      },
      userOpen: false,
      deptName: undefined,
      deptOptions: [],
      deptProps: {
        children: "children",
        label: "label"
      },
      deptTempOptions: [],
      userTableList: [],
      userTotal: 0,
      selectedUserDate: [],
      // TODO
      oldSelectedUserDate: [],
      roleOptions: [],
      roleIds: [],
      deptTreeData: [],
      deptIds: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deptId: undefined
      },
      showMultiFlog: false,
      // multiLoopType: 'Null',
      // TODOD 默认或签 ParallelMultiInstance
      multiLoopType: 'ParallelMultiInstance',
      currentUserTaskIndex: null,
    };
  },
  watch: {
    id: {
      immediate: true,
      handler () {
        this.bpmnElement = window.bpmnInstances.bpmnElement;
        this.$nextTick(() => {
          // TODO  这一块是默认第一节点为禁用审批人 计算出当前选中的是第几个userTask 审批人设置----start
          const bpmnElement = this.bpmnElement;
          const { id = '', type = '' } = bpmnElement;
          const currentUserTaskInfo = { id, type, }
          const userTaskAllList = bpmnElement?.parent?.children?.filter(i => i?.type === 'bpmn:UserTask') || [];
          const currentUserTaskIndex = userTaskAllList.findIndex((userTaskItem) => currentUserTaskInfo?.id === userTaskItem.id);
          this.currentUserTaskIndex = currentUserTaskIndex
          // TODO  这一块是默认第一节点为禁用禁用审批人 计算出当前选中的是第几个userTask 审批人设置----end
          this.resetTaskForm()
        });
      }
    }
  },
  beforeDestroy () {
    this.bpmnElement = null;
  },
  methods: {
    async resetTaskForm () {
      const bpmnElementObj = this.bpmnElement?.businessObject;
      if (!bpmnElementObj) {
        return;
      }
      this.oldSelectedUserDate = []
      this.clearOptionsData()
      // TODO  这一块是默认第一节点发起人自己
      if (this.currentUserTaskIndex === 0) {
        // TODO 默认发起人
        this.dataType = 'INITIATOR'
        this.changeDataType(this.dataType)
        return;
      }
      this.dataType = bpmnElementObj['dataType'];
      // const odlSelectedUser = { ...this.selectedUser } || { ids: [], text: [] }
      if (this.dataType === 'USERS') {
        let userIdData = bpmnElementObj['candidateUsers'] || bpmnElementObj['assignee'];
        let userText = bpmnElementObj['text'] || [];
        if (userIdData && userIdData.toString().length > 0 && userText && userText.length > 0) {
          this.selectedUser.ids = userIdData?.toString().split(',');
          this.selectedUser.text = userText?.split(',');
          for (let i = 0; i < this.selectedUser.ids.length; i++) {
            const item = {
              id: this.selectedUser.ids[i],
              nickName: this.selectedUser.text[i],
            }
            this.oldSelectedUserDate.push(item);
          }
          this.oldSelectedUserDate = uniqBy([...this.oldSelectedUserDate], 'id')
          // this.selectedUser.ids = _.uniqBy([...odlSelectedUser.ids, ...userIdData?.toString().split(',')]);
          // this.selectedUser.text = _.uniqBy([...odlSelectedUser.text, ...userText?.split(',')]);
        }
        if (this.selectedUser.ids.length > 1) {
          this.showMultiFlog = true;
        } else {
          this.showMultiFlog = false;
        }
      } else if (this.dataType === 'ROLES') {
        this.getRoleOptions();
        let roleIdData = bpmnElementObj['candidateGroups'] || [];
        if (roleIdData && roleIdData.length > 0) {
          this.roleIds = roleIdData.split(',')
        }
        this.showMultiFlog = true;
      } else if (this.dataType === 'DEPTS') {
        await this.getDeptTreeData();
        let deptIdData = bpmnElementObj['candidateGroups'] || [];
        if (deptIdData && deptIdData.length > 0) {
          this.deptIds = deptIdData.split(',');
        }
        this.showMultiFlog = true;
      }
      this.getElementLoop(bpmnElementObj);
    },
    /**
     * 清空选项数据
     */
    clearOptionsData () {
      this.selectedUser.ids = [];
      this.selectedUser.text = [];
      this.roleIds = [];
      this.deptIds = [];
    },
    /**
     * 跟新节点数据
     */
    updateElementTask () {
      const taskAttr = Object.create(null);
      for (let key in userTaskForm) {
        taskAttr[key] = userTaskForm[key];
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr);
    },
    /**
     * 查询部门下拉树结构
     */
    async getDeptOptions () {
      if (!this.deptOptions || this.deptOptions.length <= 0) {
        try {
          const deptId = sessionStorage.getItem('startDeptId') || '';
          const params = {
            deptId,
            containsHeader: true,
            levelNumber: 7,
          }
          // const res = await this.$ajax.get('getUnitTreeByDeptId', params);
          const res = await this.$ajax.get('/blcd-base/dept/treeAll', {});
          if (res?.success) {
            this.deptTempOptions = res.data || [];
            this.deptOptions = res.data || [];
          } else {
            this.$modal.msgError(res.message);
          }
        } catch (e) {
          console.error(e);
        }
        // deptTree().then(response => {
        //   this.deptTempOptions = response.data;
        //   this.deptOptions = response.data;
        //   resolve()
        // })
      }
    },
    /**
     * 查询部门下拉树结构（含部门前缀）
     */
    async getDeptTreeData () {
      function refactorTree (data) {
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
      await this.getDeptOptions();
      this.deptTreeData = refactorTree(this.deptOptions) || [];
    },
    /**
     * 查询角色下拉树结构
     */
    async getRoleOptions () {
      if (!this.roleOptions || this.roleOptions.length <= 0) {
        // listRole().then(response => this.roleOptions = response.rows);
        const res = await this.$ajax.get('${VUE_APP_BASE_PREFIX}/role/listAll')
        if (res?.success) {
          this.roleOptions = res?.data?.list || [];
        } else {
          this.$modal.msgError(res.message);
        }
      }
    },
    /** 查询用户列表 */
    async getUserList () {
      const params = {
        ...this.queryParams,
        ...this.dateRange,
      }
      const res = await this.$ajax.get('/blcd-base/user/listAll', params)
      if (res?.success) {
        this.userTableList = res.data.list;
        this.userTotal = res.data.total;
      } else {
        this.$modal.msgError(res.message);
      }
    },
    // 筛选节点
    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick (data) {
      this.queryParams.pageNum = 1;
      this.queryParams.deptId = data.treeId;
      this.getUserList();
    },
    // 关闭标签
    handleClose (tag) {
      this.selectedUserDate.splice(this.selectedUserDate.indexOf(tag), 1);
      this.$refs.multipleTable.toggleRowSelection(tag);
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.selectedUserDate = selection;
    },
    async onSelectUsers () {
      // this.oldSelectedUserDate = [...this.selectedUserDate]
      this.selectedUserDate = [];
      this.$refs.multipleTable?.clearSelection();
      await this.getDeptTreeData();
      this.userOpen = true;
    },
    // 用户选择弹出框确认按钮
    handleTaskUserComplete () {
      if (!this.selectedUserDate || this.selectedUserDate.length <= 0) {
        this.$modal.msgError('请选择用户');
        return;
      }
      userTaskForm.dataType = 'USERS';
      this.selectedUserDate = _.uniqBy([...this.oldSelectedUserDate, ...this.selectedUserDate], 'id')
      this.selectedUser.text = this.selectedUserDate.map(k => k.nickName) || [];
      if (this.selectedUserDate.length === 1) {
        let data = this.selectedUserDate[0];
        userTaskForm.assignee = data.id;
        userTaskForm.text = data.nickName;
        userTaskForm.candidateUsers = null;
        this.showMultiFlog = false;
        this.multiLoopType = 'Null';
      } else if (this.selectedUserDate.length > 1) {
        userTaskForm.candidateUsers = this.selectedUserDate.map(k => k.id).join() || null;
        userTaskForm.text = this.selectedUserDate.map(k => k.nickName).join() || null;
        userTaskForm.assignee = null;
        this.multiLoopType = 'ParallelMultiInstance';
        this.showMultiFlog = true;
      } else {
        this.showMultiFlog = false;
      }
      this.changeMultiLoopType(this.multiLoopType);
      this.oldSelectedUserDate = [...this.selectedUserDate]
      this.updateElementTask()
      this.userOpen = false;
    },
    // 用户展示标签 右侧删除按钮
    deleteUser (index) {
      this.oldSelectedUserDate.splice(index, 1);
      this.selectedUserDate = this.oldSelectedUserDate;
      this.selectedUser.text = this.selectedUserDate.map(k => k.nickName) || [];
      if (this.selectedUserDate.length === 1) {
        let data = this.selectedUserDate[0];
        userTaskForm.assignee = data.id;
        userTaskForm.text = data.nickName;
        userTaskForm.candidateUsers = null;
        this.showMultiFlog = false;
        this.multiLoopType = 'Null';
      } else if (this.selectedUserDate.length > 1) {
        userTaskForm.candidateUsers = this.selectedUserDate.map(k => k.id).join() || null;
        userTaskForm.text = this.selectedUserDate.map(k => k.nickName).join() || null;
        userTaskForm.assignee = null;
        this.multiLoopType = 'ParallelMultiInstance';
        this.showMultiFlog = true;
      } else {
        userTaskForm.assignee = '';
        userTaskForm.text = '';
        userTaskForm.candidateUsers = '';
        this.multiLoopType = 'Null';
        this.showMultiFlog = false;
      }
      this.changeMultiLoopType(this.multiLoopType);
      this.oldSelectedUserDate = [...this.selectedUserDate]
      this.updateElementTask()
    },
    changeSelectRoles (val) {
      userTaskForm.dataType = 'ROLES';
      userTaskForm.candidateGroups = val.join() || null;
      let textArr = this.roleOptions.filter(k => val.indexOf(`ROLE${k.id}`) >= 0);
      userTaskForm.text = textArr?.map(k => k.roleName).join() || null;
      this.updateElementTask();
    },
    checkedDeptChange (checkedIds, checkedData) {
      userTaskForm.dataType = 'DEPTS';
      if (checkedIds && checkedIds.length > 0) {
        this.deptIds = checkedIds;
      }
      if (checkedData && checkedData.length > 0) {
        userTaskForm.candidateGroups = checkedData.map(k => k.id).join() || null
        userTaskForm.text = checkedData.map(k => k.label).join() || null
        this.updateElementTask();
      }
    },
    changeDataType (val) {
      // 清空 userTaskForm 所有属性值
      Object.keys(userTaskForm).forEach(key => userTaskForm[key] = null);
      userTaskForm.dataType = val;
      if (val === 'USERS') {
        if (this.selectedUser && this.selectedUser.ids && this.selectedUser.ids.length > 0) {
          if (this.selectedUser.ids.length === 1) {
            userTaskForm.assignee = this.selectedUser.ids[0];
          } else {
            userTaskForm.candidateUsers = this.selectedUser.ids.join()
          }
          userTaskForm.text = this.selectedUser.text?.join() || null
        }
      } else if (val === 'ROLES') {
        this.getRoleOptions();
        if (this.roleIds && this.roleIds.length > 0) {
          userTaskForm.candidateGroups = this.roleIds.join() || null;
          let textArr = this.roleOptions.filter(k => this.roleIds.indexOf(`ROLE${k.id}`) >= 0);
          userTaskForm.text = textArr?.map(k => k.roleName).join() || null;
        }
      } else if (val === 'DEPTS') {
        this.getDeptTreeData();
        if (this.deptIds && this.deptIds.length > 0) {
          userTaskForm.candidateGroups = this.deptIds.join() || null;
          let textArr = []
          let treeStarkData = JSON.parse(JSON.stringify(this.deptTreeData));
          this.deptIds.forEach(id => {
            let stark = []
            stark = stark.concat(treeStarkData);
            while (stark.length) {
              let temp = stark.shift();
              if (temp.children) {
                stark = temp.children.concat(stark);
              }
              if (id === temp.id) {
                textArr.push(temp);
              }
            }
          })
          userTaskForm.text = textArr?.map(k => k.label).join() || null;
        }
      } else if (val === 'INITIATOR') {
        userTaskForm.assignee = "${initiator}";
        userTaskForm.text = "流程发起人";
        this.multiLoopType = 'Null';
      }
      this.updateElementTask();
      // this.multiLoopType = 'Null';
      // this.multiLoopType = 'ParallelMultiInstance';
      if (val === 'USERS' && this.selectedUser.ids.length === 1) {
        this.multiLoopType = "Null";
        this.showMultiFlog = false;
      } else if (val === 'ROLES' || val === 'DEPTS' || (val === 'USERS' && this.selectedUser.ids.length > 1)) {
        this.showMultiFlog = true;
        this.multiLoopType = "ParallelMultiInstance";
      } else {
        this.showMultiFlog = false;
      }
      this.changeMultiLoopType(this.multiLoopType)
    },
    getElementLoop (businessObject) {
      if (!businessObject.loopCharacteristics) {
        this.multiLoopType = "Null";
        // 选择任何方式都触发 审批方式函数
        this.changeMultiLoopType(this.multiLoopType)
        this.multiLoopType = 'ParallelMultiInstance';
        return;
      }
      if (businessObject.loopCharacteristics.isSequential) {
        this.multiLoopType = "SequentialMultiInstance";
      } else {
        this.multiLoopType = "ParallelMultiInstance";
      }
      // 选择任何方式都触发 审批方式函数
      this.changeMultiLoopType(this.multiLoopType)
    },
    changeMultiLoopType (type) {
      // 取消多实例配置
      if (type === "Null") {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, { loopCharacteristics: null });
        return;
      }
      // 完成条件
      let completionCondition = null;
      // 会签
      if (type === "SequentialMultiInstance") {
        this.multiLoopInstance = window.bpmnInstances.moddle.create("bpmn:MultiInstanceLoopCharacteristics", { isSequential: true });
        completionCondition = window.bpmnInstances.moddle.create("bpmn:FormalExpression", { body: '${nrOfCompletedInstances >= nrOfInstances}' });
      }
      // 或签
      if (type === "ParallelMultiInstance") {
        this.multiLoopInstance = window.bpmnInstances.moddle.create("bpmn:MultiInstanceLoopCharacteristics");
        completionCondition = window.bpmnInstances.moddle.create("bpmn:FormalExpression", { body: '${nrOfCompletedInstances > 0}' });
      }
      // 更新多实例配置
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        loopCharacteristics: this.multiLoopInstance,
        assignee: '${assignee}'
      });
      // 更新模块属性信息
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, {
        collection: '${multiInstanceHandler.getUserIds(execution)}',
        elementVariable: 'assignee',
        completionCondition
      });
    },
  }
};
</script>

<style scoped lang="scss">
.el-row .el-radio-group {
  margin-bottom: 15px;
  .el-radio {
    line-height: 28px;
  }
}
.el-tag {
  margin-bottom: 10px;
  + .el-tag {
    margin-left: 10px;
  }
}
.head-container {
  height: 500px;
  overflow: auto;
}
</style>
