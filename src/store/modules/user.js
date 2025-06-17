import { login, logout, info } from '@/api/login'

import { getToken, setToken, removeToken } from '@/utils/auth'
import { systemConfig } from '@/api/system'
import { setUserInfo } from '@/utils/user-info'

const clearStorage =() => {
  sessionStorage.removeItem('logoutMode')
  sessionStorage.removeItem('logoutReturnUrl')
  sessionStorage.removeItem('user_info')
  sessionStorage.removeItem('sessionObj')
  sessionStorage.removeItem('username')
  // 保留loginType，用于退出时判断登录方式
  // sessionStorage.removeItem('loginType')
  localStorage.removeItem('UNIT_ID')
  localStorage.removeItem('UNIT_NAME')
}

const user = {
  state: {
    token: getToken(),
    userInfo: {},
    avatar: '',
    roles: false,
    logoutMode: null,
    logoutReturnUrl: ''
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER_INFO: (state, userInfo) => {
        state.userInfo = userInfo
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_LOGOUTMODE: (state, logoutMode) =>{
      state.logoutMode = logoutMode
    },
    SET_LOGOUTRETURNURL: (state, logoutReturnUrl) =>{
      state.logoutReturnUrl = logoutReturnUrl
    }
  },
  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      return new Promise((resolve, reject) => {
        login({ username, password, checkCode: userInfo.checkCode, checkKey: userInfo.checkKey }).then(res => {
          if (res.success){
            setToken(res.data.token)
            commit('SET_TOKEN', res.data.token)
          }
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        info().then(res => {
          if (res.success) {
            const user = res.data;
            commit('SET_ROLES', true)
            commit('SET_USER_INFO', user)
            sessionStorage.setItem("rank", user.rank);
            sessionStorage.setItem("username", user.username);
            setUserInfo(user)
            resolve(res)
          }
        }).catch(error => {
            reject(error)
        })
      })
    },
    //获取系统配置信息
    getSysConfig({ commit, state }){
      return new Promise((resolve, reject)=>{
        systemConfig().then(res=>{
          let auth = res.data.auth
          sessionStorage.setItem('logoutMode', auth.logoutMode)
          sessionStorage.setItem('logoutReturnUrl', auth.logoutReturnUrl)
          commit('SET_LOGOUTMODE', auth.logoutMode)
          commit('SET_LOGOUTRETURNURL', auth.logoutReturnUrl)
          resolve(true)
        }).catch(err=>{
          reject(err)
        })
      })
    },
   
    // 退出系统
    LogOut({ commit, state }) {
      return new Promise(async(resolve, reject) => {
        logout().then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', null)
          removeToken()
          
          // 获取登录方式
          const loginType = sessionStorage.getItem('loginType')
          
          clearStorage()
          
          // 根据登录方式决定跳转页面
          if (loginType === 'username') {
            // 通过username登录的，跳转到固定页面
            sessionStorage.removeItem('loginType')
            location.href = 'http://10.128.239.85:80/login'
            return
          } else {
            // 普通登录的，按原逻辑处理
            if(state.logoutMode == 0){
              const redirect = location.href
              location.href = `/login?redirect=${encodeURIComponent(redirect)}`
            } else if(state.logoutMode == 1){
              // 跳转地址
              location.href = state.logoutReturnUrl
              return
            }
          }
          
          // 清除登录方式标识
          sessionStorage.removeItem('loginType')
          resolve()
        })
      })
    },
  }
}

export default user
