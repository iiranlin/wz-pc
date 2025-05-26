import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

export const exportDetailList = `${VUE_APP_PRODMGR_INV}/warehouse/out/exportDetailList`;
export const exportList = `${VUE_APP_PRODMGR_INV}/warehouse/out/exportList`;

export const exportQueryList = `${VUE_APP_PRODMGR_INV}/warehouse/out/exportQueryList`;

/**
 * 入库单分页查询
 * @param {*} params
 * @returns
 */
export const warehouseOutList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/list`,
    method: 'get',
    params
  })
}
export const queryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/queryList`,
    method: 'get',
    params
  })
}


/**
 * 调拨单获取单号
 * @param {*} params
 * @returns
 */
export const outQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/allocate/outQuoteList`,
    method: 'get',
    params
  })
}

/**
 * 出库单保存
 * @param {*} params
 * @returns
 */
export const warehouseSaveOrder = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/saveOrder`,
    method: 'post',
    data
  })
}

/**
 * 出库单删除
 * @param {*} params
 * @returns
 */
export const warehouseRemoveDetail = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/removeDetail`,
    method: 'post',
    data
  })
}

/**
 * 出库单明细表详情
 * @param {*} params
 * @returns
 */
export const warehouseOrderViewDetail = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/detailView`,
    method: 'post',
    data
  })
}

/**
 * 出库单明细详情(仅在修改时使用)
 * @param {*} params
 * @returns
 */
export const warehouseOrderUpdate = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/saveDetail`,
    method: 'post',
    data
  })
}

/**
 * 出库单主表详情
 * @param {*} params
 * @returns
 */
export const warehouseOrderAllViewDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/orderView/${id}`,
    method: 'get'
  })
}


/**
 * 出库单出库完成
 * @param {*} params
 * @returns
 */
export const warehouseOrderOutFinish = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/outFinish`,
    method: 'post',
    data
  })
}

/**
 * 出库单自动下架操作
 * @param {*} params
 * @returns
 */
export const warehouseOrderAutoOffShelf = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/autoOffShelf`,
    method: 'post',
    data
  })
}


/**
 * 出库单手动下架操作
 * @param {*} params
 * @returns
 */
export const warehouseOrderSaveOffShelf = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/saveOffShelf`,
    method: 'post',
    data
  })
}


/**
 * 获取推荐货位
 * @param {*} params
 * @returns
 */
export const warehouseOutGetSuggestPlace = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/getSuggestPlace`,
    method: 'post',
    data
  })
}

export const getWarehouseOffShelfView = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/offShelfView/${id}`,
    method: 'get',
  })
}

/**
 * 获取可下架的货位
 * @param {*} params
 * @returns
 */
export const warehouseGetOffShelfPlace = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/inventory/getOffShelfPlace`,
    method: 'get',
    params
  })
}

/**
 * 下架保存
 * @param {*} params
 * @returns
 */
export const warehouseSaveOffShelf = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/saveOffShelf`,
    method: 'post',
    data
  })
}


export const warehouseGetOffShelfBatchNo = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/inventory/getOffShelfBatchNo`,
    method: 'get',
    params
  })
}

export const warehouseLendOutQuoteList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/lend/outQuoteList`,
    method: 'post',
    data
  })
}

export const warehouseGetOutWarehouse = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/getOutWarehouse`,
    method: 'post',
    data
  })
}

//出库单查询
export const outOrderList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/orderList`,
    method: 'get',
    params
  })
}

//出库单明细查询
export const outDetailList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/detailList`,
    method: 'get',
    params
  })
}

//立体出库下发
export const outMiniloadGroundingSave = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/miniloadGroundingSave`,
    method: 'post',
    data
  })
}


//出库立体库获取货位
export const outMiniloadGetSuggestPlace = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/miniloadGetSuggestPlace`,
    method: 'post',
    data
  })
}

export const saCtDetail = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/saCtDetail`,
    method: 'get',
    params
  })
}

/**
 * 出库单取消完成
 * @param {*} params
 * @returns
 */
export const warehouseOrderOutCancelFinish = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/out/cancelFinish`,
    method: 'post',
    data
  })
}