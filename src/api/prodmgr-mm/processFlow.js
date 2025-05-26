import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

/**
 * 主单列表
 * @param {*} params 
 * @returns 
 */
export const flowList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/list`,
        method: 'get',
        params
    })
}

/**
 * 主单保存
 * @param {*} params 
 * @returns 
 */
export const flowSaveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/saveOrder`,
        method: 'post',
        data
    })
}

/**
 * 主单查看
 * @param {*} params 
 * @returns 
 */
export const flowOrderView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/orderView/${id}`,
        method: 'get',
    })
}

/**
 * 主单删除
 * @param {*} params 
 * @returns 
 */
export const flowRemoveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/removeOrder`,
        method: 'post',
        data
    })
}

/**
 * 提交
 * @param {*} params
 * @returns 
 */
export const flowSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/submit`,
        method: 'post',
        data
    })
}

/**
 * 明细列表
 * @param {*} params 
 * @returns 
 */
export const flowDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/detailList`,
        method: 'get',
        params
    })
}

/**
 * 明细保存
 * @param {*} params 
 * @returns 
 */
export const flowSaveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/saveDetail`,
        method: 'post',
        data
    })
}

/**
 * 明细查看
 * @param {*} params 
 * @returns 
 */
export const flowDetailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/detailView`,
        method: 'post',
        data
    })
}

/**
 * 明细删除
 * @param {*} params
 * @returns 
 */
export const flowRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/removeDetail`,
        method: 'post',
        data
    })
}

//  导出明细
export const exportDetailList = (data) => {
    return download( `${VUE_APP_PRODMGR_MM}/process/flow/exportDetailList`, data)
}

/**
 * 操作按钮
 * @param {*} params
 * @returns 
 */
export const flowOperate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/operate`,
        method: 'post',
        data
    })
}

/**
 * 报工查看
 * @param {*} params
 * @returns 
 */
export const flowReportView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/reportView`,
        method: 'post',
        data
    })
}

/**
 * 报工
 * @param {*} params
 * @returns 
 */
export const flowReportWork = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/flow/reportWork`,
        method: 'post',
        data
    })
}

/**
 * 保存提交
 * @param {*} params
 * @returns 
 */
export const flowSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/process/flow/saveSubmit`,
    method: 'post',
    data
  })
}


