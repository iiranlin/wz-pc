import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export const exportList = `${VUE_APP_PRODMGR_MM}/completion/report/exportList`;
export const exportDetailList = `${VUE_APP_PRODMGR_MM}/completion/report/exportDetailList`;

export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/completion/report/list`,
        method: 'get',
        params
    })
}

export const detailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/completion/report/detailList`,
        method: 'get',
        params
    })
}

export const saveReport = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/completion/report/save`,
        method: 'post',
        data
    })
}

export const submitValid = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/completion/report/submitValid`,
        method: 'post',
        data
    })
}

export const saveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/completion/report/submit`,
        method: 'post',
        data
    })
}

export const saveAndSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/completion/report/saveSubmit`,
        method: 'post',
        data
    })
}


export const byRaw = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/completion/report/byRaw/${id}`,
        method: 'get',
    })
}

export const detail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/completion/report/detail/${id}`,
        method: 'get',
    })
}

export const getInlist = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/order/inQuoteListByReport`,
        method: 'post',
        data
    })
}
