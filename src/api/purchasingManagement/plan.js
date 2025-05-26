import request, {download} from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const exportDetailList = `${VUE_APP_PRODMGR_PU}/purchase/plan/exportDetailList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_PU}/purchase/plan/exportDetailQueryList`;
//  导出明细
export const confirmListExportAPI = `${VUE_APP_PRODMGR_PU}/purchase/plan/confirmListExport`;
//  复核明细导出
export const reviewListExportAPI = `${VUE_APP_PRODMGR_PU}/purchase/plan/reviewListExport`;
/**
 * 采购计划分页查询
 * @param {*} params
 * @returns
 */
export const PuPlanList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/list`,
    method: 'get',
    params
  })
}

/**
 * 采购计划明细分页查询
 * @param {*} params
 * @returns
 */
export const PuPlanRawList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/detailList`,
    method: 'get',
    params
  })
}

/**
 * 采购计划新增
 * @param {*} params
 * @returns
 */
export const PuPlanCreate= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/saveOrder`,
    method: 'post',
    data
  })
}

/**
 * 批量调整采购人名称
 * @param {*} params
 * @returns
 */
export const batchAdjustAPI= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/batchAdjust`,
    method: 'post',
    data
  })
}

/**
 * 调整单条数据的保存接口
 * @param {*} params
 * @returns
 */
export const adjustAPI= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/adjust`,
    method: 'post',
    data
  })
}

/**
 * 批量确认接口
 * @param {*} params
 * @returns
 */
export const batchConfirmAPI= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/batchConfirm`,
    method: 'post',
    data
  })
}

/**
 * 批量复核接口
 * @param {*} params
 * @returns
 */
export const reviewAPI= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/review`,
    method: 'post',
    data
  })
}

export const PuPlanSaveSubmit= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/saveSubmit`,
    method: 'post',
    data
  })
}

export const PuPlanSubmit= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/submit`,
    method: 'post',
    data
  })
}

/**
 * 采购计划详情
 * @param {*} params
 * @returns
 */
export const PuPlanDetail= (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/orderView/${id}`,
    method: 'get'
  })
}



/**
 * 采购计划明细详情(多个)
 * @param {*} params
 * @returns
 */
export const PuPlanRawDetail= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/detailView`,
    method: 'post',
    data
  })
}

export const purOrderQuoteList= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/purOrderQuoteList`,
    method: 'post',
    data
  })
}



/**
 * 采购计划主表+明细修改
 * @param {*} params
 * @returns
 */
export const PuPlanRawModify= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/saveDetail`,
    method: 'post',
    data
  })
}


/**
 * 采购计划主列表删除
 * @param {*} params
 * @returns
 */
export const PuPlanBatchRemove= (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/removeOrder`,
    method: 'post',
    data
  })
}

/**
 * 采购计划主列表+明细删除
 * @param {*} params
 * @returns
 */
export const PuPlanRawBatchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/removeDetail`,
    method: 'post',
    data
  })
}

export const planMatchingCt = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/matchingCt`,
    method: 'post',
    data
  })
}


/**
 * 采购计划查询
 * @param {*} params
 * @returns
 */
export const PuPlanQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/queryList`,
    method: 'get',
    params
  })
}

/**
 * 采购计划明细查询
 * @param {*} params
 * @returns
 */
export const PuPlanRawQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/detailQueryList`,
    method: 'get',
    params
  })
}

/**
 * 归属采购员列表
 * @param {*} params
 * @returns
 */
export const planAscriptionList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/ascriptionList`,
    method: 'get',
    params
  })
}

/**
 * 确认人
 * @param {*} params
 * @returns
 */
export const planConfirmByList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/purchase/plan/confirmByList`,
    method: 'get',
    params
  })
}

