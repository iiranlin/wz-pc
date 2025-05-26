import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const exportDetailList = `${VUE_APP_PRODMGR_PU}/Pu/Send/exportDetailList`;

/**
 * 发运分页查询
 * @param {*} params 
 * @returns 
 */
export const sendList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Send/list`,
        method: 'get',
        params
    })
}

/**
 * 采购订单引用列表
 * @param {*} params 
 * @returns 
 */
export const inQuoteList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Send/inQuoteList`,
        method: 'get',
        params
    })
}

/**
 * 发运单新增
 * @param {*} params 
 * @returns 
 */
export const sendCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Send/create`,
        method: 'post',
        data
    })
}

/**
 * 发运单批量新增
 * @param {*} params 
 * @returns 
 */
export const sendCreateAll = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Send/createAll`,
        method: 'post',
        data
    })
}

/**
 * 发运单修改
 * @param {*} params 
 * @returns 
 */
export const sendModify = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Send/modify`,
        method: 'post',
        data
    })
}

/**
 * 发运单详情
 * @param {*} params 
 * @returns 
 */
export const sendDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Send/detail/${id}`,
        method: 'get',
    })
}

/**
 * 到货确认
 * @param {*} params 
 * @returns 
 */
export const sendArrive = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Send/arrive`,
        method: 'post',
        data
    })
}

/**
 * 到货确认多条操作
 * @param {*} params 
 * @returns 
 */
export const sendArriveList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Send/arriveList`,
        method: 'post',
        data
    })
}

/**
 * 质检单引用列表
 * @param {*} params 
 * @returns 
 */
export const sendQiQuoteList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Send/qiQuoteList`,
        method: 'get',
        params
    })
}