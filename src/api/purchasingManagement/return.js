import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const exportDetailList = `${VUE_APP_PRODMGR_PU}/refund/exportDetailList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_PU}/refund/exportDetailQueryList`;

/**
 * @param {*} params
 * @returns
 */
export const PuReturnList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/list`,
    method: 'get',
    params
  })
}

/**
 * @param {*} params
 * @returns
 */
export const PuReturnRawList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/detailList`,
    method: 'get',
    params
  })
}
export const getRefundoutQuoteList = (data) => {
    return request({
      url: `${VUE_APP_PRODMGR_PU}/refund/outQuoteList`,
      method: 'post',
      data 
    })
  }

/**
 * @param {*} params
 * @returns
 */
export const PuReturnSave= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/saveOrder`,
    method: 'post',
    data
  })
}

export const PuReturnSaveSubmit= (data) => {
    return request({
      url: `${VUE_APP_PRODMGR_PU}/refund/saveSubmit`,
      method: 'post',
      data
    })
  }

export const PuReturnSubmit= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/submit`,
    method: 'post',
    data
  })
}

/**
 * @param {*} params
 * @returns
 */
export const PuReturnDetail= (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/orderView/${id}`,
    method: 'get',
  })
}


/**
 * @param {*} params
 * @returns
 */
export const PuReturnRawDetail= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/detailView`,
    method: 'post',
    data
  })
}


/**
 * @param {*} params
 * @returns
 */
export const PuReturnModify= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/saveDetail`,
    method: 'post',
    data
  })
}

/**
 * @param {*} params
 * @returns
 */
export const PuReturnRawModify= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/PlanRaw/modifies`,
    method: 'post',
    data
  })
}


/**
 * @param {*} params
 * @returns
 */
export const PuReturnBatchRemove= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/removeOrder`,
    method: 'post',
    data
  })
}

/**
 * @param {*} params
 * @returns
 */
export const PuReturnRawBatchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/removeDetail`,
    method: 'post',
    data
  })
}

/**
 * 退供单查询
 */
export const refundQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/queryList`,
    method: 'get',
    params
  })
}

/**
 * 退供单明细查询
 */
export const refundDetailQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/refund/detailQueryList`,
    method: 'get',
    params
  })
}