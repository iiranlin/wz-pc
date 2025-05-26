import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;
// 权限列表
export function aclList(params, roleId) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/acl/list/${roleId}`,
        method: 'get',
        params
    })
  }
// 分配权限
export function aclAssign(data) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/acl/assign`,
        method: 'post',
        data
    })
}
