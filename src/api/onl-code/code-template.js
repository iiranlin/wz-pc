import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

/**
 * 模板列表
 * @param {*} params 
 * @returns 
 */
export const onlCodeTemplateList = (params) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/onlCodeTemplate/list`,
        method: 'get',
        params
    })
}

/**
 * 新增模板
 * @param {*} params 
 * @returns 
 */
export const createOnlCodeTemplate = (data) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/onlCodeTemplate/create`,
        method: 'post',
        data
    })
}

/**
 * 修改模板
 * @param {*} params 
 * @returns 
 */
export const modifyOnlCodeTemplate = (data) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/onlCodeTemplate/modify`,
        method: 'post',
        data
    })
}