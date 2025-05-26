<template>
  <!-- 分配角色数据权限对话框 -->
  <Dialog :title="title" :visible.sync="openDataScope" append-to-body :close-on-click-modal="false" v-loading="loading">
    <el-form ref="elForm" :model="formData" :rules="rules" label-width="85px">
      <el-form-item label="服务名称:" prop="serviceName">
        <el-input :maxlength="50" v-model="formData.serviceName" />
      </el-form-item>
      <el-form-item label="服务编码:" prop="serviceCode">
        <el-input :maxlength="50" v-model="formData.serviceCode" />
      </el-form-item>
      <el-form-item label="服务地址:" prop="serviceAddress">
        <el-input :maxlength="50" v-model="formData.serviceAddress" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitDataScope">确 定</el-button>
      <el-button @click="openDataScope = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Editor from "@/components/Editor"
import { serviceSave, serviceDetail } from '@/api/system/frontend'
export default {
  components: { Editor },
  data() {
    return {
      loading: false,
      title: '新增服务',
      type: 'add',
      id: '',
      openDataScope: false,
      formData: {
        serviceName: '',
        serviceCode: '',
        serviceAddress: ''
      },
      // 表单校验
      rules: {
        serviceName: [
          { required: true, message: "服务名称不能为空", trigger: "blur" }
        ],
        serviceCode: [
          { required: true, message: "服务编码不能为空", trigger: "blur" }
        ],
        serviceAddress: [
          { required: true, message: "服务地址不能为空", trigger: "blur" }
        ],
      }
    }
  },
  methods: {
    /** 提交按钮（数据权限） */
    init(type, id) {
      this.type = type;
      this.id = id;

      this.openDataScope = true;
      if (this.$refs.elForm) this.$refs.elForm.resetFields();
      this.$nextTick(() => {
        if (type === 'update') {
          this.title = "修改服务";
          this.serviceDetail(id);
        } else if (type === 'create') {
          this.title = "新增服务";
        }
      })
    },
    serviceDetail(id) {
      serviceDetail(id).then(({ data }) => {
        this.formData = data;
      })
    },
    submitDataScope() {
      this.$refs["elForm"].validate(valid => {
        if (valid) {
          const id = this.id || null 
          this.loading = true;
          serviceSave(Object.assign({}, this.formData, { id })).then(({ message }) => {
            this.$modal.msgSuccess(message);
            this.openDataScope = false;
            this.loading = false;
            this.$emit('operateSuccess')
          });
        }
      })
    }
  }
};
</script>
