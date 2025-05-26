import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_FA = process.env.VUE_APP_PRODMGR_FA;
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

export const ledgerInDetailList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/ledger/ledgerInDetailList`,
        method: 'post',
        data: data
    })
}

export function ledgerInDetailExport(data) {
    return download(`${VUE_APP_PRODMGR_FA}/ledger/ledgerInDetailExport`, data)
}

export const ledgerInDetailStatistics = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/ledger/ledgerInDetailStatistics`,
        method: 'post',
        data: data
    })
}

export const ledgerOutDetailList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/ledger/ledgerOutDetailList`,
        method: 'post',
        data: data
    })
}

export function ledgerOutDetailExport(data) {
    return download(`${VUE_APP_PRODMGR_FA}/ledger/ledgerOutDetailExport`, data)
}

export const ledgerOutDetailStatistics = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/ledger/ledgerOutDetailStatistics`,
        method: 'post',
        data: data
    })
}


export const ledgerDetailList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/ledger/ledgerDetailList`,
        method: 'post',
        data: data
    })
}

export function ledgerDetailExport(data) {
    return download(`${VUE_APP_PRODMGR_FA}/ledger/ledgerDetailExport`, data)
}