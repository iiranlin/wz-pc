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
            <el-form-item :label="'物资名称'" prop="materialName">
              <el-input
                v-model="form.materialName"
                maxlength="240"
                placeholder="请输入"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'规格型号'" prop="specModel">
              <el-input
                v-model="form.specModel"
                maxlength="240"
                placeholder="请输入"
              ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item :label="'计量单位'" prop="unit">
              <el-select
                v-model="form.unit"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in dict.type.JLDW"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'标准或图号'" prop="standardCode">
              <el-input
                v-model="form.standardCode"
                maxlength="240"
                placeholder="请输入"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer" v-if="type !== 'view'">
      <el-button round type="primary" @click="handleCreate">确认</el-button>
      <el-button round @click="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as Api from '@/api/prodmgr-inv/project/item.js'
export default {
  name: "ItemAdd",
  dicts: ['JLDW'],
  data () {
    return {
      title: '新增',
      visible: false,
      type: 'add',
      form: {},
      rules: {
        materialName: [
          { required: true, message: '请输入', trigger: 'blur' },
        ],
        specModel: [
          { required: true, message: '请输入', trigger: 'blur' },
        ],
        unit: [
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
        this.title = "新建物资";
      });
    },
    // 编辑初始化
    async updateInit (id) {
      this.isEdit = true;
      this.visible = true;
      await Api.detail(id).then(({ data }) => {
        this.form = Object.assign({}, data);
        this.$nextTick(() => {
          this.title = "编辑物资";
        });
      });
    },

    //新建
    handleCreate () {
      this.$refs.elform.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          await Api[
            this.isEdit ? `edit` : `save`
          ](Object.assign({}, this.form))
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