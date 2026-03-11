import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 抽检列表
 * @param {*} params 
 * @returns 
 */
export const list = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialCirSampling/list`,
        method: 'get',
        params
    })
}

/**
 * 详情
 * @param {*} params 
 * @returns 
 */
export const detail = (id,params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirSampling/detail/${id}`,
    method: 'get',
    params
  })
}

/**
 * 新增
 * @param {*} params 
 * @returns 
 */
export const add = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirSampling/create`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialCirSampling/batchRemove`,
    method: 'post',
    data
  })
}


/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirSampling/remove/${id}`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialCirSampling/modify`,
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
    url: `${VUE_APP_PRODMGR_INV}/materialCirSampling/save`,
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

// 物资批量导入
export const itemBatchImport = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirSampling/importExcel`,
    method: 'post',
    data
  })
}

// 提交审核
export const submit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialCirSampling/submit`,
    method: 'post',
    data
  })
}