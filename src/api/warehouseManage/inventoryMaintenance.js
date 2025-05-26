import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

export const exportDetailList = `${VUE_APP_PRODMGR_INV}/warehouse/in/exportDetailList`;
export const exportQueryList = `${VUE_APP_PRODMGR_INV}/warehouse/in/exportQueryList`;
export const exportList = `${VUE_APP_PRODMGR_INV}/warehouse/in/exportList`;

/**
 * 入库单列表
 * @param {*} params
 * @returns
 */
export const inMaintenanceList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/warehouse/in/list`,
      method: 'get',
      params
    })
  }

export const queryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/queryList`,
    method: 'get',
    params
  })
}
  /**
   * 入库单引用质检单 
   */
  export const inQuoteqi = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/qi/quoteList`,
      method: 'get',
      params
    })
  }

/**
 * 入库单保存
 * @param {*} params 
 * @returns 
 */
  export const inMaintenanceSave = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/warehouse/in/saveOrder`,
      method: 'post',
      data: params
    })
  }

  /**
   * 入库单删除
   * @param {*} params 
   * @returns 
   */
export const inMaintenanceDelete = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/removeDetail`,
    method: 'post',
    data: params
  })
}
// /warehouse/in/orderView/{id}
  /**
   * 入库单详情
   * @param {*} params 
   * @returns 
   */
export const getMainDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/orderView/${id}`,
    method: 'get'
  })
}
/**
 * 入库单上架
 * @param {*} params 
 * @returns 
 */
export const inMaintenanceUp = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/autoGrounding`,
    method: 'post',
    data: params
  })
}

/**
 * 手动上架
 * @param {*} params 
 * @returns 
 */
export const inMaintenanceUpMaul = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/saveGrounding`,
    method: 'post',
    data: params
  })
}

/**
 * 入库完成
 * @param {*} params 
 * @returns 
 */
export const inMaintenanceComplete = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/inFinish`,
    method: 'post',
    data: params
  })
}

/**
 * 取消完成
 * @param {*} params 
 * @returns 
 */
export const warehouseInCancelFinish = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/cancelFinish`,
    method: 'post',
    data: params
  })
}
  export const getInDetail = (data) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/warehouse/in/detailView`,
      method: 'post',
      data
    })
  }

    export const detailSave = (data) => {
      return request({
        url: `${VUE_APP_PRODMGR_INV}/warehouse/in/detailSave`,
        method: 'post',
        data
      })
    }
    // /warehouse/in/groundingView/{id}
    /**
     * 上架查看
     * @param {*} data 
     * @returns 
     */
    export const groundingView = (id) => {
      return request({
        url: `${VUE_APP_PRODMGR_INV}//warehouse/in/groundingView/${id}`,
        method: 'post'
      })
    }

/**
 * 仓储管理地区新增或修改
 * @param {*} params
 * @returns
 */
export const WarehouseSave = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseWarehouse/save`,
    method: 'post',
    data
  })
}

/**
 * 仓储管理地区详情
 * @param {*} params
 * @returns
 */
export const WareDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseWarehouse/detail/${id}`,
    method: 'get'
  })
}

/**
 * 销售订单维护批量删除
 * @param {*} params
 * @returns
 */
export const saleOrderBatchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/saleOrderDetail/batchRemove`,
    method: 'post',
    data
  })
}

/**
 * 仓储管理查询仓库树
 * @param {*} params
 * @returns
 */
export const getWarehouseTree = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseWarehouse/getWarehouseTree`,
    method: 'get',
    params
  })
}

/**
 * 入库单取消上架
 * @param {*} params
 * @returns
 */
export const inCancelGrounding = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/cancelGrounding`,
    method: 'post',
    data
  })
}

export const queryDetailInfoList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/queryDetailInfoList`,
    method: 'post',
    data
  })
}

/**
 * 入库明细-获取单价
 * @param {*} params
 * @returns
 */
export const productPrice = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/product/price`,
    method: 'post',
    data
  })
}

/**
 * 获取入库单查询主列表
 * @param {*} params
 * @returns
 */
export const inOrderList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/orderList`,
    method: 'get',
    params
  })
}

/**
 * 获取入库单查询主+明细列表
 * @param {*} params
 * @returns
 */
export const inDetailList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/detailList`,
    method: 'get',
    params
  })
}

/**
 * 获取入库单立体库行内上架
 * @param {*} params
 * @returns
 */
export const miniloadGroundingSingle = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/miniloadGroundingSingle`,
    method: 'get',
    params
  })
}

/**
 * 立体库上架-下发/回库
 * @param {*} params
 * @returns
 */
export const miniloadGroundingChange = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/miniloadGroundingChange`,
    method: 'post',
    data
  })
}

/**
 * 立体库上架-确认
 * @param {*} params
 * @returns
 */
export const miniloadGroundingSave = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/miniloadGroundingSave`,
    method: 'post',
    data
  })
}

/**
 * 获取入库单立体库行内上架调整
 * @param {*} params
 * @returns
 */
export const miniloadGroundingDetail = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/miniloadGroundingDetail`,
    method: 'get',
    params
  })
}

/**
 * 获取入库单立体库多选上架
 * @param {*} params
 * @returns
 */
export const miniloadGroundingMultiple = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/warehouse/in/miniloadGroundingMultiple`,
    method: 'post',
    data
  })
}