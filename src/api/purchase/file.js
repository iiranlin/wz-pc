import request,{ download } from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

// 查询列表
export function page(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseFile/list`,
    method: 'get',
    params
  })
}



// 新增
export function create(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseFile/create`,
    method: 'post',
    data: data
  })
}

// 详情
export function detail(id) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseFile/detail/${id}`,
    method: 'get',
  })
}

// 修改
export function modify(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseFile/modify`,
    method: 'post',
    data
  })
}

// 删除
export function deleteBatch(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseFile/batchRemove`,
    method: 'post',
    data
  })
}

// 提交审核
export function submit(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseFile/submit`,
    method: 'post',
    data
  })
}

export const downloadExport = (data) => {
  return download(`${VUE_APP_PRODMGR_INV}/materialPurchaseFile/export`, data)
}


