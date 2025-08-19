import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

// 查询列表
export function purchaseDetailPage(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/detail/list`,
    method: 'get',
    params
  })
}

export function purchaseDetailFindAllList(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/detail/findAllList`,
    method: 'get',
    params
  })
}

// 新增
export function purchaseDetailCreate(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/detail/create`,
    method: 'post',
    data: data
  })
}

// 详情
export function purchaseDetailDetail(id) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/detail/detail/${id}`,
    method: 'get',
  })
}

// 修改
export function purchaseDetailModify(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/detail/modify`,
    method: 'post',
    data
  })
}

// 删除
export function purchaseDetailDeleteBatch(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/detail/batchRemove`,
    method: 'post',
    data
  })
}
