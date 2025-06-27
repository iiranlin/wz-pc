<template>
  <div>
    <el-form
      label-position="top"
      label-width="90px"
    >
      <el-form-item
        label="⚙ 选择审批对象"
        prop="text"
        class="user-type"
      >
        <el-radio-group v-model="nodeProps.assignedType">
          <el-radio
            v-for="t in approvalTypes"
            :label="t.type"
            :key="t.type"
          >{{ t.name }}</el-radio>
        </el-radio-group>
        <div v-if="nodeProps.assignedType === 'ASSIGN_USER'">
          <el-button
            size="mini"
            icon="el-icon-plus"
            type="primary"
            @click="selectUser"
            round
          >选择人员</el-button>
          <org-items v-model="nodeProps.assignedUser" />
        </div>
        <!-- <div v-else-if="nodeProps.assignedType === 'SELF_SELECT'">
          <el-radio-group size="mini" v-model="nodeProps.selfSelect.multiple">
            <el-radio-button :label="false">自选一个人</el-radio-button>
            <el-radio-button :label="true">自选多个人</el-radio-button>
          </el-radio-group>
        </div> -->
        <!-- <div v-else-if="nodeProps.assignedType === 'LEADER_TOP'">
          <el-divider/>
          <el-form-item label="审批终点" prop="text" class="approve-end">
            <el-radio-group v-model="nodeProps.leaderTop.endCondition">
              <el-radio label="TOP">直到最上层主管</el-radio>
              <el-radio label="LEAVE">不超过发起人的</el-radio>
            </el-radio-group>
            <div class="approve-end-leave" v-if="nodeProps.leaderTop.endCondition === 'LEAVE'">
              <span>第 </span>
              <el-input-number :min="1" :max="20" :step="1" size="mini" v-model="nodeProps.leaderTop.level"/>
              <span> 级主管</span>
            </div>
          </el-form-item>
        </div> -->
        <!-- <div v-else-if="nodeProps.assignedType === 'LEADER'">
          <el-divider/>
          <el-form-item label="指定主管" prop="text">
            <span>发起人的第 </span>
            <el-input-number :min="1" :max="20" :step="1" size="mini"
                             v-model="nodeProps.leader.level"></el-input-number>
            <span> 级主管</span>
            <div style="color: #409EFF; font-size: small;">👉 直接主管为 第 1 级主管</div>
          </el-form-item>
        </div>
        -->
        <div v-else-if="nodeProps.assignedType === 'ROLE'">
          <el-button
            size="mini"
            icon="el-icon-plus"
            type="primary"
            @click="selectRole"
            round
          >选择系统角色</el-button>
          <org-items v-model="nodeProps.role" />
          <!-- <div class="role-filter-condition">
            <span>过滤条件</span>
            <el-radio-group v-model="roleType">
              <el-radio label="0">按单位</el-radio>
              <el-radio label="1">按部门</el-radio>
            </el-radio-group>
          </div> -->
          <!-- <div class="role-add-condition">
            <span>添加条件</span>
            <el-popover placement="bottom" title="选择过滤条件" width="300" trigger="click">
              <el-checkbox-group v-model="conditionCheck" value-key="id">
                <el-checkbox :label="condition" v-for="(condition) in conditionList" :key="condition.id" @change="conditionChange()">
                  {{ condition.title }}
                </el-checkbox>
              </el-checkbox-group>
              <i class="el-icon-plus" slot="reference"></i>
            </el-popover>
            <org-items v-model="conditionCheck"/>
          </div> -->
        </div>
        <!--
        <div v-else-if="nodeProps.assignedType === 'FORM_USER'">
          <el-form-item label="选择表单联系人项" prop="text" class="approve-end">
            <el-select style="width: 80%;" size="small" v-model="nodeProps.formUser" placeholder="请选择包含联系人的表单项">
              <el-option v-for="op in forms" :label="op.title" :value="op.id"></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div v-else>
          <span class="item-desc">发起人自己作为审批人进行审批</span>
        </div> -->

      </el-form-item>

      <el-divider></el-divider>
      <el-form-item label="👤 审批人为空时" prop="text" class="line-mode">
        <el-radio-group v-model="nodeProps.nobody.handler">
          <el-radio label="TO_PASS">自动通过</el-radio>
          <!-- <el-radio label="TO_REFUSE">自动驳回</el-radio>
          <el-radio label="TO_ADMIN">转交审批管理员</el-radio>
          <el-radio label="TO_USER">转交到指定人员</el-radio> -->
        </el-radio-group>

        <div style="margin-top: 10px" v-if="nodeProps.nobody.handler === 'TO_USER'">
          <el-button size="mini" icon="el-icon-plus" type="primary" @click="selectNoSetUser" round>选择人员</el-button>
          <org-items v-model="nodeProps.nobody.assignedUser"/>
        </div>

      </el-form-item>

      <div v-if="showMode">
        <el-divider />
        <el-form-item
          label="👩‍👦‍👦 多人审批时审批方式"
          prop="text"
          class="approve-mode"
        >
          <el-radio-group v-model="nodeProps.mode">
            <el-radio label="NEXT">顺序会签 （按选择顺序审批，每个人必须同意）</el-radio>
            <el-radio label="AND">并行会签（可同时审批，每个人必须同意）</el-radio>
            <el-radio label="OR">或签（有一人同意即可）</el-radio>
            <el-radio label="APPOINT">或签（指定下级审核人）</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <template>
        <el-divider />
        <!-- 短信开关及短信模板 -->
        <el-form-item label="短信开关"  prop="sendFlag">
          <el-switch
            v-model="nodeProps.sendFlag"
            active-text="开启"
            inactive-text="关闭"
            active-color="#13ce66"
           inactive-color="#ff4949"
           :active-value="0"
           :inactive-value="1"
          />
        </el-form-item>
      </template>

      <!-- <el-divider>高级设置</el-divider>
      <el-form-item label="✍ 审批同意时是否需要签字" prop="text">
        <el-switch inactive-text="不用" active-text="需要" v-model="nodeProps.sign"></el-switch>
        <el-tooltip class="item" effect="dark" content="如果全局设置了需要签字，则此处不生效" placement="top-start">
          <i class="el-icon-question" style="margin-left: 10px; font-size: medium; color: #b0b0b1"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="⏱ 审批期限（为 0 则不生效）" prop="timeLimit">
        <el-input style="width: 180px;" placeholder="时长" size="small" type="number"
                  v-model="nodeProps.timeLimit.timeout.value">
          <el-select style="width: 75px;" v-model="nodeProps.timeLimit.timeout.unit" slot="append" placeholder="请选择">
            <el-option label="天" value="D"></el-option>
            <el-option label="小时" value="H"></el-option>
          </el-select>
        </el-input>
      </el-form-item> -->
      <!-- <el-form-item label="审批期限超时后执行" prop="level" v-if="nodeProps.timeLimit.timeout.value > 0">
        <el-radio-group v-model="nodeProps.timeLimit.handler.type">
          <el-radio label="PASS">自动通过</el-radio>
          <el-radio label="REFUSE">自动驳回</el-radio>
          <el-radio label="NOTIFY">发送提醒</el-radio>
        </el-radio-group>
        <div v-if="nodeProps.timeLimit.handler.type === 'NOTIFY'">
          <div style="color:#409EEF; font-size: small">默认提醒当前审批人</div>
          <el-switch inactive-text="循环" active-text="一次" v-model="nodeProps.timeLimit.handler.notify.once"></el-switch>
          <span style="margin-left: 20px" v-if="!nodeProps.timeLimit.handler.notify.once">
							每隔
							<el-input-number :min="0" :max="10000" :step="1" size="mini"
                               v-model="nodeProps.timeLimit.handler.notify.hour"/>
							小时提醒一次
						</span>
        </div>
      </el-form-item> -->
      <!-- <el-form-item label="🙅‍ 如果审批被驳回 👇">
        <el-radio-group v-model="nodeProps.refuse.type">
          <el-radio label="TO_END">直接结束流程</el-radio>
          <el-radio label="TO_BEFORE">驳回到上级审批节点</el-radio>
          <el-radio label="TO_NODE">驳回到指定节点</el-radio>
        </el-radio-group>
        <div v-if="nodeProps.refuse.type === 'TO_NODE'">
          <span>指定节点:</span>
          <el-select style="margin-left: 10px; width: 150px;" placeholder="选择跳转步骤" size="small" v-model="nodeProps.refuse.target">
            <el-option v-for="(node, i) in nodeOptions" :key="i" :label="node.name" :value="node.id"></el-option>
          </el-select>
        </div>

      </el-form-item> -->
    </el-form>
    <!-- <org-picker :title="pickerTitle" multiple :type="orgPickerType" ref="orgPicker" :selected="orgPickerSelected"
                @ok="selected"/> -->
    <select-user-tree
      ref="selectUserTree"
      @handleTaskUserComplete="selected"
    />
    <Dialog
      class="unit-dialog"
      :visible.sync="roleVisible"
      append-to-body
      width="800px"
      :title="`系统角色`"
      :close-on-click-modal="false"
      
    >
      <div class="unit-dialog-content">
        <div class="select-title">
          系统角色:
        </div>
        <el-select
          v-model="currentRoleVal"
          placeholder="请选择系统角色"
          style="width: 600px;"
          @change="roleChange"
        >
          <el-option
            v-for="item in roleOptions"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <div class="pop-btn-box">
          <el-button
            type="primary"
            @click="confirmButton()"
            :disabled="!currentRoleVal"
          >确定</el-button>
          <el-button @click="roleVisible = false">取消</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import {roleListAll} from "@/api/system/role"
