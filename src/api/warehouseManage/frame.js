import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV


export const baseFrameSave = (data) => {
   return request({
       url: `${VUE_APP_PRODMGR_INV}/baseFrame/save`,
       method: 'post',
       data
   })
}


export const baseFrameList = (params) => {
   return request({
       url: `${VUE_APP_PRODMGR_INV}/baseFrame/list`,
       method: 'get',
       params
   })
}

export const frameReferenceList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/baseFrame/reference/list`,
        method: 'get',
        params
    })
 }

 export const baseFrameremove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/baseFrame/remove`,
        method: 'post',
        data
    })
 }
 export const frameDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/baseFrame/detail/${id}`,
        method: 'get',
    })
 }

 export const baseFrameReferenced = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/baseFrame/referenced`,
        method: 'get',
        params
    })
 }