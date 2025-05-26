import request, {download} from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
const VUE_APP_PRODMGR_FA =  process.env.VUE_APP_PRODMGR_FA;

/**
 * 质检单引用列表
 * @param {*} params 
 * @returns 
 */
export const allocateQiQuoteList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/allocate/qiQuoteList`,
        method: 'get',
        params
    })
}

export const selectAllocateOrderDetails = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/allocate/selectAllocateOrderDetails`,
        method: 'post',
        data
    })
}

export const selectAllocateOrderDetailsDataSum = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/allocate/selectAllocateOrderDetailsDataSum`,
        method: 'post',
        data
    })
}

export function exportAllocateOrderDetailsList(data) {
    return download(`${VUE_APP_PRODMGR_FA}/allocate/exportAllocateOrderDetailsList`, data)
}

export const allocateOutOrderList = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/allocate/allocateOutOrderList`,
        method: 'post',
        data
    })
}