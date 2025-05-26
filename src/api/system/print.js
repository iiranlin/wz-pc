import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;
export function list(query) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/print/template/list`,
        method: 'get',
        params: query
    })
}

export function tmplAllList() {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/print/template/list`,
        method: 'get',
        params: {
            pageNum: 1,
            pageSize: 99999999
        }
    })
}


export function save(data) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/print/template/save`,
        method: 'post',
        data
    })
}


export function detailByCode(code) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/print/template/detailByCode/${code}`,
        method: 'get',
    })
}

export function detailById(id) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/print/template/detail/${id}`,
        method: 'get',
    })
}


export function remove(data) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/print/template/remove`,
        method: 'post',
        data
    })
}

export function userPrintTemplate() {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/print/template/userPrintTemplate`,
        method: 'get',
    })
}

export function saveRolePrint(data) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/print/template/saveRolePrint`,
        method: 'post',
        data
    })
}
export function getRolesByTmplId(id) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/print/template/templateRole/${id}`,
        method: 'post',
    })
}
