import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 表单业务列表
export function formDataList(query,formCode) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/data/list/${formCode}`,
    method: 'get',
    query
  })
}

// 表单业务详情
export function formDataDetail(id,formCode) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/data/detail/${formCode}/${id}`,
    method: 'get',
  })
}

// 表单业务新增
export function formDataCreate(data,formCode) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/data/create/${formCode}`,
    method: 'post',
    data
  })
}

// 表单业务修改
export function formDataModify(data,formCode) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/data/modify/${formCode}`,
    method: 'post',
    data
  })
}

// 表单业务删除
export function formDataDeleteBatch(data,formCode) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/data/deleteBatch/${formCode}`,
    method: 'post',
    data
  })
}