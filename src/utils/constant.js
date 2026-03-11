export const alignList = [
    { code: "left", name: "居左" },
    { code: "center", name: "居中" },
    { code: "right", name: "居右" },
]

export default {
    API_PUBLIC_KEY: "045429c430cf25b13f1890bcd27882d001bfa33d16998356a392a9bc654b37f2daaf36ab336b4ddbd0605e456cbbbcb05b5d7788355c7fe09d0021ae41619a0f0c",
}

// 流程审批节点类型
export const ACTIVITI_ASSUGNEE = {
    PU_PROJECT: 'PU_PROJECT', // 项目维护
    PU_CT: 'PU_CT', // 合同维护
    SA_XSD: 'SA_XSD', // 销售订单维护
    SA_CHD: 'SA_CHD', // 销售出货维护
    SA_CU: 'SA_CU', // 客户档案维护
    SA_BJD: 'SA_BJD', // 报价单维护
    SA_YTDD: 'SA_YTDD', // 预投单维护
    PU_NP: 'PU_NP', // 需求计划维护
    PU_MA: 'PU_MA', // 用料申请维护
    PU_PP: 'PU_PP', // 采购计划维护
    PU_OR: 'PU_OR', // 采购订单维护
    PU_SU: 'PU_SU', // 供应商档案维护
    INV_ZJD: 'INV_ZJD', // 质检单维护
    MM_BOM: 'MM_BOM', // BOM维护
    MM_PATH: 'MM_PATH', // 工艺路线
    MM_ORDER: 'MM_ORDER', //  生产订单
    SA_THD: 'SA_THD', // 销售退货单
    MM_RETURN: 'MM_RETURN', // 退料单
    PU_REFUND: 'PU_REFUND', // 退供单
    MM_ST: 'MM_ST', // 报工单
    MM_WGBG: 'MM_WGBG', // 完工报告
    MM_ZSD: 'MM_ZSD', // 质损单
    MM_LLD: 'MM_LLD', // 领料单
    FA_KJQJ: 'FA_KJQJ', // 会计期间
    MM_ZYXQ: 'MM_ZYXQ', // 自研需求
    MM_XQJH: 'MM_XQJH', // 需求计划
    MM_GXLZ: 'MM_GXLZ', // 工序流转卡
    INV_TZD: 'INV_TZD', // 调整单
    INV_DBD: 'INV_DBD', // 调出单
    INV_BFSQ: 'INV_BFSQ', // 报废申请
    INV_BFCZ: 'INV_BFCZ', // 报废处置
    INV_JCD: 'INV_JCD', // 借出单
    INV_GHD: 'INV_GHD', // 归还单
    MM_SCBG: 'MM_SCBG', // 生产变更
    INV_ADJUST_IN: 'INV_ADJUST_IN', // 入库调整单
    FBYLXQ:'FBYLXQ' ,//分部用料需求
	CGWJ:'detailPurchase', // 采购文件
	CGHT:'detailPurchaseContract', // 采购合同
}

// 审批类型对应的路由

export const FLOW_ROUTE = {
    SA_CU: 'customerProfileAdd', //客户
    MM_BOM: 'BOMAdministrationOperate', //BOM
    SA_XSD: 'saleOrderOperate', //销售订单
    INV_BFSQ: 'scrapApplyOperate', //报废申请
    INV_BFCZ: 'scrapHandleOperate', //报废处置
    INV_TZD: 'inventoryAdjustDetail', //调整单
    INV_JCD: 'createLendOrder', //借出单
    INV_ZJD: 'qualityTestingOperate', //质检单
    INV_GHD: 'lendReturnOrder', //归还单
    INV_DBD: 'createTransferOutOrder', //调拨单
    MM_ZYXQ: 'selfResearchDemandOperate', //自研需求
    MM_XQJH: 'demandPlanWorkbenchOperate', //需求计划
    MM_GXLZ: 'processFlowOperate', //工序流转
    MM_PATH: 'processRouteCreate', //工艺路线
    MM_ORDER: 'productionOrderOperate', //生产订单
    PU_PROJECT: 'projectManagementOperate', //项目
    SA_CHD: 'saleShipmentMaintainOperate', //出货单
    PU_CT: 'contractManagementOperate', //合同
    PU_NP: 'requirementPlanMaintenanceOperate',//运营需求计划
    PU_MA: 'materialApplicationOperate', //用料申请
    PU_PP: 'purchasePlanOperate', //采购计划
    PU_OR: 'purchaseOrderOperate', //采购订单
    PU_SU: 'supplierOperate', //供应商
    SA_THD: 'salesReturnOperate', //退货单
    MM_RETURN: 'productionRejectedOperate', //退料单
    PU_REFUND: 'purchaseReturnOperate', //退供单
    MM_ST: 'productionPieceworkOperate', //报工
    MM_WGBG: 'productionOrderReport', // 完工报告
    MM_ZSD: 'productionDamageOperate', // 质损单
    MM_LLD: 'productionReceiveOperate', // 领料单
    SA_BJD: 'quotationOperate', // 报价单
    FA_KJQJ: 'accountantCycleOperate', // 会计期间
    SA_YTDD: 'preOperate', // 预投单
    MM_SCBG: 'productionChangeOperate', // 生产变更
    INV_ADJUST_IN: 'inventoryAdjustOperate', // 入库调整单
    FBYLXQ: 'requestReviewDetail',//分部用料需求审核详情
    YLXQ: 'requestReviewDetail',//总部用料需求审核详情
    FBYLJH: 'planReviewDetail',//分部甲供计划审核详情
    YLJH:'planReviewDetail',//总部甲供计划审核详情
    WZML:'itemAuditDetail',//甲供物资审核详情
    RKLC:'imDetail',
    SHLC:'receivePage',
	CGWJ:'detailPurchase', // 采购文件
	CGHT:'detailPurchaseContract', // 采购合同
    FHLC:'addSend',
    WZCJ: 'addSpok'
}

// 生产变更日志
export const PRODUCT_CHANGE_LOGS = {
    1: '修改计划数量',
    2: '修改计划开始日期',
    3: '修改计划完成日期',
    4: '修改BOM版本',
    5: '修改工艺版本',
    6: '修改材料信息',
    7: '修改工艺信息',

}