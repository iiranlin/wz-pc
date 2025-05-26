import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询操作记录列表
export function list(query) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/operate/list`,
    method: 'get',
    params: query
  })
}

// 查询操作记录详细
export function detail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/operate/detail/` + id,
    method: 'get'
  })
}

// 新增操作记录
export function create(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/operate/create`,
    method: 'post',
    data
  })
}

// 删除操作记录
export function delOperate(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/operate/deleteBatch`,
    method: 'post',
    data
  })
}
