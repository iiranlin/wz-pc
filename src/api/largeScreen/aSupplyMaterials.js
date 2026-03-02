// 甲供物资统计 Material Big Screen Controller
import request from "@/utils/request";
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;


/**
 * 物资出库
 * @param {*} params
 * @returns
 */
export const materialOut = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialBigScreen/materialOut`,
    method: "get",
    params,
  });
};
/**
 * 物资计划
 * @param {*} params
 * @returns
 */
export const materialPlan = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialBigScreen/materialPlan`,
    method: "get",
    params,
  });
};
/**
 * 物资供应
 * @param {*} params
 * @returns
 */
export const materialShipping = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialBigScreen/materialShipping`,
    method: "get",
    params,
  });
};
/**
 * 质检入库
 * @param {*} params
 * @returns
 */
export const materialStore = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialBigScreen/materialStore`,
    method: "get",
    params,
  });
};
/**
 * 物资初验
 * @param {*} params
 * @returns
 */
export const materialTake = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialBigScreen/materialTake`,
    method: "get",
    params,
  });
};
/**
 * 投资总览
 * @param {*} params
 * @returns
 */
export const projectStatistics = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialBigScreen/projectStatistics`,
    method: "get",
    params,
  });
};

// New  根据deptCode查询指定部门列表,仅枢纽指挥部使用
export function newListByDeptCode(params = { deptCodePrefix: 'SN', status: '' }) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/dept/getListByDeptCodePrefix`,
    method: "get",
    params,
  });
}
/**
 * 根据用户获取建设项目
 * @param {*} params
 * @returns
 */
export const getProjectByUser = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialProject/getProjectByUser`,
    method: "get",
    params,
  });
};

/**
 * 建设项目站点
 * @param {*} params
 * @returns
 */
export const getProjectSite = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialBigScreen/projectSite`,
    method: "get",
    params,
  });
};

// 供应商考核
export const supplierEvaluation = (params) => {
  const { deptName } = params
  const data = (!deptName || deptName.includes('南京') ) 
  ? [{
      supperName: '山东龙祥新材料科技有限公司',
      num: 1,
      amount: 0.72
    }]
  : []
  return Promise.resolve({
    success: true,
    data: data
  })
  // return request({
  //   url: `${VUE_APP_PRODMGR_INV}/materialBigScreen/projectSite`,
  //   method: "get",
  //   params,
  // });
};

// 自购物资统计
// Material Purchase Big Screen Controller------------------------------------------------------------------------------------------------------------------------------------------------------------------


/**
 * 自购物资分页查询
 * @param {*} params
 * @returns
 */
export const purchaseList = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/purchase/item/list`,
    method: "get",
    params,
  });
};


/**
 * 自购物资合同核备数
 * @param {*} params
 * @returns
 */
export const groupByMonth = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseBigScreen/groupByMonth`,
    method: "get",
    params,
  });
};


/**
 * 物资种类合同核备数
 * @param {*} params
 * @returns
 */
export const groupByPurchaseType = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseBigScreen/groupByPurchaseType`,
    method: "get",
    params,
  });
};


/**
 * 物资种类合同核备金额
 * @param {*} params
 * @returns
 */
export const groupByPurchaseTypeAmount = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseBigScreen/groupByPurchaseTypeAmount`,
    method: "get",
    params,
  });
};


/**
 * 标段项目合同核备数
 * @param {*} params
 * @returns
 */
export const groupBySectionName = (params) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialPurchaseBigScreen/groupBySectionName`,
    method: "get",
    params,
  });
};
