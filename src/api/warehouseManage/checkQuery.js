import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

export const exportList = `${VUE_APP_PRODMGR_INV}/check/exportQueryDetailList`;

export const getList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/check/queryList`,
    method: 'get',
    params
  })
}

export const getDetailList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/check/detailQueryList`,
      method: 'get',
      params
    })
  }