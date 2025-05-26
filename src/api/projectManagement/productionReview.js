import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export function exportDetailList(data) {
    return download(`${VUE_APP_PRODMGR_MM}/picking/exportDetailList`, data)
}

export function exportDetailListQuery(data) {
    return download(`${VUE_APP_PRODMGR_MM}/picking/exportDetailQueryList`, data)
}
export const getListQuery = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/queryList`,
        method: 'get',
        params
    })
}

export const getDetailListsQuery = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/detailQueryList`,
        method: 'get',
        params
    })
}


export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/list`,
        method: 'get',
        params
    })
}

export const getDetailLists = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/detailList`,
        method: 'get',
        params
    })
}


export const pickingOutQuoteList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/outQuoteList`,
        method: 'post',
        data
    })
}

export const saveOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/saveOrder`,
        method: 'post',
        data
    })
}


export const saveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/saveSubmit`,
        method: 'post',
        data
    })
}

export const saveDetailOrder = (data) => {

    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/saveDetail`,
        method: 'post',
        data
    })
}

export const removes = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/removeOrder`,
        method: 'post',
        data
    })
}

export const getDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/orderView/${id}`,
        method: 'get',
    })
}

export const detailView = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/detailView`,
        method: 'post',
        data
    })
}

export const removeBatch = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/removeDetail`,
        method: 'post',
        data
    })
}

export const submit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/submit`,
        method: 'post',
        data: data
    })
}

export const queryDetailInfoList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/queryDetailInfoList`,
        method: 'post',
        data: data
    })
}
