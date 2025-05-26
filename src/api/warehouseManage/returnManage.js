import request, {download} from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

// 列表
export const getList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/return/list`,
      method: 'get',
      params
    })
  }

  // 列表
export const getDetailList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/return/detailList`,
      method: 'get',
      params
    })
  }

// 保存
export const saveOrder = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/return/orderSave`,
      method: 'post',
      data: data
    })
}

// 提交
export const submitOrder = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/return/submit`,
      method: 'post',
      data: data
    })
}


// 删除
export const removeOrder = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/return/removeOrder`,
      method: 'post',
      data: data
    })
}


// 详情
export const getOrderView = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/return/orderView/${id}`,
    method: 'get',
  })
}

// 明细详情
export const getDetailView = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/return/detailView`,
      method: 'post',
      data: data
    })
}

// 明细保存
export const saveDetail = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/return/detailSave`,
      method: 'post',
      data: data
    })
}

// 明细删除
export const removeDetail = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/return/removeDetail`,
      method: 'post',
      data: data
    })
}

//  导出明细
export const exportDetailList = (data) => {
  return download( `${VUE_APP_PRODMGR_INV}/return/exportDetailList`,data)
}

// 入库单引用
export const getInQuoteList = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/return/pushWarehouseIn`,
      method: 'post',
      data
    })
}

// 质检单引用列表
export const getQiQuoteList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/return/qiQuoteList`,
        method: 'get',
        params
    })
}

// 入库单引用列表
export const returnInQuoteList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/return/inQuoteList`,
        method: 'get',
        params
    })
}
// 保存提交
export const returnSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/return/saveSubmit`,
    method: 'post',
    data: data
  })
}

// 归还单查询
export const returnQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/return/queryList`,
    method: 'get',
    params
  })
}

// 归还单明细查询
export const returnDetailQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/return/detailQueryList`,
    method: 'get',
    params
  })
}

//  导出明细
export const exportDetailQueryList = (data) => {
  return download( `${VUE_APP_PRODMGR_INV}/return/exportDetailQueryList`,data)
}

// 归还单引用出库单
export const returnWarehouseList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/return/returnWarehouseList`,
    method: 'post',
    data
  })
}