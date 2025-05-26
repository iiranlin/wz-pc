import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER

export function getHandlePageList(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/wf/selectHandlePage`,
    method: 'get',
    params
  })
}

//已审核列表
export function selectAuditedPage(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/wf/selectAuditedPage`,
    method: 'get',
    params
  })
}