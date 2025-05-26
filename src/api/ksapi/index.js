import request from '@/utils/requestCopy'

// 一、今日能耗统计：
// 登录用户信息
export function getTodayEnergyUserInfo() {
  return request({
    url: '/user-info',
    method: "get"
  })
}

// 能耗管理今日能耗所属车站列表
export function listStation() {
  return request({
    url: '/device/listSearch-StationAndRegion',
    method: "get"
  })
}

// 能耗管理今日能耗查询设备类型列表
export function listDeviceCategory() {
  return request({
    url: '/energy/getDeviceTypeForEnergyConsumer',
    method: "get"
  })
}

// 能耗管理今日能耗查询设备区域列表
export function listDeviceArea() {
  return request({
    url: '/energy/getRegionForEnergyConsumer',
    method: "get"
  })
}

// 能耗管理今日能耗电表能耗列表查询
export function todayEnergyList(params) {
  return request({
    url: '/energy/energyConsumerSta',
    method: "get",
    params: params
  })
}

// 水表区域
export function listWaterArea(params) {
  return request({
    url: '/energy/getWaterArea',
    method: "get",
    params: params
  })
}

// 能耗管理今日能耗水表能耗列表查询
export function todayEnergyWaterList(params) {
  return request({
    url: '/energy/waterConsumerSta',
    method: "get",
    params: params
  })
}

// 二、历史能耗统计：
// 能耗管理历史能耗电表能耗列表查询
export function historyEnergyStatisticsList(params) {
  return request({
    url: '/energy/getStatisticsList',
    method: "get",
    params: params
  })
}

// 能耗管理历史能耗水表能耗列表查询
export function historyShuiEnergyStatisticsList(params) {
  return request({
    url: '/energy/getWaterStatisList',
    method: "get",
    params: params
  })
}

// 三、仪表能耗统计：
// 能耗管理仪表能耗电表列表查询
export function dianInstrumentStatisticsList(params) {
  return request({
    url: '/energy/getElectData',
    method: "get",
    params: params
  })
}
