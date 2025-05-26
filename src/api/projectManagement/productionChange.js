import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export function exportList(data) {
    return download(`${VUE_APP_PRODMGR_MM}/order/change/exportList`, data)
}

export const getList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/order/change/list`,
    method: 'get',
    params
  })
}

export const save = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/order/change/save`,
    method: 'post',
    data
  })
}

export const remove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/order/change/remove`,
    method: 'post',
    data
  })
}

export const detail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/order/change/detail/${id}`,
    method: 'get',
  })
}

export const submit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/order/change/submit`,
    method: 'post',
    data
  })
}

export const saveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/order/change/saveSubmit`,
    method: 'post',
    data
  })
}

export const historyList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/order/change/historyList`,
    method: 'get',
    params
  })
}

export const historyDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/order/change/historyDetail/${id}`,
    method: 'get',
  })
}