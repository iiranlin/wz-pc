import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV

/**
* 仓储管理货位
* 新增/修改
* @param {*} params
* @returns
*/
export const basePlaceSave = (data) => {
   return request({
       url: `${VUE_APP_PRODMGR_INV}/basePlace/save`,
       method: 'post',
       data
   })
}

/**
* 仓储管理货位
* 查询列表
* @param {*} params
* @returns
*/
export const basePlaceList = (params) => {
   return request({
       url: `${VUE_APP_PRODMGR_INV}/basePlace/list`,
       method: 'get',
       params
   })
}

/**
* 仓储管理货位
* 详情
* @param {*} params
* @returns
*/
export const basePlaceDetail = (id) => {
  return request({
      url: `${VUE_APP_PRODMGR_INV}/basePlace/detail/${id}`,
      method: 'get',
  })
}


/**
* 仓储管理货位树
* 查询列表
* @param {*} params
* @returns
*/
export const basePlaceTree = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/basePlace/placeTree`,
        method: 'get',
        params
    })
 }

/**
* 入库立体库分页查询
* @param {*} params
* @returns
*/
export const basePlaceMiniloadPlaceList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/basePlace/miniloadPlaceList`,
    method: 'get',
    params
  })
}