import request from '@/utils/request'
let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA;

export const exportDetailList = `${VUE_APP_PRODMGR_SA}/quotation/exportDetailList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_SA}/quotation/exportQueryDetailList`;

export const quotationImportUrl = `${process.env.VUE_APP_BASE_API}${VUE_APP_PRODMGR_SA}/quotation/importExcel`

/**
 * 报价单主单列表
 * @param {*} params 
 * @returns 
 */
export const quotationList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/list`,
        method: 'get',
        params
    })
}

export const quotationListQuery = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/queryList`,
        method: 'get',
        params
    })
}
/**
 * 报价单明细列表
 * @param {*} params 
 * @returns 
 */
export const quotationDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/detailList`,
        method: 'get',
        params
    })
}

export const quotationDetailListQuery = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/queryDetailList`,
        method: 'get',
        params
    })
}
/**
 * 报价单-主单详情
 * @param {*} params 
 * @returns 
 */
export const quotationQuotationView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/quotationView/${id}`,
        method: 'get',
    })
}
/**
 * 报价单-明细详情
 * @param {*} params 
 * @returns 
 */
export const quotationQuotationDetailView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/quotationDetailView/${id}`,
        method: 'get',
    })
}

/**
 * 报价单-新增
 * @param {*} params 
 * @returns 
 */
export const quotationCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/create`,
        method: 'post',
        data
    })
}
/**
 * 报价单-主单修改
 * @param {*} params 
 * @returns 
 */
export const quotationModify = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/modify`,
        method: 'post',
        data
    })
}
/**
 * 报价单-明细修改
 * @param {*} params 
 * @returns 
 */
export const quotationModifyDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/modifyDetail`,
        method: 'post',
        data
    })
}
/**
 * 报价单-主单删除
 * @param {*} params 
 * @returns 
 */
export const quotationRemove = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/remove/${id}`,
        method: 'post',
    })
}
/**
 * 报价单-主单批量删除
 * @param {*} params 
 * @returns 
 */
export const quotationBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/batchRemove`,
        method: 'post',
        data
    })
}
/**
 * 报价单-明细批量删除
 * @param {*} params 
 * @returns 
 */
export const quotationBatchRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/batchRemoveDetail`,
        method: 'post',
        data
    })
}

/**
 * 报价单-提交
 * @param {*} params 
 * @returns 
 */
export const quotationSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/submit`,
        method: 'post',
        data
    })
}

/**
 * 报价单-保存提交
 * @param {*} params 
 * @returns 
 */
export const quotationSaveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/saveSubmit`,
        method: 'post',
        data
    })
}

/**
 * 报价单-标记结果
 * @param {*} params 
 * @returns 
 */
export const quotationMark = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/quotation/mark`,
        method: 'post',
        data
    })
}

