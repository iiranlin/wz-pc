import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

/**
 * 检查可以巡检人员
 * @returns 
 */
export const checkInspectionUser = () => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/passport/checkInspectionUser`,
        method: 'get'
    })
}

/**
 * 获得巡检信息
 * @returns 
 */
export const checkInspectionInfo = () => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/passport/checkInspectionInfo`,
        method: 'get'
    })
}

/**
 * 上报巡检信息
 * @param {*} params 
 * @returns 
 */
export const addInspectionInfo = (data) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/passport/addInspectionInfo`,
        method: 'post',
        data
    })
}