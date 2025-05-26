import request from '@/utils/request'
let VUE_APP_BASE_SERVER = process.env.VUE_APP_BASE_SERVER;

export function serviceList(params) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/frontend/service/list`,
    method: 'get',
    params
  })
}

export function serviceSave(data) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/frontend/service/save`,
    method: 'post',
    data
  })
}

export function serviceRemove(data) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/frontend/service/remove`,
    method: 'post',
    data
  })
}

export function serviceDetail(id) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/frontend/service/detail/${id}`,
    method: 'get',
  })
}

export function serviceDict(data) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/frontend/service/serviceDict`,
    method: 'get',
    data
  })
}
