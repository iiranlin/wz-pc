
import request from '@/utils/requestCopy'
// 区域树
export function devicelistDevice (query) {
  return request({
    url:'/infRela-region/list'+query,
    method: "get",
  });
}
 //  设备树
export function devicelistItemTree (query) {
  return request({
    url:'/device-category/listItemTree'+query,
    method: "get",
  });
}
 /// 列表
export function devicelistDevicee (params) {
  return request({
    url:'/device/listDevice'+params,
    method: "get",
    // params:params,
  });
}
//  新增页面  设备分类
export function devicecategory (params) {
  return request({
    url:'device-category/list',
    method: "get",
    // params:params,
  });
}
//  新增页面  设备区域
export function deviceRecordlistRegionsByStationId (params) {
  return request({
    url:'/deviceRecord/listRegionsByStationId'+params,
    method: "get",
    // params:params,
  });
}
//  新增页面  所属车站
export function deviceRecordStationAndRegion (params) {
  return request({
    url:'/device/listSearch-StationAndRegion',
    method: "get",
    // params:params,
  });
}
// 新增修改接口  /device/verifyDataUnique
export function devicevVerifyDataUnique (params) {
  return request({
    url:'/device/verifyDataUnique',
    method: "post",
    params:params,
  });
}
// 批量删除
export function deviceDelete (params) {
  return request({
    url:'/device/delete-batch',
    method: "post",
    data:params,
  });
}
// 导出全部
export function deviceAlldetails (params) {
  return request({
    url:'/device/download-all-details',
    method: "post",
    data:params,
  });
}
// 详情图片
export function deviceCategoryImgUp (params) {
  return request({
    url:'/device-category/findImg'+params,
    method: "get",
  });
}
// 时间线详情
export function getDeviceInfo (params) {
  return request({
    url:'/device/getDeviceInfo'+params,
    method: "get",
  });
}
// 上传图片
export function deviceCategoryImgDeviceCategoryImgUp (params,data) {
  return request({
    url:'/deviceCategoryImg/deviceCategoryImgUp'+params,
    method: "post",
    data:data
  });
}
// 台账详情左下角   /deviceRecord/get-one
export function deviceRecordgetone (params) {
  return request({
    url:'/deviceRecord/get-one'+params,
    method: "get",
  });
}
// 设备导入
export function deviceDownload (params) {
  return request({
    url:'device/newUploadDeviceExcel',
    method: "post",
    data:params
  });
}


//  状态列表接口  /status/monitor
export function statusMonitor (params) {
  return request({
    url:'/status/monitor'+params,
    method: "get",
  });
}
// /device-category/querySmallCategoryIds   状态列表空调
export function querySmallCategoryIds () {
  return request({
    url:'/device-category/querySmallCategoryIds?code=05',
    method: "get",
  });
}
//    状态检测
export function getAirJC2 () {
  return request({
    url:'/smartAir-monitor/getAirJC2',
    method: "get",
  });
}
