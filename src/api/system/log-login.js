import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询用户登录日志列表
export function list(query) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/login/list`,
    method: 'get',
    params: query
  })
}

// 查询用户登录日志详细
export function detail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/login/detail/` + id,
    method: 'get'
  })
}

// 新增用户登录日志
export function create(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/login/create`,
    method: 'post',
    data
  })
}

// 修改用户登录日志
export function modify(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/login/modify`,
    method: 'post',
    data
  })
}

// 删除用户登录日志
export function delLogin(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/login/deleteBatch`,
    method: 'post',
    data
  })
}
