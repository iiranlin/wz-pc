import request from '@/utils/request'
import dayjs from 'dayjs';
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const exportDetailList = `${VUE_APP_PRODMGR_PU}/arrived/exportDetailList`;


/**
 * 采购单详情
 * @param {*} params
 * @returns
 */
export const arrivedDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/arrived/detail/${id}`,
        method: 'get',
    })
}

export const arrivedList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/arrived/list`,
        method: 'get',
        params
    })
}

export const arrivedSave = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/arrived/save`,
        method: 'post',
        data
    })
}


export const arrivedBatchArrived = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/arrived/batchArrived`,
        method: 'post',
        data
    })
}


export const qiQuoteList = (params) => {
    if(params.arrivedDateStart) {
        params.arrivedDateStart = dayjs(params.arrivedDateStart).format('YYYY-MM-DD')
    }
    if(params.arrivedDateEnd) {
        params.arrivedDateEnd = dayjs(params.arrivedDateEnd).format('YYYY-MM-DD')
    }
    return request({
        url: `${VUE_APP_PRODMGR_PU}/arrived/qiQuoteList`,
        method: 'get',
        params
    })
}

export const inQuoteList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/arrived/inQuoteList`,
        method: 'get',
        params
    })
}

export const detailByArrivedId = (id) => {
  return request({
      url: `${VUE_APP_PRODMGR_PU}/arrived/detailByArrivedId/${id}`,
      method: 'get',
  })
}

export const detailInQuoteDt = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/arrived/inQuoteDt`,
    method: 'post',
    data
  })
}