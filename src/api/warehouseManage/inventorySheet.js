import request,{download} from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV
const VUE_APP_PRODMGR_FA = process.env.VUE_APP_PRODMGR_FA
export const exportDetailList = `${VUE_APP_PRODMGR_INV}/check/exportDetailList`;
export const adjustExportDetailList = `${VUE_APP_PRODMGR_INV}/adjust/exportDetailList`;

/**
 * 盘点单明细列表
 */
export const detailList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/check/detailList`,
      method: 'get',
      params
    })
  }
/**
 * 盘点单保存
 */
export const checkSave = (data) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/check/checkSave`,
      method: 'post',
      data
    })
  }
  /**
   * 盘点单查看
   * @param {*} id 
   * @returns 
   */
  export const orderView = (id) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/check/orderView/${id}`,
      method: 'get'
    })
  }
/**
 * 盘点单保存
 */
export const saveOrder = (data) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/check/saveOrder`,
      method: 'post',
      data
    })
  }

/**
 * 盘点单明细查看
 */
export const detailView = (data) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/check/detailView`,
      method: 'post',
      data
    })
  }

/**
 * 盘点单明细删除
 */
export const removeDetail = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/check/removeDetail`,
    method: 'post',
    data
  })
}

/**
 * 生成调整单
 * @param {*} data 
 * @returns 
 */
export const createAdjustOrder = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/check/createAdjustOrder`,
    method: 'post',
    data
  })
}

/**
 * 调整单明细列表
 * @param {*} params 
 * @returns 
 */
export const adjustDetailList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjust/detailList`,
    method: 'get',
    params
  })
}

/**
 * 调整单列表
 * @param {*} params 
 * @returns 
 */
export const adjustList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjust/list`,
    method: 'get',
    params
  })
}

/**
 * 调整单提交
 * @param {*} params 
 * @returns 
 */
export const adjustSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjust/submit`,
    method: 'post',
    data
  })
}

/**
 * 调整单查看
 * @param {*} id 
 * @returns 
 */

export const adjustOrderView = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjust/orderView/${id}`,
    method: 'get',
  })
}

export const selectAdjustDetailsStatistics = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_FA}/adjust/selectAdjustDetailsListDataSum`,
    method: 'post',
    data
  })
}

export const exportAdjustDetailsList = (data) => {
  return  download(`${VUE_APP_PRODMGR_FA}/adjust/exportAdjustDetailsList`, data)
}

export const selectAdjustDetailsList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_FA}/adjust/selectAdjustDetailsList`,
    method: 'post',
    data
  })
}

export const searchList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjust/searchList`,
    method: 'post',
    data
  })
}

export const finish = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjust/finish`,
    method: 'post',
    data
  })
}
