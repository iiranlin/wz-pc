import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
/**
 * 入库列表
 * @param {*} params 
 * @returns 
 */
export const listStore = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/listStore`,
        method: 'get',
        params
    })
}
/**
 * 入库明细
 * @param {*} params 
 * @returns 
 */
export const detailStore = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/detailStore/${id}`,
        method: 'get',
    })
}
/**
 * 入库-保存
 * @param {*} params 
 * @returns 
 */
export const saveStore = (data) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/saveStore`,
      method: 'post',
      data
    })
  }
  /**
 * 入库退货列表
 * @param {*} params 
 * @returns 
 */
export const listCrRetreat = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/listCrRetreat`,
      method: 'get',
      params
    })
  }
  //库存列表
  /**
 * @param {*} params 
 * @returns 
 */
export const listStock = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/listStock`,
      method: 'get',
      params
  })
}
  /**
 * 出库列表
 * @param {*} params 
 * @returns 
 */
export const listOut= (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialSupplierOutRest/list`,
      method: 'get',
      params
  })
}
/**
 * 出库明细
 * @param {*} params 
 * @returns 
 */
export const outDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSupplierOutRest/detail/${id}`,
        method: 'get',
    })
}
/**
 * 出库-保存
 * @param {*} params 
 * @returns 
 */
export const outSave = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierOutRest/save`,
    method: 'post',
    data
  })
}