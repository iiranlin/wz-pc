import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 合同列表
 * @param {*} params 
 * @returns 
 */
export const itemList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialContract/list`,
        method: 'get',
        params
    })
}

/**
 * 供应商列表
 * @param {*} params 
 * @returns 
 */
export const supplierList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialContract/sellerList`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialContract/detail/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialContract/create`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialContract/batchRemove`,
    method: 'post',
    data
  })
}


/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/remove/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialContract/modify`,
    method: 'post',
    data
  })
}

/**
 * 修改合同状态
 * @param {*} params 
 * @returns 
 */
export const editStatus = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/modifyContractStatus`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialContract/save`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialContract/changeContract`,
    method: 'post',
    data
  })
}

// 根据标段获取合同列表
export const getContractList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/getBySectionProject`,
    method: 'post',
    data
  })
}

// 查询所有合同名称
export const getContractNameList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/getNameByIds`,
    method: 'post',
    data
  })
}

// 查询合同计划下达统计
export const getContractPlanStatistics = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/planExecuteReport`,
    method: 'post',
    data
  })
}

// 查询合同下的编号有多个相同的合同编号
export const countByContractNo = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/countByContractNo`,
    method: 'get',
    params
  })
}
