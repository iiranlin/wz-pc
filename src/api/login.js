import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

import { encrypt } from '../utils/sm2'
import constant from '../utils/constant';

// 登录方法
export function login(data) {
    data = { data: encrypt(data, constant.API_PUBLIC_KEY) }
    return request({
        url: `${VUE_APP_BASE_PREFIX}/auth/login`,
        method: 'post',
        data
    })
}
// 用url username 自动登录
export function autoLogin (params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/loginByUserName`,
    method: 'get',
    params
  })
}

// 第三方凭证登录
export function loginByTicketCloud(params) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/auth/loginByTicket`,
        method: 'get',
        params
    })
}

// 用户信息
export function info() {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/info`,
    method: 'get',
  })
}

// 登出
export function logout() {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/logout`,
    method: 'get',
  })
}

// 获取验证码
export function getVerificationCode(randomKey) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/randomImage/` + randomKey,
    method: 'get',
  })
}

/**
 * 修改初始密码
 * @param data
 * @returns {*}
 */
export function changePassword(data) {
    data = { data: encrypt(data, constant.API_PUBLIC_KEY) }
    return request({
        url: `${VUE_APP_BASE_PREFIX}/auth/changePassword`,
        method: 'post',
        data
    })
}

export function getSnapTicket(snapTicket) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/getSnapTicket`,
    method: 'get',
  })
}

export function loginByTicket(snapTicket) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/loginByTicket/${snapTicket}`,
    method: 'get',
  })
}

export function refreshToken(){
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/refreshToken`,
    method: 'get'
  })
}

export const loginByRails = (data) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/auth/loginByRails`,
        method: 'post',
        data
    })
}

/**
 * 校验密钥
 * @param {*} params 
 * @returns 
 */
export const verifySecret = (params)=>{
    return request({
        url: `${VUE_APP_BASE_PREFIX}/auth/verifySecret/${params}`,
        method: 'get',
    })
}

/**
 * 验证密码
 * @param {*} params 
 * @returns 
 */
export const createTempPass = (params)=>{
    return request({
        url: `${VUE_APP_BASE_PREFIX}/auth/createTempPass/${params}`,
        method: 'get',
    })
}

export const testSSO = ()=>{
  return request({
      url: `${VUE_APP_BASE_PREFIX}/auth/getRedirectUrl`,
      method: 'get',
  })
}

/**
 * 获取登录账号下相同标段的账号
 * @returns {Promise} 可选项目列表
 */
export function getLoginSelectUser() {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/loginSelect/selectUser`,
    method: 'GET'
  })
}
