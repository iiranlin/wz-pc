import request from '@/utils/request'

let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询角色列表
export function rolePage(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/list`,
    method: 'get',
    params
  })
}

// 查询角色列表
export function roleListAll(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/listAll`,
    method: 'get',
    params
  })
}

// 角色详情
export function roleDetail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/detail/${id}`,
    method: 'get',
  })
}

// 新增角色
export function roleCreate(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/create`,
    method: 'post',
    data: data
  })
}

// 角色修改
export function roleModify(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/modify`,
    method: 'post',
    data
  })
}

// 角色删除
export function roleDeleteBatch(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/deleteBatch`,
    method: 'post',
    data
  })
}

// 角色菜单
export function roleMenuList(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/menuList/${id}`,
    method: 'get',
  })
}

// 角色绑定菜单
export function roleBindMenu(data, id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/bindMenu/${id}`,
    method: 'post',
    data
  })
}

// 查询角色已授权用户列表
export function allocatedUserList(query) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/authUser/allocatedList`,
    method: 'get',
    params: query
  })
}

// 查询角色未授权用户列表
export function unallocatedUserList(query) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/authUser/unallocatedList`,
    method: 'get',
    params: query
  })
}

// 取消用户授权角色
export function authUserCancel(roleId, data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/${roleId}/authUser/cancel`,
    method: 'post',
    data
  })
}

// 授权用户选择
export function authUser(roleId, data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/role/${roleId}/authUser`,
    method: 'post',
    data
  })
}
