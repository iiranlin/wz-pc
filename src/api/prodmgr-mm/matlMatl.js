
import request, {download} from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

export const matlImport = `${VUE_APP_PRODMGR_MM}/matl/matl/import`;

/**
 * 物料基础信息分页查询
 * @param {*} params 
 * @returns 
 */
export const matlList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/matl/list`,
        method: 'get',
        params
    })
}

export const lendQuoteList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/inventory/lendQuoteList`,
        method: 'get',
        params
    })
}

/**
 * 新增或修改物料基础信息
 * @param {*} params 
 * @returns 
 */
export const matlCreateModify = (data, type) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/matl/${type}`,
        method: 'post',
        data
    })
}

/**
 * 批量删除物料基础信息
 * @param {*} params 
 * @returns 
 */
export const matlBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/matl/batchRemove`,
        method: 'post',
        data
    })
}

/**
 * 物料基础信息详情
 * @param {*} params 
 * @returns 
 */
export const matlDetail = (code) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/matl/detailCode/${code}`,
        method: 'get',
    })
}

export const dtoByCode = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/matl/dtoByCode`,
        method: 'post',
        data
    })
}

/**
 * 采购计划新增引用物料
 * @param {*} params 
 * @returns 
 */
export const matlPurPlanQuoteList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_MM}/matl/matl/purPlanQuoteList`,
      method: 'get',
      params
  })
}

// 导出
export const matlExport = (data) => {
  return download( `${VUE_APP_PRODMGR_MM}/matl/matl/export`,data)
}

/**
 * 物料档案-物料同步
 * @param {*} params 
 * @returns 
 */
 export const matlSyncMatlInfo = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/matl/matl/syncMatlInfo`,
        method: 'get',
        params
    })
  }

/**
 * 入库单选择物料
 * @param {*} params 
 * @returns 
 */
export const matlInvInQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/matl/matl/invInQuoteList`,
    method: 'get',
    params
  })
}