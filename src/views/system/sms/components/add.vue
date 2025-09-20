<template>
  <Dialog :title="title" :visible.sync="visible" v-if="visible" :show-close="true" :close-on-click-modal="false"
    :close-on-press-escape="false" :append-to-body="true" :destroy-on-close="true" class="dialog-route" width="600px">
    <div class="form-render-wrapper" style="margin-top: 16px">
      <el-form ref="elform" class="process-form" label-position="right" labelWidth="120px" size="medium"
        :showMessage="true" :rules="rules" :model="form">
        <el-row :span="24" :gutter="20">
          <template v-if="userName == 'cars'">
            <el-col :span="24">
              <el-form-item :label="'短信类型'" prop="smsType">
                <el-input v-model="form.smsType" maxlength="240" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="'短信模板编码'" prop="smsCodeAli">
                <el-input v-model="form.smsCodeAli" maxlength="240" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="'短信编码'" prop="smsCode">
                <el-input v-model="form.smsCode" maxlength="240" placeholder="请输入"></el-input>
              </el-form-item>
            </el-col>
          </template>
          <el-col :span="24">
            <el-form-item :label="'推送事件'" prop="smsFlowCode">
              <el-select @change="onChange" v-model="form.smsFlowCode" style="width: 100%;" :disabled="userName != 'cars'">
                <el-option v-for="item in dict.type.SMSTEMPLATE" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="'接收人'" prop="remark">
              <el-input v-model="form.remark" maxlength="240" placeholder="请输入"
                :disabled="userName != 'cars'"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item :label="'推送内容'" prop="content">
              <el-input type="textarea" v-model="form.content" maxlength="240" placeholder="请输入"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="短信开关" prop="status">
              <el-switch v-model="form.status" active-text="开启" inactive-text="关闭" active-color="#13ce66"
                inactive-color="#ff4949" active-value="1" inactive-value="0" />
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
import * as Api from '@/api/prodmgr-inv/project/sms.js'
import * as RoleApi from '@/api/system/role.js'
import { getUserInfo } from '@/utils/user-info'
export default {
  name: "ItemAdd",
  dicts: ['SMSTEMPLATE', 'SMSTYPE'],
  props: {
    userName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      title: '新增',
      visible: false,
      type: 'add',
      form: {},
      rules: {
        content: [
          { required: false, message: '请输入', trigger: 'blur' },
        ],
        smsFlowCode: [
          { required: false, message: '请选择', trigger: 'change' },
        ],
        smsType: [
          { required: false, message: '请选择', trigger: 'change' },
        ],
      },
      userInfo: getUserInfo(),
      eventOptions: [],
      loading: false,
      roleOptions: [],
      selectedIds: []
    }
  },

  methods: {
    getList () {

    },
    getRoleList () {
      const params = {
        pageNum: 1,
        pageSize: -1,
      }
      RoleApi.rolePage(params).then(({ data }) => {
        this.roleOptions = data.list.map(x => ({
          ...x,
          label: x.roleName,
          value: x.id,
        }))
      }).finally(() => {
        this.loading = false
      })
    },
    //初始化
    init (allIds) {
      this.form = {
      };
      this.selectedIds = allIds
      this.isEdit = false;
      this.visible = true;
      this.$nextTick(() => {
        this.title = "新建";
        this.getList()
      });
    },
    // 编辑初始化
    async updateInit (id) {
      this.isEdit = true;
      this.visible = true;
      await Api.detail(id).then(({ data }) => {
        this.form = Object.assign({}, data);
        this.$nextTick(() => {
          this.title = "编辑";
          this.getList()
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
          ](Object.assign(this.form, { unitId: this.userInfo.unitId },))
            .then(({ message }) => {
              this.$modal.msgSuccess(message);
              this.visible = false;
              this.$emit("createSuccess");
            })
            .finally(() => {
              this.loading = false
            })
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
    onChange (e) {
      // this.form.remark = this.eventOptions.find(x => x.value == e).remark
      this.form.smsCodeName = this.dict.type.SMSTEMPLATE.find(x => x.value == e).label
      // this.form.content = this.eventOptions.find(x => x.value == e).content
      // this.form.status = this.eventOptions.find(x => x.value == e).status
      // this.form.smsCode = this.eventOptions.find(x => x.value == e).smsCode

      // this.form = { ...this.eventOptions.find(x => x.value == e) }
      this.form.smsFlowCode = e
      // this.form.id = null
    },
    onRoleChange (e) {
      this.form.remark = this.roleOptions.find(x => x.value == e).roleName
    }
  },
}
</script>