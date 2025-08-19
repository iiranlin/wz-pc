import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

// 查询列表
export function purchaseTypePage(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/type/list`,
    method: 'get',
    params
  })
}

// 查询所有列表
export function purchaseTypeFindAllList(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/type/findAllList`,
    method: 'get',
    params
  })
}

// 新增
export function purchaseTypeCreate(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/type/create`,
    method: 'post',
    data: data
  })
}

// 详情
export function purchaseTypeDetail(id) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/type/detail/${id}`,
    method: 'get',
  })
}

// 修改
export function purchaseTypeModify(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/type/modify`,
    method: 'post',
    data
  })
}

// 删除
export function purchaseTypeDeleteBatch(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/type/batchRemove`,
    method: 'post',
    data
  })
}
