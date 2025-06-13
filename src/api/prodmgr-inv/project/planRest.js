import request,{ download } from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 合同列表
 * @param {*} params 
 * @returns 
 */
export const itemList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/list`,
        method: 'get',
        params
    })
}

/**
 * 详情
 * @param {*} params 
 * @returns 
 */
export const detail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/detail/${id}`,
    method: 'get',
  })
}

/**
 * 新增
 * @param {*} params 
 * @returns 
 */
export const add = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/create`,
    method: 'post',
    data
  })
}

/**
 * 批量删除
 * @param {*} params 
 * @returns 
 */
export const batchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/batchRemove`,
    method: 'post',
    data
  })
}


/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/remove/${id}`,
    method: 'post',
  })
}

/**
 * 修改
 * @param {*} params 
 * @returns 
 */
export const edit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/modify`,
    method: 'post',
    data
  })
}

/**
 * 保存
 * @param {*} params 
 * @returns 
 */
export const save = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/save`,
    method: 'post',
    data
  })
}

/**
 * 导出
 * @param {*} params 
 * @returns 
 */
export function adjustInExport(data) {
  return download(`${VUE_APP_PRODMGR_INV}/adjustIn/export`, data)
}

// 合同变更
export const changeList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/changeContract`,
    method: 'post',
    data
  })
}

// 撤销
export const recall = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/recall`,
    method: 'post',
    data
  })
}

// 获取多个计划下所有明细
export const getAllDetail = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/getByParentIdList`,
    method: 'post',
    data
  })
}

// 提交计划
export const submit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/merger`,
    method: 'post',
    data
  })
}

// 获取所有供应商
export const getSeller = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/getSeller`,
    method: 'get',
    params
  })
}

/**
 * 分布需求列表提交
 * @param {*} params
 * @returns
 */
export const submitTodo = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/submit`,
        method: 'post',
        data
    })
}

// 提交给供应商
export const submitToSeller = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/submitSeller`,
    method: 'post',
    data
  })
}

// 下载供应商计划表
export const downloadPlan = (data) => {
  return download(`${VUE_APP_PRODMGR_INV}/materialDemandPlanRest/export`, data)
}