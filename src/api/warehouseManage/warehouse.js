import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

/**
 * 仓储管理地区分页查询
 * @param {*} params
 * @returns
 */
export const WarehouseList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseWarehouse/list`,
    method: 'get',
    params
  })
}

/**
 * 仓储管理地区新增或修改
 * @param {*} params
 * @returns
 */
export const WarehouseSave = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseWarehouse/save`,
    method: 'post',
    data
  })
}

/**
 * 仓储管理地区详情
 * @param {*} params
 * @returns
 */
export const WareDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseWarehouse/detail/${id}`,
    method: 'get'
  })
}

/**
 * 销售订单维护批量删除
 * @param {*} params
 * @returns
 */
export const saleOrderBatchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/saleOrderDetail/batchRemove`,
    method: 'post',
    data
  })
}

/**
 * 仓储管理查询仓库树
 * @param {*} params
 * @returns
 */
export const getWarehouseTree = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseWarehouse/getWarehouseTree`,
    method: 'get',
    params
  })
}
