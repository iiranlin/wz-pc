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
    url: `${VUE_APP_PRODMGR_INV}/materialSupplyPlanRest/modifyConfirm`,
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
export const sendList = (params) => {
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


// 获取供应商下所有物料
export const getMaterial = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanDetails/getList`,
    method: 'get',
    params
  })
}
/**
 * 添加货运位置
 * @param {*} params 
 * @returns 
 */
export const addAdress = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialTrackMessageRest/create`,
      method: 'post',
      data
  })
}
/**
 * 查回货运位置list
 * @param {*} params 
 * @returns 
 */
export const findAdressList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialTrackMessageRest/list`,
    method: 'get',
    params
  })
}
/**
 * 供应商退货列表
 * @param {*} params 
 * @returns 
 */
export const listRetreat = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/listRetreat`,
    method: 'get',
    params
  })
}
/**
 * 退货明细
 * @param {*} params 
 * @returns 
 */
export const detailBack = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/detailBack/${id}`,
    method: 'get',
  })
}
/**
 * 供应需求详情
 * @param {*} params 
 * @returns 
 */
export const listShippingInformation = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierDetailRest/listShippingInformation`,
    method: 'get',
    params
  })
}
