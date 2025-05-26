import request from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export const detail = () => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/produce/parameter/detail`,
        method: 'get',
    })
}


export const save = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/produce/parameter/save`,
        method: 'post',
        data: data
    })
}
