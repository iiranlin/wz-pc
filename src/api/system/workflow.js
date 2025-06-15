import request from '@/utils/request'
import { Loading } from 'element-ui'
let VUE_APP_BASE_SERVER = process.env.VUE_APP_BASE_SERVER;
let VUE_APP_WORK_FLOW_SERVER = process.env.VUE_APP_WORK_FLOW_SERVER;
let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA;
let VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
let VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;
let VUE_APP_PRODMGR_FA = process.env.VUE_APP_PRODMGR_FA;

let loadingInstance = null;

function loading(){
    loadingInstance = Loading.service({  spinner: "el-icon-loading", background: "rgba(0, 0, 0, 0.7)", })
}

function closeLoading(){
  loadingInstance.close();
}

const businessType = (data) => {
    let type = '';
    const businessType = data.businessType.split('_')[0];
    if(businessType === 'SA'){
        type = VUE_APP_PRODMGR_SA;
    }else if(businessType === 'MM'){
        type = VUE_APP_PRODMGR_MM;
    }else if(businessType === 'INV'){
        type = VUE_APP_PRODMGR_INV;
    }else if(businessType === 'PU'){
      type = VUE_APP_PRODMGR_PU;
    } else if(businessType === 'FA'){
      type = VUE_APP_PRODMGR_FA;
    } else {
        type = VUE_APP_PRODMGR_INV
  }
    return type
}

/**
 * 审核通过
 * @param {*} data 
 * @returns 
 */
export const passWorkFlow = (data) => {
    loading()
    return request({
        url: `${businessType(data)}/audit/approve`,
        method: 'post',
        data
    }).finally(()=>closeLoading())
}

/**
 * 修改后通过
 * @param {*} data 
 * @returns 
 */
export const passEditWorkFlow = (data) => {
    return request({
        url: `${businessType(data)}/audit/modify/approve`,
        method: 'post',
        data
    })
}

/**
 * 审批驳回
 * @param {*} data 
 * @returns 
 */
export const rejectWorkFlow = (data) => {
    loading()
    return request({
        url: `${businessType(data)}/audit/reject`,
        method: 'post',
        data
    }).finally(closeLoading())
}

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

//获取下级审批人
export function activitiAssigneeList(taskId) {
  return request({
      url: `${VUE_APP_WORK_FLOW_SERVER}/wf/nextAssignee/${taskId}`,
      method: 'get',
  })
}

//提交时获取下级审批人
export function commitNextAssignee(data) {
    return request({
        url: `${VUE_APP_WORK_FLOW_SERVER}/wf/commitNextAssignee`,
        method: 'post',
        data
    })
}

/**
 * 待办数量
 * @param {*} params 
 * @returns 
 */
export const wfTodoCount = (params) => {
    return request({
        url: `${VUE_APP_WORK_FLOW_SERVER}/wf/todoCount`,
        method: 'get',
        params
    })
}

/**
 * 待处理列表
 * @param {*} params 
 * @returns 
 */
export const wfHandleList = (params) => {
    return request({
        url: `${VUE_APP_WORK_FLOW_SERVER}/wf/handleList`,
        method: 'get',
        params
    })
}