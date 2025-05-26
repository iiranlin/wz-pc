import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 库存数量查询
 * @param {*} params 
 * @returns 
 */
export const matlInventory = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/inventory/matlInventory`,
        method: 'post',
        data
    })
}

export const getInventoryNum = (data) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/inventory/getInventoryNum`,
        method: 'post',
        data
    })
}