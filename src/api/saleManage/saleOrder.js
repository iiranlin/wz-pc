
import request from '@/utils/request'
let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA;

export const exportAllOrderList =  `${VUE_APP_PRODMGR_SA}/saleOrder/exportAllOrderList`

/**
 * 销售订单维护分页查询
 * @param {*} params
 * @returns
 */
export const saleOrderList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/list`,
        method: 'get',
        params
    })
}

export const saleOrderAllList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/allList`,
        method: 'get',
        params
    })
}

export const allOrderList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/allOrderList`,
        method: 'get',
        params
    })
}

/**
 * 销售订单明细维护分页查询
 * @param {*} params
 * @returns
 */
export const saleOrderDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/detailList`,
        method: 'get',
        params
    })
}

/**
 * 销售订单维护新增或修改
 * @param {*} params
 * @returns
 */
export const saleOrderSave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/saveOrder`,
        method: 'post',
        data
    })
}
export const saleOrderSaveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/saveSubmit`,
        method: 'post',
        data
    })
}
  

/**
 * 销售订单维护详情
 * @param {*} params
 * @returns
 */
export const saleOrderOrderView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/orderView/${id}`,
        method: 'get',
    })
}

export const saleOrderDetailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/detailView`,
        method: 'post',
        data
    })
}

/**
 * 销售订单维护批量删除
 * @param {*} params
 * @returns
 */
export const saleOrderRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/removeDetail`,
        method: 'post',
        data
    })
}
export const saleOrderRemoveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/removeOrder`,
        method: 'post',
        data
    })
}

/**
 * 销售出货引用列表
 * @param {*} params
 * @returns
 */
export const deliveryQuoteList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/deliveryQuoteList`,
        method: 'post',
        data
    })
}

/**
 * 物料需求计划选择采购订单
 * @param {*} params
 * @returns
 */
export const saleOrderDemandQuoteList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/demandQuoteList`,
        method: 'get',
        params
    })
}


export function saleOrderSubmit(param) {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/submit`,
        method: 'post',
        data: param
    })
}

/**
 * 销售订单查询
 * @param {*} params
 * @returns
 */
export const saleOrderQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/saleOrder/queryList`,
    method: 'get',
    params
  })
}

/**
 * 销售订单明细查询
 * @param {*} params
 * @returns
 */
export const saleOrderDetailQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/saleOrder/detailQueryList`,
    method: 'get',
    params
  })
}

/**
 * 销售明细保存
 * @param {*} params
 * @returns
 */
export const saleOrderSaveDetail = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/saleOrder/saveDetail`,
    method: 'post',
    data
  })
}

/**
 * 采购计划引用销售订单
 * @param {*} params
 * @returns
 */
export const saleOrderPurPlanQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/saleOrder/purPlanQuoteList`,
    method: 'get',
    params
  })
}

