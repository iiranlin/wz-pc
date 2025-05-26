import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_WORK_FLOW_SERVER

export const workFlowHistoryList = (businessId) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/wf/historyList/${businessId}`,
        method: 'get',
    })
}

export const workFlowProcessViewer = (billId) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/wf/flowViewer/${billId}`,
        method: 'get',
    })
}

export const getBpmnXml = (modelId) => {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/model/bpmnXml/${modelId}`,
        method: 'get',
    })
}