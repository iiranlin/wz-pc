import request from '@/utils/request'
import {IDB} from '@/utils'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询表单列表
export function list(query) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/list`,
    method: 'get',
    params: query
  })
}

// 查询表单详细
export function detail(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/detail/` + id,
    method: 'get'
  })
}

// 新增表单
export function create(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/create`,
    method: 'post',
    data
  })
}

// 修改表单
export function modify(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/modify`,
    method: 'post',
    data
  })
}

// 删除表单
export function delForm(data) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/deleteBatch`,
    method: 'post',
    data
  })
}

// 表单发布
export function formPublish(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/publish/${id}`,
    method: 'get',
  })
}

// 获得填报页面配置
export function formFillInPage(formCode) {
  return new Promise(async (resolve, reject) => {
    try {
      // let res = await IDB.getObjectStore('fillInPage',formCode)
      // if(!res) {
         const res = await request({
          url: `${VUE_APP_BASE_PREFIX}/onl/form/fillInPage/${formCode}`,
          method: 'get',
        })
        // await IDB.setObjectStore('fillInPage',formCode, {data: res.data})
      // }
      resolve({data: res.data})
    }catch(err){
      reject(err)
    }
  })
}

// 获得填报页面配置
export function getFormTable(params) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/getFormTable`,
    method: 'get',
    params
  })
}

// 获得页面字段信息
export function getFormField(id) {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/getFormField/${id}`,
    method: 'get',
  })
}

/**
 * 生成建表SQL
 * @param {*} data 
 * @returns 
 */
export const geneCreateSql = (data) => {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/geneCreateSql`,
    method: 'post',
    data
  })
}

/**
 * 生成迁移SQL
 * @param {*} data 
 * @returns 
 */
export const geneUpdateSql = (data) => {
  return request({
    url: `${VUE_APP_BASE_PREFIX}/onl/form/geneUpdateSql`,
    method: 'post',
    data
  })
}