import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
// 下载
export const exportDetailList = `${VUE_APP_PRODMGR_INV}/qi/exportDetailList`;
export const exportDetailQueryList = `${VUE_APP_PRODMGR_INV}/qi/exportDetailQueryList`;
export const exportUnqualityList = `${VUE_APP_PRODMGR_INV}/qi/exportUnqualityList`;


/**
 * 质检单列表
 * @param {*} params
 * @returns
 */
export const qiOrderList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/orderList`,
        method: 'get',
        params
    })
}

/**
 * 质检单明细列表
 * @param {*} params
 * @returns
 */
export const qiDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/detailList`,
        method: 'get',
        params
    })
}

/**
 * 质检单保存
 * @param {*} params
 * @returns
 */
export const qiSaveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/saveOrder`,
        method: 'post',
        data
    })
}

export const qiSaveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/saveSubmit`,
        method: 'post',
        data
    })
}

/**
 * 检单删除
 * @param {*} params
 * @returns
 */
export const qiRemoveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/removeOrder`,
        method: 'post',
        data
    })
}

/**
 * 质检单明细删除
 * @param {*} params
 * @returns
 */
export const qiRemoveDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/removeDetail`,
        method: 'post',
        data
    })
}

/**
 * 质检单查看详情
 * @param {*} params
 * @returns
 */
export const qiOrderView = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/orderView/${id}`,
        method: 'get',
    })
}

/**
 * 质检单明细查看详情
 * @param {*} params
 * @returns
 */
export const qiDetailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/detailView`,
        method: 'post',
        data
    })
}

/**
 * 质检单明细批量合格
 * @param {*} params
 * @returns
 */
export const qiBatchQualified = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/batchQualified`,
        method: 'post',
        data
    })
}

/**
 * 质检单明细手工填报保存
 * @param {*} params
 * @returns
 */
export const qiQiSave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/qiSave`,
        method: 'post',
        data
    })
}

/**
 * 质检单提交
 * @param {*} params
 * @returns
 */
export const qiSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/submit`,
        method: 'post',
        data
    })
}

/**
 * 获取质检来源
 * @param {*} params 
 * @returns 
 */
export const getQiSource = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/getQiSource`,
        method: 'get',
        params
    })
}

/**
 * 获取质检参数
 * @param {*} params
 * @returns
 */
export const qiParameter = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/qi/getQiParameter`,
    method: 'get',
    params
  })
}

/**
 * 保存质检参数
 * @param {*} params
 * @returns
 */
export const qiSaveQiParameter = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/qi/saveQiParameter`,
    method: 'post',
    data
  })
}


/**
 * 质检入库单查列表
 * @param {*} params
 * @returns
 */
export const qiInQuoteList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/qi/inQuoteList`,
        method: 'post',
        data
    })
}

/**
 * 质检单列表查询
 * @param {*} params
 * @returns
 */
export const qiOrderQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/qi/orderQueryList`,
    method: 'get',
    params
  })
}

/**
 * 质检单明细列表查询
 * @param {*} params
 * @returns
 */
export const qiDetailQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/qi/detailQueryList`,
    method: 'get',
    params
  })
}

/**
 * 不良品列表查询
 * @param {*} params
 * @returns
 */
export const qiUnqualityList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/qi/unqualityList`,
    method: 'get',
    params
  })
}

/**
 * 质检不合格记录
 * @param {*} params
 * @returns
 */
export const qiRecordList = (detailId) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/qi/recordList/${detailId}`,
    method: 'get',
  })
}