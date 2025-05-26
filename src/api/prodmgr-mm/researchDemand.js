import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

/**
 * 主单列表
 * @param {*} params 
 * @returns 
 */
export const demandList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/list`,
        method: 'get',
        params
    })
}

/**
 * 主单保存
 * @param {*} params 
 * @returns 
 */
export const demandSaveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/saveOrder`,
        method: 'post',
        data
    })
}

/**
 * 主单查看
 * @param {*} params 
 * @returns 
 */
export const demandOrderView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/orderView/${id}`,
        method: 'get',
    })
}

/**
 * 主单删除
 * @param {*} params 
 * @returns 
 */
export const demandRemoveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/removeOrder`,
        method: 'post',
        data
    })
}

/**
 * 提交
 * @param {*} params
 * @returns 
 */
export const demandSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/submit`,
        method: 'post',
        data
    })
}

/**
 * 明细列表
 * @param {*} params 
 * @returns 
 */
export const demandDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/detailList`,
        method: 'get',
        params
    })
}

/**
 * 明细保存
 * @param {*} params 
 * @returns 
 */
export const demandSaveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/saveDetail`,
        method: 'post',
        data
    })
}

/**
 * 明细查看
 * @param {*} params 
 * @returns 
 */
export const demandDetailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/detailView`,
        method: 'post',
        data
    })
}

/**
 * 明细删除
 * @param {*} params
 * @returns 
 */
export const demandRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/removeDetail`,
        method: 'post',
        data
    })
}

//  导出明细
export const exportDetailList = (data) => {
    return download( `${VUE_APP_PRODMGR_MM}/research/demand/exportDetailList`, data)
}

/**
 * 需求计划引用列表
 * @param {*} params 
 * @returns 
 */
export const demandQuoteList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/research/demand/demandQuoteList`,
        method: 'get',
        params
    })
}

/**
 * 保存提交
 * @param {*} params
 * @returns 
 */
export const demandSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/research/demand/saveSubmit`,
    method: 'post',
    data
  })
}

/**
 * 自研需求主单查询
 * @param {*} params 
 * @returns 
 */
export const demandQueryList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_MM}/research/demand/queryList`,
      method: 'get',
      params
  })
}

/**
 * 自研需求明细查询
 * @param {*} params 
 * @returns 
 */
export const demandDetailQueryList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_MM}/research/demand/detailQueryList`,
      method: 'get',
      params
  })
}

//  导出明细
export const exportDetailQueryList = (data) => {
  return download( `${VUE_APP_PRODMGR_MM}/research/demand/exportDetailQueryList`, data)
}