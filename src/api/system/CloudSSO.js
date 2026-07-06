import request from "@/utils/request";
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

// 获取云平台人员列表
export function getSystemPersonList(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/user/getStaffTypeList`,
    method: "get",
    params:data,
  });
}

// 获取物资平台人员列表
export function getExternalPersonList(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/user/getStaffTypeOutList`,
    method: "get",
    params:data,
  });
}

// 修改绑定状态
export function updStaffTypeOutList(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/user/updStaffTypeOutList`,
    method: "post",
    data:data,
  });
}

// 同步物资平台人员
export function insStaffTypeOutList(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/user/insStaffTypeOutList`,
    method: "get",
    params:data,
  });
}

// 同步云平台人员
export function getCasUserByDepartmentId(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/getCasData`,
    method: "post",
    data:data,
  });
}

// 获取加密用户编号
export function loginByCode(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/loginByCode`,
    method: "get",
    params:data,
  });
}

// 注册接收推送
export function casRegister() {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/auth/casRegister`,
    method: "get",
  });
}