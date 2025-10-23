import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 工作台数据统计
 * @param {*} params 
 * @returns 
 */
export const itemList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/statistics/homeStatistics`,
        method: 'get',
        params
    })
}
/**
 * 获取建设项目列表
 */
export const getLineProjectList = () => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/statistics/projectList`,
    method: 'get',
  })
}