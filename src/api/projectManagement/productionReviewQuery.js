import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export function exportList(data) {
    return download(`${VUE_APP_PRODMGR_MM}/picking/review/exportPickingReview`, data)
}


export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/review/pickingReview`,
        method: 'get',
        params
    })
}

export const pickingReviewDetail = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/picking/review/pickingReviewDetail`,
        method: 'get',
        params
    })
}
