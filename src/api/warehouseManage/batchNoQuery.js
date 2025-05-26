import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

export const exportList = `${VUE_APP_PRODMGR_INV}/inventory/batch/exportList`;

export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/inventory/batch/list`,
        method: 'get',
        params
    })
}
