import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 退货附件
 * @param {type} params 
 * @returns 
 */
export const backFile = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialFile/backFile`,
        method: 'get',
        params
    })
}

/**
 * type:1-发货；2-收货；3-入库
 * @param {type} params 
 * @returns 
 */
export const customFile = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialFile/cirFile`,
        method: 'get',
        params
    })
}

/**
 * 合同附件
 * @param {type} params 
 * @returns 
 */
export const contractFile = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialFile/contractFile`,
        method: 'get',
        params
    })
}

/**
 * 计划附件
 * @param {type} params 
 * @returns 
 */
export const planFile = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialFile/planFile`,
        method: 'get',
        params
    })
}

/**
 * 出库附件
 * @param {type} params 
 * @returns 
 */
export const supplierOutFileFile = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialFile/supplierOutFile`,
        method: 'get',
        params
    })
}