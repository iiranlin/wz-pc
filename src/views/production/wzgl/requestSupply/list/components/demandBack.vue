<template>
  <Dialog
    :title="title"
    :visible.sync="visible"
    v-if="visible"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :append-to-body="true"
    :destroy-on-close="true"
    class="dialog-route"
    width="600px"
  >
    <div class="form-render-wrapper" style="margin-top: 16px">
      <el-form
        ref="elform"
        class="process-form"
        label-position="right"
        labelWidth="120px"
        size="medium"
        :showMessage="true"
        :rules="rules"
        :model="form"
      >
        <el-row :span="24" :gutter="20">
          <el-col :span="24">
            <el-form-item :label="'供应计划名称'" prop="planName">
              {{ form.planName }}
            </el-form-item>
          </el-col>
           <el-col :span="24">
            <el-form-item :label="'经办人'" prop="createUserName">
              {{ form.createUserName }}
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'退回说明'" prop="message">
              <el-input
               type="textarea"
                v-model="form.message"
                placeholder="请输入退回说明"
                :max="120"
                :rows="5"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer" v-if="type !== 'view'">
      <el-button round type="primary" @click="handleCreate" :loading="loading" :disabled="loading">确认</el-button>
      <el-button round @click="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/planRest.js'
export default {
  name: "demandBack",
  data () {
    return {
      title: '退回经办人',
      visible: false,
      type: 'add',
      form: {},
      rules: {
        message: [{ required: true, message: '请输入退回说明', trigger: 'blur' }],
      },
    }
  },
  methods: {
    //初始化
    init () {
      this.form = {
        message:''
      };
      this.isEdit = false;
      this.visible = true;
      this.$nextTick(() => {
        this.title = "退回经办人";
      });
    },
      // 编辑初始化
    async updateInit (id) {
      this.isEdit = true;
      this.visible = true;
      await Api.detail(id).then(({ data }) => {
        this.form = Object.assign({}, data);
        this.$nextTick(() => {
          this.title = "退回经办人";
        });
      });
    },

    //新建
    handleCreate () {
      this.$refs.elform.validate(async (valid) => {
        if (valid) {
          const data = {
            id:this.form.id,
            message:this.form.message
          }
          this.loading = true;
          await Api[
            `demandBack`
          ](Object.assign({}, data))
            .then(({ message }) => {
              this.loading = false;
              this.$modal.msgSuccess(message);
              this.visible = false;
              this.$emit("createSuccess");
            })
            .catch((err) => {
              this.loading = false;
            });
        }
      });
    },
    //取消
    handleCancel () {
      this.visible = false;
    },
    //关闭dialog回调
    handleDialogClose () {
      this.$refs.elform.resetFields();
    },
  },
}
</script>