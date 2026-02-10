import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

// 查询列表
export function page(params) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContract/list`,
    method: 'get',
    params
  })
}



// 新增
export function create(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContract/create`,
    method: 'post',
    data: data
  })
}

// 详情
export function detail(id) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContract/detail/${id}`,
    method: 'get',
  })
}

// 修改
export function modify(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContract/modify`,
    method: 'post',
    data
  })
}

// 删除
export function deleteBatch(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContract/batchRemove`,
    method: 'post',
    data
  })
}
// 提交审核
export function submit(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContract/submit`,
    method: 'post',
    data
  })
}

// 新增证书
export function licenseCreate(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContractLicense/create`,
    method: 'post',
    data
  })
}

// 批量导入
export function batchImport(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContractLicense/importExcel`,
    method: "post",
    data,
    minioSm4: true, //上传不需要加密
  });
}

// 检查合同编号重复
export const countByContractNumber = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContract/countByContractNumber`,
    method: 'get',
    params
  })
}