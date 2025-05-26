import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export function exportDetailList(data) {
    return download(`${VUE_APP_PRODMGR_MM}/return/exportDetailList`, data)
}


export function exportDetailQueryList(data) {
    return download(`${VUE_APP_PRODMGR_MM}/return/exportDetailQueryList`, data)
}
export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/list`,
        method: 'get',
        params
    })
}

export const getDetailLists = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/detailList`,
        method: 'get',
        params
    })
}

export const getDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/rawList`,
        method: 'get',
        params
    })
}

export const saveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/saveOrder`,
        method: 'post',
        data
    })
}


export const saveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/saveSubmit`,
        method: 'post',
        data
    })
}

export const saveDetailOrder = (data) => {

    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/saveDetail`,
        method: 'post',
        data
    })
}

export const removes = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/removeOrder`,
        method: 'post',
        data
    })
}

export const getDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/orderView/${id}`,
        method: 'get',
    })
}

export const detailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/detailView`,
        method: 'post',
        data
    })
}

export const removeBatch = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/removeDetail`,
        method: 'post',
        data
    })
}

export const submit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/submit`,
        method: 'post',
        data: data
    })
}

export const rejectedRawIn = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/inQuoteList`,
        method: 'post',
        data: data
    })
}

export const getReturnInList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/return/inList`,
        method: 'get',
        params
    })
}

export const returnQueryList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/queryList`,
        method: 'get',
        params
    })
}

export const returnRawQueryList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/return/detailQueryList`,
        method: 'get',
        params
    })
}

export const returnQuoteList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_MM}/return/qiQuoteList`,
      method: 'get',
      params
  })
}

export const qiQuoteCreateUserList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_MM}/return/qiQuoteCreateUserList`,
      method: 'get',
      params
  })
}