import request from '@/utils/request'
let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA;

export const exportDetailList = `${VUE_APP_PRODMGR_SA}/delivery/exportDetailList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_SA}/delivery/exportDetailQueryList`;

/**
 * 销售出货列表
 * @param {*} params 
 * @returns 
 */
export const deliveryList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/list`,
        method: 'get',
        params
    })
}

/**
 * 销售出货新增修改
 * @param {*} params 
 * @returns 
 */
export const deliverySaveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/saveOrder`,
        method: 'post',
        data
    })
}

export const deliverySaveSubmitOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/saveSubmit`,
        method: 'post',
        data
    })
}

/**
 * 销售出货单查看
 * @param {*} params 
 * @returns 
 */
export const deliveryOrderView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/orderView/${id}`,
        method: 'get',
    })
}

/**
 * 销售出货明细保存
 * @param {*} params 
 * @returns 
 */
export const deliverySaveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/saveDetail`,
        method: 'post',
        data
    })
}

/**
 * 销售出货明细列表
 * @param {*} params 
 * @returns 
 */
export const deliveryDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/detailList`,
        method: 'get',
        params
    })
}

/**
 * 销售出货明细查看
 * @param {*} params 
 * @returns 
 */
export const deliveryDetailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/detailView`,
        method: 'post',
        data
    })
}

/**
 * 销售出货删除
 * @param {*} params 
 * @returns 
 */
export const deliveryRemoveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/removeOrder`,
        method: 'post',
        data
    })
}

/**
 * 销售出货明细删除
 * @param {*} params 
 * @returns 
 */
export const deliveryRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/removeDetail`,
        method: 'post',
        data
    })
}

/**
 * 销售出货提交
 * @param {*} params 
 * @returns 
 */
export const deliverySubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/submit`,
        method: 'post',
        data
    })
}

/**
 * 销售出货上传附件
 * @param {*} params 
 * @returns 
 */
export const deliverySaveFile = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/saveFile`,
        method: 'post',
        data
    })
}

/**
 * 退货单引用销售出货列表
 * @param {*} params 
 * @returns 
 */
export const deliveryReturnQuoteList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/delivery/returnQuoteList`,
    method: 'post',
    data
  })
}

/**
 * 出库单引用销售出货列表
 * @param {*} params 
 * @returns 
 */
export const deliveryOutQuoteList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/delivery/outQuoteList`,
    method: 'post',
    data
  })
}

/**
 * 销售出货查询
 * @param {*} params 
 * @returns 
 */
export const deliveryQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/delivery/queryList`,
    method: 'get',
    params
  })
}

/**
 * 销售出货查询
 * @param {*} params 
 * @returns 
 */
export const deliveryDetailQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/delivery/detailQueryList`,
    method: 'get',
    params
  })
}

export const deliveryOutQuoteMtList = (data) => {
    return request({
      url: `${VUE_APP_PRODMGR_SA}/delivery/outQuoteMtList`,
      method: 'post',
      data
    })
  }

export const deliveryOutQuoteDtList = (data) => {
return request({
    url: `${VUE_APP_PRODMGR_SA}/delivery/outQuoteDtList`,
    method: 'post',
    data
})
}