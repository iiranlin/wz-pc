import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;

export const bomImport = `${VUE_APP_PRODMGR_MM}/mm/bom/import`;

/**
 * BOM分页查询
 * @param {*} params 
 * @returns 
 */
export const bomList1 = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/list`,
        method: 'get',
        params
    })
}

export const bomList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/bomList`,
        method: 'get',
        params
    })
}

/**
 * 新增或修改BOM
 * @param {*} params 
 * @returns 
 */
export const bomModify = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/modify`,
        method: 'post',
        data
    })
}

export const submit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/submit`,
        method: 'post',
        data
    })
}

export const bomCreate = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/create`,
        method: 'post',
        data
    })
}

export const bomChange = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/change`,
        method: 'post',
        data
    })
}



export const bomSubmit = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/saveSubmit`,
        method: 'post',
        data
    })
}

/**
 * 批量删除BOM
 * @param {*} params 
 * @returns 
 */
export const bomBatchRemove = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/batchRemove`,
        method: 'post',
        data
    })
}

/**
 * BOM详情
 * @param {*} params 
 * @returns 
 */
export const bomDetail = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/detail/${id}`,
        method: 'get',
    })
}

/**
 * BOM历史版本
 * @param {*} params 
 * @returns 
 */
export const bomHistory = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/history`,
        method: 'get',
        params
    })
}

/**
 * 参照历史版本
 * @param {*} params 
 * @returns 
 */
export const bomReferenceHistory = (params) => {
  return request({
      url: `${VUE_APP_PRODMGR_MM}/mm/bom/referenceHistory`,
      method: 'get',
      params
  })
}

/**
 * 成本卡明细展开
 * @param {*} params 
 * @returns 
 */
export const bomExpandChildren = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_MM}/mm/bom/expandChildrenM`,
        method: 'post',
        data
    })
}

/**
 * 采购订单维护新增时引用
 * @param {*} params 
 * @returns 
 */
export const bomPurchaseOrderQuote = (data) => {
  return request({
      url: `${VUE_APP_PRODMGR_MM}/mm/bom/purchaseOrderQuote`,
      method: 'post',
      data
  })
}
export const bomExport = (data) => {
  return download( `${VUE_APP_PRODMGR_MM}/mm/bom/export`, data)
}

/**
* 差异分析比较
* @param {*} params 
* @returns 
*/
export const bomDifferenceAnalysis = (data) => {
 return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/bom/differenceAnalysis`,
    method: 'post',
    data
 })
}

/**
* 差异分析比较里的替代比较
* @param {*} params 
* @returns 
*/
export const bomReplaceDifferenceAnalysis = (data) => {
  return request({
     url: `${VUE_APP_PRODMGR_MM}/mm/bom/replaceDifferenceAnalysis`,
     method: 'post',
     data
  })
 }

/**
 * bom维护左树
 * @param {*} params 
 * @returns 
 */
export const bomBomWithoutLeaf = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_MM}/mm/bom/bomWithoutLeaf`,
    method: 'get',
    params
  })
}