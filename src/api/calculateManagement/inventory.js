import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_FA = process.env.VUE_APP_PRODMGR_FA;

export const inventoryCardInfoList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/inventory/inventoryCardInfoList`,
        method: 'post',
        data
    })
}

export function inventoryCardInfoExport(data) {
    return download(`${VUE_APP_PRODMGR_FA}/inventory/inventoryCardInfoExport`, data)
}

export const inventoryCardInfoStatistics = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/inventory/inventoryCardInfoStatistics`,
        method: 'post',
        data
    })
}

export const inventoryDetailList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/inventory/inventoryDetailList`,
        method: 'post',
        data
    })
}

export function inventoryDetailExport(data) {
    return download(`${VUE_APP_PRODMGR_FA}/inventory/inventoryDetailExport`, data)
}

export const inventoryDetailStatistics = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/inventory/inventoryDetailStatistics`,
        method: 'post',
        data
    })
}