import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const auditStopList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/audit/stopList`,
    method: 'post',
    data
  })
}
