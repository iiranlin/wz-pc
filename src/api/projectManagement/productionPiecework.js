import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;


export function exportList(data) {
    return download(`${VUE_APP_PRODMGR_MM}/mm/st/exportList`, data)
}


export function exportDetailList(data) {
    return download(`${VUE_APP_PRODMGR_MM}/mm/st/exportDetailList`, data)
}
export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/list`,
        method: 'get',
        params
    })
}

export const getDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/rawList`,
        method: 'get',
        params
    })
}

export const pushState = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/pushTimePiece/${id}`,
        method: 'get',
    })
}

export const createOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/create`,
        method: 'post',
        data
    })
}

export const modifyOrder = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/modify`,
        method: 'post',
        data
    })
}

export const saveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/saveSubmit`,
        method: 'post',
        data
    })
}

export const saveDetailOrder = (data, type = 'create') => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/return/${type}`,
        method: 'post',
        data
    })
}

export const removes = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/batchRemove`,
        method: 'post',
        data
    })
}

export const getDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/detail/${id}`,
        method: 'get',
    })
}


export const getRawDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/raw/detail`,
        method: 'post',
        data
    })
}

export const saveRawDetail = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/saveRaw`,
        method: 'post',
        data
    })
}

export const removeBatch = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/batchRemoveItem`,
        method: 'post',
        data
    })
}

export const submit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/st/submit`,
        method: 'post',
        data: data
    })
}

export const rejectedRawIn = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/return/rawIn`,
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
    url: `${VUE_APP_PRODMGR_MM}/mm/return/queryList`,
    method: 'get',
    params
  })
}

export const returnRawQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/return/rawQueryList`,
    method: 'get',
    params
  })
}