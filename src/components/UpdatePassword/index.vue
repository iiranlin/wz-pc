<template>
  <!--用户修改密码对话框-->
  <div class="update-password">
    <Dialog v-loading="updatePasswordLoading" :close-on-click-modal="false" :visible.sync="visible" width="40%">
      <el-row slot="title">
        <span>修改密码</span>
      </el-row>
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
        <el-form-item label="旧密码:" prop="oldPass" v-if="!pwdInitStatus" class="form-input">
          <el-input ref="oldpassword" size="small" style="width: 80%" v-model.trim="passwordForm.oldPass" autocomplete="off"
            :type="oldpasswordType">
          </el-input>
          <svg @click="showPwd('oldpasswordType','oldpassword')" v-show="oldpasswordType" focusable="false" class="el-input_showPwd" data-icon="eye"
            width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="64 64 896 896">
            <path
              d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z">
            </path>
          </svg>
          <svg @click="showPwd('oldpasswordType','oldpassword')" v-show="!oldpasswordType" focusable="false" class="el-input_showPwd"
            data-icon="eye-invisible" width="1em" height="1em" fill="currentColor" aria-hidden="true"
            viewBox="64 64 896 896">
            <path
              d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z">
            </path>
            <path
              d="M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z">
            </path>
          </svg>
        </el-form-item>
        <el-form-item label="新密码:" prop="pass" class="form-input">
          <el-input ref="newpassword" size="small" style="width: 80%" v-model.trim="passwordForm.pass" autocomplete="off"
            :type="newpasswordType"></el-input>
          <svg @click="showPwd('newpasswordType','newpassword')" v-show="newpasswordType" focusable="false" class="el-input_showPwd" data-icon="eye"
            width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="64 64 896 896">
            <path
              d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z">
            </path>
          </svg>
          <svg @click="showPwd('newpasswordType','newpassword')" v-show="!newpasswordType" focusable="false" class="el-input_showPwd"
            data-icon="eye-invisible" width="1em" height="1em" fill="currentColor" aria-hidden="true"
            viewBox="64 64 896 896">
            <path
              d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z">
            </path>
            <path
              d="M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z">
            </path>
          </svg>
        </el-form-item>
        <el-form-item label="确认新密码:" prop="checkPass" class="form-input">
          <el-input ref="confirmpassword" size="small" style="width: 80%" v-model.trim="passwordForm.checkPass" autocomplete="off"
            :type="confirmpasswordType"></el-input>
          <svg @click="showPwd('confirmpasswordType','confirmpassword')" v-show="confirmpasswordType" focusable="false" class="el-input_showPwd" data-icon="eye"
            width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="64 64 896 896">
            <path
              d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z">
            </path>
          </svg>
          <svg @click="showPwd('confirmpasswordType','confirmpassword')" v-show="!confirmpasswordType" focusable="false" class="el-input_showPwd"
            data-icon="eye-invisible" width="1em" height="1em" fill="currentColor" aria-hidden="true"
            viewBox="64 64 896 896">
            <path
              d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z">
            </path>
            <path
              d="M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z">
            </path>
          </svg>
        </el-form-item>
      </el-form>

      <el-row slot="footer">
        <el-button size="small" type="primary" @click="updatePassword">提交</el-button>
        <el-button size="small" @click="closeUpdatePassword">关闭</el-button>
      </el-row>
    </Dialog>
  </div>
</template>

<script>
import { getCookie, removeToken } from "@/utils/auth";
import { changePassword, logout } from '@/api/login'
import { MessageBox } from 'element-ui'

export default {
  data() {
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'))
      } else {
        if (this.passwordForm.oldPass !== '') {
          if (value === this.passwordForm.oldPass) {
            callback(new Error('旧密码和新密码不能相同'))
          }
        }
        if (this.passwordForm.checkPass !== '') {
          this.$refs.passwordForm.validateField('checkPass')
        }
        callback()
      }
    }
    let validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.passwordForm.pass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      updatePasswordLoading: false,
      visible: false,
      username: '',
      passwordForm: {
        oldPass: '',
        pass: '',
        checkPass: ''
      },
      passwordRules: {
        oldPass: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        pass: [
          { required: true, validator: validatePass, trigger: 'blur' },
          {
            pattern: /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9])/,
            message: '密码由大小写字母+特殊字符+数字组成', trigger: 'blur'
          },
          { min: 8, max: 20, message: '请设置8-20位密码', trigger: 'blur' }
        ],
        checkPass: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      },
      // true表示登陆初始密码检测,false为登录后修改密码
      pwdInitStatus: true,
      oldpasswordType: "password",
      newpasswordType: "password",
      confirmpasswordType: "password",
    }
  },
  watch: {
    visible(newVal) {
      if (!newVal) {
        this.$refs.passwordForm.resetFields()
        if (this.pwdInitStatus) {
          this.$emit('watchVisible', newVal)
        }
      }
    },
    pwdInitStatus(newVal) {
      newVal ? this.passwordRules.oldPass = [] :
        this.passwordRules.oldPass = [{
          required: true,
          message: '请输入旧密码',
          trigger: 'blur'
        }]
    }
  },
  methods: {
    showPwd(opt,ref) {
      if (this[opt] === "password") {
        this[opt] = "";
      } else {
        this[opt] = "password";
      }
      this.$nextTick(() => {
        this.$refs[ref].focus();
      });
    },
    /**针对初始密码进行更新*/
    updatePassword() {
        this.$refs.passwordForm.validate((valid) => {
            if (valid) {
                // 初始密码修改
                changePassword({
                    oldPass: this.passwordForm.oldPass,
                    password: this.passwordForm.pass,
                    pwdInitStatus: this.pwdInitStatus,
                    username: getCookie("username"),
                }).then(res => {
                    if (res.success) {
                        if (this.pwdInitStatus) {
                            this.$modal.msgSuccess('修改密码成功,请重新登陆')
                        } else {
                            MessageBox.confirm('修改密码后需重新登录', '系统提示', {
                                confirmButtonText: '重新登录',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                this.$store.dispatch('LogOut')
                                // .then(() => {
                                //     // 如果是登录页面不需要重新加载
                                //     if (window.location.hash.indexOf('#/login') !== 0) {
                                //         location.href = '/index'
                                //     }
                                // })
                            }).catch(() => {
                                logout()
                            })
                        }
                        this.visible = false
                    } else {
                        this.$modal.msgError(res.message);
                    }
                })
            }
        })
    },
    /**关闭修改初始密码对话框*/
    closeUpdatePassword() {
      this.visible = false
      if (this.pwdInitStatus) {
        this.$store.commit('SET_TOKEN', '')
        this.$store.commit('SET_ROLES', null)
        removeToken()
      }
    }
    ,
    /**
     * 重置密码弹窗初始化
     * @param visible 可见,传true
     * @param pwdInitStatus true表示登陆初始密码检测,false为登录后修改密码
     * @param username 用户名
     * @param oldPass 旧密码
     */
    initUpdatePassword(visible, pwdInitStatus, username, oldPass) {
      this.username = username
      this.visible = visible
      this.pwdInitStatus = pwdInitStatus
      if (pwdInitStatus) {
        this.passwordForm.oldPass = oldPass
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.update-password {
  margin: auto;
}
/* .form-input{
  position: relative;
} */
.form-input ::v-deep .el-form-item__content {
  position: relative;
}
.el-input_showPwd {
  position: absolute;
  top: 12px;
  right: 22%;
  color: #818286;
  cursor: pointer;
}
.el-input_showPwd:hover {
  color: #2f3031;
}

::v-deep .el-form-item__error{
    display: block !important;
}
</style>
