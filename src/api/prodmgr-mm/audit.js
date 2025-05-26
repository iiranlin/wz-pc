import request from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

/**
 * 提交
 * @param {*} params 
 * @returns 
 */
export const auditSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/audit/submit`,
        method: 'post',
        data
    })
}

/**
 * 批量提交
 * @param {*} params 
 * @returns 
 */
export const auditSubmitList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/audit/submitList`,
        method: 'post',
        data
    })
}