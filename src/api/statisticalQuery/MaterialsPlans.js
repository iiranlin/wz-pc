import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 物资明细列表
 * @param {*} params 
 * @returns 
 */
export const materialDetailsQueryList = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/getLatestVersionPage`,
      method: 'get',
      params
  })
}