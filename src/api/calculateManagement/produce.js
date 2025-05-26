import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_FA = process.env.VUE_APP_PRODMGR_FA;

export const inventoryCardInfoList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/order/rawDetailList`,
        method: 'post',
        data
    })
}

export function inventoryCardInfoExport(data) {
    return download(`${VUE_APP_PRODMGR_FA}/order/rawDetailExport`, data)
}

export const inventoryCardInfoStatistics = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/order/rawDetailStatistics`,
        method: 'post',
        data
    })
}

export const rawDetailInDetailList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/order/rawDetailInDetailList`,
        method: 'post',
        data
    })
}



export const balanceDetailInDetailList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/order/balanceDetailInDetailList`,
        method: 'post',
        data
    })
}



export const inventoryDetailList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/order/rawCostList`,
        method: 'post',
        data
    })
}

export function inventoryDetailExport(data) {
    return download(`${VUE_APP_PRODMGR_FA}/order/rawCostExport`, data)
}

export const inventoryDetailStatistics = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/order/rawCostStatistics`,
        method: 'post',
        data
    })
}