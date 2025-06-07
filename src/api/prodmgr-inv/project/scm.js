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
 * 查询需求组织列表
 * @param {*} params 
 * @returns 
 */
export const findDeptList = (params) => {
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
 * 发货-保存
 * @param {*} params 
 * @returns 
 */
export const save = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/save`,
    method: 'post',
    data
  })
}

/**
 * 供应需求详情
 * @param {*} params 
 * @returns 
 */
export const detail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplyPlanRest/detail/${id}`,
    method: 'get',
  })
}

/**
 * 供应管理发货列表
 * @param {*} params 
 * @returns 
 */
export const sandList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/list`,
      method: 'get',
      params
  })
}

/**
 * 发货列表删除
 * @param {*} params 
 * @returns 
 */
export const batchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/batchRemove`,
    method: 'post',
    data
  })
}

/**
 * 发货列表修改、详情回显
 * @param {*} params 
 * @returns 
 */
export const sendDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/detail/${id}`,
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
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/remove/${id}`,
    method: 'post',
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

// 获取供应商下所有物料
export const getMaterial = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanDetails/getList`,
    method: 'get',
    params
  })
}