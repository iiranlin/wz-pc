import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
/**
 * 收货列表
 * @param {*} params 
 * @returns 
 */
export const listTake = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/listTake`,
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
        url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/detailTake/${id}`,
        method: 'get',
    })
}
/**
 * 收货备份明细详情
 * @param {*} params 
 * @returns 
 */
export const detailTakeBack = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialBackTableRest/detailByBack/${id}`,
    method: 'get',
  })
}
//收货保存
export const save = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/saveTake`,
        method: 'post',
        data
    })
}
/**
 * 收货退货列表
 * @param {*} params 
 * @returns 
 */
export const listRetreat = (params) => {
    return request({
      url: `${VUE_APP_PRODMGR_INV}/materialCirculationTableRest/listCyRetreat`,
      method: 'get',
      params
    })
  }

  /**
   * 收货提交
   * @param {*} params
   * @returns
   */
  export const submitTodo = (data) => {
      return request({
          url: `${VUE_APP_PRODMGR_INV}/materialBackTableRest/submit`,
          method: 'post',
          data
      })
  }
