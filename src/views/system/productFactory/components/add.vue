<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="520px"
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="厂家名称" prop="factoryName"
        ><el-input
          v-model="form.factoryName"
          maxlength="100"
          placeholder="请输入厂家名称"
      /></el-form-item>
      <el-form-item label="厂家类型" prop="factoryType"
        ><el-select
          v-model="form.factoryType"
          clearable
          placeholder="请选择厂家类型"
          style="width: 100%"
          ><el-option
            v-for="item in factoryTypes"
            :key="item"
            :label="item"
            :value="item" /></el-select
      ></el-form-item>
      <el-form-item label="备注"
        ><el-input
          v-model="form.remark"
          type="textarea"
          maxlength="500"
          show-word-limit
          placeholder="请输入备注"
      /></el-form-item>
    </el-form>
    <span slot="footer"
      ><el-button @click="visible = false">取消</el-button
      ><el-button type="primary" :loading="loading" @click="submit"
        >确定</el-button
      ></span
    > </el-dialog
  > 
</template>
<script>
import * as Api from "@/api/prodmgr-inv/project/productFactory.js";
export default {
  name: "ProductFactoryAdd",
  data() {
    return {
      visible: false,
      loading: false,
      title: "新建",
      form: {},
      factoryTypes: ["钢材", "水泥", "粉煤灰", "外加剂"],
      rules: {
        factoryName: [
          { required: true, message: "请输入厂家名称", trigger: "blur" },
        ],
        factoryType: [
          { required: true, message: "请选择厂家类型", trigger: "change" },
        ],
      },
    };
  },
  methods: {
    init() {
      this.title = "新建";
      this.form = {};
      this.visible = true;
    },
    updateInit(id) {
      this.title = "编辑";
      this.visible = true;
      Api.detail(id).then(({ data }) => {
        this.form = Object.assign({}, data);
      });
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        Api.save({
          id: this.form.id,
          factoryName: this.form.factoryName,
          factoryType: this.form.factoryType,
          remark: this.form.remark,
        })
          .then(({ message }) => {
            this.$modal.msgSuccess(message || "保存成功");
            this.visible = false;
            this.$emit("success");
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
  },
};
</script>
