import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询部门列表
export function list(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/list`,
    method: 'get',
    params
  })
}

// 根据deptCode查询指定部门列表
export function listByDeptCode(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/getListByDeptCode`,
    method: 'get',
    params
  })
}

// New  根据deptCode查询指定部门列表,仅枢纽指挥部使用
export function newListByDeptCode(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/getListByDeptCodePrefix`,
    method: 'get',
    params
  })
}

// 查询部门详细
export function deptDetail(deptId) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/detail/${deptId}`,
    method: 'get'
  })
}

// 新增部门
export function deptCreate(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/create`,
    method: 'post',
    data
  })
}

// 修改部门
export function deptModify(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/modify`,
    method: 'post',
    data
  })
}

// 删除部门
export function deptDeleteBatch(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/deleteBatch`,
    method: 'post',
    data
  })
}

// 查询部门下拉树结构
export function deptTree(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/tree`,
    method: 'get',
    params
  })
}

// 查询部门下拉树结构
export function deptTreeAll(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/treeAll`,
    method: 'get',
    params
  })
}

// 获取第一级部门数据
export function deptGetFirstLevel(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/findTopDeptList`,
    method: 'get',
    params
  })
}

// 根据部门id获得子部门
export function deptGetTreeByDeptId(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/getTreeByDeptId`,
    method: 'get',
    params
  })
}

export function getDeptTreeByIdForRank(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/getDeptTreeByIdForRank`,
    method: 'get',
    params
  })
}

/**
 * 用户自定义部门树
 * @param {*} params
 * @returns
 */
export function getRankTreeByDeptId(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/getRankTreeByDeptId`,
    method: 'get',
    params
  })
}

/**
 * 用户单位部门树
 * @param {*} params
 * @returns
 */
export function getDeptTreeByUser(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/getDeptTreeByUser`,
    method: 'get',
    params
  })
}

//未分配流程权限的用户
export function unallocatedFlowUserList(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/unallocatedFlowUserList`,
    method: 'post',
    data: data
  })
}

//流程权限授权
export function authFlowUser(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/authFlowUser`,
    method: 'post',
    data: data
  })
}

//已分配流程权限的用户
export function allocatedFlowUserList(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/allocatedFlowUserList`,
    method: 'post',
    data: data
  })
}

//取消授权
export function cancelAuth(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/cancelAuth`,
    method: 'post',
    data: data
  })
}

export const getUnitListByUser = (params)=>{
    return request({
        url: `${VUE_APP_BASE_PREFIX}/dept/getUnitListByUser`,
        method: 'get',
        params
    })
}

/**
 * 批量修改部门
 * @param {*} data
 * @returns
 */
export const sysDeptModifyBatch = (data) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/dept/modifyBatch`,
        method: 'post',
        data
    })
}

/**
 * 获得单位树
 * @param {*} params
 * @returns
 */
export const getUnitTree = (params) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/dept/getUnitTreeByRank`, // /dept/getUnitTree
        method: 'get',
        params
    })
}

/**
 * 获得负责人
 * @param {*} params
 * @returns
 */
export const getUserListAll = (params) => {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/user/listAll`,
    method: 'get',
    params
  })
}
