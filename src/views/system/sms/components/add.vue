<template>
  <Dialog :title="title" :visible.sync="visible" v-if="visible" :show-close="true" :close-on-click-modal="false"
    :close-on-press-escape="false" :append-to-body="true" :destroy-on-close="true" class="dialog-route" width="600px">
    <div class="form-render-wrapper" style="margin-top: 16px">
      <el-form ref="elform" class="process-form" label-position="right" labelWidth="120px" size="medium"
        :showMessage="true" :rules="rules" :model="form">
        <el-row :span="24" :gutter="20">
          <el-col :span="24">
            <el-form-item :label="'推送事件'" prop="smsFlowCode">
              <el-select v-model="form.smsFlowCode" @change="onChange" style="width: 100%;" :disabled="isEdit">
                <el-option v-for="item in eventOptions" :key="item.value" :label="item.label" :disabled="item.disabled"
                  :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.smsCode == 7" :label="'接收人'" prop="roleCode">
              <el-select v-model="form.roleCode" filterable  @change="onRoleChange" style="width: 100%;">
                <el-option v-for="item in roleOptions" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-else :label="'接收人'" prop="remark">
              <el-input v-model="form.remark" maxlength="240" placeholder="请输入" :disabled="true"></el-input>
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
  data() {
    return {
      title: '新增',
      visible: false,
      type: 'add',
      form: {},
      rules: {
        content: [
          { required: true, message: '请输入', trigger: 'blur' },
        ],
        roleCode: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
        smsFlowCode: [
          { required: true, message: '请选择', trigger: 'change' },
        ]
      },
      userInfo: getUserInfo(),
      eventOptions: [],
      loading: false,
      roleOptions: [],
      selectedIds:[]
    }
  },

  methods: {
    getList() {
      this.loading = true
      const params = {
        unitId: -1,
        pageNum: 1,
        pageSize: -1,
      }
      Api.itemList(Object.assign(params)).then(({ data }) => {
        this.eventOptions = data.list.map(x => ({
          ...x,
          disabled: this.selectedIds.includes(x.smsCode),
          label: x.smsCodeName,
          value: x.id,
        }))

        this.getRoleList()
      }).finally(() => {
        this.loading = false
      })
    },
    getRoleList() {
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
    init(allIds) {
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
    async updateInit(id) {
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
    handleCreate() {
      this.$refs.elform.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          await Api[
            this.isEdit ? `edit` : `save`
          ](Object.assign(this.form,{ unitId: this.userInfo.unitId }, ))
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
    handleCancel() {
      this.visible = false;
    },
    //关闭dialog回调
    handleDialogClose() {
      this.$refs.elform.resetFields();
    },
    onChange(e) {
      // this.form.remark = this.eventOptions.find(x => x.value == e).remark
      // this.form.smsCodeName = this.eventOptions.find(x => x.value == e).smsCodeName
      // this.form.content = this.eventOptions.find(x => x.value == e).content
      // this.form.status = this.eventOptions.find(x => x.value == e).status
      // this.form.smsCode = this.eventOptions.find(x => x.value == e).smsCode

      this.form = {...this.eventOptions.find(x => x.value == e)}
      this.form.smsFlowCode = e
      this.form.id = null
    },
    onRoleChange(e) {
      this.form.remark = this.roleOptions.find(x => x.value == e).roleName
    }
  },
}
</script>