import OrgPicker from "@/components/common/OrgPicker";
import selectUserTree from "@/components/common/selectUserTree";
import OrgItems from "../OrgItems";
import uniqBy from "lodash/uniqBy";
import {ValueType} from '@/views/common/form/ComponentsConfigExport'

export default {
  name: "ApprovalNodeConfig",
  components: { selectUserTree, OrgItems },
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      showOrgSelect: false,
      orgPickerSelected: [],
      orgPickerType: 'user',
      approvalTypes: [
        { name: '指定人员', type: 'ASSIGN_USER' },
        // {name: '发起人自选', type: 'SELF_SELECT'},
        // {name: '连续多级主管', type: 'LEADER_TOP'},
        // {name: '主管', type: 'LEADER'},
        { name: '角色', type: 'ROLE' },
        // {name: '发起人自己', type: 'SELF'},
        // {name: '表单内联系人', type: 'FORM_USER'}
      ],
      roleVisible: false,
      roleOptions: [],
      currentCondition: {},
      currentRoleVal: null,
      selectRoleItem: {},
      currentRoleName: '',
      roleType:'0',
      conditionCheck: [],
      ValueType,
      supportTypes:[ValueType.number, ValueType.string, ValueType.date, ValueType.dept, ValueType.user],
    }
  },
  computed: {
    nodeProps () {
      return this.$store.state.process.selectedNode.props
    },
    select () {
      return this.config.assignedUser || []
    },
    selectRoleData () {
      return this.config.role || []
    },
    formItems(){
      return this.$store.state.process.design.formItems
    },
    forms () {
      return this.$store.state.process.design.formItems.filter(f => {
        return f.name === 'UserPicker'
      })
    },
    pickerTitle () {
      switch (this.orgPickerType) {
        case 'user':
          return '请选择人员';
        case 'role':
          return '请选择系统角色';
        default:
          return null;
      }
    },
    nodeOptions () {
      let values = []
      const excType = ['ROOT', 'EMPTY', "CONDITION", "CONDITIONS", "CONCURRENT", "CONCURRENTS"]
      this.$store.state.process.nodeMap.forEach((v) => {
        if (excType.indexOf(v.type) === -1) {
          values.push({ id: v.id, name: v.name })
        }
      })
      return values
    },
    showMode () {
      console.log("🚀 ~ file: ApprovalNodeConfig.vue:300 ~ showMode ~ this.nodeProps.assignedType:", this.nodeProps.assignedType, this.nodeProps)
      switch (this.nodeProps.assignedType) {
        case "ASSIGN_USER":
          return this.nodeProps.assignedUser.length > 0;
        case "SELF_SELECT":
          return this.nodeProps.selfSelect.multiple;
        case "LEADER_TOP":
          return this.nodeProps.formUser !== '';
        case "FORM_USER":
          return true;
        case "ROLE":
          return true;
        default:
          return false;
      }
    },
    conditionList() {
      //构造可用条件选项
      const conditionItems = []
      this.formItems.forEach(item => this.filterCondition(item, conditionItems))
      return conditionItems
    },
  },
  created() {
    // 设置短信开关默认为开启状态
    if (this.nodeProps.sendFlag === undefined || this.nodeProps.sendFlag === null) {
      this.$set(this.nodeProps, 'sendFlag', 0);
    }
    
    let conditionStr = this.nodeProps.condition;

    if(!!conditionStr){
      let conditionStrArr = conditionStr.split(':');

      if(conditionStrArr.length === 1){
        this.roleType = conditionStrArr[0];
      }else{
        this.roleType = conditionStrArr[0];

        let index = this.conditionList.findIndex((item) => {
          return item.id === conditionStrArr[1]
        })
        this.conditionCheck.push(this.conditionList[index]);
      }
    }
  },
  methods: {
    selectUser () {
      this.orgPickerSelected = this.select
      this.orgPickerType = 'user'
      // this.$refs.orgPicker.show()
      this.$refs.selectUserTree.init()
    },
    selectNoSetUser () {
      this.orgPickerSelected = this.config.nobody.assignedUser
      this.orgPickerType = 'user'
      this.$refs.orgPicker.show()
    },
    selectRole () {
      this.orgPickerSelected = this.selectRoleData
      this.orgPickerType = 'role'
      // this.$refs.orgPicker.show()
      this.roleVisible = true;
      this.currentRoleVal = this.selectRoleData?.[0]?.id
      this.getRoleOptions()
    },
    selected (select) {
      const oldData = [...this.orgPickerSelected]
      this.orgPickerSelected.length = 0
      const newData = [...oldData, ...select]
      const uniqData = uniqBy(newData, 'id')
      uniqData.forEach(val => this.orgPickerSelected.push(val))
    },
    removeOrgItem (index) {
      this.select.splice(index, 1)
    },
    // 获取系统角色
    async getRoleOptions () {
      try {
        roleListAll({}).then(res=>{
          if (res?.success) {
            const roleOptions = res?.data?.list?.map(i => {
              return {
                id: i.id,
                roleCode: i.roleCode,
                roleName: i.roleName,
                type: 'role',
              }
            }) || [];
            this.roleOptions = roleOptions || [];
          } else {
            this.$modal.msgError(res.message);
          }
        })
      } catch (e) {
        console.error(e);
      }
    },
    handleIconSearch (row) {
      this.currentCondition = row;
      this.currentRoleName = ''
      this.currentRoleVal = null
      this.visible = true
    },
    roleChange (v) {
      const selectRoleItem = this.roleOptions.find(i => i.id === v) || [];
      this.selectRoleItem = selectRoleItem || {}
      this.currentRoleName = selectRoleItem.deptName || ''

    },
    confirmButton () {
      this.currentRoleVal ? this.currentCondition.value = this.currentRoleName : null;
      const currentRole = [this.selectRoleItem] || [];
      this.orgPickerSelected.length = 0
      currentRole.forEach(val => this.orgPickerSelected.push(val))
      this.roleVisible = false
    },
    filterCondition(item, list){
      if (item.name === 'SpanLayout'){
        item.props.items.forEach(sub => this.filterCondition(sub, list))
      }else if (this.supportTypes.indexOf(item.valueType) > -1 ){
        list.push({title: item.title, id: item.id, valueType: item.valueType, dictMap: item.dictMap, dictFlag: item.dictFlag, orgFlag: item.orgFlag})
      }
    },
    conditionChange() { 
      //判断新增的
      if(this.conditionCheck.length > 1){
          this.conditionCheck.splice(0,1)
      }
      this.nodeProps.condition = this.roleType + ":" + this.conditionCheck[0].id;
    },
  }
}
</script>

