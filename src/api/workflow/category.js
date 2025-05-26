let VUE_APP_WORK_FLOW_SERVER = process.env.VUE_APP_WORK_FLOW_SERVER
let VUE_APP_BASE_SERVER = process.env.VUE_APP_BASE_SERVER
import request from '@/utils/request'

// 查询流程分类列表
export function listCategory(query) {
  return request({
    url: `${VUE_APP_WORK_FLOW_SERVER}/category/list`,
    method: 'get',
    params: query
  })
}

// 查询流程分类列表
export function listAllCategory(query) {
  return request({
    url: `${VUE_APP_WORK_FLOW_SERVER}/category/listAll`,
    method: 'get',
    params: query
  })
}

// 查询流程分类详细
export function getCategory(categoryId) {
  return request({
    url: `${VUE_APP_WORK_FLOW_SERVER}/category/` + categoryId,
    method: 'get'
  })
}

// 新增流程分类
export function addCategory(data) {
  return request({
    url: `${VUE_APP_WORK_FLOW_SERVER}/category/create`,
    method: 'post',
    data: data
  })
}

// 修改流程分类
export function updateCategory(data) {
  return request({
    url: `${VUE_APP_WORK_FLOW_SERVER}/category/modify`,
    method: 'post',
    data: data
  })
}

// 删除流程分类
export function delCategory(data) {
  return request({
    url: `${VUE_APP_WORK_FLOW_SERVER}/category/delete`,
    method: 'post',
    data
  })
}


// 获得部门树
export function getOrgTree(query) {
  return request({
    url: `${VUE_APP_WORK_FLOW_SERVER}/category/getOrgTree`,
    method: 'get',
    params: query
  })
}

// 获得关联业务
export function getBusinessType(query) {
  return request({
    url: `${VUE_APP_BASE_SERVER}/business-type/list`,
    method: 'get',
    params: query
  })
}

//获取版本信息 
export function getVersionRecord(query) {
  return request({
    url: `${VUE_APP_WORK_FLOW_SERVER}/category/selectVersionPage`,
    method: 'get',
    params: query
  })
}

//实例启用/停用
export function changeStatus(data) {
  return request({
    url: `${VUE_APP_WORK_FLOW_SERVER}/category/changeStatus`,
    method: 'post',
    data: data
  })
}

//获取审批条件 
export function categoryCondition(id) {
    return request({
        url: `${VUE_APP_WORK_FLOW_SERVER}/category/condition/${id}`,
        method: 'get',
    })
}

//查询流程表单详细信息
export function categoryBpmnXmlModel(modelId) {
    return request({
        url: `${VUE_APP_WORK_FLOW_SERVER}/category/bpmnXmlModel/${modelId}`,
        method: 'get',
    })
}

//查询历史流程表单详细信息
export function categoryBpmnXmlVersion(deploymentId) {
    return request({
        url: `${VUE_APP_WORK_FLOW_SERVER}/category/bpmnXmlVersion/${deploymentId}`,
        method: 'get',
    })
}