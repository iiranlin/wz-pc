import request, {download} from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

//  导出明细
export const exportDetailList = (data) => {
    return download( `${VUE_APP_PRODMGR_INV}/scrap/apply/exportDetailList`,data)
}
//  导出明细查询
export const exportDetailQueryList = (data) => {
  return download( `${VUE_APP_PRODMGR_INV}/scrap/apply/exportDetailQueryList`,data)
}

/**
 * 报废申请列表
 * @param {*} params
 * @returns
 */
export const applyList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/list`,
        method: 'get',
        params
    })
}

/**
 * 报废申请查询列表
 * @param {*} params
 * @returns
 */
export const applyQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/scrap/apply/queryList`,
    method: 'get',
    params
  })
}

/**
 * 报废申请明细列表
 * @param {*} params
 * @returns
 */
export const applyDetailList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/scrap/apply/detailList`,
      method: 'get',
      params
  })
}

/**
 * 报废申请明细查询列表
 * @param {*} params
 * @returns
 */
export const applyDetailQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/scrap/apply/detailQueryList`,
    method: 'get',
    params
  })
}

/**
 * 报废申请保存
 * @param {*} params
 * @returns
 */
export const applySave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/applySave`,
        method: 'post',
        data
    })
}

/**
 * 报废申请删除
 * @param {*} params
 * @returns
 */
export const applyRemoveApply = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/removeApply`,
        method: 'post',
        data
    })
}

/**
 * 报废申请明细删除
 * @param {*} params
 * @returns
 */
export const applyRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/removeDetail`,
        method: 'post',
        data
    })
}

/**
 * 报废申请查看详情
 * @param {*} params
 * @returns
 */
export const applyView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/applyView/${id}`,
        method: 'get',
    })
}

/**
 * 报废申请明细查看详情
 * @param {*} params
 * @returns
 */
export const applyDetailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/detailView`,
        method: 'post',
        data
    })
}

/**
 * 报废申请提交
 * @param {*} params
 * @returns
 */
export const applySubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/submit`,
        method: 'post',
        data
    })
}

/**
 * 报废申请明细保存
 * @param {*} params
 * @returns
 */
export const applyDetailSave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/detailSave`,
        method: 'post',
        data
    })
}

/**
 * 报废申请明细鉴定保存
 * @param {*} params
 * @returns
 */
export const applyIdentifySave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/identifySave`,
        method: 'post',
        data
    })
}
// 报废单号
export const getQuoteList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/apply/handleQuoteList`,
        method: 'post',
        data
    })
}

/**
 * 报废申请保存提交
 * @param {*} params
 * @returns
 */
export const applySaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/scrap/apply/saveSubmit`,
    method: 'post',
    data
  })
}
