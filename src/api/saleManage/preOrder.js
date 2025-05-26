import request from '@/utils/request'
let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA;

export const exportDetailList = `${VUE_APP_PRODMGR_SA}/preOrder/exportDetailList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_SA}/quotation/exportQueryDetailList`;

/**
 * 预投单主单列表
 * @param {*} params 
 * @returns 
 */
export const preOrderList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/list`,
        method: 'get',
        params
    })
}

export const queryList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/queryList`,
        method: 'get',
        params
    })
}
/**
 * 预投单明细列表
 * @param {*} params 
 * @returns 
 */
export const preOrderDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/detailList`,
        method: 'get',
        params
    })
}

export const queryDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/queryDetailList`,
        method: 'get',
        params
    })
}
/**
 * 所属组织预投单列表
 * @param {*} params 
 * @returns 
 */
 export const preOrderQueryListByUnit = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/queryListByUnit`,
        method: 'get',
        params
    })
}
/**
 * 预投单-主单详情
 * @param {*} params 
 * @returns 
 */
export const preOrderDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/detail/${id}`,
        method: 'get',
    })
}

/**
 * 预投单-新增
 * @param {*} params 
 * @returns 
 */
export const preOrderCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/create`,
        method: 'post',
        data
    })
}
/**
 * 预投单-主单修改
 * @param {*} params 
 * @returns 
 */
export const preOrderModify = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/modify`,
        method: 'post',
        data
    })
}

/**
 * 预投单-主单批量删除
 * @param {*} params 
 * @returns 
 */
export const preOrderBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/batchRemove`,
        method: 'post',
        data
    })
}
/**
 * 预投单-明细批量删除
 * @param {*} params 
 * @returns 
 */
export const preOrderBatchRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/batchRemoveDetail`,
        method: 'post',
        data
    })
}

/**
 * 预投单-提交
 * @param {*} params 
 * @returns 
 */
export const preOrderSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/submit`,
        method: 'post',
        data
    })
}

/**
 * 预投单-保存提交
 * @param {*} params 
 * @returns 
 */
export const preOrderCreateAndsubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/createAndsubmit`,
        method: 'post',
        data
    })
}
/**
 * 预投单-关联合同
 * @param {*} params 
 * @returns 
 */
export const preOrderBindContract = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/preOrder/bindContract`,
        method: 'post',
        data
    })
}


