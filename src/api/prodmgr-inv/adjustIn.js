import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

/**
 * 入库调整单列表
 * @param {*} params 
 * @returns 
 */
export const adjustInList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjustIn/list`,
    method: 'get',
    params
  })
}

/**
 * 入库调整单详情
 * @param {*} params 
 * @returns 
 */
export const adjustInOrderView = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjustIn/orderView/${id}`,
    method: 'get',
  })
}

/**
 * 入库调整单保存
 * @param {*} params 
 * @returns 
 */
export const adjustInSaveOrder = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjustIn/saveOrder`,
    method: 'post',
    data
  })
}

/**
 * 入库调整单删除
 * @param {*} params 
 * @returns 
 */
export const adjustInRemoveDetail = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjustIn/removeDetail`,
    method: 'post',
    data
  })
}

/**
 * 入库调整单保存提交
 * @param {*} params 
 * @returns 
 */
export const adjustInSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjustIn/saveSubmit`,
    method: 'post',
    data
  })
}

/**
 * 入库调整单提交
 * @param {*} params 
 * @returns 
 */
export const adjustInSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjustIn/submit`,
    method: 'post',
    data
  })
}

/**
 * 入库调整单导出
 * @param {*} params 
 * @returns 
 */
export function adjustInExport(data) {
  return download(`${VUE_APP_PRODMGR_INV}/adjustIn/export`, data)
}

/**
 * 入库调整单引用入库单明细
 * @param {*} params 
 * @returns 
 */
export function adjustInQuote(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/adjustInQuote`,
    method: 'get',
    params
  })
}