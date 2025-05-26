import request from '@/utils/request'
let VUE_APP_WORK_FLOW_SERVER = process.env.VUE_APP_WORK_FLOW_SERVER

// 保存流程模型
export function saveModel(data) {
  return request({
    url: '/workflow/model/save',
    method: 'post',
    data: data
  })
}
