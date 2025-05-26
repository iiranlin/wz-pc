import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

export const exportDetailList = `${VUE_APP_PRODMGR_INV}/inventory/exportDetailList`;
export const exportBatchlist = `${VUE_APP_PRODMGR_INV}/inventory/exportBatchlist`; //批次库存导出
export const exportGroupList = `${VUE_APP_PRODMGR_INV}/inventory/exportGroupList`;
export const exportProjcetList = `${VUE_APP_PRODMGR_INV}/inventory/exportProjectInvList`;
/**
 * 查询库存列表
 */
export const getInventoryList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/inventory/list`,
      method: 'get',
      params
    })
  }
  export const getInventoryProjectList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/inventory/projectInvList`,
      method: 'get',
      params
    })
  }
  export const getInventoryGroupList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/inventory/groupList`,
      method: 'get',
      params
    })
  }

  export const getInventoryGroupDetail = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/inventory/groupDetail`,
      method: 'get',
      params
    })
  }
  // /inventory/batchDetail/{batchNo}
// 批次明细接口
export const getBatchDetail = (batchNo) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/inventory/batchDetail/${batchNo}`,
        method: 'get',
      })
}
export const getRefundQuoteList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/inventory/refundQuoteList`,
    method: 'get',
    params
  })
}

export const inventoryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/inventory/list`,
    method: 'get',
    params
  })
}

/**
 * 批次库存查询列表
 */
export const inventoryBatchlist = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/inventory/batchlist`,
    method: 'get',
    params
  })
}