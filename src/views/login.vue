<template>
    <section class="login-container" v-loading="loading && username">
        <div id="leftvedio">
            <el-image :src="logoBg" class="background-image" fit="cover">
            </el-image>
            <!-- <video id="banner" src="../assets/LoginBg.mp4" width="2560" height="1400" autoplay="autoplay" loop="loop"
                muted></video> -->
        </div>
        <div class="login-form" v-if="!username">
            <header>
                <!-- <div class="login-logo">
                    <img :src="logo" />
                </div> -->
                <!-- <h1>{{ title }}</h1> -->
                <el-image :src="loginTitle" fit="cover">
                </el-image>
                <!-- <h3>请输入账号信息</h3> -->
            </header>
            <div class="login-tabs">
                <button :class="{ active: loginMode === 'account' }" type="button" @click="switchLoginMode('account')">
                    账号登录
                </button>
                <button :class="{ active: loginMode === 'phone' }" type="button" @click="switchLoginMode('phone')">
                    手机登录
                </button>
            </div>
            <el-form v-if="loginMode === 'account'" ref="loginForm" :model="loginForm" :rules="loginRules" class="hz-form" inline>
                <el-form-item prop="username" label="用户名：">
                    <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
                        <template slot="prefix">
                            <img src="../assets/login/Icon-user@2x.webp"
                                style="height: 20px; margin-right: 5px;line-height:40px;margin-left: 7px; ">
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password" label="密码：">
                    <el-input ref="password" v-model="loginForm.password" :type="passwordType" auto-complete="off"
                        placeholder="密码" @keyup.enter.native="handleLogin">
                        <template slot="prefix">
                            <img src="../assets/login/Icon-pwd@2x.webp"
                                style="height: 20px; margin-right: 5px;line-height:40px;margin-left: 7px;">
                        </template>
                    </el-input>
                    <span :class="passwordType ? 'hz-icon-eye' : 'hz-icon-eye-open'" @click="showPwd"></span>
                </el-form-item>
                <el-form-item prop="checkCode" label="验证码：">
                    <el-input v-model="loginForm.checkCode" type="text" auto-complete="off" placeholder="验证码"
                        @keyup.enter.native="handleLogin" style="width: 65%; float: left">
                        <template slot="prefix">
                            <img src="../assets/login/Icon-code@2x.webp"
                                style="height: 20px; margin-right: 5px; margin-left: 7px;line-height:40px;">
                        </template>
                    </el-input>
                    <img class="imgVerification" :src="verificationCode" @click="getVerificationCode" alt="" />
                </el-form-item>
            </el-form>
            <el-form v-else ref="smsLoginForm" :model="smsLoginForm" :rules="smsLoginRules" class="hz-form" inline>
                <el-form-item prop="phone" label="手机号：">
                    <el-input v-model="smsLoginForm.phone" type="text" auto-complete="off" placeholder="请输入手机号">
                        <template slot="prefix">
                            <i class="el-icon-mobile-phone sms-prefix-icon"></i>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="code" label="短信验证码：">
                    <div class="sms-code-row">
                        <el-input v-model="smsLoginForm.code" type="text" auto-complete="off" placeholder="请输入验证码"
                            @keyup.enter.native="handleSmsLogin">
                            <template slot="prefix">
                                <img src="../assets/login/Icon-code@2x.webp"
                                    style="height: 20px; margin-right: 5px; margin-left: 7px;line-height:40px;">
                            </template>
                        </el-input>
                        <el-button class="sms-code-btn" :disabled="smsCountdown > 0" :loading="smsSending"
                            @click="sendSmsCode">
                            {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
                        </el-button>
                    </div>
                </el-form-item>
            </el-form>
            <div class="btn">
                <el-button v-if="loginMode === 'account'" type="primary" @click.native.prevent="handleLogin" @keyup.enter.native.prevent="handleLogin"
                    :loading="loading">
                    <span v-if="!loading">登 录</span>
                    <span v-else>登 录 中...</span>
                </el-button>
                <el-button v-else type="primary" @click.native.prevent="handleSmsLogin" @keyup.enter.native.prevent="handleSmsLogin"
                    :loading="smsLoading">
                    <span v-if="!smsLoading">登 录</span>
                    <span v-else>登 录 中...</span>
                </el-button>
            </div>
        </div>
        <span v-if="testFlag" class="testTitle">{{ testFlag }}</span>
        <update-password ref="updatePassword" @watchVisible="watchUpdatePasswordClose"></update-password>
    </section>
</template>

<script>
//门户登录
import logoBg from '../assets/login/menhuBG.png';
import { setCookie, removeCookie } from "@/utils/auth";
import { getVerificationCode, sendPhoneCaptcha, autoLogin } from "@/api/login";
import { generateUUID } from "@/utils";
import UpdatePassword from "@/components/UpdatePassword";
import loginTitle from '../assets/login/Login Title@2x.png';
import { setToken } from "@/utils/auth";
export default {
    name: "Login",
    components: {
        UpdatePassword,
    },
    data() {
        const phoneValidator = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入手机号'));
            } else if (!/^\d{11}$/.test(value)) {
                callback(new Error('请输入 11 位手机号'));
            } else {
                callback();
            }
        };
        return {
            testFlag: process.env.VUE_APP_TEST_FLAG,
            logoBg,
            loginTitle,
            dialogVisible: false,
            loginMode: "account",
            loginForm: {
                username: "",
                // password: '',
                checkCode: "",
                checkKey: "",
                rememberMe: true,
            },
            loginRules: {
                username: [
                    { required: true, trigger: "blur", message: "请输入您的账号" },
                ],
                password: [
                    { required: true, trigger: "blur", message: "请输入您的密码" },
                ],
                checkCode: [
                    { required: true, trigger: "blur", message: "请输入验证码" },
                ],
            },
            smsLoginForm: {
                phone: "",
                code: "",
            },
            smsLoginRules: {
                phone: [
                    { required: true, validator: phoneValidator, trigger: "blur" },
                ],
                code: [
                    { required: true, trigger: "blur", message: "请输入短信验证码" },
                ],
            },
            passwordType: "password",
            verificationCode: "",
            loading: false,
            smsLoading: false,
            smsSending: false,
            smsCountdown: 0,
            smsCountdownTimer: null,
        };
    },
    computed: {

    },
    watch: {


    },
    created() {
        this.getVerificationCode();
    },
    mounted() {

    },
    methods: {
        handleDialog() {
            this.dialogVisible = true
            this.getVerificationCode();
        },
        handleClose() {
            this.dialogVisible = false
        },
        switchLoginMode(mode) {
            this.loginMode = mode;
            this.$nextTick(() => {
                const formRef = mode === "account" ? "loginForm" : "smsLoginForm";
                if (this.$refs[formRef]) {
                    this.$refs[formRef].clearValidate();
                }
            });
        },
        redirectAfterLogin() {
            let route = { path: '/portal' }
            if (this.redirect) {
                const query = this.redirect.search ? Object.fromEntries(
                    new URLSearchParams(this.redirect.search)
                ) : {}
                route = {
                    path: this.redirect.pathname,
                    query: query
                }
            }
            this.$router
                .push(route)
                .catch(() => { });
        },
        handleLogin() {

            localStorage.removeItem('UNIT_ID')
            localStorage.removeItem('UNIT_NAME')
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    if (this.loginForm.rememberMe) {
                        setCookie("username", this.loginForm.username);
                    } else {
                        removeCookie("username");
                    }
                    this.$store
                        .dispatch("Login", this.loginForm)
                        .then((res) => {
                            this.loading = false;
                            if (res.success) {
                                // 标记为普通登录
                                sessionStorage.setItem('loginType', 'normal');

                                this.redirectAfterLogin();
                            } else {
                                if (res.code == 10001 || res.code == 10002) {
                                    this.$modal.msgError(res.message)
                                    // 为初始密码,弹窗提示进行更改
                                    this.$refs.updatePassword.initUpdatePassword(
                                        true,
                                        true,
                                        this.loginForm.username,
                                        this.loginForm.password
                                    );
                                } else {
                                    this.getVerificationCode();
                                    this.$modal.msgError(res.message);
                                }
                            }
                        })
                        .catch(() => {
                            this.getVerificationCode();
                            this.loading = false;
                        });
                }
            });
        },
        validateSmsPhone() {
            return new Promise((resolve) => {
                this.$refs.smsLoginForm.validateField('phone', (message) => {
                    resolve(!message);
                });
            });
        },
        sendSmsCode() {
            if (this.smsCountdown > 0 || this.smsSending) {
                return;
            }
            this.validateSmsPhone().then((valid) => {
                if (!valid) {
                    return;
                }
                this.smsSending = true;
                sendPhoneCaptcha(this.smsLoginForm.phone.trim())
                    .then((res) => {
                        if (res.success || res.code === 0) {
                            this.$modal.msgSuccess(res.message || '验证码已发送');
                            this.startSmsCountdown();
                        } else {
                            this.$modal.msgError(res.message || '验证码发送失败');
                        }
                    })
                    .catch(() => {
                    })
                    .finally(() => {
                        this.smsSending = false;
                    });
            });
        },
        startSmsCountdown() {
            this.smsCountdown = 60;
            if (this.smsCountdownTimer) {
                clearInterval(this.smsCountdownTimer);
            }
            this.smsCountdownTimer = setInterval(() => {
                this.smsCountdown -= 1;
                if (this.smsCountdown <= 0) {
                    clearInterval(this.smsCountdownTimer);
                    this.smsCountdownTimer = null;
                }
            }, 1000);
        },
        handleSmsLogin() {
            localStorage.removeItem('UNIT_ID')
            localStorage.removeItem('UNIT_NAME')
            this.$refs.smsLoginForm.validate((valid) => {
                if (valid) {
                    this.smsLoading = true;
                    this.$store
                        .dispatch("LoginByPhone", this.smsLoginForm)
                        .then((res) => {
                            this.smsLoading = false;
                            if (res.success || res.code === 0) {
                                sessionStorage.setItem('loginType', 'normal');
                                if (res.data && res.data.username) {
                                    sessionStorage.setItem("username", res.data.username);
                                }
                                this.redirectAfterLogin();
                            } else {
                                this.$modal.msgError(res.message || '登录失败');
                            }
                        })
                        .catch(() => {
                            this.smsLoading = false;
                        });
                }
            });
        },
        /**获取验证码*/
        getVerificationCode() {
            let randomKey = generateUUID(8, 16);
            this.loginForm.checkKey = randomKey;
            getVerificationCode(randomKey).then((res) => {
                this.verificationCode = res.data;
            });
        },
        showPwd() {
            if (this.passwordType === "password") {
                this.passwordType = "";
            } else {
                this.passwordType = "password";
            }
            this.$nextTick(() => {
                this.$refs.password.focus();
            });
        },
        watchUpdatePasswordClose() {
            this.getVerificationCode();
        },
    },
    beforeDestroy() {
        if (this.smsCountdownTimer) {
            clearInterval(this.smsCountdownTimer);
        }
    }
};
</script>
<style scoped>
::v-deep.el-input .el-input__prefix {
    top: 5px;
}

