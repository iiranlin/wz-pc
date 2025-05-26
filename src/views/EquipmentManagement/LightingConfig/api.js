import request from '@/utils/requestCopy'
let VUE_APP_SA_SERVER = process.env.VUE_APP_SA_SERVER;
let VUE_APP_BASE_SERVER = process.env.VUE_APP_BASE_SERVER;
let VUE_APP_WORK_FLOW_SERVER = process.env.VUE_APP_WORK_FLOW_SERVER;

// 获取照明区域数据
export function getLightAreaList() {
	return request({
		url: `/conRegionDevice/region-device-list`,
		method: 'get',
	})
}
// 获取区域回路信息
export function getLoopList() {
	return request({
		url: `/regionloop/list`,
		method: 'get',
	})
}
// 根据id获取区域回路
export function getLoopById(params) {
	return request({
		url: `/regionloop/selectid`,
		method: 'get',
		params
	})
}
// 新增控制区域
export function addRegion(data) {
	return request({
		url: `/conRegionDevice/addregion`,
		method: 'post',
		data
	})
}
// 修改控制区域
export function updateRegion(data) {
	return request({
		url: `/conRegionDevice/updateregion`,
		method: 'post',
		data
	})
}
// 新增区域回路
export function addLoop(data) {
	return request({
		url: `/regionloop/save`,
		method: 'post',
		data
	})
}
// 修改区域回路
export function updateLoop(data) {
	return request({
		url: `/regionloop/update`,
		method: 'post',
		data
	})
}
// 删除回路
export function deleteLoop(data) {
	return request({
		url: `/regionloop/delate?id=${data}`,
		method: 'post',
	})
}

// 查询某条回路信息
export function getLoopDetail(data) {
	return request({
		url: `/regionloop/selectbyde?id=${data}`,
		method: 'post',
	})
}
