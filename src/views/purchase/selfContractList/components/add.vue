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
            <el-form-item :label="'发证单位'" prop="materialName">
              <el-input
                v-model="form.materialName"
                maxlength="240"
                placeholder="请输入发证单位"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'证书编号'" prop="specModel">
              <el-input
                v-model="form.specModel"
                maxlength="240"
                placeholder="请输入证书编号"
              ></el-input>
            </el-form-item>
          </el-col>
          <!-- 日期范围选择 -->
          <el-col :span="24">
            <el-form-item :label="'有效期至'" prop="validityGuarantee">
              <el-date-picker
                v-model="form.validityGuarantee"
                type="daterange"
                placeholder="请选择有效期至"
                style="width: 100%;"
              />
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
import * as Api from '@/api/purchase/selfContractList.js'

export default {
  name: "ItemAdd",
  dicts: ["MeasureUnit", "WZDL"],
  data() {
    return {
      title: "新增",
      visible: false,
      type: "add",
      form: {
        materialName: "",
        specModel: "",
        validityGuarantee: [],
      },
      rules: {
        materialName: [{ required: true, message: "请输入发证单位", trigger: "blur" }],
        specModel: [{ required: true, message: "请输入证书编号", trigger: "blur" }],
        validityGuarantee: [{ required: true, message: "请选择有效期", trigger: "change" }],
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
    //初始化
    init() {
      this.form = {
        materialName: "",
        specModel: "",
        validityGuarantee: [],
      };
      this.typeOptions = [];
      this.detailOptions = [];
      this.isEdit = false;
      this.originalForm = null;
      this.isInitialLoad = false;
      this.visible = true;
      this.$nextTick(() => {
        this.title = "新建";
      });
    },

    // 编辑初始化
    async updateInit(id) {
      this.isEdit = true;
      this.isInitialLoad = true; // 标记为初始加载
      this.visible = true;

       await Api.detail(id).then((res) => {
        this.form = {
          ...res.data,
          materialName: '',
          specModel:  '',
          validityGuarantee: [],
        };
      });
     
    },


    //新建
    handleCreate() {
      this.$refs.elform.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          await Api['edit'](Object.assign({}, this.form,{
            startTime: this.form.validityGuarantee[0] || '',
            endTime: this.form.validityGuarantee[1] || ''
          }))
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
