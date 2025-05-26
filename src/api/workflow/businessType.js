let VUE_APP_BASE_SERVER = process.env.VUE_APP_BASE_SERVER
import request from '@/utils/request'


// 分页查询业务类型
export function getBusinessTypeByPage(params) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/business-type/list`,
    method: 'get',
    params
  })
}

// 根据id查询业务类型
export function getBusinessTypeDetail(id) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/business-type/detail/${id}`,
    method: 'get',
  })
}


// 保存业务类型
export function saveBusinessType(data) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/business-type/save`,
    method: 'post',
    data
  })
}


// 删除业务类型
export function deleteBusinessType(data) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/business-type/remove`,
    method: 'post',
    data
  })
}


// 分页查询业务类型
export function getClassFieldsByPath(params) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/business-type/classFields`,
    method: 'get',
    params
  })
}
