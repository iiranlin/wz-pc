import request from '@/utils/request'
const VUE_APP_WORK_FLOW_SERVER = process.env.VUE_APP_WORK_FLOW_SERVER
let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA;
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;

export const exportDetailList = `${VUE_APP_PRODMGR_SA}/cuInfo/list/export`;


// 查询客户信息列表
export function getProfileList(param) {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/cuInfo/list`,
    method: 'get',
    params: param
  })
}

// 修改或者添加客户信息
export function profileSave(param) {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/cuInfo/save`,
    method: 'post',
    data: param
  })
}

export function profileSaveSubmmit(param) {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/cuInfo/saveSubmit`,
    method: 'post',
    data: param
  })
}

// 客户信息详情
export function getProfileDetail(param) {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/cuInfo/detail/${param.id}`,
    method: 'get'
  })
}


// 客户信息删除
export function getProfileDelete(param) {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/cuInfo/batchRemove`,
    method: 'post',
    data: param
  })
}


// 客户信息导出
export function getProfileExport(param) {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/cuInfo/list/export`,
    method: 'get',
    params: param,
    responseType: 'blob'
  })
}

// 客户信息导出
export function getProfileSubmit(param) {
  return request({
    url: `${VUE_APP_PRODMGR_SA}/audit/submit`,
    method: 'post',
    data: param
  })
}


// 客户信息审批
export function cuInfoSubmit(param) {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/cuInfo/submit`,
        method: 'post',
        data: param
    })
}

// 客户同步
export function cuInfoSyncSuInfo(params) {
  return request({
      url: `${VUE_APP_PRODMGR_PU}/Pu/Su/syncSuInfo`,
      method: 'get',
      params
  })
}
