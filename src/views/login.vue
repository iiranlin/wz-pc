<template>
    <div class="login-container">
      <div class="top-bar">
        <div class="top-content">
          <div class="logo"></div>
        </div>
      </div>
      <div class="login-banner">
        <h1>物资管理解决方案</h1>
        <a href="javascript:void(0)" class="banner-login-btn" @click="handleDialog">立即登录</a>
        <video :src="logoBg" width="1920" height="600" autoplay="autoplay" loop="loop" muted="true"></video>
      </div>
      <div class="functions">
        <h2>特色功能</h2>
        <div class="func-box">
          <ul class="funct-content">
            <li>
              <div class="func-img"><img src="../assets/login/Icon1@2x.webp" alt=""></div>
              <h3>项目管理</h3>
            </li>
            <li>
              <div class="func-img"><img src="../assets/login/Icon2@2x.webp" alt=""></div>
              <h3>合同管理</h3>
            </li>
            <li>
              <div class="func-img"><img src="../assets/login/Icon3@2x.webp" alt=""></div>
              <h3>需求计划管理</h3>
            </li>
            <li>
              <div class="func-img"><img src="../assets/login/Icon4@2x.webp" alt=""></div>
              <h3>供应管理</h3>
            </li>
            <li>
              <div class="func-img"><img src="../assets/login/Icon5@2x.webp" alt=""></div>
              <h3>收货管理</h3>
            </li>
            <li>
              <div class="func-img"><img src="../assets/login/Icon6@2x.webp" alt=""></div>
              <h3>出入库管理</h3>
            </li>
          </ul>
        </div>
      </div>
      <div class="features">
        <h2>产品介绍</h2>
        <div class="features-content">
          <p>物资管理平台集成了业务管理、建设物资、绩效评价、统计分析四大子系统，做为集团公司统一信息化平台，串联了各系统业务流程，达到了智慧运维、整合资源、合理配置、充分共享的目标。创建资产履历动态记录资产使用详情，资产信息数字化保证业务留痕、可追溯，满足资产管理的需求。</p>
        </div>
        <video src="../assets/login/About.mp4" width="700" height="520" autoplay="autoplay" loop="loop" muted="true"></video>
        <img src="../assets/login/cubes.svg" alt="">
        <a href="javascript:void(0)" class="featureslogin" @click="handleDialog">立即登录</a>
      </div>
      <div class="footer">技术支持：中国铁道科学研究院集团有限公司电子计算技术研究所</div>
      <el-dialog
          :visible.sync="dialogVisible"
          width="360px" 
          :close="handleClose"
          :show-close="false"
          id="dialogLogin"
          >
          <div class="login-form" >
              <header>
                  <el-image
                  :src="loginTitle"
                  fit="cover">
              </el-image>
              </header>
              <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="hz-form">
                  <el-form-item  label="用户名：">
                      <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="请输入用户名">
                           <template slot="prefix">
                              <img src="../assets/login/Icon-user@2x.webp" style="height: 20px; margin-right: 5px;line-height:40px;margin-left: 7px;">
                            </template>
                      </el-input>
                  </el-form-item>
                  <el-form-item  label="密码：">
                      <el-input ref="password" v-model="loginForm.password" :type="passwordType" auto-complete="off"
                          placeholder="请输入密码" @keyup.enter.native="handleLogin">
                            <template slot="prefix">
                              <img src="../assets/login/Icon-pwd@2x.webp" style="height: 20px; margin-right: 5px;line-height:40px;margin-left: 7px;">
                            </template>
                      </el-input>
                      <span :class="passwordType ? 'hz-icon-eye' : 'hz-icon-eye-open'" @click="showPwd"></span>
                  </el-form-item>
                  <el-form-item  label="验证码：" class="custom-label"> 
                       <!-- <label style="display:block">验证码：</label> -->
                       <el-input v-model="loginForm.checkCode" type="text" auto-complete="off" placeholder="请输入验证码"
                          @keyup.enter.native="handleLogin" style="width:170px;vertical-align: middle;">
                             <template slot="prefix">
                              <img src="../assets/login/Icon-code@2x.webp" style="height: 20px; margin-right: 5px; margin-left: 7px;line-height:40px;">
                            </template>
                      </el-input>
                      <div class="img-code">
                        <img class="imgVerification" :src="verificationCode" @click="getVerificationCode" />
                      </div>
                      
                  </el-form-item>
              </el-form>
              <div class="btn">
                  <el-button  class="btn-el" @click.native.prevent="handleLogin" @keyup.enter.native.prevent="handleLogin"
                      :loading="loading">
                      <span v-if="!loading">登 录</span>
                      <span v-else>登 录 中...</span>
                  </el-button>
              </div>
          </div>
      </el-dialog>
      <update-password ref="updatePassword" @watchVisible="watchUpdatePasswordClose"></update-password>
    </div>
