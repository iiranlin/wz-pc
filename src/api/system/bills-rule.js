import request from '@/utils/request'
let VUE_APP_BASE_SERVER = process.env.VUE_APP_BASE_SERVER;

// 单据规则维护查询列表
export function sysBillsRuleList(params) {
    return request({
        url: `${VUE_APP_BASE_SERVER}/sysBillsRule/list`,
        method: 'get',
        params
    })
}

// 单据规则维护删除
export function sysBillsRuleBatchRemove(data) {
    return request({
        url: `${VUE_APP_BASE_SERVER}/sysBillsRule/batchRemove`,
        method: 'post',
        data
    })
}

// 单据规则维护新增修改
export function sysBillsCodeCreateModify(data,type) {
    return request({
        url: `${VUE_APP_BASE_SERVER}/sysBillsRule/${type}`,
        method: 'post',
        data
    })
}

// 单据规则维护预览
export function sysBillsRulePreview(params) {
    return request({
        url: `${VUE_APP_BASE_SERVER}/sysBillsRule/preview`,
        method: 'get',
        params
    })
}