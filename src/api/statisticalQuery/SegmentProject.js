import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 建设项目执行统计查询列表
 * @param params
 */
export const performStatistics = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectStatistics/performStatistics`,
    method: 'get',
    params
  })
}
/**
 * 标段项目执行统计查询列表
 * @param params
 */
export const getSectionPerformStatistics = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProjectStatistics/sectionPerformStatistics`,
    method: 'get',
    params
  })
}
/**
 * 项目结算统计
 * @param params
 */
export const getReport = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/settlementMonth/getReport`,
    method: 'get',
    params
  })
}
