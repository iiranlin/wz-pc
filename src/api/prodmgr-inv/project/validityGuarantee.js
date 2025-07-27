import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 合同列表
 * @param {*} params 
 * @returns 
 */
export const itemList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/list`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/detail/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/create`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/batchRemove`,
    method: 'post',
    data
  })
}


/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/remove/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/modify`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/modifyContractStatus`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/save`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/changeContract`,
    method: 'post',
    data
  })
}

// 根据标段获取合同列表
export const getContractList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/getBySectionProject`,
    method: 'post',
    data
  })
}

// 查询所有合同名称
export const getContractNameList = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialValidityGuarantee/getNameByIds`,
    method: 'post',
    data
  })
}
