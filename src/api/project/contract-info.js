import { $get, $post } from '@/utils/request'
import request from '@/utils/request'
let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA;


export function contractList(params) {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/contract/list`,
    method: 'get',
    params
  })
}

export function contractDetail(params) {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/contract/detail/${params.id}`,
    method: 'get'
  })
}
