import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询【请填写功能名称】列表
export function testListPage(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/test/list`,
    method: 'get',
    params
  })
}

// 查询【请填写功能名称】详细
export function testListdetail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/test/detail/` + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function testListcreate(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/test/create`,
    method: 'post',
    data
  })
}

// 修改【请填写功能名称】
export function testListmodify(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/test/modify`,
    method: 'post',
    data
  })
}

//【请填写功能名称】批量删除
export function testListDeleteBatch(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/test/deleteBatch`,
    method: 'post',
    data
  })
}

//【请填写功能名称】单个删除
export function testListDelete(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/test/id`,
    method: 'post',
  })
}

//提交
export function submit(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/test/submit`,
    method: 'post',
    data: data
  })
}