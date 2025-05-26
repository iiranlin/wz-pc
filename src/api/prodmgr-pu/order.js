import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const exportDetailList = `${VUE_APP_PRODMGR_PU}/purchase/order/exportDetailAllList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_PU}/purchase/order/exportDetailQueryList`;
export const orderImportExcel = `${VUE_APP_PRODMGR_PU}/purchase/order/importExcel`;

/**
 * 采购单分页查询
 * @param {*} params
 * @returns
 */
export const OrderList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/list`,
        method: 'get',
        params
    })
}

export const getPurNoInNum = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/getPurNoInNum`,
        method: 'post',
        data
    })
}
export const purNoInDetail = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/purNoInDetail`,
        method: 'get',
        params
    })
}

/**
 * 采购单明细分页查询
 * @param {*} params
 * @returns
 */
export const OrderRawList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/detailList`,
        method: 'get',
        params
    })
}

/**
 * 采购单新增、修改
 * @param {*} params
 * @returns
 */
export const OrderCreateCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/saveOrder`,
        method: 'post',
        data
    })
}


export const OrderSaveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/saveSubmit`,
        method: 'post',
        data
    })
}


/**
 * 采购单详情
 * @param {*} params
 * @returns
 */
export const OrderDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/orderView/${id}`,
        method: 'get',
    })
}

/**
 * 采购单明细详情
 * @param {*} params
 * @returns
 */
export const OrderRawDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/OrderRaw/detail/${id}`,
        method: 'get',
    })
}

/**
 * 采购单删除
 * @param {*} params
 * @returns
 */
export const OrderDeleteAll = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/removeOrder`,
        method: 'post',
        data
    })
}

/**
 * 采购单明细删除
 * @param {*} params
 * @returns
 */
export const OrderBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/removeDetail`,
        method: 'post',
        data
    })
}


/**
 * 采购单明细列表
 * @param {*} params
 * @returns
 */
export const OrderRawLists = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/detailView`,
        method: 'post',
        data
    })
}

/**
 * 采购单明细修改
 * @param {*} params
 * @returns
 */
export const OrderRawModifyAll = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/saveDetail`,
        method: 'post',
        data
    })
}

/**
 * 采购计划生成采购订单
 * @param {*} params
 * @returns
 */
export const OrderCreateAll = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Order/createAll`,
        method: 'post',
        data
    })
}

export const matchingCtCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/matchingCtCreate`,
        method: 'post',
        data
    })
}

export const Ordersubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/order/submit`,
    method: 'post',
    data
  })
}


/**
 * 采购单查询
 * @param {*} params
 * @returns
 */
export const OrderQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/order/queryList`,
    method: 'get',
    params
  })
}

/**
 * 采购单明细查询
 * @param {*} params
 * @returns
 */
export const OrderRawQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/order/detailQueryList`,
    method: 'get',
    params
  })
}

export const detailAllList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_PU}/purchase/order/detailAllList`,
      method: 'get',
      params: {
        ...params,
        status: 3 
      }
    })
  }

//退供单换货引用采购订单
export const orderListByRefund = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/order/orderListByRefund`,
    method: 'get',
    params
  })
}

//入库单引用菜单主单查询
export const orderInQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/order/inQuoteList`,
    method: 'get',
    params
  })
}