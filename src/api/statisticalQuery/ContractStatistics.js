import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 合同执行统计查询列表
 * @param params
 */
export const contractPerformStatistics = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectStatistics/contractPerformStatistics`,
    method: 'get',
    params
  })
}
/**
 * 退货统计
 * @param params
 */
export const refundStatistics = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectStatistics/refundStatistics`,
    method: 'get',
    params
  })
}
/**
 * 投资计划完成统计查询
 * @param params
 */
export const investStatistics = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectStatistics/investStatistics`,
    method: 'get',
    params
  })
}
