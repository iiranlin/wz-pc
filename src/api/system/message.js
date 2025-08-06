import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询列表
export function messagePage(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/message/list`,
    method: 'get',
    params
  })
}

// 新增
export function messageCreate(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/message/create`,
    method: 'post',
    data: data
  })
}

// 详情
export function messageDetail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/message/detail/${id}`,
    method: 'get',
  })
}

// 修改
export function messageModify(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/message/modify`,
    method: 'post',
    data
  })
}

// 删除
export function messageDeleteBatch(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/message/deleteBatch`,
    method: 'post',
    data
  })
}
