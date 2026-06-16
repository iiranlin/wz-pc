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
        labelWidth="135px"
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
          <el-form-item :label="'供应商名称'" prop="sellerName">
            {{ form.sellerName }}
          </el-form-item>
          </el-col>
          <el-col :span="24"> </el-col>
          <el-col :span="24">
            <el-form-item :label="'需求计划表附件'" prop="xqjhbfj">
              <fileUpload
                v-model="form.xqjhbfj"
                businessType="51"
                :limit="9999"
                :fileSize="500"
                :fileType="['pdf']"
                :preview="false"
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
import fileUpload from '@/components/upload'
import {findByBusinessType} from '@/utils/index.js'
export default {
  name: "ItemAdd",
  components: {
    fileUpload
  },
  data () {
    return {
      title: '发送甲供物资需求计划到供应商',
      visible: false,
      type: 'add',
      form: {},
      rules: {
        xqjhbfj: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
      },
    }
  },
  methods: {
    //初始化
    init () {
      this.form = {
      };
      this.isEdit = false;
      this.visible = true;
      this.$nextTick(() => {
        this.title = "发送甲供物资需求计划到供应商";
      });
    },
    // 编辑初始化
    async updateInit (id) {
      this.isEdit = true;
      this.visible = true;
      await Api.detail(id).then(({ data }) => {
        this.form = Object.assign({xqjhbfj:undefined}, data);
        this.$nextTick(() => {
          this.title = "发送甲供物资需求计划到供应商";
        });
      });
    },

    //新建
    handleCreate () {
      this.$refs.elform.validate(async (valid) => {
        if (valid) {
          const fileList = [...this.form.fileList ,{fileList:this.form.xqjhbfj}]
          const data = {
            ...this.form,
            fileList
          }
          this.loading = true;
          await Api[
            `submitToSeller`
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

<style lang="scss" scoped>
  ::v-deep .process-form {
    .el-form-item__label{
      min-height: 38px;
      padding: 2px 12px 2px 10px;
      background: #F2F2F2;
      border: 1px solid #e6ebf5;
      border-right: none;
    }
    .el-form-item__content{
      min-height: 38px;
      padding-left: 10px;
      border: 1px solid #e6ebf5;
      border-left: none;
    }
  }
</style>