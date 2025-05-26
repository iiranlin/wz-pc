import request from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/process/list`,
        method: 'get',
        params
    })
}

export const save = (data, type = 'create') => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/process/${type}`,
        method: 'post',
        data
    })
}
export const detail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/process/detail/${id}`,
        method: 'get',
    })
}

export const remove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/process/batchRemove`,
        method: 'post',
        data
    })
}

export const classTree = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/class/tree`,
        method: 'get',
        params
    })
}

export const classCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/class/create`,
        method: 'post',
        data
    })
}

export const classRemove = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/class/remove/${id}`,
        method: 'post',
    })
}

export const classModify = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/process/class/modify`,
        method: 'post',
        data
    })
}