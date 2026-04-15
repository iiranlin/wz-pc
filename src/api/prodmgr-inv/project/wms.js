import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
/**
 * 入库列表
 * @param {*} params 
 * @returns 
 */
export const listStore = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/listStore`,
    method: 'get',
    params
  })
}
/**
 * 入库明细（未入库、已退货、已入库、部分入库）
 * @param {*} params 
 * @returns 
 */
export const detailStore = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/detailByStore/${id}`,
    method: 'get',
  })
}
/**
 * 入库明细（审核中、已驳回）
 * @param {*} params 
 * @returns 
 */
export const detailStoreBack = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialStoreTableRest/detailByStore/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/saveStore`,
    method: 'post',
    data
  })
}
/**
 * 入库审核
 * @param {*} params
 * @returns
 */
export const submitTodo = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialStoreTableRest/submit`,
    method: 'post',
    data
  })
}
//撤回
export const recall = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/audit/stop`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/listCrRetreat`,
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
//库存明细
/**
 * 
 * @param {*} params 
 * @returns 
 */
export const detailOut = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/detailOut/${id}`,
    method: 'get',
  })
}
//库存详情
/**
 * 
 * @param {*} params 
 * @returns 
 */
export const detailByOut = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/detailByOut/${id}`,
    method: 'get',
  })
}
/**
* 出库列表
* @param {*} params 
* @returns 
*/
export const listOut = (params) => {
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
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierOutRest/saveOut`,
    method: 'post',
    data
  })
}

/**
 * 驳回明细查看
 */
export const getDismissedDetails = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/getDismissedDetails`,
        method:'get',
        params:{id}
    })
}