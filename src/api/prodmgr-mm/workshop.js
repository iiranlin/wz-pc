import request from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

/**
 * 车间参数明细
 * @param {*} params 
 * @returns 
 */
export const parameterDetail = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/workshop/parameter/detail`,
        method: 'get',
        params
    })
}

/**
 * 车间参数保存
 * @param {*} params 
 * @returns 
 */
export const parameterSave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/workshop/parameter/save`,
        method: 'post',
        data
    })
}