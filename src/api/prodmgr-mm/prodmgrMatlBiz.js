
import request from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

/**
 * 新增或修改物料业务信息
 * @param {*} params 
 * @returns 
 */
export const matlBizCreateModify = (data, type) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/prodmgr/matl/biz/${type}`,
        method: 'post',
        data
    })
}

/**
 * 物料业务信息详情
 * @param {*} params 
 * @returns 
 */
export const matlBizDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/prodmgr/matl/biz/detail/${id}`,
        method: 'get',
    })
}