import request from '@/utils/request'

const baseUrl = `${process.env.VUE_APP_PRODMGR_INV}/materialFirstReceipt`
const detailsBaseUrl = `${process.env.VUE_APP_PRODMGR_INV}/materialFirstReceiptDetails`

export function itemList(params) {
  return request({ url: `${baseUrl}/list`, method: 'get', params })
}

export function detail(id) {
  return request({ url: `${baseUrl}/detail/${id}`, method: 'get' })
}

export function add(data) {
  return request({ url: `${baseUrl}/create`, method: 'post', data })
}

export function edit(data) {
  return request({ url: `${baseUrl}/modify`, method: 'post', data })
}

export function save(data) {
  return request({ url: `${baseUrl}/save`, method: 'post', data })
}

export function remove(id) {
  return request({ url: `${baseUrl}/remove/${id}`, method: 'post' })
}

export function batchRemove(data) {
  return request({ url: `${baseUrl}/batchRemove`, method: 'post', data })
}

export function submit(data) {
  return request({ url: `${baseUrl}/submit`, method: 'post', data })
}

export function detailsList(params) {
  return request({ url: `${detailsBaseUrl}/list`, method: 'get', params })
}

export function detailsDetail(id) {
  return request({ url: `${detailsBaseUrl}/detail/${id}`, method: 'get' })
}

export function detailsAdd(data) {
  return request({ url: `${detailsBaseUrl}/create`, method: 'post', data })
}

export function detailsEdit(data) {
  return request({ url: `${detailsBaseUrl}/modify`, method: 'post', data })
}

export function detailsSave(data) {
  return request({ url: `${detailsBaseUrl}/save`, method: 'post', data })
}

export function detailsRemove(id) {
  return request({ url: `${detailsBaseUrl}/remove/${id}`, method: 'post' })
}

export function detailsBatchRemove(data) {
  return request({ url: `${detailsBaseUrl}/batchRemove`, method: 'post', data })
}
