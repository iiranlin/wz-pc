import request from '@/utils/request'
let VUE_APP_PRODMGR_FA = process.env.VUE_APP_PRODMGR_FA;

export const detail = (codes) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/faParamers/getListByCodes`,
        method: 'get',
        params: {codes}
    })
}


export const save = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/faParamers/saveOrUpdate`,
        method: 'post',
        data: data
    })
}
