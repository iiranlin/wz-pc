import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;


// 例外信息查询
export const getList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/demand/plan/exceptionList`,
    method: 'get',
    params
  })
}

export const exportQueryList = (data) => {
  return download( `${VUE_APP_PRODMGR_MM}/demand/plan/exceptionExport`, data)
}
