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
            <el-form-item :label="'当前位置：'" prop="positionInformation">
              <el-input
                v-model="form.positionInformation"
                placeholder="请输入当前货运位置"
                style="width: 70%; margin-right: 10px"
              ></el-input>
              <el-button type="primary" @click="add">添加</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        style="border-top: 1px solid #ccc; padding: 20px; height: 350px; overflow: auto"
      >
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.createDate"
            size="large"
            :type="activity.type"
          >
            {{ activity.positionInformation }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false">关闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as Api from "@/api/prodmgr-inv/project/scm.js";
import dayjs from "dayjs";
export default {
  name: "addAdress",
  dicts: ["MeasureUnit"],
  props: ["shipmentBatchNumber"],
  data() {
    return {
      title: "请填写货运当前位置",
      visible: false,
      loading: false,
      form: {},
      rules: {
        positionInformation: [{ required: true, message: "请输入", trigger: "blur" }],
      },
      activities: [],
    };
  },
  methods: {
    //初始化
    init() {
      this.form = {};
      this.visible = true;
      this.findList();
    },
    findList() {
      Api.findAdressList({ shipmentBatchNumber: this.shipmentBatchNumber })
        .then(({ data }) => {
          if (data.list.length > 0) {
            data.list[0].type = "success ";
            this.activities = data.list.map((x) => ({
              ...x,
              createDate: dayjs(x.createDate).format("YYYY-MM-DD HH:mm:ss"),
            }));
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    //新建
    async add() {
      this.$refs.elform.validate(async (valid) => {
        if (!valid) {
          this.$message.warning("请输入货运位置");
          return;
        }
        await Api.addAdress({
          shipmentBatchNumber: this.shipmentBatchNumber,
          positionInformation: this.form.positionInformation,
        })
          .then(({ message }) => {
            this.$modal.msgSuccess("添加成功");
            this.findList();
          })
          .finally((err) => {});
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
