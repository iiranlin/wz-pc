import request from '@/utils/request'

let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

export const exportDetailList = `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/exportList`;

export const materialStorageImportUrl = `${process.env.VUE_APP_BASE_API}${VUE_APP_PRODMGR_INV}/invMatlStorageRel/importExcel`
export const materialStorageDownTemplate = `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/export/template`

export const exportBarCodeList = `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/exportBarCodeList`;
/**
 * 物料存储关系-分页
 * @param {*} params
 * @returns
 */
export const invMatlStorageRelList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/list`,
    method: 'get',
    params
  })
}

/**
 * 物料存储关系-新增或修改
 * @param {*} params
 * @returns
 */
export const invMatlStorageRelSave = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/save`,
    method: 'post',
    data
  })
}

/**
 * 物料存储关系-批量删除
 * @param {*} params
 * @returns
 */
 export const invMatlStorageRelRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/remove`,
    method: 'post',
    data
  })
}

/**
 * 物料存储关系-详情
 * @param {*} params
 * @returns
 */
export const invMatlStorageRelDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/detail/${id}`,
    method: 'get'
  })
}


/**
 * 物料存储关系-选择货架
 * @param {*} params
 * @returns
 */
 export const invMatlStorageRelReferenceFrameList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/reference/frame/list`,
    method: 'get',
    params
  })
}

/**
 * 物料存储关系-选择货位
 * @param {*} params
 * @returns
 */
 export const invMatlStorageRelReferencePlaceList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/reference/place/list`,
    method: 'get',
    params
  })
}

/**
 * 物料存储关系-保存校验
 * @param {*} params
 * @returns
 */
 export const invMatlStorageRelSaveCheck = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/invMatlStorageRel/save/check`,
    method: 'post',
    data
  })
}

