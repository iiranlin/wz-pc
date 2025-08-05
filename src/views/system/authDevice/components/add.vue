<template>
  <Dialog :title="title" :visible.sync="visible" v-if="visible" :show-close="true" :close-on-click-modal="false"
    :close-on-press-escape="false" :append-to-body="true" :destroy-on-close="true" class="dialog-route" width="600px">
    <div class="form-render-wrapper" style="margin-top: 16px">
      <el-form ref="elform" class="process-form" label-position="right" labelWidth="120px" size="medium"
        :showMessage="true" :rules="rules" :model="form">
        <el-row :span="24" :gutter="20">

          <el-col :span="24">
            <el-form-item :label="'单位类型'" prop="unitType">
              <el-select v-model="form.unitType" placeholder="请选择" style="width: 100%" filterable>
                  <el-option v-for="item in dict.type.UnitType" :key="item.value" :label="item.label"
                  :value="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'设备类型'" prop="deviceType">
              <el-select v-model="form.deviceType" placeholder="请选择" style="width: 100%" filterable>
                <el-option v-for="item in dict.type.DiviceType" :key="item.value" :label="item.label"
                  :value="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'单位名称'" prop="unitName">
              <el-input v-model="form.unitName" maxlength="240" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'使用人'" prop="name">
              <el-input v-model="form.name" maxlength="240" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'设备序列号'" prop="deviceNum">
              <el-input v-model="form.deviceNum" maxlength="240" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <!-- 状态使用开关并带文字 -->
          <el-col :span="24">
            <el-form-item :label="'授权状态'" prop="status">
              <el-switch v-model="form.status" active-text="启用" inactive-text="关闭" active-color="#13ce66"
                inactive-color="#ff4949" active-value="1" inactive-value="0" /></el-form-item>
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
import * as Api from "@/api/prodmgr-inv/project/authDevice.js";
import * as DeptApi from "@/api/system/dept.js";
export default {
  name: "ItemAdd",
  dicts: ["DiviceType","UnitType"],
  data() {
    return {
      title: "新增",
      visible: false,
      type: "add",
      form: {
        unitType: "",
        unitName: "",
        name: "",
        deviceNum: "",
        deviceType: "",
        status: "1",
      },
      rules: {
        unitType: [{ required: true, message: "请选择", trigger: "change" }],
        unitName: [{ required: true, message: "请输入", trigger: "blur" }],
        name: [{ required: true, message: "请输入", trigger: "blur" }],
        deviceNum: [{ required: true, message: "请输入", trigger: "blur" }],
        deviceType: [{ required: true, message: "请选择", trigger: "change" }],
      },
      typeOptions: [],
      detailOptions: [],
      loading: false,
      isEdit: false,
      originalForm: null, // 保存原始表单数据用于比较
      isInitialLoad: false, // 标记是否为初始加载
    };
  },
  methods: {
    // 获取单位类型数据
    async getUnitTypeOptions() {
      const res = await DeptApi.deptGetFirstLevel();
      this.typeOptions = res.data.map((item) => {
        return {
          value: item.id,
          label: item.unitName,
        };
      });
    },
    //初始化
    init() {
      this.form = {
        unitType: "",
        unitName: "",
        name: "",
        deviceNum: "",
        deviceType: "",
        status: "1",
      };
      this.typeOptions = [];
      this.detailOptions = [];
      this.isEdit = false;
      this.originalForm = null;
      this.isInitialLoad = false;
      this.visible = true;
      this.$nextTick(() => {
        this.title = "新建授权设备";
        this.getUnitTypeOptions();
      });
    },

    // 编辑初始化
    async updateInit(id) {
      this.isEdit = true;
      this.isInitialLoad = true; // 标记为初始加载
      this.visible = true;

      await Api.detail(id).then(async ({ data }) => {
        await this.getUnitTypeOptions();
        this.originalForm = { ...data }; // 保存原始数据用于比较
        this.form = Object.assign({}, data);

        this.$nextTick(() => {
          this.title = "编辑授权设备";
          // 初始加载完成后，重置标记
          setTimeout(() => {
            this.isInitialLoad = false;
          }, 500);
        });
      });
    },

    //新建
    handleCreate() {
      this.$refs.elform.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          await Api[this.isEdit ? `edit` : `save`](Object.assign({}, this.form))
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
