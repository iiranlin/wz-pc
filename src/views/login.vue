<template>
    <section class="login-container">
        <div id="leftvedio">
            <el-image
                :src="logoBg"
                class="background-image"
                fit="cover">
            </el-image>
        </div>
        <div class="login-form">
            <header>
                <!-- <div class="login-logo">
                    <img :src="logo" />
                </div> -->
                <!-- <h1>{{ title }}</h1> -->
                 <el-image
                :src="loginTitle"
                fit="cover">
            </el-image>
                <!-- <h3>请输入账号信息</h3> -->
            </header>
            <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="hz-form" inline>
                <el-form-item prop="username" label="用户名：">
                    <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
                        <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
                    </el-input>
                </el-form-item>
                <el-form-item prop="password" label="密码：">
                    <el-input ref="password" v-model="loginForm.password" :type="passwordType" auto-complete="off"
                        placeholder="密码" @keyup.enter.native="handleLogin">
                        <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
                    </el-input>
                    <span :class="passwordType ? 'hz-icon-eye' : 'hz-icon-eye-open'" @click="showPwd"></span>
                </el-form-item>
                <el-form-item prop="checkCode" label="验证码：">
                    <el-input v-model="loginForm.checkCode" type="text" auto-complete="off" placeholder="验证码"
                        @keyup.enter.native="handleLogin" style="width: 65%; float: left">
                    </el-input>
                    <img class="imgVerification" :src="verificationCode" @click="getVerificationCode" alt="" />
                </el-form-item>
            </el-form>
            <div class="btn">
                <el-button type="primary" @click.native.prevent="handleLogin" @keyup.enter.native.prevent="handleLogin"
                    :loading="loading">
                    <span v-if="!loading">登 录</span>
                    <span v-else>登 录 中...</span>
                </el-button>
            </div>
        </div>
        <span v-if="testFlag" class="testTitle">{{ testFlag }}</span>
        <update-password ref="updatePassword" @watchVisible="watchUpdatePasswordClose"></update-password>
    </section>
</template>

<script>
import { getCookie, setCookie, removeCookie } from "@/utils/auth";
import { getVerificationCode } from "@/api/login";
import { generateUUID } from "@/utils";
import UpdatePassword from "@/components/UpdatePassword";
import logo from "@/assets/logo/logo.png";
import logoBg from '../assets/loginBg.png';
import loginTitle from '../assets/loginTitle.png';

