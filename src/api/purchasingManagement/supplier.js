
import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const exportDetailList = `${VUE_APP_PRODMGR_PU}/Pu/Su/exportDetailList`;



/**
 * 供应商档案分页查询
 * @param {*} params
 * @returns
 */
export const PuSuList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Su/list`,
    method: 'get',
    params
  })
}

/**
 * 采购计划确认列表
 * @param {*} params
 * @returns
 */
export const confirmListAPI = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/confirmList`,
    method: 'get',
    params
  })
}

/**
 * 采购计划复核列表
 * @param {*} params
 * @returns
 */
export const reviewListAPI = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/reviewList`,
    method: 'get',
    params
  })
}

/**
 * 供应商档案新增
 * @param {*} params
 * @returns
 */
export const PuSuCreate = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Su/create`,
    method: 'post',
    data
  })
}

export const PuSuSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Su/saveSubmit`,
    method: 'post',
    data
  })
}

/**
 * 供应商档案修改
 * @param {*} params
 * @returns
 */
export const PuSuModify = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Su/modify`,
    method: 'post',
    data
  })
}

/**
 * 供应商档案详情
 * @param {*} params
 * @returns
 */
export const PuSuDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Su/detail/${id}`,
    method: 'get',
  })
}

/**
 * 供应商档案批量删除
 * @param {*} params
 * @returns
 */
export const PuSuBatchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Su/batchRemove`,
    method: 'post',
    data
  })
}

// 供应商档案提交数据
export function getPuSuSubmit(param) {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/audit/submit`,
    method: 'post',
    data: param
  })
}

// 供应商档案提交数据
export function puSuDisable(id, type) {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Su/${type}/${id}`,
    method: 'get',
  })
}
