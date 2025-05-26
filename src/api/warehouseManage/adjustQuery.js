import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

export const exportList = `${VUE_APP_PRODMGR_INV}/adjust/exportQueryDetailList`;

export const getList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/adjust/queryList`,
    method: 'get',
    params
  })
}

export const getDetailList = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/adjust/detailQueryList`,
      method: 'get',
      params
    })
  }