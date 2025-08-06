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