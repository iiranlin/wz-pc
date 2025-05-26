import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

//数据库表
export function listDbTable(query) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/getNoImportTable`,
    method: 'get',
    params: query
  })
}

//查询生成表数据
export function listTable(query) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/list`,
    method: 'get',
    params: query
  })
}

//导入表
export function importTable(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/importTable`,
    method: 'post',
    data: data
  })
}

//获取属性配置下拉框选项
export function columnSelectOptions() {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/columnSelectOptions`,
    method: 'get'
  })
}

//验证表单编号是否已存在
export function checkOnlFormCode(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/checkOnlFormCode`,
    method: 'post',
    data: data
  })
}

//保存
export function save(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate`,
    method: 'post',
    data: data
  })
}

//预览
export function previewCode(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/previewCode`,
    method: 'post',
    data: data
  })
}

//生成
export function generateCode(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/generateCode`,
    method: 'post',
    data: data
  })
}

//明细
export function detail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/detail/` + id,
    method: 'get',
  })
}

// 同步数据库
export function syncDb(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/syncDb/` + id,
    method: 'post'
  })
}

//获取表单表/列
export function getFormTableColumn(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/getFormTableColumn`,
    method: 'post',
    data: data
  })
}

//获取基础信息和列信息
export function getBaseInfoAndTable(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/getBaseInfoAndTable`,
    method: 'post',
    data: data
  })
}

//表单驱动保存
export function saveFormDriver(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/saveFormDriver`,
    method: 'post',
    data: data
  })
}

//删除
export function remove(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/code/generate/` + id,
    method: 'delete'
  })
}