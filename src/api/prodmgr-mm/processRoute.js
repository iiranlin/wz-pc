import request from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/list`,
        method: 'get',
        params
    })
}

export const saveCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/create`,
        method: 'post',
        data
    })
}
export const submit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/submit`,
        method: 'post',
        data
    })
}
export const saveModify = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/modify`,
        method: 'post',
        data
    })
}

export const saveChange = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/change`,
        method: 'post',
        data
    })
}

export const saveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/saveSubmit`,
        method: 'post',
        data
    })
}

export const detail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/detail/${id}`,
        method: 'get',
    })
}

export const remove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/batchRemove`,
        method: 'post',
        data
    })
}

export const history = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/history`,
        method: 'get',
        params
    })
}

export const detailByBom = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/detailByBom/${id}`,
        method: 'get',
    })
}

//选择工艺列表
export const detailByBomOrMatl = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/path/detailByBomOrMatl`,
        method: 'get',
        params
    })
}