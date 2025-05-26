import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export function exportList(data) {
    return download(`${VUE_APP_PRODMGR_MM}/mm/order/exportDetailList`, data)
}

export function exportQueryList(data) {
  return download(`${VUE_APP_PRODMGR_MM}/mm/order/exportDetailQueryList`, data)
}

export const getList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/list`,
    method: 'get',
    params
  })
}

export const getListQuery = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/queryList`,
    method: 'get',
    params
  })
}
export const getDetailList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/rawList`,
    method: 'get',
    params
  })
}

export const getDetailListQuery = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/queryRawList`,
    method: 'get',
    params
  })
}

export const getOrderOutQuoteList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/outQuoteList`,
    method: 'post',
    data
  })
}

export const pickingQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/pickingQuoteList`,
    method: 'get',
    params
  })
}

export const pickingQuoteOrderList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/pickingQuoteOrderList`,
    method: 'get',
    params
  })
}

export const queryDetailInfoList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/queryDetailInfoList`,
    method: 'get',
    params
  })
}

export const getPickingReview = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/pickingReview`,
    method: 'get',
    params
  })
}

export const saveCreate = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/create`,
    method: 'post',
    data
  })
}

export const saveModify = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/modify`,
    method: 'post',
    data
  })
}

export const saveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/saveSubmit`,
    method: 'post',
    data
  })
}

export const detail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/detail/${id}`,
    method: 'get',
  })
}
export const matlDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/matl/${id}`,
    method: 'get',
  })
}

export const reportIn = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/inQuoteListByReport`,
    method: 'post',
    data
  })
}


export const remove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/batchRemove`,
    method: 'post',
    data
  })
}

export const submit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/submit`,
    method: 'post',
    data
  })
}

export const rawList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/rawList`,
    method: 'get',
    params
  })
}

export const getReturnQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/returnQuoteList`,
    method: 'get',
    params
  })
}

export const orderRawDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/detailView/${id}`,
    method: 'get',
  })
}

export const analysis = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/analysis`,
    method: 'get',
    params
  })
}
export const expandForOrders = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/bom/expandForOrders`,
    method: 'post',
    data
  })
}

export const expandBom = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/expandBom`,
    method: 'post',
    data
  })
}

export const expandForOrdersNum = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/childRefresh`,
    method: 'post',
    data
  })
}

export const finishM = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/finishM`,
    method: 'post',
    data
  })
}

export const startM = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/startM`,
    method: 'post',
    data
  })
}

export const batchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/raw/batchRemove`,
    method: 'post',
    data
  })
}

export const matlOut = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/matlOut`,
    method: 'post',
    data
  })
}

export const pushInList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/pushInList`,
    method: 'post',
    data
  })
}

export const rawDetail = (id) => {
  return request({
      url: `${VUE_APP_PRODMGR_MM}/mm/order/raw/${id}`,
      method: 'get',
  })
}

export const chartsData = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/global/query/produceQuery/${id}`,
    method: 'get',
  })
}
export const getOrderInList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/inQuoteListByOrder`,
    method: 'get',
    params
  })
}

export const getReturnQuoteDetail = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/returnQuoteDetail`,
    method: 'post',
    data
  })
}

export const flowQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/flowQuoteList`,
    method: 'get',
    params
  })
}
export const returnQuoteOutList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/returnQuoteOutList`,
    method: 'get',
    params
  })
}

export const saCtDetail = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/saCtDetail`,
    method: 'get',
    params
  })
}

export const pickingOutQuoteOrderList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/picking/outQuoteOrderList`,
    method: 'get',
    params
  })
}

export const changeQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/order/changeQuoteList`,
    method: 'get',
    params
  })
}