export default {
    name: "Login",
    components: {
        UpdatePassword,
    },
    data() {
        return {
            loginTitle,
            logoBg,
            logo,
            title: process.env.VUE_APP_TITLE,
            testFlag: process.env.VUE_APP_TEST_FLAG,
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
            loading: false,
            redirect: undefined,
            patternSwitch: true,
            passwordType: "password",
            verificationCode: "",
        };
    },
    watch: {
        $route: {
            handler: function (route) {
                if (route.query && route.query.redirect) {
                    const redirect = decodeURIComponent(route.query.redirect)
                    const url = /(http|https):\/\/([\w.]+\/?)\S*/.test(redirect) ? redirect: `${location.origin}${redirect}` 
                    this.redirect = new URL(`${url}`);
                }

            },
            immediate: true,
        },
        // 'loginForm.username': {
        //   handler: function (newUsername){
        //     this.loginForm.username = newUsername.toLocaleUpperCase();
        //   }
        // }
    },
    created() {
        const username = getCookie("username");
        const password = getCookie("password");
        this.loginForm = {
            username: username === undefined ? this.loginForm.username : username,
            password: password === undefined ? this.loginForm.password : password,
            rememberMe: true,
            checkCode: "",
            checkKey: "",
        };
        this.getVerificationCode();
    },
    mounted() {
        let banner = document.getElementById('banner');
        if (banner) {
            this.setBg();
            window.addEventListener('resize', this.setBg);
        }
    },
    methods: {
        setBg() {
            let vdo_w = 2560;
            let vdo_h = 1400;
            let win_w = window.innerWidth;
            let set_h = vdo_h / vdo_w * win_w;
            document.getElementById('banner').style.height = set_h + 'px';
        },
        handleLogin() {
            localStorage.removeItem('UNIT_ID')
            localStorage.removeItem('UNIT_NAME')
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    if (this.loginForm.rememberMe) {
                        setCookie("username", this.loginForm.username);
                        // setCookie('password', this.loginForm.password)
                    } else {
                        removeCookie("username");
                        // removeCookie('password')
                    }
                    this.$store
                        .dispatch("Login", this.loginForm)
                        .then((res) => {
                            this.loading = false;
                            if (res.success) {
                                let route = { path: '/' }
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
        /**获取验证码*/
        getVerificationCode() {
            let randomKey = generateUUID(8, 16);
            this.loginForm.checkKey = randomKey;
            getVerificationCode(randomKey).then((res) => {
                this.verificationCode = res.data;
            });
        },
        pattern() {
            this.patternSwitch = !this.patternSwitch;
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
        window.removeEventListener('resize', this.setBg);
    }
};
</script>

<style lang="scss">
.login-container {
    height: 100%;
    background-color: #eaeff6;

    #leftvedio {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        overflow: hidden;
    }

    .background-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    #banner {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        filter: saturate(1.3);
    }

    .login-form {
        position: fixed;
        left: 75%;
        top: 50%;
        transform: translate(-50%, -56%);
        width: 350px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0px 3px 7px rgba(15, 20, 44, 0.16);
        z-index: 2;
        color: #2a2e33;

        header {
            width: 100%;
            padding: 15px 15px 0 32px;
        }

        .login-logo {
            width: 83px;
            height: 40px;
            position: absolute;
            left: 14px;
            top: 15px;
        }

        img {
            width: 100%;
        }

        h1 {
            font-size: 32px;
            line-height: 45px;
            color: #18223e;
            letter-spacing: 2px;
            margin-top: 50px;
            margin-bottom: 0;
            text-align: center;
        }

        h3 {
            margin-left: 32px;
            font-size: 12px;
            font-weight: 300;
            line-height: 16px;
            color: #18223e;
            opacity: 0.7;
            margin: 0;
            text-align: center;
        }

        .hz-form {
            // margin-top: 14px;
            padding: 0 40px;

            .el-form-item__error {
                display: none;
            }
        }

        .btn {
            margin-top: 30px;
            padding: 0 35px;
            margin-bottom: 20px;
        }

        .el-form-item {
            width: 100%;
            margin-bottom: 5px;
            margin-right: 0px !important;
        }

        .el-form-item__label {
            padding: 0;
            font-size: 13px;

            &::before {
                content: none !important;
            }
        }

        .el-form-item__content {
            width: 100%;

            .imgVerification {
                width: 35%;
                height: 36px;
            }
        }

        .el-input__inner {
            border-width: 0;
            border-radius: 0 !important;
            border-bottom-width: 1px;
            padding-left: 15px;
            border-bottom-color: #000;
            color: #2a2e33;
        }

        .is-error .el-input__inner {
            border-bottom-color: #ff4949;
        }

        .el-input__inner:focus {
            border: 2px solid #1682e6;
            border-radius: 4px !important;
        }

        .el-button {
            width: 100%;
            font-size: 16px;
            background-color: #1c75fd;
            padding: 15px 20px;

            &:hover {
                background: #0160ee;
            }
        }
    }

    .el-login-footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
        height: 20px;
        line-height: 20px;
    }

    .hz-icon-eye {
        display: inline-block;
        position: absolute;
        width: 16px;
        height: 16px;
        top: 12px;
        right: 8px;
        background: url("../assets/images/eye.png") center/contain no-repeat;
        cursor: pointer;

        &:hover {
            background: url("../assets/images/eye-hover.png") center/contain no-repeat;
        }
    }

    .hz-icon-eye-open {
        display: inline-block;
        position: absolute;
        width: 16px;
        height: 16px;
        top: 12px;
        right: 8px;
        background: url("../assets/images/eye-open.png") center/contain no-repeat;
        cursor: pointer;

        &:hover {
            background: url("../assets/images/eye-open-hover.png") center/contain no-repeat;
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
    bottom: 2%;
    transform: translate(-50%, -2%);
    z-index: 2;
}

.validate-code-image {
    margin-top: 32px;
    display: flex;
    height: 30px;
    background-color: #fff;
}
</style>
