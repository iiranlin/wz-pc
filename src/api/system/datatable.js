import request from '@/utils/request'
let VUE_APP_BASE_PREFIX = process.env.VUE_APP_BASE_SERVER;

// 查询所有表
export function allListDbTable(params) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/system/datatable/getTableList`,
        method: 'get',
        params
    })
}

// 根据表名获得字段
export function columnByTableName(tableName) {
    return request({
        url: `${VUE_APP_BASE_PREFIX}/system/datatable/getColumnByTableName/${tableName}`,
        method: 'get',
    })
}
