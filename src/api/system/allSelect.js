import request from "@/utils/request";
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

// 查询登录数据
export function loginSelect(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/login/logInToStatistics`,
    method: "get",
    params:data,
  });
}
// 查询项目数据报告
export function getSectionProjectReport(data) {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSectionProject/getSectionProjectReport`,
    method: "post",
    data:data,
  });
}