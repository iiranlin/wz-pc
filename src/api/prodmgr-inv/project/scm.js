import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 供应需求列表
 * @param {*} params 
 * @returns 
 */
export const demandList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSupplyPlanRest/list`,
        method: 'get',
        params
    })
}
/**
 * 供应需求修改
 * @param {*} params 
 * @returns 
 */
export const demandEdit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplyPlanRest/modify`,
    method: 'post',
    data
  })
}
/**
 * 查询标段项目列表
 * @param {*} params 
 * @returns 
 */
export const findBdList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanDetails/listSection`,
      method: 'get',
      params
  })
}
/**
 * 查询物资列表
 * @param {*} params 
 * @returns 
 */
export const listMaterials = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanDetails/listMaterials`,
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