import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

/**
 * 主单列表
 * @param {*} params 
 * @returns 
 */
export const planList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/list`,
        method: 'get',
        params
    })
}

export const mergeList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/mergeList`,
        method: 'get',
        params
    })
}

/**
 * 主单保存
 * @param {*} params 
 * @returns 
 */
export const planSaveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/saveOrder`,
        method: 'post',
        data
    })
}

/**
 * 主单查看
 * @param {*} params 
 * @returns 
 */
export const planOrderView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/orderView/${id}`,
        method: 'get',
    })
}

/**
 * 主单删除
 * @param {*} params 
 * @returns 
 */
export const planRemoveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/removeOrder`,
        method: 'post',
        data
    })
}

/**
 * 提交
 * @param {*} params
 * @returns 
 */
export const planSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/submit`,
        method: 'post',
        data
    })
}

/**
 * 明细列表
 * @param {*} params 
 * @returns 
 */
export const planDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/detailList`,
        method: 'get',
        params
    })
}

/**
 * 明细保存
 * @param {*} params 
 * @returns 
 */
export const planSaveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/saveDetail`,
        method: 'post',
        data
    })
}

/**
 * 明细查看
 * @param {*} params 
 * @returns 
 */
export const planDetailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/detailView`,
        method: 'post',
        data
    })
}

/**
 * 明细删除
 * @param {*} params
 * @returns 
 */
export const planRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/removeDetail`,
        method: 'post',
        data
    })
}

//  导出明细
export const exportDetailList = (data) => {
    return download(`${VUE_APP_PRODMGR_MM}/demand/plan/exportDetailList`, data)
}

//  生产计划单
export const produceQuoteList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/produceQuoteList`,
        method: 'get',
        params: data
    })
}

export const produceQuoteListForOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/produceQuoteList`,
        method: 'post',
        data
    })
}

export const planQuoteList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/quoteList`,
        method: 'post',
        data
    })
}

/**
 * 保存提交
 * @param {*} params
 * @returns 
 */
export const planSaveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/saveSubmit`,
        method: 'post',
        data
    })
}

/**
 * 物料需求计划查询
 * @param {*} params 
 * @returns 
 */
export const planQueryList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/queryList`,
        method: 'get',
        params
    })
}

/**
 * 物料需求计划明细查询
 * @param {*} params 
 * @returns 
 */
export const planDetailQueryList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/detailQueryList`,
        method: 'get',
        params
    })
}

// 导出明细查询
export const exportDetailQueryList = (data) => {
    return download(`${VUE_APP_PRODMGR_MM}/demand/plan/exportDetailQueryList`, data)
}

export const expandQuoteList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/expandQuoteList`,
        method: 'post',
        data
    })
}

export const expandRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/expandRemove`,
        method: 'post',
        data
    })
}

export const sparePartsRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/sparePartsRemove`,
        method: 'post',
        data
    })
}

export const childRefresh = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/childRefresh`,
        method: 'post',
        data
    })
}

export const refreshPlan = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/refreshPlan`,
        method: 'post',
        data
    })
}

export const getDemandMergeItem = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/getDemandMergeItem`,
        method: 'post',
        data
    })
}


export const demandMerge = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/demandMerge`,
        method: 'post',
        data
    })
}

export const demandDivide = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/demandDivide`,
        method: 'post',
        data
    })
}

export const saCtDetail = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/demand/plan/saCtDetail`,
        method: 'get',
        params
    })
}

