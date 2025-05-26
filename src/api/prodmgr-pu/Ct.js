import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV
let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA
/**
 * 采购计划合同匹配
 * @param {*} params 
 * @returns 
 */
export const rawListByMatlCode = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/rawListByMatlCode`,
        method: 'post',
        data
    })
}

export const matchingCt = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Plan/matchingCt`,
        method: 'post',
        data
    })
}

export const getCtList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/saCtList`,
        method: 'get',
        params: data
    })
}

export const getDetailList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/saleOrder/detailQueryList`,
        method: 'get',
        params: data
    })
}
export const getReturnList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/return/detailQueryList`,
        method: 'get',
        params: data
    })
}
export const getDetailListByCt = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/warehouse/out/placeListByCt`,
        method: 'get',
        params: data
    })
}
export const getPlaceListByCt = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/delivery/detailQueryList`,
        method: 'get',
        params: data
    })
}
// warehouse/out/placeListByCt
export const getPuCtList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/puCtList`,
        method: 'get',
        params: data
    })
}


export const detailListByCt = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/warehouse/in/detailListByCt`,
        method: 'get',
        params: data
    })
}
export const placeListByCt = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/warehouse/in/placeListByCt`,
        method: 'get',
        params: data
    })
}

export const orderListByCt = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/purchase/order/orderListByCt`,
        method: 'get',
        params: data
    })
}

export const chartsData = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/saCtGlobalQuery`,
        method: 'get',
        params: {saleDetailId:id}
    })
}



export const exportDetailList = `${VUE_APP_PRODMGR_PU}/Pu/Ct/exportPuCtList`

export const exportSaleDetailList = `${VUE_APP_PRODMGR_PU}/Pu/Ct/exportSaCtList`