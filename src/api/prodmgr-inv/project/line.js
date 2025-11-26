import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 线路项目列表
 * @param {*} params 
 * @returns 
 */
export const itemList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialProject/list`,
        method: 'get',
        params
    })
}

/**
 * 获取所有建设项目列表
 * @param {*} params 
 * @returns 
 */
export const getAllProject = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialProject/getAllProject`,
        method: 'get',
        params
    })
}


/**
 * 获取建设项目下拉
 * @param {*} params 
 * @returns 
 */
export const lineSelectOptions = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialProject/getProjectByUser`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialProject/detail/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialProject/create`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialProject/batchRemove`,
    method: 'post',
    data
  })
}


/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProject/remove/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialProject/modify`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialProject/save`,
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