<style lang="scss" scoped>
.user-type {
  ::v-deep .el-radio {
    width: 110px;
    margin-top: 10px;
    margin-bottom: 20px;
  }
}

::v-deep .line-mode {
  .el-radio {
    width: 150px;
    margin: 5px;
  }
}

::v-deep .el-form-item__label {
  line-height: 25px;
}

::v-deep .approve-mode {
  .el-radio {
    float: left;
    width: 100%;
    display: block;
    margin-top: 15px;
  }
}

::v-deep .approve-end {
  position: relative;

  .el-radio-group {
    width: 160px;
  }

  .el-radio {
    margin-bottom: 5px;
    width: 100%;
  }

  .approve-end-leave {
    position: absolute;
    bottom: -5px;
    left: 150px;
  }
}

::v-deep .el-divider--horizontal {
  margin: 10px 0;
}
</style>

<style lang="scss" scoped>
.group {
  margin-bottom: 20px;
  color: #5e5e5e;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid #e3e3e3;

  .group-header {
    padding: 5px 10px;
    background: #e3e3e3;
    position: relative;

    div {
      display: inline-block;
    }

    .group-name {
      font-size: small;
    }

    .group-cp {
      font-size: small;
      position: absolute;
      left: 100px;
      display: flex;
      top: 5px;
      justify-content: center;
      align-items: center;
    }

    .group-operation {
      position: absolute;
      right: 10px;

      i {
        padding: 0 10px;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .group-content {
    padding: 10px 5px;
    p {
      text-align: center;
      font-size: small;
    }
    .el-icon-delete {
      position: absolute;
      cursor: pointer;
      top: 12px;
      right: 0;
    }
  }

  .condition-title {
    display: block;
    width: 100px;
  }
}
.unit-dialog-content {
  display: flex;
  .select-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin-right: 20px;
  }
}

.role-filter-condition {
  span {
    font-weight: 600;
  }
  .el-radio-group {
    margin-top: 10px;
    margin-left: 20px;
  }
  .el-radio {
    margin-right: 0px;
  }
}

.role-add-condition {
  span {
    font-weight: 600;
  }
  i {
    margin-left: 20px;
    color: #1890ff;
  }
}
</style>
