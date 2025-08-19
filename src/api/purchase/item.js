import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

// 查询列表
export function purchaseItemPage(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/item/list`,
    method: 'get',
    params
  })
}

// 查询列表
export function purchaseItemFindAllList(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/item/findAllList`,
    method: 'get',
    params
  })
}


// 新增
export function purchaseItemCreate(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/item/create`,
    method: 'post',
    data: data
  })
}

// 详情
export function purchaseItemDetail(id) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/item/detail/${id}`,
    method: 'get',
  })
}

// 修改
export function purchaseItemModify(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/item/modify`,
    method: 'post',
    data
  })
}

// 删除
export function purchaseItemDeleteBatch(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/item/batchRemove`,
    method: 'post',
    data
  })
}
