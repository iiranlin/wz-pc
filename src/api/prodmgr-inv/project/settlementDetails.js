import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 结算明细列表
 * @param {*} params 
 * @returns 
 */
export const itemList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/settlementMonth/list`,
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
    url: `${VUE_APP_PRODMGR_INV}/settlementMonth/detail/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/settlementMonth/create`,
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
    url: `${VUE_APP_PRODMGR_INV}/settlementMonth/batchRemove`,
    method: 'post',
    data
  })
}


/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/settlementMonth/remove/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/settlementMonth/modify`,
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
    url: `${VUE_APP_PRODMGR_INV}/settlementMonth/save`,
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

// 获取当前标段信息
export function getCurrentSection() {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/settlementMonth/getSectionProject`,
    method: 'get'
  })
}

// 获取当前标段所有物料
export function getCurrentSectionMaterial(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/getListBySectionId`,
    method: 'get',
    params
  })
}

// 根据标段id集合，查询合同
export const getContractListByProjectIds = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialContract/getContractListByProjectIds`,
    method: 'post',
    data
  })
}

// 根据建设项目id,查询标段项目
export const getSectionProjectListByProjectIds = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSectionProject/getSectionProjectByProjectIds`,
    method: 'post',
    data
  })
}
// 根据合同id,查询标段项目
export const getSectionProjectListByContractId = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSectionProject/getSectionProjectByContractId`,
    method: 'post',
    data
  })
}
// 根据标段id,查询标段项目详情
export const getSectionDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/settlementMonth/detail/${id}`,
    method: 'get',
  })
}
