import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 供应需求列表
 * @param {*} params 
 * @returns 
 */
export const demandList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/listGhs`,
        method: 'get',
        params
    })
}
/**
 * 供应需求修改
 * @param {*} params 
 * @returns 
 */
export const demandEdit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/modifyConfirm`,
    method: 'post',
    data
  })
}
/**
 * 发货查物资
 * @param {*} params 
 * @returns 
 */
export const detailWz = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/detailWz/${id}`,
    method: 'get',
  })
}
/**
 * 发货新建-保存
 * @param {*} params 
 * @returns 
 */
export const save = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/saveSendGoods`,
    method: 'post',
    data
  })
}
/**
 * 发货修改-保存
 * @param {*} params 
 * @returns 
 */
export const modifySend = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/modifySend`,
    method: 'post',
    data
  })
}
/**
 * 供应详情
 * @param {*} params 
 * @returns 
 */
export const detailGyMx = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/detailGyMx`,
      method: 'get',
      params
  })
}
/**
 * 发货列表-确认发货
 * @param {*} params 
 * @returns 
 */
export const modify = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/modifyQrfh`,
    method: 'post',
    data
  })
}
/**
 * 供应需求详情
 * @param {*} params 
 * @returns 
 */
export const detail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplyPlanRest/detail/${id}`,
    method: 'get',
  })
}

/**
 * 供应管理发货列表
 * @param {*} params 
 * @returns 
 */
export const sendList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/listBySend`,
      method: 'get',
      params
  })
}

/**
 * 发货列表删除
 * @param {*} params 
 * @returns 
 */
export const batchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/batchRemove`,
    method: 'post',
    data
  })
}

/**
 * 发货列表修改、详情回显
 * @param {*} params 
 * @returns 
 */
export const sendDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/detailBySend/${id}`,
    method: 'get',
  })
}


// 获取供应商下所有物料
export const getMaterial = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanDetails/getList`,
    method: 'get',
    params
  })
}

// 物流跟踪查询
export const getLogistics = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/detailWlgz/${id}`,
    method: 'get',
  })
}

// 分页查询供货单查看所有物资剩余发货数量
export const getMaterialCount = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/listShippingInformation`,
    method: 'get',
    params
  })
}
// 物流跟踪明细查询
export const getLogisticsDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/detailWlgz/${id}`,
    method: 'get',
  })
}
/**
 * 添加货运位置
 * @param {*} params 
 * @returns 
 */
export const addAdress = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialTrackMessageRest/create`,
      method: 'post',
      data
  })
}
/**
 * 查回货运位置list
 * @param {*} params 
 * @returns 
 */
export const findAdressList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialTrackMessageRest/list`,
    method: 'get',
    params
  })
}
/**
 * 供应商退货列表
 * @param {*} params 
 * @returns 
 */
export const listGysRetreat = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/listGysRetreat`,
    method: 'get',
    params
  })
}
/**
 * 退货明细
 * @param {*} params 
 * @returns 
 */
export const detailBack = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/detailByBack/${id}`,
    method: 'get',
  })
}
/**
 * 供应需求详情
 * @param {*} params 
 * @returns 
 */
export const listShippingInformation = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierDetailRest/listShippingInformation`,
    method: 'get',
    params
  })
}
// 根据需求计划查询发货批次
export const getBatch = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/listPc/${id}`,
    method: 'get',
  })
}
