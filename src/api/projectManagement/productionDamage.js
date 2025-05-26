import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export function exportList(data) {
    return download(`${VUE_APP_PRODMGR_MM}/damage/exportDetailList`, data)
}


export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/damage/list`,
        method: 'get',
        params
    })
}


export const submit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/damage/submit`,
        method: 'post',
        data: data
    })
}

export const detail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/damage/detail/${id}`,
        method: 'get',
    })
}

export const purPlanQuoteList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/damage/purPlanQuoteList`,
        method: 'post',
        data: data
    })
}