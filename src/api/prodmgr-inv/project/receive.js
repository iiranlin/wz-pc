import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
/**
 * 收货列表
 * @param {*} params 
 * @returns 
 */
export const listTake = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/listTake`,
    method: 'get',
    params
  })
}
/**
 * 收货明细
 * @param {*} params 
 * @returns 
 */
export const detailTake = (id) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/detailTake/${id}`,
      method: 'get',
    })
  }