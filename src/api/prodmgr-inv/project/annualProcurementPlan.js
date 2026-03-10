import request from '@/utils/request'
let VUE_APP_PRODMGR_INV = process.env.VUE_APP_PRODMGR_INV;

/**
 * 年度采购计划
 * @param {*} params
 * @returns
 */
// 计划列表
export const purchasePlanList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlan/list`,
        method: 'get',
        params
    })
}


// 详情
export const detail = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlan/detail/${id}`,
    method: 'get',
  })
}
// 计划录入
export const save = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlan/save`,
    method: 'post',
    data
  })
}

// 修改
export const edit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlan/save`,
    method: 'post',
    data
  })
}

// 批量删除
export const batchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlan/batchRemove`,
    method: 'post',
    data
  })
}

/**
 * 删除
 */
export const remove = (id) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSettlementYear/remove/${id}`,
    method: 'post',
  })
}

// 提交
export const submit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlan/submit`,
    method: 'post',
    data
  })
}

// 撤回
export const recall = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlan/recall`,
    method: 'post',
    data
  })
}
// 计划量调整保存
export const PlanQtySave = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlanQty/save`,
    method: 'post',
    data
  })
}
// 下拉框
export const getSectionProjectBySGDW = () => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/materialSectionProject/getSectionProjectBySGDW`,
    method: 'get',
  })
}
// 关联物资合同列表
export const zgContractListAndRelFlag = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlan/zgContractListAndRelFlag`,
        method: 'get',
        params
    })
}
// 合同查询物资列表
export const materialList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/materialPurchaseContractDetails/listAndRelPlanNumber`,
        method: 'get',
        params
    })
}
// 关联物资
export const saveRelationship = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlan/saveRelationship`,
    method: 'post',
    data
  })
}
/**
 * 计划量调整
 * @param {*} params
 * @returns
 */
// 计划量调整列表
export const planQtyList = (params) => {
    return request({
        url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlanQty/list`,
        method: 'get',
        params
    })
}

// 计划量调整提交
export const PlanQtySubmit = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlanQty/submit`,
    method: 'post',
    data
  })
}
// 计划量调整撤回
export const planQtyRecall = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlanQty/recall`,
    method: 'post',
    data
  })
}
// 计划量调整批量删除
export const planQtyBatchRemove = (data) => {
  return request({
    url: `${VUE_APP_PRODMGR_INV}/zgPurchasePlanQty/batchRemove`,
    method: 'post',
    data
  })
}


