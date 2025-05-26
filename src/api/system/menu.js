import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询菜单列表
export function menuPage(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/list`,
    method: 'get',
    params
  })
}

// 菜单详情
export function menuDetail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/detail/${id}`,
    method: 'get',
  })
}


// 新增菜单
export function menuCreate(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/create`,
    method: 'post',
    data
  })
}

// 菜单修改
export function menuModify(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/modify`,
    method: 'post',
    data
  })
}

// 菜单批量删除
export function menuDeleteBatch(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/deleteBatch`,
    method: 'post',
    data
  })
}
// 菜单单个删除
export function menuDelete(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/delete/${id}`,
    method: 'post',
  })
}

export function menuBindRole() {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/bindRole/${menuId}`,
    method: 'post',
  })
}

export function menuTree() {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/tree`,
    method: 'get',
  })
}

// 页面属性
export function menuProperty(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/property/${id}`,
    method: 'get',
  })
}


// 页面属性
export function menuRecordFunc(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/menu/recordFunc`,
    method: 'get',
    params
  })
}

/**
 * 根据父ID获得子最大排序号
 * @param {*} params {parentId:""}
 * @returns 
 */
export const getMaxSeqByParentId = (params) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/menu/getMaxSeqByParentId`,
        method: 'get',
        params
    })
}

// 获取路由
export function getUserMenu() {
	return request({
		url: `${VUE_APP_BASE_PREFIX}/user/menu`,
		method: 'GET'
	})
}
