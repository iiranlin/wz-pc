import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const exportDetailList = `${VUE_APP_PRODMGR_PU}/matl/apply/exportDetailList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_PU}/matl/apply/exportDetailQueryList`;

/**
 * 用料申请分页查询
 * @param {*} params 
 * @returns 
 */
export const MaList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/list`,
        method: 'get',
        params
    })
}


export const MaCreateSaveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/saveSubmit`,
        method: 'post',
        data
    })
}



export const MaCreateCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/saveOrder`,
        method: 'post',
        data
    })
}

export const MaSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/submit`,
        method: 'post',
        data
    })
}


/**
 * 用料申请详情
 * @param {*} params 
 * @returns 
 */
export const MaDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/orderView/${id}`,
        method: 'get',
    })
}

/**
 * 用料申请删除 
 * @param {*} params 
 * @returns 
 */
export const MaBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/removeOrder`,
        method: 'post',
        data
    })
}

/**
 * 用料申请明细分页查询
 * @param {*} params 
 * @returns 
 */
export const MaRawList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/detailList`,
        method: 'get',
        params
    })
}

/**
 * 用料申请明细删除
 * @param {*} params 
 * @returns 
 */
export const MaRawBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/removeDetail`,
        method: 'post',
        data
    })
}

/**
 * 用料申请明细批量修改
 * @param {*} params 
 * @returns 
 */
export const MaRawBatchModifies = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/saveDetail`,
        method: 'post',
        data
    })
}

/**
 * 用料申请明细详情列表
 * @param {*} params 
 * @returns 
 */
export const MaRawBatchListById = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/detailView`,
        method: 'post',
        data
    })
}

/**
 * 用料申请下推出库明细详情列表
 * @param {*} params 
 * @returns 
 */
export const MaRawBatchWhiListById = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/matl/apply/outQuoteList`,
        method: 'post',
        data
    })
}


/**
 * 用料申请查询
 * @param {*} params 
 * @returns 
 */
export const MaQueryList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_PU}/matl/apply/queryList`,
      method: 'get',
      params
  })
}

/**
 * 用料申请明细查询
 * @param {*} params 
 * @returns 
 */
export const MaRawQueryList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_PU}/matl/apply/detailQueryList`,
      method: 'get',
      params
  })
}