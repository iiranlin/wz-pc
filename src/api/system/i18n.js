import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

/**
 * 
 * @param {*} params 
 * @returns 
 */
export const i18nList = (params) => {
    return request.get(`${VUE_APP_BASE_PREFIX}/sys/i18n/list`, { params })
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
export const i18nCreate = (data) => {
    return request.post(`${VUE_APP_BASE_PREFIX}/sys/i18n/create`, data)
}

/**
 * 
 * @param {*} params 
 * @returns 
 */
export const i18nModify = (data) => {
    return request.post(`${VUE_APP_BASE_PREFIX}/sys/i18n/modify`, data)
}

/**
 * 
 * @param {*} params 
 * @returns 
 */
export const i18nDelete = (id) => {
    return request.post(`${VUE_APP_BASE_PREFIX}/sys/i18n/delete/${id}`)
}


/**
 * 获得i18n语言数据列表
 * @param {*} params 
 * @returns 
 */
export const getDataList = (params) => {
    return request.get(`${VUE_APP_BASE_PREFIX}/sys/i18n/dataList`, { params })
}

/**
 * 
 * @param {*} params 
 * @returns 
 */
export const i18nDataSave = (data) => {
    return request.post(`${VUE_APP_BASE_PREFIX}/sys/i18n/dataSave`, data)
}

/**
 * 获得i18n语言数据列表
 * @param {*} params 
 * @returns 
 */
export const getDataByI18nCode = (params) => {
    return request.get(`${VUE_APP_BASE_PREFIX}/sys/i18n/getDataByI18nCode`, { params })
}

/**
 * 获得i18n语言数据列表
 * @param {*} params 
 * @returns 
 */
export const i18nDataDelete = (data) => {
    return request.post(`${VUE_APP_BASE_PREFIX}/sys/i18n/dataDelete`, data)
}

/**
 * 获得i18n语言数据
 * @param {*} params 
 * @returns 
 */
export const getI18nMessage = (params) => {
    return request.get(`${VUE_APP_BASE_PREFIX}/sys/i18n/message`, { params })
}