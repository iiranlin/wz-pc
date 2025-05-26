import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

/**
 * 仓储管理通道
 * 新增/修改
 * @param {*} params
 * @returns
 */
export const basePassageSave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/basePassage/save`,
        method: 'post',
        data
    })
}

/**
 * 仓储管理通道
 * 分页查询
 * @param {*} params
 * @returns
 */
export const basePassageList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/basePassage/list`,
        method: 'get',
        params
    })
}


/**
 * 仓储管理通道
 * 查询通道树
 * @param {*} params
 * @returns
 */
export const basePassageGetPassageTree = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/basePassage/getPassageTree`,
        method: 'get',
        params
    })
}

export const getFrameTree = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/baseFrame/getFrameTree`,
        method: 'get',
        params
    })
}

/**
 * 仓储管理通道
 * 详情
 * @param {*} params
 * @returns
 */
export const basePassageDtail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/basePassage/detail/${id}`,
        method: 'get',
    })
}