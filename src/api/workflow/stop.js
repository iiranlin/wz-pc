import request from '@/utils/request'
const VUE_APP_PRODMGR_MM = process.env.VUE_APP_PRODMGR_MM;
const VUE_APP_PRODMGR_SA = process.env.VUE_APP_PRODMGR_SA;
const VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;
const VUE_APP_PRODMGR_PU = process.env.VUE_APP_PRODMGR_PU;
const VUE_APP_PRODMGR_FA = process.env.VUE_APP_PRODMGR_FA;

// 撤回流程提交
export function flowStop(data) {
    const type = data.businessType.split('_')[0]
    const PRODMGR = { MM: VUE_APP_PRODMGR_MM, SA: VUE_APP_PRODMGR_SA, INV: VUE_APP_PRODMGR_INV, PU: VUE_APP_PRODMGR_PU, FA: VUE_APP_PRODMGR_FA }[type]
    return request({
        url: `${PRODMGR ||VUE_APP_PRODMGR_INV }/audit/stop`,
        method: 'post',
        data: data
    })
}