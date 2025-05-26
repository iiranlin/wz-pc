import request, {download} from '@/utils/request'
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const CtImportExcel = `${VUE_APP_PRODMGR_PU}/Pu/Ct/importExcel`;

/**
 * 合同管理分页查询
 * @param {*} params
 * @returns
 */
export const PuCtList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/list`,
    method: 'get',
    params
  })
}




export const PuCtAllList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/allList`,
    method: 'get',
    params
  })
}

/**
 * 合同管理新增
 * @param {*} params
 * @returns
 */
export const PuCtCreate = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/create`,
    method: 'post',
    data
  })
}

export const PuCtSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/submit`,
    method: 'post',
    data
  })
}

export const PuCtSaveSubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/saveSubmit`,
    method: 'post',
    data
  })
}

/**
 * 合同管理修改
 * @param {*} params
 * @returns
 */
export const PuCtModify = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/modify`,
    method: 'post',
    data
  })
}

/**
 * 合同管理详情
 * @param {*} params
 * @returns
 */
export const PuCtDetail = (id) => {
    return request({
      url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/detail/${id}`,
      method: 'get',
    })
}

export const PurOrderRawList = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/purOrderRawList/${id}`,
    method: 'get',
  })
}

/**
 * 合同管理详情
 * @param {*} params
 * @returns
 */
export const PuCtDetailUnused = (id) => {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/detail/unused/${id}`,
        method: 'get',
    })
}



/**
 * 供应商档案批量删除
 * @param {*} params
 * @returns
 */
export const PuCtBatchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/batchRemove`,
    method: 'post',
    data
  })
}

// 供应商档案提交数据
export function getPuSuSubmit(param) {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/audit/submit`,
    method: 'post',
    data: param
  })
}
// 供应商档案提交数据
export function getPuSuSubmitList(param) {
    return request({
        url: `${VUE_APP_PRODMGR_PU}/audit/submitList`,
        method: 'post',
        data: param
    })
}

// 供应商档案撤回数据
export function PuCtStop(param) {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/audit/stop`,
    method: 'post',
    data: param
  })
}

/**
 * 合同查询
 * @param {*} params
 * @returns
 */
export const PuCtQqueryList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/queryList`,
    method: 'get',
    params
  })
}

// 合同-重置合同状态
export function contractResetContractMtStatus(param) {
  return request({
    url: `${VUE_APP_PRODMGR_PU}/Pu/Ct/resetContractMtStatus`,
    method: 'post',
    data: param
  })
}
