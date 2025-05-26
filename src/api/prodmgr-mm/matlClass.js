
import request from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

/**
 * 物料分类分页查询
 * @param {*} params 
 * @returns 
 */
export const classList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/class/list`,
        method: 'get',
        params
    })
}

/**
 * 新增或修改物料分类
 * @param {*} params 
 * @returns 
 */
export const classCreateModify = (data, type) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/class/${type}`,
        method: 'post',
        data
    })
}

/**
 * 批量删除物料分类
 * @param {*} params 
 * @returns 
 */
export const classBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/class/batchRemove`,
        method: 'post',
        data
    })
}

/**
 * 物料分类树形查询接口
 * @param {*} params 
 * @returns 
 */
export const classTree = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/class/tree`,
        method: 'get',
        params
    })
}

export const classCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/class/create`,
        method: 'post',
        data
    })
}

export const classRemove = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/class/remove/${id}`,
        method: 'post',
    })
}
export const classModify = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/class/modify`,
        method: 'post',
        data
    })
}
