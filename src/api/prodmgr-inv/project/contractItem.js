import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 合同分配标段物料列表
 * @param {*} params 
 * @returns 
 */
export const itemList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/list`,
        method: 'get',
        params
    })
}

/**
 * 查询主合合同下负数合同
 * @param {*} params 
 * @returns 
 */
export const mainItemList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/getNegativeByUniqueNumber`,
        method: 'get',
        params
    })
}

/**
 * 查询主合同物资明细列表
 * @param {*} params 
 * @returns 
 */
export const mainItemDetailList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/getLatestVersionList`,
        method: 'get',
        params
    })
}

/**
 * 保存补充合同与主合同选择的关系数据
 * @param {id:当前数据id,masterDetailId:主合同id} params 
 * @returns 
 */
export const saveContractItem = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/updateMasterDetailId`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/detail/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/create`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/batchRemove`,
    method: 'post',
    data
  })
}


/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/remove/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/modify`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/save`,
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


// 批量导入
export function batchImport(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/importExcel`,
    method: 'post',
    data
  })
}

//  单条新增合同物资
export const verifyAllocation = (data) => {
   return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSectionAllocation/verifyAllocation`,
    method: 'post',
    data
  })
}
