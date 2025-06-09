import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
/**
 * 入库列表
 * @param {*} params 
 * @returns 
 */
export const listStore = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/listStore`,
        method: 'get',
        params
    })
}
/**
 * 入库明细
 * @param {*} params 
 * @returns 
 */
export const detailStore = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/detailStore/${id}`,
        method: 'get',
    })
}
/**
 * 入库-保存
 * @param {*} params 
 * @returns 
 */
export const saveStore = (data) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/materialSupplierSendRest/saveStore`,
      method: 'post',
      data
    })
  }