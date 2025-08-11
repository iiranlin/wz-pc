<template>
    <section class="login-container" v-loading="loading && username">
        <div id="leftvedio">
            <!-- <el-image
                :src="logoBg"
                class="background-image"
                fit="cover">
            </el-image> -->
       <video id="banner" src="../assets/LoginBg.mp4" width="2560" height="1400" autoplay="autoplay" loop="loop"
                muted></video>
        </div>
        <div class="login-form"  v-if="!username">
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
import { getVerificationCode, autoLogin } from "@/api/login";
import { generateUUID } from "@/utils";
import UpdatePassword from "@/components/UpdatePassword";
import logo from "@/assets/logo/logo.png";
// import logoBg from '../assets/loginBg.png';
import loginTitle from '../assets/loginTitle.png';
import { setToken } from "@/utils/auth";

export default {
    name: "Login",
    components: {
        UpdatePassword,
    },
    data() {
        return {
            loginTitle,
            // logoBg,
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
    computed:{
        username(){
            return this.$route.query?.username || ''
        },
        userkey(){
            return this.$route.query?.userkey || ''
        }
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
        // 检查URL参数中是否有username，如果有则自动登录
        const urlParams = new URLSearchParams(window.location.search);
        const usernameFromUrl = urlParams.get('username');
        
        if (usernameFromUrl) {
            this.handleAutoLogin(usernameFromUrl);
            return;
        }
        
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
        // let banner = document.getElementById('banner');
        // if (banner) {
        //     this.setBg();
        //     window.addEventListener('resize', this.setBg);
        // }
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
                                // 标记为普通登录
                                sessionStorage.setItem('loginType', 'normal');
                                
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
        /**
         * 处理自动登录
         * @param {string} username - 从URL参数获取的用户名
         */
        handleAutoLogin(username) {
            this.loading = true;
            autoLogin({ username })
                .then((res) => {
                    this.loading = false;
                    if (res.success && res.data && res.data.token) {
                        // 设置token
                        setToken(res.data.token);
                        this.$store.commit('SET_TOKEN', res.data.token);
                        
                        // 标记为通过username自动登录
                        sessionStorage.setItem('loginType', 'username');
                        sessionStorage.setItem('userkey',this.userkey)
                        
                        // 获取用户信息
                        this.$store.dispatch('GetInfo').then(() => {
                            // 生成动态路由
                            this.$store.dispatch('GenerateRoutes').then(accessRoutes => {
                                this.$router.addRoutes(accessRoutes); // 动态添加可访问路由表
                                
                                // 处理重定向
                                let route = { path: '/' };
                                if (this.redirect) {
                                    const query = this.redirect.search ? Object.fromEntries(
                                        new URLSearchParams(this.redirect.search)
                                    ) : {};
                                    route = {
                                        path: this.redirect.pathname,
                                        query: query
                                    };
                                }
                                this.loading = false; // 关闭loading
                                this.$router.push(route).catch(() => {});
                            }).catch(() => {
                                this.$modal.msgError('生成路由失败');
                                this.loading = false;
                            });
                        }).catch(() => {
                            this.$modal.msgError('获取用户信息失败');
                            this.loading = false;
                        });
                    } else {
                        this.$modal.msgError(res.message || '自动登录失败');
                    }
                })
                .catch((error) => {
                    this.loading = false;
                    this.$modal.msgError('自动登录失败，请手动登录');
                    console.error('Auto login error:', error);
                });
        },
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.setBg);
    }
};
</script>

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
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
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

        .el-input__inner {
            border: 1px solid #dcdfe6;
            border-radius: 4px !important;
            padding: 12px 15px;
            color: #2a2e33;
            height: 40px;

            &:focus {
                border-color: #1682e6;
                box-shadow: 0 0 0 2px rgba(22, 130, 230, 0.2);
            }
        }

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
