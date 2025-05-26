import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

/**
 * 获得系统配置
 * @returns 
 */
export const systemConfig = () => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/system/config`,
        method: 'GET'
    })
}

/**
 * 统一身份认证相关配置
 * @returns 
 */
export const systemPassportConfig = () => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/system/passportConfig`,
        method: 'get'
    })
}
