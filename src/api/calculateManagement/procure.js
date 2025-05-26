import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
let VUE_APP_PRODMGR_FA = process.env.VUE_APP_PRODMGR_FA;

export const inventoryCardInfoList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/warehouse/in/queryInvInCompList`,
        method: 'post',
        data
    })
}

export function inventoryCardInfoExport(data) {
    return download(`${VUE_APP_PRODMGR_FA}/warehouse/in/exportInvInCompList`, data)
}

export const inventoryCardInfoStatistics = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/warehouse/in/calcInvInCompTotal`,
        method: 'post',
        data
    })
}

export const inventoryDetailList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/warehouse/in/queryInventoryWarehouseInDetailList`,
        method: 'post',
        data
    })
}

export function inventoryDetailExport(data) {
    return download(`${VUE_APP_PRODMGR_FA}/warehouse/in/exportInventoryWarehouseInDetailList`, data)
}

export const inventoryDetailStatistics = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/warehouse/in/calcInvInTotal`,
        method: 'post',
        data
    })
}

export const saCtDetail = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/warehouse/in/saCtDetail`,
        method: 'get',
        params
    })
}