import request, {download} from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 报废处置列表
 * @param {*} params
 * @returns
 */
export const handleList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/list`,
        method: 'get',
        params
    })
}

/**
 * 报废处置明细列表
 * @param {*} params
 * @returns
 */
export const handleDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/detailList`,
        method: 'get',
        params
    })
}

export const handleLedgerListList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/ledgerList`,
        method: 'get',
        params
    })
}
/**
 * 报废处置保存
 * @param {*} params
 * @returns
 */
export const handleSave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/handleSave`,
        method: 'post',
        data
    })
}

/**
 * 报废处置明细保存
 * @param {*} params
 * @returns
 */
export const detailSave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/detailSave`,
        method: 'post',
        data
    })
}

/**
 * 报废处置删除
 * @param {*} params
 * @returns
 */
export const handleRemovehandle = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/removeHandle`,
        method: 'post',
        data
    })
}

/**
 * 报废处置明细删除
 * @param {*} params
 * @returns
 */
export const handleRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/removeDetail`,
        method: 'post',
        data
    })
}

/**
 * 报废处置查看详情
 * @param {*} params
 * @returns
 */
export const handleView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/handleView/${id}`,
        method: 'get',
    })
}

/**
 * 报废处置明细查看详情
 * @param {*} params
 * @returns
 */
export const handleDetailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/detailView`,
        method: 'post',
        data
    })
}

/**
 * 报废处置提交
 * @param {*} params
 * @returns
 */
export const handleSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/submit`,
        method: 'post',
        data
    })
}


//  导出明细
export const exportDetailList = (data) => {
    return download( `${VUE_APP_PRODMGR_INV}/scrap/handle/exportDetailList`,data)
}

export const exportLedgerList = (data) => {
    return download( `${VUE_APP_PRODMGR_INV}/scrap/handle/exportLedgerList`,data)
}



/**
 * 出库引用列表
 * @param {*} params
 * @returns
 */
export const handleOutQuoteList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/scrap/handle/outQuoteList`,
        method: 'post',
        data
    })
}

/**
 * 报废处置保存提交
 * @param {*} params
 * @returns
 */
export const handleSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/scrap/handle/saveSubmit`,
    method: 'post',
    data
  })
}
