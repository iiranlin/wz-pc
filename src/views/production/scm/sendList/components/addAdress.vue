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
            <el-form-item :label="'当前位置：'" prop="confirmValidate">
              <el-input
                v-model="form.confirmValidate"
                placeholder="请输入当前货运位置"
                style="width: 70%; margin-right: 10px"
              ></el-input>
              <el-button type="primary" @click="add">添加</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="border-top:1px solid #ccc;padding:20px;height:350px;overflow:auto;">
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.timestamp"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/scm.js";
export default {
  name: "addAdress",
  dicts: ["MeasureUnit"],
  props: ["id"],
  data() {
    return {
      title: "请填写货运当前位置",
      visible: false,
      loading: false,
      form: {},
      rules: {},
      activities: [
        {
          content: "活动按期开始",
          timestamp: "2018-04-15",
        },
        {
          content: "通过审核",
          timestamp: "2018-04-13",
        },
        {
          content: "创建成功",
          timestamp: "2018-04-11",
        },
      ],
    };
  },
  methods: {
    //初始化
    init() {
      this.form = {};
      this.visible = true;
    },

    //新建
    handleCreate() {},
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
