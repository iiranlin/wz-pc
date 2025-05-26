import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA;
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;
export const exportDetailList = (data) => {
  return download( `${VUE_APP_PRODMGR_SA}/return/exportDetailList`,data)
}

export const exportDetailQueryList = (data) => {
    return download( `${VUE_APP_PRODMGR_SA}/return/exportDetailQueryList`,data)
}

/**
 * 销售退货列表
 * @param {*} params 
 * @returns 
 */
export const returnList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/list`,
    method: 'get',
    params
  })
}

/**
 * 销售退货新增修改
 * @param {*} params 
 * @returns 
 */
export const returnSaveOrder = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/saveOrder`,
    method: 'post',
    data
  })
}

export const returnSaveSubmitOrder = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/saveSubmit`,
    method: 'post',
    data
  })
}

/**
 * 销售退货单查看
 * @param {*} params 
 * @returns 
 */
export const returnOrderView = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/orderView/${id}`,
    method: 'get',
  })
}

/**
 * 销售退货明细保存
 * @param {*} params 
 * @returns 
 */
export const returnSaveDetail = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/saveDetail`,
    method: 'post',
    data
  })
}

/**
 * 销售退货明细列表
 * @param {*} params 
 * @returns 
 */
export const returnDetailList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/detailList`,
    method: 'get',
    params
  })
}

/**
 * 销售退货明细查看
 * @param {*} params 
 * @returns 
 */
export const returnDetailView = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/detailView`,
    method: 'post',
    data
  })
}

/**
 * 销售退货删除
 * @param {*} params 
 * @returns 
 */
export const returnRemoveOrder = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/removeOrder`,
    method: 'post',
    data
  })
}

/**
 * 销售退货明细删除
 * @param {*} params 
 * @returns 
 */
export const returnRemoveDetail = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/removeDetail`,
    method: 'post',
    data
  })
}

/**
 * 销售退货提交
 * @param {*} params 
 * @returns 
 */
export const returnSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/submit`,
    method: 'post',
    data
  })
}

/**
 * 入库引用
 * @param {*} params 
 * @returns 
 */
export const saInQuoteList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/inQuoteList`,
    method: 'post',
    data
  })
}

/**
 * 质检引用
 * @param {*} params 
 * @returns 
 */
export const saQiQuoteList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/qiQuoteList`,
    method: 'post',
    data
  })
}

/**
 * 销售退货查询
 * @param {*} params 
 * @returns 
 */
export const returnQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/queryList`,
    method: 'get',
    params
  })
}

/**
 * 销售退货明细查询
 * @param {*} params 
 * @returns 
 */
export const returnDetailQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/detailQueryList`,
    method: 'get',
    params
  })
}

export const queryDetailInfoList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/return/queryDetailInfoList`,
    method: 'post',
    data
  })
}

export const saCtDetail = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/return/saCtDetail`,
    method: 'get',
    params
  })
}