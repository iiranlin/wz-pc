let VUE_APP_PRODMGR_FA = process.env.VUE_APP_PRODMGR_FA;
import request, { download } from '@/utils/request'


export const getList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/list`,
        method: 'get',
        params
    })
}
export const listNoPage = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/listNoPage`,
        method: 'get',
        params
    })
}
export const create = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/create`,
        method: 'post',
        data
    })
}

export const modify = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/modify`,
        method: 'post',
        data
    })
}

export const saveSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/saveSubmit`,
        method: 'post',
        data
    })
}



export const detail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/detail`,
        method: 'get',
        params: { id }
    })
}


export const remove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/batchRemove`,
        method: 'post',
        data
    })
}

export function submit(data) {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/submit`,
        method: 'post',
        data
    })
}


export function exportFile(data) {
    return download(`${VUE_APP_PRODMGR_FA}/accounting/period/export`, data)
}

export const getLogList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/log/list`,
        method: 'get',
        params
    })
}

export function updateForwardYes(data) {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/updateForwardYes`,
        method: 'post',
        data
    })
}

export function updateForwardNo(data) {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/updateForwardNo`,
        method: 'post',
        data
    })
}

export function updateSealOff(data) {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/updateSealOff`,
        method: 'post',
        data
    })
}

export function updateSealOn(data) {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/updateSealOn`,
        method: 'post',
        data
    })
}

export function checkForward(data) {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/checkForward`,
        method: 'post',
        data
    })
}

export const getStartDateByLastEndDate = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_FA}/accounting/period/getStartDateByLastEndDate`,
        method: 'get',
        params
    })
}
