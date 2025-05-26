import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

export const exportDetailList = `${VUE_APP_PRODMGR_INV}/baseApply/exportList`;

/**
 * 智能应用设置-分页
 * @param {*} params
 * @returns
 */
export const baseApplyList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseApply/list`,
    method: 'get',
    params
  })
}

/**
 * 智能应用设置-新增或修改
 * @param {*} params
 * @returns
 */
export const baseApplySave = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseApply/save`,
    method: 'post',
    data
  })
}

/**
 * 智能应用设置-批量删除
 * @param {*} params
 * @returns
 */
 export const baseApplyRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseApply/remove`,
    method: 'post',
    data
  })
}

/**
 * 智能应用设置-详情
 * @param {*} params
 * @returns
 */
export const baseApplyDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/baseApply/detail/${id}`,
    method: 'get'
  })
}

