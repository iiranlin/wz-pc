<template>
  <div class="cloud-login">
    <!-- 动态背景装饰 -->
    <div class="cloud-login__bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="cloud-login__panel" :class="{ 'is-error': status === 'error' }">
      <div class="cloud-login__icon-wrapper">
        <i :class="statusIcon" class="cloud-login__icon" />
      </div>
      <div class="cloud-login__title">{{ title }}</div>
      <div class="cloud-login__message">{{ message }}</div>
    </div>
  </div>
</template>

<script>
import { loginWzByTicket } from '@/api/login'
import { setToken, removeToken } from '@/utils/auth'
import { loginByCode } from '@/api/system/CloudSSO.js'

const CLOUD_LOGOUT_URL = process.env.VUE_APP_SUPPLIES_CLOUD_URL
const CLOUD_SSO_URL = process.env.VUE_APP_SUPPLIES_CLOUD_SSO
const MATERIAL_SSO_URL = process.env.VUE_APP_MATERIAL_URL
const CLOUD_REDIRECT_KEY = 'cloudLoginRedirect'
// 物资平台登录地址
const FALLBACK_LOGIN_URL = 'http://10.3.144.73:8000'

export default {
  name: 'suppliesLogin',
  data() {
    return {
      status: 'loading',
      message: '登录处理中，请稍候...',
      userName: ''
    }
  },
  computed: {
    title() {
      return this.status === 'error' ? '登录失败' : '登录'
    },
    statusIcon() {
      return this.status === 'error' ? 'el-icon-error' : 'el-icon-loading'
    }
  },
  created() {
    this.clearCurrentToken()
    this.handleCloudLogin()
  },
  methods: {
    clearCurrentToken() {
      this.userName = '';
      removeToken()
      this.$store.commit('SET_TOKEN', '')
    },
    cacheRedirectTarget() {
      const { pcurl: redirect, ticket } = this.$route.query
      if (!redirect && !ticket) {
        sessionStorage.removeItem(CLOUD_REDIRECT_KEY)
        return
      }
      if (!redirect) {
        return
      }
      sessionStorage.setItem(CLOUD_REDIRECT_KEY, redirect)
    },
    async redirectAfterLogin() {
      try {
        const businessId = sessionStorage.getItem(CLOUD_REDIRECT_KEY)

        // 加密用户编号
        const res = await loginByCode({ userName: this.userName })
        if (businessId) {
          // 加密待办业务ID
          const res2 = await loginByCode({ userName: businessId })

          // 跳转物资平台
          await window.location.replace(`${MATERIAL_SSO_URL}?userCode=${encodeURIComponent(res.data)}&businessId=${encodeURIComponent(res2.data)}`)
        } else {
          // 跳转物资平台
          await window.location.replace(`${MATERIAL_SSO_URL}?userCode=${encodeURIComponent(res.data)}`)
        }

        sessionStorage.removeItem(CLOUD_REDIRECT_KEY)
        return
      } catch (error) {
        console.log(error)
      }
    },
    clearCloudStorage() {
      sessionStorage.removeItem('cloudLoginFlag')
      sessionStorage.removeItem('cloudLogoutUrl')
      sessionStorage.removeItem('loginType')
      sessionStorage.removeItem(CLOUD_REDIRECT_KEY)
    },
    redirectToLogin() {
      setTimeout(() => {
        this.$router.replace('/login')
      }, 800)
    },
    showError(message) {
      this.status = 'error'
      this.message = message
      this.$message.error(message)
    },
    async handleCloudLogin() {
      const ticket = this.$route.query.ticket
      this.cacheRedirectTarget()

      if (!ticket) {
        if (CLOUD_SSO_URL) {
          this.message = '正在跳转统一认证，请稍候...'
          window.location.href = CLOUD_SSO_URL
          return
        }

        this.showError('缺少登录凭证')
        this.clearCloudStorage()
        return
      }

      sessionStorage.setItem('cloudLoginFlag', '1')
      sessionStorage.setItem('cloudLogoutUrl', CLOUD_LOGOUT_URL)

      try {
        const res = await loginWzByTicket({ ticket })
        if (res.data) {
          // setToken(res.data.token)
          // this.$store.commit('SET_TOKEN', res.data.token)

          this.userName = res.data?.username || '';
          sessionStorage.setItem('loginType', 'cloud')
          await this.redirectAfterLogin()
          return
        }

        this.clearCloudStorage()
        window.location.replace(FALLBACK_LOGIN_URL)
      } catch (error) {
        this.clearCloudStorage()
        window.location.replace(FALLBACK_LOGIN_URL)
      }
    }
  }
}
</script>

<style scoped>
/* 容器及动态渐变背景 */
.cloud-login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f2f6fc 0%, #dce6f7 100%);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 动态背景几何图形装饰 */
.cloud-login__bg-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  animation: float 12s infinite ease-in-out alternate;
}

.shape-1 {
  width: 300px;
  height: 300px;
  left: -100px;
  top: -100px;
  animation-duration: 10s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  right: -150px;
  bottom: -150px;
  animation-duration: 14s;
  background: rgba(255, 255, 255, 0.1);
}

.shape-3 {
  width: 150px;
  height: 150px;
  left: 20%;
  bottom: 20%;
  animation-duration: 8s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  right: 20%;
  top: 20%;
  animation-duration: 11s;
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
  }

  100% {
    transform: translateY(-30px) scale(1.05) rotate(10deg);
  }
}

/* 登录面板（毛玻璃效果） */
.cloud-login__panel {
  position: relative;
  z-index: 1;
  width: 380px;
  padding: 48px 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.cloud-login__panel.is-error {
  background: rgba(255, 245, 245, 0.85);
  border-color: rgba(245, 108, 108, 0.3);
  box-shadow: 0 24px 48px rgba(245, 108, 108, 0.15);
  animation: shake 0.5s ease-in-out forwards;
}

@keyframes slideUpFade {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-8px);
  }

  40% {
    transform: translateX(8px);
  }

  60% {
    transform: translateX(-4px);
  }

  80% {
    transform: translateX(4px);
  }
}

/* 图标及其动画背景 */
.cloud-login__icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  animation: pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
  transition: all 0.4s ease;
}

.is-error .cloud-login__icon-wrapper {
  background: rgba(245, 108, 108, 0.1);
  box-shadow: none;
  animation: none;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }

  70% {
    box-shadow: 0 0 0 24px rgba(64, 158, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

.cloud-login__icon {
  font-size: 36px;
  color: #409eff;
  z-index: 2;
  transition: all 0.4s ease;
}

.is-error .cloud-login__icon {
  color: #f56c6c;
  font-size: 42px;
}

/* 文本内容 */
.cloud-login__title {
  margin-bottom: 12px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cloud-login__message {
  color: #5c6b77;
  font-size: 15px;
  line-height: 1.6;
}

/* 确保 element ui 内置的旋转动画正常 */
:deep(.el-icon-loading) {
  animation: rotating 2s linear infinite;
}
</style>
