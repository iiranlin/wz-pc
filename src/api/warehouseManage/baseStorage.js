import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

/**
 * 仓储管理储区
 * 查询储区树
 * @param {*} params
 * @returns
 */
export const baseStorageGetStorageTree = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/baseStorage/getStorageTree`,
        method: 'get',
        params
    })
}

/**
 * 仓储管理储区
 * 分页查询
 * @param {*} params
 * @returns
 */
export const baseStorageList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/baseStorage/list`,
        method: 'get',
        params
    })
}

/**
 * 仓储管理储区
 * 新增/修改
 * @param {*} params
 * @returns
 */
export const baseStorageSave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/baseStorage/save`,
        method: 'post',
        data
    })
}

/**
 * 仓储管理储区
 * 详情
 * @param {*} params
 * @returns
 */
export const baseStorageDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/baseStorage/detail/${id}`,
        method: 'get',
    })
}