import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

// 查询列表
export function list(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectSite/list`,
    method: 'get',
    params
  })
}

// 新增
export function siteSave(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectSite/save`,
    method: 'post',
    data: data
  })
}

// 详情
export function siteDetail(id) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectSite/detail/${id}`,
    method: 'get',
  })
}

// 修改
export function siteModify(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectSite/modify`,
    method: 'post',
    data
  })
}

// 批量删除
export function batchRemove(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectSite/batchRemove`,
    method: 'post',
    data
  })
}
/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectSite/remove/${id}`,
    method: 'post',
  })
}