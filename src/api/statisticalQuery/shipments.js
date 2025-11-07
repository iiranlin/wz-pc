import request from '@/utils/request'
let VUE_APP_WORK_FLOW_SERVER = process.env.VUE_APP_WORK_FLOW_SERVER;

/**
 * 审批列表
 * @param {*} params 
 * @returns 
 */
export const auditList = (params) => {
  return request({
      url: `${VUE_APP_WORK_FLOW_SERVER}/wf/todoList`,
      method: 'get',
      params
  })
}