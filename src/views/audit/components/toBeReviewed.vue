<template>
  <Dialog
    :title="title"
    :visible.sync="visible"
    width="50%"
    append-to-body
    :close-on-click-modal="false"
    @close="cancel()"
  >
    <el-form
      ref="elForm"
      :model="toBeReviewedForm"
      label-suffix="："
      label-width="120px"
    >
      <el-form-item
        label="审批意见"
        prop="comment"
        :rules="[
          {
            required: type === 'reject',
            message: '请输入审批意见',
            trigger: 'change',
          },
          {
            trigger: 'change',
            validator: this.checkComment,
          },
        ]"
      >
        <el-input
          type="textarea"
          v-model="toBeReviewedForm.comment"
          placeholder="请输入审批意见"
          maxlength="500"
          show-word-limit
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel()">取 消</el-button>
    </div>
    <!--选择审批人弹框-->
    <activiti-assignee
      ref="activitiAssignee"
      @activitiAssigneeSelected="activitiAssigneeSelected"
    ></activiti-assignee>
  </Dialog>
</template>

<script>
import activitiAssignee from './activitiAssignee'
import { passWorkFlow, passEditWorkFlow, rejectWorkFlow, activitiAssigneeList } from '@/api/system/workflow.js'
export default {
  components: { activitiAssignee },
  data () {
    let checkComment = (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      let reg = /\S/
      if (!reg.test(value)) {
        callback(new Error('审批意见不能为空'))
      } else {
        callback()
      }
    };
    return {
      title: '',
      visible: false,
      toBeReviewedForm: {
        comment: ''
      },
      type: '',
      checkComment,
      selected: [],
      candidateUsers: [],
      queryName: '',
      numArr: []
    }
  },
  methods: {
    init (type, row, queryName, numArr = []) {
      this.selected = row;
      this.type = type
      this.title = type === 'pass' ? '同意' : type === 'passEdit' ? '修改后同意' : '不同意'
      this.queryName = queryName || ''
      this.numArr = numArr;
      this.visible = true
      this.$nextTick(() => {
        this.$refs['elForm'].resetFields()
        this.candidateUsers = []
      })
    },
    submitForm () {
      if (this.type === 'pass') {
        this.getActivitiAssigneeList('pass');
      } else if (this.type === 'passEdit') {
        this.getActivitiAssigneeList('passEdit');
      } else {
        this.handleReject()
      }
    },
    //获取下一级审批人
    getActivitiAssigneeList (type) {
      activitiAssigneeList(this.selected[0].taskId).then(({ data }) => {
        let assigneeList = data;

        if (!!assigneeList && assigneeList.length !== 0) {
          this.$refs.activitiAssignee.init(assigneeList);
        } else if (type === 'passEdit') {
          this.activitiCompleteWithEdit();
        } else {
          this.activitiComplete();
        }
      })
    },
    //审核通过
    activitiComplete () {
      const params = {
        taskId: this.selected[0].taskId,
        procInstId: this.selected[0].procInstId,
        candidateUsers: this.candidateUsers,
        businessType: this.selected[0].businessType,
        businessId: this.selected[0].businessId,
        message: this.toBeReviewedForm.comment || "同意"
      }
      passWorkFlow(params).then(res => {
        if (res.success) {
          this.$modal.msgSuccess(res.message)
          this.visible = false
          if (this.queryName) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name: this.queryName });
          } else {
            this.$parent.handleQuery()
          }
        } else {
          this.$modal.msgError(res.message)
        }
      })
    },
    //修改后同意
    activitiCompleteWithEdit () {
      const params = {
        taskId: this.selected[0].taskId,
        procInstId: this.selected[0].procInstId,
        candidateUsers: this.candidateUsers,
        businessType: this.selected[0].businessType,
        businessId: this.selected[0].businessId,
        message: this.toBeReviewedForm.comment || "修改后同意",
        modifyIds: this.numArr.length === 0 ? [this.selected[0].businessId] : this.numArr  // 添加勾选的参数
      }
      passEditWorkFlow(params).then(res => {
        if (res.success) {
          this.$modal.msgSuccess(res.message)
          this.visible = false
          if (this.queryName) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name: this.queryName });
          } else {
            this.$parent.handleQuery()
          }
        } else {
          this.$modal.msgError(res.message)
        }
      })
    },
    //驳回
    handleReject () {
      this.$refs['elForm'].validate(async (valid) => {
        if (valid) {
          const params = {
            taskId: this.selected[0].taskId,
            procInstId: this.selected[0].procInstId,
            candidateUsers: this.candidateUsers,
            businessType: this.selected[0].businessType,
            businessId: this.selected[0].businessId,
            message: this.toBeReviewedForm.comment
          }
          rejectWorkFlow(params).then(res => {
            if (res.success) {
              this.$modal.msgSuccess(res.message)
              this.visible = false
              if (this.queryName) {
                // 关闭当前tabs
                this.$tab.closeOpenPage({ name: this.queryName });
              } else {
                this.$parent.handleQuery()
              }
            } else {
              this.$modal.msgError(res.message)
            }
          })
        }
      })
    },
    cancel () {
      this.visible = false
    },
    //选择审批人后回调
    activitiAssigneeSelected (assignee) {
      // this.candidateUsers = assignee;
      this.candidateUsers = Array.isArray(assignee) ? assignee : [assignee];
      //  修改后同意走修改后同意接口，否则同意
      if (this.type === 'passEdit') {
        this.activitiCompleteWithEdit()
      } else {
        this.activitiComplete()
      }
    },
  },
}
</script>