::v-deep.el-form-item .el-form-item__content {
    .el-input--prefix .el-input__inner {
        padding-left: 35px;
    }
}
</style>
<style lang="scss">
.login-container {
    height: 100vh;
    width: 100vw;
    position: relative;
    overflow: hidden;
    background-color: #eaeff6;

    #leftvedio {
        position: absolute;
        top: 0;
        right: 500px; // 留出登录表单的宽度
        height: 100vh; // 高度占满屏幕
        width: calc(100vh * (1630 / 960)); // 按比例计算宽度
        overflow: hidden; // 超出部分隐藏
        z-index: 1;

        .background-image {
            position: absolute;
            right: 0; // 图片靠右
            top: 0;
            height: 100%;
            width: 100%;
            object-fit: cover; // 保持比例填充
        }
    }

    #banner {
        width: calc(100vw - 500px);
        height: 100%;
        object-fit: cover;
        filter: saturate(1.3);
    }

    .login-form {
        position: absolute;
        right: 0;
        top: 50%;
        width: 500px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        transform: translateY(-50%);
        width: 500px;
        background: #ffffff;
        padding: 0 70px;
        // border-radius: 12px;
        // box-shadow: 0px 3px 7px rgba(15, 20, 44, 0.16);
        color: #2a2e33;
        z-index: 2;

        header {
            width: 100%;
            text-align: center;
        }

        .hz-form {
            padding: 0;
        }

        .login-tabs {
            display: flex;
            align-items: center;
            margin: 26px 0 22px;
            border-bottom: 1px solid #edf0f5;

            button {
                flex: 1;
                height: 38px;
                padding: 0;
                border: 0;
                border-bottom: 2px solid transparent;
                background: transparent;
                color: #7a8491;
                font-size: 15px;
                cursor: pointer;

                &.active {
                    color: #1c75fd;
                    border-bottom-color: #1c75fd;
                    font-weight: 600;
                }
            }
        }

        .btn {
            margin-top: 30px;
            padding: 0;
            margin-bottom: 30px;
        }

        // 表单项样式
        .el-form-item {
            width: 100%;
            margin-bottom: 20px;
            margin-right: 0px !important;
        }

        .el-form-item__label {
            padding: 0;
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;

            &::before {
                content: none !important;
            }
        }

        .el-form-item__content {
            width: 100%;
            position: relative;

            .imgVerification {
                width: 35%;
                height: 36px;
                float: right;
                cursor: pointer;
            }
        }

        .sms-prefix-icon {
            margin-left: 7px;
            color: #9aa4b2;
            font-size: 18px;
            line-height: 30px;
        }

        .sms-code-row {
            display: flex;
            align-items: center;
            gap: 10px;

            .el-input {
                flex: 1;
            }

            .sms-code-btn {
                width: 112px;
                height: 36px;
                padding: 0;
                flex-shrink: 0;
                color: #1c75fd;
                border-color: #1c75fd;
                background: #fff;
                font-size: 14px;

                &:hover {
                    color: #fff;
                    background: #1c75fd;
                }

                &.is-disabled,
                &.is-disabled:hover {
                    color: #a8b0bb;
                    border-color: #dcdfe6;
                    background: #f5f7fa;
                }
            }
        }

        // .el-input__inner {
        //     border: 1px solid #dcdfe6;
        //     border-radius: 4px !important;
        //     padding: 12px 15px;
        //     color: #2a2e33;
        //     height: 40px;

        //     &:focus {
        //         border-color: #1682e6;
        //         box-shadow: 0 0 0 2px rgba(22, 130, 230, 0.2);
        //     }
        // }

        .is-error .el-input__inner {
            border-color: #ff4949;
        }

        .el-button {
            width: 100%;
            font-size: 16px;
            background-color: #1c75fd;
            padding: 12px 20px;
            height: 44px;
            border-radius: 4px;

            &:hover {
                background: #0160ee;
            }
        }
    }

    // 测试提示
    .testTitle {
        color: red;
        font-weight: bold;
        font-size: 22px;
        position: absolute;
        left: 50%;
        bottom: 20px;
        transform: translateX(-50%);
        z-index: 3;
    }

    // 眼睛图标样式
    .hz-icon-eye,
    .hz-icon-eye-open {
        display: inline-block;
        position: absolute;
        width: 16px;
        height: 16px;
        top: 12px;
        right: 8px;
        cursor: pointer;
        z-index: 3;
    }

    .hz-icon-eye {
        background: url("../assets/images/eye.png") center/contain no-repeat;

        &:hover {
            background: url("../assets/images/eye-hover.png") center/contain no-repeat;
        }
    }

    .hz-icon-eye-open {
        background: url("../assets/images/eye-open.png") center/contain no-repeat;

        &:hover {
            background: url("../assets/images/eye-open-hover.png") center/contain no-repeat;
        }
    }




}
</style>
