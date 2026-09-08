import request from "@/utils/request";
const VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
export const list = (params) =>
  request({
    url: `${VUE_APP_PRODMGR_INV}/materialFirstFactory/list`,
    method: "get",
    params,
  });
export const detail = (id) =>
  request({
    url: `${VUE_APP_PRODMGR_INV}/materialFirstFactory/detail/${id}`,
    method: "get",
  });
export const save = (data) =>
  request({
    url: `${VUE_APP_PRODMGR_INV}/materialFirstFactory/save`,
    method: "post",
    data,
  });
export const batchRemove = (data) =>
  request({
    url: `${VUE_APP_PRODMGR_INV}/materialFirstFactory/batchRemove`,
    method: "post",
    data,
  });
