import request,  {download } from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;
/**
 * 项目管理分页查询
 * @param {*} params
 * @returns
 */
export const projectList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/list`,
    method: 'get',
    params
  })
}

export const projectAllList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/allList`,
    method: 'get',
    params
  })
}

/**
 * 项目管理新增
 * @param {*} params
 * @returns
 */
export const projectSave = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/save`,
    method: 'post',
    data
  })
}
export const projectSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/saveSubmit`,
    method: 'post',
    data
  })
}


/**
 * 项目管理详情
 * @param {*} params
 * @returns
 */
export const projectDetail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/detail/${id}`,
    method: 'get',
  })
}

/**
 * 项目批量删除
 * @param {*} params
 * @returns
 */
export const projectRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/remove`,
    method: 'post',
    data
  })
}

// 项目提交数据
export function projectSubmit(data) {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/submit`,
    method: 'post',
    data
  })
}


// 项目导出数据
export function projectExport(data) {
  return download( `${VUE_APP_PRODMGR_PU}/project/export`,data)
}

// 项目关联合同
export function projectRelatedContract(data) {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/relatedContract`,
    method: 'post',
    data
  })
}

/**
 * 项目查询
 * @param {*} params
 * @returns
 */
export const projectQueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/queryList`,
    method: 'get',
    params
  })
}

// 项目导出查询
export function projectExportQuery(data) {
  return download( `${VUE_APP_PRODMGR_PU}/project/exportQuery`,data)
}

export const projectContactQuotePageList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/project/contactQuotePageList`,
    method: 'get',
    params
  })
}