import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

/**
 * 发运单分页查询
 * @param {*} params
 * @returns
 */
export const PuSendList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Send/list`,
    method: 'get',
    params
  })
}
