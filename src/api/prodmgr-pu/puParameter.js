import request from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

/**
 * 采购参数获取
 * @param {*} params
 * @returns
 */
export const puParameterDetail = (code) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/puParameter/detail/${code}`,
        method: 'get',
    })
}

/**
 * 采购参数保存
 * @param {*} params
 * @returns
 */
export const puParameterSave = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_PU}/puParameter/save`,
      method: 'post',
      data
  })
}