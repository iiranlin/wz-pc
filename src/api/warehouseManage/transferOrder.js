import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

export const exportDetailList = `${VUE_APP_PRODMGR_INV}/allocate/exportDetailList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_INV}/allocate/exportDetailQueryList`;

/**
 * 查询库存列表
 */
export const getStockList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/inventory/list`,
      method: 'get',
      params
    })
  }

/**
 * 调拨单引用列表
 */
export const allocateQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/inventory/allocateQuoteList`,
    method: 'get',
    params
  })
}

/**
 * 保存调出单
 */
export const saveInventory = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/allocate/save`,
    method: 'post',
    data
  })
}

/**
 * 查看调出单
 */
export const getAllocateDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/allocate/detail/${id}`,
    method: 'get'
  })
}

/**
 * 提交调出单 || 批量
 */
export const submitAllocate = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/allocate/submit`,
    method: 'post',
    data
  })
}

/**
 * 删除调出单 || 批量
 */
export const deleteAllocate = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/allocate/remove`,
    method: 'post',
    data
  })
}

/**
 * 查询列表
 */
export const getAllocateList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/allocate/list`,
    method: 'get',
    params
  })
}
/**
 * 入库单引用调拨单列表
 */
export const inQuoteListInventory = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/allocate/inQuoteList`,
    method: 'get',
    params
  })
}

/**
 * 保存调出单并提交
 */
export const allocateSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/allocate/saveSubmit`,
    method: 'post',
    data
  })
}

/**
 * 调拨单查询
 */
export const allocateQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/allocate/queryList`,
    method: 'get',
    params
  })
}