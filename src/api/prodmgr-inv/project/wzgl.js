import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 物资需求列表
 * @param {*} params 
 * @returns 
 */
export const itemList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/list`,
        method: 'get',
        params
    })
}

/**
 * 获取建设项目下拉| 发货之前和收货后使用
 * @param {*} params 
 * @returns 
 */
export const lineSelectOptions = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/selectProject`,
        method: 'get',
        params
    })
}

/**
 * 获取建设项目下拉| 收货后使用
 * @param {*} params 
 * @returns 
 */
export const afterLineSelectOptions = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/circulationProject`,
        method: 'get',
        params
    })
}

/**
 * 获取建设项目下拉| 自购合同
 * @param {*} params 
 * @returns 
 */
export const contractLineSelectOptions = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContract/purchaseContractProject`,
        method: 'get',
        params
    })
}

/**
 * 获取建设项目下拉| 自购文件
 * @param {*} params 
 * @returns 
 */
export const fileLineSelectOptions = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialPurchaseFile/purchaseFileProject`,
        method: 'get',
        params
    })
}

/**
 * 详情
 * @param {*} params 
 * @returns 
 */
export const detail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/detail/${id}`,
    method: 'get',
  })
}

/**
 * 新增
 * @param {*} params 
 * @returns 
 */
export const add = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/create`,
    method: 'post',
    data
  })
}

/**
 * 批量删除
 * @param {*} params 
 * @returns 
 */
export const batchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/batchRemove`,
    method: 'post',
    data
  })
}


/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/remove/${id}`,
    method: 'post',
  })
}

/**
 * 修改
 * @param {*} params 
 * @returns 
 */
export const edit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/modify`,
    method: 'post',
    data
  })
}

/**
 * 保存
 * @param {*} params 
 * @returns 
 */
export const save = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/save`,
    method: 'post',
    data
  })
}

/**
 * 导出
 * @param {*} params 
 * @returns 
 */
export function adjustInExport(data) {
  return download(`${VUE_APP_PRODMGR_INV}/adjustIn/export`, data)
}