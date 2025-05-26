import request, {download } from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

// 列表
export const getList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/list`,
      method: 'get',
      params
    })
  }
// 明细
export const getDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/lend/detailList`,
        method: 'get',
        params
      })
}

export const getDetailView = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/detailView`,
      method: 'post',
      data: data
    })
}

export const getOutQuoteList = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/outQuoteList`,
      method: 'post',
      data: data
    })
}

export const removeDetail = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/removeDetail`,
      method: 'post',
      data: params
    })
}


export const saveDetail = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/saveDetail`,
      method: 'post',
      data: params
    })
}


// 归还单引用
export const returnQuoteList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/returnQuoteList`,
      method: 'post',
      data: params
    })
}

// 保存
export const saveOrder = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/saveOrder`,
      method: 'post',
      data: data
    })
}
// 详情
export const getDetailOrder = (id) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/orderView/${id}`,
      method: 'get',
    })
}
// 删除
export const delOrder = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/removeOrder`,
      method: 'post',
      data: data
    })
}
// 提交
export const submitOrder = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/lend/submit`,
      method: 'post',
      data: data
    })
}

//  导出明细
export const exportDetailList = (data) => {
  return download( `${VUE_APP_PRODMGR_INV}/lend/exportDetailList`,data)
}

// 保存提交
export const lendSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/lend/saveSubmit`,
    method: 'post',
    data: data
  })
}

// 借出单列表查询
export const lendQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/lend/queryList`,
    method: 'get',
    params
  })
}

// 借出单明细列表查询
export const lendDetailQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/lend/detailQueryList`,
    method: 'get',
    params
  })
}

// 明细查询导出
export const exportDetailQueryList = (data) => {
  return download( `${VUE_APP_PRODMGR_INV}/lend/exportDetailQueryList`,data)
}