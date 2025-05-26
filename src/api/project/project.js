import request from '@/utils/request'

let VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA


/**
 * 项目分页查询
 */
export function getProjectByPage(params) {
    return request({
        url: `${VUE_APP_PRODMGR_SA}/project/list`,
        method: 'get',
        params
    })
}

/**
 * 项目新增修改
 */
export function projectCreateModify(data, type) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/project/${type}`,
        method: 'post',
        data
    })
}

/**
 * 项目保存并提交功能
 */
export function projectSaveAndSubmit(data) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/project/createAndsubmit`,
        method: 'post',
        data
    })
}

/**
 * 项目删除
 */
export function projectBatchRemove(data) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/project/batchRemove`,
        method: 'post',
        data
    })
}

/**
 * 项目详情
 */
export function projectDetail(id) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/project/detail/${id}`,
        method: 'get',
    })
}

/**
 * 项目提交
 */
export function projectSubmit(data) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/project/submit`,
        method: 'post',
        data
    })
}

/**
 * 项目撤回
 */
export function projectStop(data) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/project/stop`,
        method: 'post',
        data
    })
}

/**
 * 项目查询列表
 */
export function projectQuery(params) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/project/query`,
        method: 'get',
        params
    })
}

/**
 * 项目引用列表
 */
export function projectExternalList(params) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/project/externalList`,
        method: 'get',
        params
    })
}

/**
 * 项目补充合同
 */
export function projectSupplyContract(data) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/project/supplyContract`,
        method: 'post',
        data
    })
}
