import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

// 查询列表
export function noticePage(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/notice/list`,
    method: 'get',
    params
  })
}

// 新增
export function noticeCreate(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/notice/create`,
    method: 'post',
    data: data
  })
}

// 详情
export function noticeDetail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/notice/detail/${id}`,
    method: 'get',
  })
}

// 修改
export function noticeModify(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/notice/modify`,
    method: 'post',
    data
  })
}

// 删除
export function noticeDeleteBatch(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/notice/deleteBatch`,
    method: 'post',
    data
  })
}


// 短信消息通知
export function materialSmsLogRest(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSmsLogRest/list`,
    method: 'get',
    params
  })
}