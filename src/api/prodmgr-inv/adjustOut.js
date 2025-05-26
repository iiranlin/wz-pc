import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

/**
 * 出库调整单列表
 * @param {*} params 
 * @returns 
 */
export const adjustOutList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjustOut/list`,
    method: 'get',
    params
  })
}

/**
 * 出库调整单详情
 * @param {*} params 
 * @returns 
 */
export const adjustOutOrderView = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjustOut/orderView/${id}`,
    method: 'get',
  })
}

/**
 * 出库调整单导出
 * @param {*} params 
 * @returns 
 */
export function adjustOutExport(data) {
  return download(`${VUE_APP_PRODMGR_INV}/adjustOut/export`, data)
}