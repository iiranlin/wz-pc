import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询表单列表
export function list(query) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/joining/list`,
    method: 'get',
    params: query
  })
}

// 查询表单详细
export function detail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/joining/detail/${id}`,
    method: 'get'
  })
}

// 新增表单
export function create(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/joining/create`,
    method: 'post',
    data
  })
}

// 修改表单
export function modify(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/joining/modify`,
    method: 'post',
    data
  })
}

// 删除表单
export function remove(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/joining/deleteBatch`,
    method: 'post',
    data
  })
}