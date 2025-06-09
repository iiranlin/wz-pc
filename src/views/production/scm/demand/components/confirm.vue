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
    <div class="form-render-wrapper" style="margin-top: 16px" v-loading="loading">
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
            <el-form-item :label="'预计发货时间'" prop="shippingDate">
              <el-date-picker
                v-model="form.shippingDate"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
                format="yyyy-MM-dd"
                style="width:100%;"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'确认说明'" prop="confirmValidate">
              <el-input
                v-model="form.confirmValidate"
                type="textarea"
                :rows="2"
                placeholder="请输入"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button round type="primary" @click="handleCreate">确认</el-button>
      <el-button round @click="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/scm.js";
export default {
  name: "confirm",
  dicts: ["MeasureUnit"],
  props:["id"],
  data() {
    return {
      title: "供应需求确认",
      visible: false,
      loading:false,
      form: {},
      rules: {
        shippingDate: [{ required: true, message: "请选择", trigger: "change" }],
        confirmValidate: [{ required: true, message: "请输入", trigger: "blur" }],
      },
    };
  },
  methods: {
    //初始化
    init() {
      this.form = {};
      this.visible = true;
    },

    //新建
    handleCreate() {
      this.$refs.elform.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          await Api.demandEdit(Object.assign({id:this.id}, this.form))
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
    handleCancel() {
      this.visible = false;
    },
    //关闭dialog回调
    handleDialogClose() {
      this.$refs.elform.resetFields();
    },
  },
};
</script>
