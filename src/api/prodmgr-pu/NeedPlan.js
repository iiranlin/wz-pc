import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const exportDetailList = `${VUE_APP_PRODMGR_PU}/demand/plan/exportDetailList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_PU}/demand/plan/exportDetailQueryList`;

/**
 * 需求计划分页查询
 * @param {*} params 
 * @returns 
 */
export const NeedPlanList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/list`,
        method: 'get',
        params
    })
}

/**
 * 需求计划明细分页查询
 * @param {*} params 
 * @returns 
 */
export const NeedPlanRawList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/detailList`,
        method: 'get',
        params
    })
}

export const NeedPlanDetailCreateCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/saveDetail`,
        method: 'post',
        data
    })
}


export const NeedPlanSaveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/saveSubmit`,
        method: 'post',
        data
    })
}

export const NeedPlanSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/submit`,
        method: 'post',
        data
    })
}



export const NeedPlanCreateCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/saveOrder`,
        method: 'post',
        data
    })
}

/**
 * 需求计划详情
 * @param {*} params 
 * @returns 
 */
export const NeedPlanDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/orderView/${id}`,
        method: 'get',
    })
}

/**
 * 需求计划删除
 * @param {*} params 
 * @returns 
 */
export const NeedPlanBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/removeOrder`,
        method: 'post',
        data
    })
}



export const NeedPlanRawAllList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/purPlanQuoteList`,
        method: 'get',
        params
    })
}

/**
 * 需求计划明细删除
 * @param {*} params 
 * @returns 
 */
export const NeedPlanRawBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/removeDetail`,
        method: 'post',
        data
    })
}

/**
 * 需求计划明细批量修改
 * @param {*} params 
 * @returns 
 */
export const NeedPlanRawBatchModifies = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/NeedPlanRaw/modifies`,
        method: 'post',
        data
    })
}

/**
 * 需求计划明细详情列表
 * @param {*} params 
 * @returns 
 */
export const NeedPlanRawBatchListById = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/demand/plan/detailView`,
        method: 'post',
        data
    })
}

/**
 * 需求计划查询
 * @param {*} params 
 * @returns 
 */
export const NeedPlanQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/demand/plan/queryList`,
    method: 'get',
    params
  })
}

/**
 * 需求计划明细查询
 * @param {*} params 
 * @returns 
 */
export const NeedPlanRawQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/demand/plan/detailQueryList`,
    method: 'get',
    params
  })
}