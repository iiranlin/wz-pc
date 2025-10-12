import request from "@/utils/request";
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询登录数据
export function loginSelect(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/log/login/logInToStatistics`,
    method: "get",
    params:data,
  });
}
