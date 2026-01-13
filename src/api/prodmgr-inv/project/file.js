import request, { download } from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

// 交接验收单下载
export const downloadHandoverAcceptanceForm = (params) => {
  return download(`${VUE_APP_PRODMGR_INV}/materialExport/handoverAcceptanceForm`, params, 'get')
}

// 出库单下载
export const downloadOutOfTheWarehouse = (params) => {
  return download(`${VUE_APP_PRODMGR_INV}/materialExport/outOfTheWarehouse`, params, 'get')
}

// 入库单下载
export const downloadStorageList = (params) => {
  return download(`${VUE_APP_PRODMGR_INV}/materialExport/storageList`, params, 'get')
}

// 结算清单下载
export const downloadSettlementList = (params) => {
  return download(`${VUE_APP_PRODMGR_INV}/materialExport/settlementList`, params, 'get')
}

/**
 * 通用下载接口
 * businessType businessData
 * 1:需求计划表下载
 * 2:采购合同许可证台账下载
 * 3:供应需求结算单下载
 * 4:收货列表-下载验收单
 * 5:入库列表-下载入库单
 * 6:出库列表-下载出库单
 * 7:采购文件核备-下载采购文件
 * 8:自购物资价格预警弹窗-下载合同列表
 **/ 
export const customDownload = (params) => {
  return download(`${VUE_APP_PRODMGR_INV}/materialBaseExport/export`, params, 'get')
}

/**
 * 通用文件上传接口
 * (@RequestParam("file") MultipartFile file, String businessType, String businessData)
 * businessType  1 合同导入上传；2 甲供物资导入上传； 3 创建需求计划导入上传； 4 自购合同物资明细导入上传
 *  */ 
export const customUpload = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialBaseImport/import`,
    method: 'post',
    data,
    minioSm4: true, //上传不需要加密
  })
}
