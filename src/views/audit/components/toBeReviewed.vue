<template>
  <div>
    <Dialog
      :title="title"
      :visible.sync="visible"
      width="50%"
      append-to-body
      :close-on-click-modal="false"
      :show-close="!rollbackSubmitting"
      :close-on-press-escape="!rollbackSubmitting"
      :before-close="beforeReviewClose"
      @close="cancel()"
    >
      <el-form
        ref="elForm"
        :model="toBeReviewedForm"
        label-suffix="："
        label-width="120px"
      >
        <el-alert v-if="type === 'rollbackToPrevious'" class="rollback-tip"
          title="退回后，单据仍处于审核中，由上一步审批人或审批环节重新审核。"
          type="warning" :closable="false" show-icon />
        <el-form-item v-if="type === 'rollbackToPrevious' && selected[0]" label="当前单据">
          {{ selected[0].businessCode || selected[0].businessId }}
        </el-form-item>
        <el-form-item
          :label="type === 'rollbackToPrevious' ? '退回原因' : '审批意见'"
          prop="comment"
          :rules="[
            {
              required: type === 'reject' || type === 'rollbackToPrevious',
              message: type === 'rollbackToPrevious' ? '请输入退回原因' : '请输入审批意见',
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
            :placeholder="type === 'rollbackToPrevious' ? '请输入退回原因' : '请输入审批意见'"
            :disabled="rollbackSubmitting"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="rollbackSubmitting" @click="submitForm">{{ type === 'rollbackToPrevious' ? '确认退回' : '确 定' }}</el-button>
        <el-button :disabled="rollbackSubmitting" @click="cancel()">取 消</el-button>
      </div>
      <!--选择审批人弹框-->
      <activiti-assignee
        ref="activitiAssignee"
        @activitiAssigneeSelected="activitiAssigneeSelected"
        :multiple="multiple"
      ></activiti-assignee>
    </Dialog>
  </div>
</template>

<script>
import activitiAssignee from './activitiAssignee'
import { passWorkFlow, passEditWorkFlow, rejectWorkFlow, rollbackWorkFlow, activitiAssigneeList } from '@/api/system/workflow.js'
export default {
  components: { activitiAssignee },
  data () {
    let checkComment = (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      let reg = /\S/
      if (!reg.test(value)) {
        callback(new Error(this.type === 'rollbackToPrevious' ? '退回原因不能为空' : '审批意见不能为空'))
      } else {
        callback()
      }
    };
    return {
      multiple:false,
      title: '',
      visible: false,
      rollbackSubmitting: false,
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
      if (this.rollbackSubmitting) return
      if (type === 'rollbackToPrevious' && (!Array.isArray(row) || row.length !== 1 || !row[0]?.taskId)) {
        this.$modal.msgWarning('请选择一条有效的待审核任务进行退回')
        return
      }
      this.selected = row;
      this.queryName = queryName || ''
      this.numArr = numArr;
      this.openReview(type)
    },
    openReview (type) {
      this.type = type
      this.title = { pass: '通过', passEdit: '修改后通过', reject: '驳回', rollbackToPrevious: '退回上一步' }[type]
      this.visible = true
      this.$nextTick(() => {
        this.$refs['elForm'].resetFields()
        this.candidateUsers = []
      })
    },
    submitForm () {
      if (this.rollbackSubmitting) return
      if (this.type === 'pass') {
        this.getActivitiAssigneeList('pass');
      } else if (this.type === 'passEdit') {
        this.activitiCompleteWithEdit();
      } else if (this.type === 'rollbackToPrevious') {
        this.handleRollback()
      } else if (this.type === 'reject') {
        this.handleReject()
      }
    },
    //获取下一级审批人
    getActivitiAssigneeList (type) {
      activitiAssigneeList(this.selected[0].taskId).then(({ data }) => {
        let assigneeList = data;

        if (!!assigneeList.data && assigneeList.data.length !== 0) {
          if(assigneeList.nextTaskType ==="APPOINT_AND"){
            this.multiple = true;
          }
          this.$refs.activitiAssignee.init(assigneeList.data);
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
        message: this.toBeReviewedForm.comment || "通过"
      }
      passWorkFlow(params).then(res => {
        if (res.success) {
          this.$modal.msgSuccess(res.message)
          this.handleApproveSuccess()
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
        message: this.toBeReviewedForm.comment || "修改后通过",
        modifyIds: this.numArr.length === 0 ? [this.selected[0].businessId] : this.numArr  // 添加勾选的参数
      }
      passEditWorkFlow(params).then(res => {
        if (res.success) {
          this.$modal.msgSuccess(res.message)
          this.handleApproveSuccess()
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
              this.handleApproveSuccess()
            } else {
              this.$modal.msgError(res.message)
            }
          })
        }
      })
    },
    // 退回整条审批任务，不使用修改后同意的明细 ID 和下级审批人。
    handleRollback () {
      this.toBeReviewedForm.comment = (this.toBeReviewedForm.comment || '').trim()
      this.$refs.elForm.validate(async valid => {
        if (!valid || this.rollbackSubmitting) return
        this.rollbackSubmitting = true
        try {
          const res = await rollbackWorkFlow({
            taskId: this.selected[0].taskId,
            backReason: this.toBeReviewedForm.comment
          })
          this.$modal.msgSuccess(res.message)
          this.handleApproveSuccess()
          this.selected = []
          this.candidateUsers = []
          this.numArr = []
          this.toBeReviewedForm.comment = ''
        } catch (error) {
          // 请求层已提示 HTTP/通用业务错误，这里仅展示退回接口的文案兼容错误。
          if (error?.isRollbackResult) this.$modal.msgError(error.message)
        } finally {
          this.rollbackSubmitting = false
        }
      })
    },
    beforeReviewClose (done) {
      if (!this.rollbackSubmitting) done()
    },
    cancel () {
      if (this.rollbackSubmitting) return
      this.visible = false
    },
    isCloudLogin () {
      return sessionStorage.getItem('loginType') === 'cloud' || !!sessionStorage.getItem('cloudLoginFlag')
    },
    handleApproveSuccess () {
      this.visible = false
      if (this.type === 'rollbackToPrevious') this.$emit('rollback-success')
      if (this.isCloudLogin()) {
        this.$router.replace('/index')
        return
      }

      if (this.queryName) {
        // 关闭当前tabs
        this.$tab.closeOpenPage({ name: this.queryName })
      } else {
        this.$parent.handleQuery()
      }
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

<style scoped>
.rollback-tip {
  margin-bottom: 16px;
}
</style>