</template>

<script>
import logoBg from '../assets/login/Banner.mp4';
import { getCookie, setCookie, removeCookie } from "@/utils/auth";
import { getVerificationCode, autoLogin } from "@/api/login";
import { generateUUID } from "@/utils";
import UpdatePassword from "@/components/UpdatePassword";
import logo from "@/assets/logo/logo.png";
import loginTitle from '../assets/login/Login Title@2x.webp';
import { setToken } from "@/utils/auth";
export default {
    name: "Login",
    components: {
      UpdatePassword,
    },
    data() {
        return {
           logoBg,
           loginTitle,
           dialogVisible:false,
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
            passwordType: "password",
            verificationCode: "",
            loading: false,
        };
    },
    computed:{

    },
    watch: {


    },
    created() {
       
    },
    mounted() {

    },
    methods: {
      handleDialog(){
        this.dialogVisible =true
        this.getVerificationCode();
      },
      handleClose(){
        this.dialogVisible =false
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
                                
                                let route = { path: '/portal' }
                                // let route = { path: '/' }
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
      
    }
};
</script>

<style lang="scss" scoped>
* {
		padding: 0;
		margin: 0;
	}
	body {
		overflow-x: hidden;
		background-color: #fff;
		font-family: "Microsoft YaHei", "Pingfang SC", "Hiragino Sans GB", "Helvetica", "Droid Sans", "Arial", "sans-serif";
	}
	ul, li {
		list-style: none;
	}
 ::v-deep.el-dialog__wrapper .el-dialog .el-dialog__header {
  background-color: #fff; /* 修改背景颜色 */
  padding: 0px; /* 修改内边距 */
  }
  ::v-deep.el-dialog__wrapper .el-dialog .el-dialog__body {
    height: 502px;
    padding:30px 26px;
  }

.imgVerification{
  vertical-align: middle;
  height: 36px;
  top: -3px;
  position: relative;
}
.login-container{
  .top-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 74px;
    line-height: 74px;
    background-image: linear-gradient(180deg, #f5faff 0%, rgba(245, 250, 255, 0) 100%);
    z-index: 4;
    .top-content{
      margin: 0 auto;
      width: 1220px;
      .logo{
        float: left;
        margin-top: 10px;
        width: 222px;
        height: 66px;
        background: url(../assets/login/Logo2.png) no-repeat left top;
        background-size: contain;
      }
    }
  }
  .login-banner{
    position: relative;
    width: 100%;
    height: 600px;
    background: #F5FAFF;
    overflow: hidden;
    &::before {
      content: "";
      position: absolute;
      left: 50%;
      transform: translateX(-960px);
      width: 75px;
      height: 100%;
      background-image: linear-gradient(270deg, rgba(245, 250, 255, 0) 0%, #f5fafe 100%);
      z-index: 2;
    }
     &::after {
      content: "";
      position: absolute;
      right: 50%;
      transform: translateX(960px);
      width: 75px;
      height: 100%;
      background-image: linear-gradient(-270deg, rgba(245, 250, 255, 0) 0%, #f5fafe 100%);
      z-index: 2;
    }
    h1{
      position: absolute;
      text-align: center;
      width: 1150px;
      height: 448px;
      z-index: 3;
      top: 66px;
      left: 50%;
      padding: 0 0.5em;
      transform: translateX(-48%);
      font-size: 52px;
      line-height: 999px;
      color: #0F2241;
      overflow: hidden;
      background: url(../assets/login/Title2.png) no-repeat center top;
      background-size: contain;
    }
    .banner-login-btn{
      position: absolute;
      top: 376px;
      left: 50%;
      width: 168px;
      height: 44px;
      background: #2B53FF;
      border-radius: 4px;
      line-height: 44px;
      transform: translateX(-50%);
      z-index: 3;
      color: #fff;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s ease-in-out 0s;
      cursor: pointer;
    }
    video{
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      display: block;
      margin: 0 auto;
    }



  }
 /* 5大特色功能 */

	.functions {
		width: 100%;
		height: 395px;
		background-color: #233660;
	}
	.functions h2 {
		padding: 60px 0 46px;
		font-size: 44px;
		line-height: 64px;
		color: #fff;
		font-weight: 500;
		text-align: center;
		letter-spacing: 5px;
	}
	.func-box {
		margin: 0 auto;
		width: 1220px;
	}
	.func-box ul {
		display: flex;
		justify-content: space-between;
	}
	.funct-content li {
		width: 140px;
	}
	.funct-content li .func-img {
		position: relative;
		margin: 0 auto;
		width: 110px;
		height: 110px;
		overflow: hidden;
	}
	.funct-content li .func-img img {
		display: block;
		position: absolute;
		left: 0;
		top: 0;
		width: 110px;
		height: 4070px;
	}
	.funct-content li:hover .func-img img {
		animation: features 1.6s forwards steps(36, end) infinite;
	}
	.funct-content li:nth-child(3):hover .func-img img {
		animation: features 2.2s forwards steps(36, end) infinite;
	}
	@keyframes features {
		0% {
			top: 0;
		}
		100% {
			top: -3960px;
		}
	}
	.funct-content li h3 {
		color: #fff;
		text-align: center;
		font-size: 16px;
		line-height: 40px;
		font-weight: 400;
	}
	/* 产品介绍 */
	.features {
		position: relative;
		margin: 0 auto;
		width: 1220px;
		height: 615px;
		padding-bottom: 96px;
		background-size: contain;
	}
	.features h2 {
		padding-top: 126px;
		padding-bottom: 30px;
		font-size: 44px;
		line-height: 62px;
		color: #003081;
	}
	.features p {
		font-size: 16px;
		line-height: 38px;
		width: 560px;
	}
	.features video {
		position: absolute;
		width: 800px;
		height: 636px;
		left: 50%;
		top: 0;
		transform: translateX(-28px);
	}
	.features img {
		position: absolute;
		width: 214px;
		height: 228px;
		left: 50%;
		top: 294px;
		transform: translateX(-850px);
	}
	.featureslogin {
		display: block;
		margin-top: 46px;
		width: 168px;
		height: 44px;
		background: #2B53FF;
		border-radius: 4px;
		line-height: 44px;
		z-index: 3;
		color: #fff;
		text-align: center;
		text-decoration: none;
		transition: all 0.2s ease-in-out 0s;
		cursor: pointer;
	}
	.featureslogin:hover {
		background-color: #032CDD;
	}

	.footer {
		width: 100%;
		background-color: #24314E;
		text-align: center;
		line-height: 36px;
		color: rgba(245, 250, 255, 0.7);
		font-size: 12px;
	}


	@media screen and (max-width:1440px) {
		#Banner {
			height: 500px;
		}
		#Banner video {
			width: 1600px;
			height: 500px;
			z-index: 1;
		}
		#Banner h1 {
			top: 180px;
			font-size: 48px;
			line-height: 67px;
		}
		#Banner h2 {
			top: 256px;
			font-size: 16px;
			line-height: 22px;
		}
		.bannerlogin {
			top: 316px;
		}
		.features video {
			transform: translateX(-90px);
		}
	}
  ::v-deep.custom-label .el-form-item__label {
    display: block; /* 使标签独占一行 */
    width: 100%;
    text-align: left;
  }
  .hz-form .el-form-item{
    margin-bottom:10px;
    ::v-deep.el-form-item__content{
      .img-code{
        display: inline-block;
        width: 130px;
        height: 40px;
        text-align: center;
        border:1px solid #DCDFE6;
        border-radius:5px;
        vertical-align:middle;
        margin-left: 7px;
      }
    }
  }
  ::v-deep.el-input .el-input__prefix{
    top: 5px;
 
  }
  ::v-deep.el-form-item .el-form-item__content{
    .el-input--prefix  .el-input__inner{
      padding-left: 35px;
     }
  }
  
  .btn{
    margin-top: 32px;
    .btn-el{
      width:308px;
      height:46px;
      border-radius:4px;
      background:#1e38c4;
      span{
        color: #fff;
      }
    }
  }
 
}
</style>
