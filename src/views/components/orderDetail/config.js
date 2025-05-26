import { pickingReviewDetail } from '@/api/projectManagement/productionReviewQuery'
import { inventoryList, getInventoryList } from '@/api/warehouseManage/inventoryManage'
import {purNoInDetail} from '@/api/prodmgr-pu/order'
import {saCtDetail as demandSaCtDetail} from '@/api/prodmgr-mm/demandPlan'
import {saCtDetail as mmSaCtDetail} from '@/api/projectManagement/productionOrder'
import {saCtDetail as inSaCtDetail} from '@/api/calculateManagement/procure'
import {saCtDetail as outSaCtDetail} from '@/api/warehouseManage/outboundMaintenance'
import {saCtDetail as reSaCtDetail} from '@/api/prodmgr-sa/return'


import { detailListByCt, placeListByCt, orderListByCt, getDetailList, getReturnList, getDetailListByCt, getPlaceListByCt } from '@/api/prodmgr-pu/Ct'
import {rawDetailInDetailList, balanceDetailInDetailList} from '@/api/calculateManagement/produce'
const ENUM = {
    CG: 'CG', // 已生成采购订单数量
    RK: 'RK', // 已生成入库单数量
    HW: 'HW',  // 已完成入库单数量
    TH: 'TH', // 已生成退货单数量
    WC: 'WC',  // 已出库完成数量
    SC: 'SC', // 已生成出货单数量
    XS: 'XS', // 已生成销售订单数量
    inventoryNum: 'inventoryNum',// 当前库存量
    pickingQuoteNum: 'pickingQuoteNum',// 已生成领料单数量(累计)
    outQuoteNum: 'outQuoteNum', // 已生成出库单数量(累计)
    outNum: 'outNum',// 已出库完成数量(累计)
    returnQuoteNum: 'returnQuoteNum', // 已生成退料单数量(累计)
    qiNum: 'qiNum', // 已生成质检单数量(累计)
    qiFinishNum: 'qiFinishNum', // 已质检完成数量(累计)
    totalQualifiedNum: 'totalQualifiedNum', // 质检合格数量
    totalUnqualifiedNum: 'totalUnqualifiedNum', // 质检不良数量
    damageNum: 'damageNum', // 质检制损件数量
    inNum: 'inNum',  // 已完成入库单数量(累计)
    totalInNum: 'totalInNum', // 产品入库完成数量
    inCount: 'inCount', // 已生成入库单数量（累计）
    inFinishNum: 'inFinishNum', //已入库完成数量（累计） 
    invNum: 'invNum', // 生产计划库存数量
    purNoInNum: 'purNoInNum', // 采购订单未入库量
    demandNum: 'demandNum',
    produceNum: 'produceNum',
    deliveryNum: 'deliveryNum',
    produceInNum: 'produceInNum',
    returnNum: 'returnNum',

}
// 表格表头配置
const TBALE_HEADERS = {
    [ENUM.invNum]: [
        { prop: 'unitName', label: '所属组织',  align: 'left' },
        { prop: 'projectCode', label: '项目编码', link: 'projectId', refName: 'projectManagementOperate', align: 'center' },
        { prop: 'projectName', label: '项目名称', align: 'left' },
        { prop: 'warehouseName', label: '仓库名称', align: 'left' },
        { prop: 'warehouseCode', label: '货位编码', align: 'center' },
        { prop: 'inventoryNum', label: '存储数量', align: 'right' },
        { prop: 'batchNo', label: '批次号', link: 'batchNo',refName: 'batchNoDetail', align: 'center' },
    ],
    [ENUM.purNoInNum]: [
        { prop: 'purCode', label: '采购单号', link: 'purOrderId', refName: 'purchaseOrderOperate', align: 'center' },
        { prop: 'purNum', label: '单据原量', align: 'right' },
        { prop: 'inCode', label: '入库单号', link: 'inId', refName: 'createInventoryMaintenance', align: 'center' },
        { prop: 'inFinishNum', label: '入库完数量', align: 'right' },
        { prop: 'noFinishNum', label: '未入库数量', align: 'right', sye: {color: '#77b90f', 'font-weight':700} },
    ],
    [ENUM.CG]: [
        { prop: 'status', label: '审批状态', dict: 'flowStatus', align: 'center' },
        { prop: 'purCode', label: '采购单号', link: 'purOrderId', refName: 'purchaseOrderOperate', align: 'center' },
        { prop: 'rowNum', label: '采购单行号', align: 'center' },
        { prop: 'purNum', label: '订单数量', align: 'right' },
    ],
    [ENUM.RK]: [
        { prop: 'inCode', label: '入库单号', link: 'inId', refName: 'createInventoryMaintenance', align: 'center' },
        { prop: 'qualifiedInNum', label: '本次入库数量', tooltip: '只计合格品' , align: 'right'},
    ],
    [ENUM.HW]: [
        { prop: 'quWarehouseName', label: '入货仓库', align: 'left' },
        { prop: 'placeName', label: '上架货位', align: 'left' },
        { prop: 'batchNo', label: '入库批次', link: 'batchNo', refName: 'inventoryQueryDetail', align: 'center' },
        { prop: 'groundingNum', label: '上架数量', tooltip: '只计合格品', align: 'right' },
    ],
    [ENUM.TH]: [
        { prop: 'status', label: '审批状态', dict: 'flowStatus', align: 'center' },
        { prop: 'returnCode', label: '退货单号', link: 'returnId', refName: 'salesReturnOperate', align: 'center' },
        { prop: 'returnNum', label: '本次退货数量', align: 'right' },
    ],
    [ENUM.WC]: [
        { prop: 'warehouseName', label: '出货仓库', align: 'left' },
        { prop: 'placeName', label: '下架货位', align: 'left' },
        { prop: 'batchNo', label: '下架批次', link: 'batchNo', refName: 'batchNoDetail', align: 'center' },
        { prop: 'offShelfNum', label: '下架数量', align: 'right' },
    ],
    [ENUM.SC]: [
        { prop: 'status', label: '审批状态', dict: 'flowStatus', align: 'center' },
        { prop: 'saleOrderCode', label: '出货单号', link: 'deliveryId', refName: 'saleShipmentMaintainOperate', align: 'center' },
        { prop: 'deliveryNum', label: '本次出货数量', align: 'right' },
    ],
    [ENUM.XS]: [
        { prop: 'status', label: '审批状态', dict: 'flowStatus', align: 'center' },
        { prop: 'saleOrderCode', label: '销售单号', link: 'saleOrderId', refName: 'saleOrderOperate', align: 'center' },
        { prop: 'matlNum', label: '订单数量', align: 'right' },
    ],
    [ENUM.inventoryNum]: [
        { prop: 'placeName', label: '货位编码', align: 'center' },
        { prop: 'batchNo', label: '批次号', link: 'batchNo', refName: 'batchNoDetail', align: 'center' },
        { prop: 'inventoryNum', label: '存储数量', align: 'right' },
    ],
    [ENUM.pickingQuoteNum]: [
        { prop: 'orderRawCode', label: '生产单号', link: 'orderRawId', refName: 'productionOrderOperate', align: 'center' },
        { prop: 'pickingCode', label: '领料单号', link: 'id', refName: 'productionReceiveOperate', align: 'center' },
        { prop: 'pickingNum', label: '本次领料数量', align: 'right' },
        { prop: 'status', label: '审批状态', dict: 'flowStatus', align: 'center' },
        { prop: 'bizStatus', label: '业务状态', dict: 'PickingBizStatus', align: 'center' },
    ],
    [ENUM.outQuoteNum]: [
        { prop: 'sourceCode', label: '来源单号', link: 'sourceId', refName: 'productionReceiveOperate', align: 'center' },
        { prop: 'sourceRowNum', label: '来源行号', align: 'center' },
        { prop: 'outCode', label: '出库单号', link: 'id', refName: 'outboundMaintenanceOperate', align: 'center' },
        { prop: 'outNum', label: '本次出库数量', align: 'right' },
        { prop: 'bizStatus', label: '业务状态', dict: 'outboundOrderStatus', align: 'center' },
    ],
    [ENUM.outNum]: [
        { prop: 'outCode', label: '出库单号', link: 'id', refName: 'outboundMaintenanceOperate', align: 'center' },
        { prop: 'placeCode', label: '下架货位', align: 'left' },
        { prop: 'offShelfNum', label: '下架数量', align: 'right' },
        { prop: 'batchNo', label: '批次号', link: 'batchNo', refName: 'batchNoDetail', align: 'center' },
    ],
    [ENUM.returnQuoteNum]: [
        { prop: 'orderRawCode', label: '生产单号', link: 'orderRawId', refName: 'productionOrderOperate', align: 'center' },
        { prop: 'returnCode', label: '退料单号', link: 'id', refName: 'productionRejectedOperate', align: 'center' },
        { prop: 'needNum', label: '需求数量', align: 'right' },
        { prop: 'outNum', label: '已出库完成数量(累计)', align: 'right' },
        { prop: 'returnNum', label: '本次退料数量', align: 'right' },
    ],
    [ENUM.qiNum]: [
        { prop: 'sourceCode', label: '来源单号', link: 'sourceId', refName: 'productionRejectedOperate', align: 'center' },
        { prop: 'sourceRowNum', label: '来源行号', align: 'center' },
        { prop: 'qiCode', label: '质检单号', link: 'qiOrderId', refName: 'qualityTestingOperate', align: 'center' },
        { prop: 'qiNum', label: '本次可质检数量', align: 'right' },
        { prop: 'totalQualifiedNum', label: '已质检合格数量', align: 'right' },
        { prop: 'totalUnqualifiedNum', label: '已质检不良数量', align: 'right' },
        { prop: 'damageNum', label: '已质检制损数量', align: 'right' },
    ],
    [ENUM.qiFinishNum]: [
        { prop: 'sourceCode', label: '来源单号', link: 'sourceId', refName: 'productionRejectedOperate', align: 'center' },
        { prop: 'sourceRowNum', label: '来源行号', align: 'center' },
        { prop: 'qiCode', label: '质检单号', link: 'qiOrderId', refName: 'qualityTestingOperate', align: 'center' },
        { prop: 'qiNum', label: '本次可质检数量', align: 'right' },
        { prop: 'totalQualifiedNum', label: '已质检合格数量', align: 'right' },
        { prop: 'totalUnqualifiedNum', label: '已质检不良数量', align: 'right' },
        { prop: 'damageNum', label: '已质检制损数量', align: 'right' },
    ],
    [ENUM.totalQualifiedNum]: [
        { prop: 'sourceCode', label: '来源单号', link: 'sourceId', refName: 'productionRejectedOperate', align: 'center' },
        { prop: 'sourceRowNum', label: '来源行号', align: 'center' },
        { prop: 'qiCode', label: '质检单号', link: 'qiOrderId', refName: 'qualityTestingOperate', align: 'center' },
        { prop: 'qiNum', label: '本次可质检数量', align: 'right' },
        { prop: 'totalQualifiedNum', label: '已质检合格数量', align: 'right' },
        { prop: 'totalUnqualifiedNum', label: '已质检不良数量', align: 'right' },
        { prop: 'damageNum', label: '已质检制损数量', align: 'right' },
    ],
    [ENUM.totalUnqualifiedNum]: [
        { prop: 'sourceCode', label: '来源单号', link: 'sourceId', refName: 'productionRejectedOperate', align: 'center' },
        { prop: 'sourceRowNum', label: '来源行号', align: 'center' },
        { prop: 'qiCode', label: '质检单号', link: 'qiOrderId', refName: 'qualityTestingOperate', align: 'center' },
        { prop: 'qiNum', label: '本次可质检数量', align: 'right' },
        { prop: 'totalQualifiedNum', label: '已质检合格数量', align: 'right' },
        { prop: 'totalUnqualifiedNum', label: '已质检不良数量', align: 'right' },
        { prop: 'damageNum', label: '已质检制损数量', align: 'right' },
    ],
    [ENUM.damageNum]: [
        { prop: 'sourceCode', label: '来源单号', link: 'sourceId', refName: 'productionRejectedOperate', align: 'center' },
        { prop: 'sourceRowNum', label: '来源行号', align: 'center' },
        { prop: 'qiCode', label: '质检单号', link: 'qiOrderId', refName: 'qualityTestingOperate', align: 'center' },
        { prop: 'qiNum', label: '本次可质检数量', align: 'right' },
        { prop: 'totalQualifiedNum', label: '已质检合格数量', align: 'right' },
        { prop: 'totalUnqualifiedNum', label: '已质检不良数量', align: 'right' },
        { prop: 'damageNum', label: '已质检制损数量', align: 'right' },
    ],
    [ENUM.inNum]: [
        { prop: 'sourceCode', label: '来源单号', link: 'sourceId', refName: 'productionRejectedOperate', align: 'center' },
        { prop: 'sourceRowNum', label: '来源行号', align: 'center' },
        { prop: 'qiCode', label: '质检单号', link: 'qiOrderId', refName: 'qualityTestingOperate', align: 'center' },
        { prop: 'inCode', label: '入库单号', link: 'id', refName: 'createInventoryMaintenance', align: 'center' },
        { prop: 'qualifiedInNum', label: '合格品已完成入库数量', align: 'right' },
        { prop: 'unqualifiedInNum', label: '不良品已完成入库数量', align: 'right' },
    ],
    [ENUM.totalInNum]: [
        { prop: 'orderCode', label: '生产单号', link: 'orderId', refName: 'productionOrderOperate', align: 'center' },
        { prop: 'inCode', label: '入库单号', link: 'inDetailId', refName: 'createInventoryMaintenance', align: 'center' },
        { prop: 'waitInNum', label: '本次待入库数量', align: 'right' },
        { prop: 'inNum', label: '本次入库完成数量', align: 'right' },
        { prop: 'inFinishDate', label: '本次入库完成日期', align: 'center' },
    ],
    [ENUM.inCount]: [
        { prop: 'orderCode', label: '生产单号', link: 'orderId', refName: 'productionOrderOperate', align: 'center' },
        { prop: 'inCode', label: '入库单号', link: 'inDetailId', refName: 'createInventoryMaintenance', align: 'center' },
        { prop: 'waitInNum', label: '本次待入库数量', align: 'right' },
        { prop: 'inNum', label: '本次入库完成数量', align: 'right' },
        { prop: 'inFinishDate', label: '本次入库完成日期', align: 'center' },
    ],
    [ENUM.inFinishNum]: [
        { prop: 'orderCode', label: '生产单号', link: 'orderId', refName: 'productionOrderOperate', align: 'center' },
        { prop: 'inCode', label: '入库单号', link: 'inDetailId', refName: 'createInventoryMaintenance', align: 'center' },
        { prop: 'waitInNum', label: '本次待入库数量', align: 'right' },
        { prop: 'inNum', label: '本次入库完成数量', align: 'right' },
        { prop: 'inFinishDate', label: '本次入库完成日期', align: 'center' },
    ],

    [ENUM.demandNum]: [
        { prop: 'status', label: '审批状态', align: 'center',  dict: 'flowStatus', },
        { prop: 'detailCode', label: '物料需求计划单号', link: 'planId', refName: 'demandPlanWorkbenchOperate', align: 'center' },
        { prop: 'planNum', label: '计划数量', align: 'right' },
    ],
    [ENUM.produceNum]: [
        { prop: 'status', label: '审批状态', align: 'center',  dict: 'flowStatus', },
        { prop: 'orderRawCode', label: '生产订单单号', link: 'orderRawId', refName: 'productionOrderOperate', align: 'center' },
        { prop: 'planNum', label: '预计生产数量', align: 'right' },
    ],
    [ENUM.deliveryNum]: [
        { prop: 'deliveryCode', label: '销售出货单号', link: 'deliveryId', refName: 'saleShipmentMaintainOperate', align: 'center' },
        { prop: 'outCode', label: '出库单号', link: 'outId', refName: 'outboundMaintenanceOperate', align: 'center' },
        { prop: 'outNum', label: '出库单任务数量', align: 'right' },
        { prop: 'outFinishNum', label: '本次出库完成数量', align: 'right' },
    ],
    [ENUM.produceInNum]: [
        { prop: 'inCode', label: '入库单号', link: 'inId', refName: 'createInventoryMaintenance', align: 'center' },
        { prop: 'inNum', label: '入库单任务数量', align: 'right' },
        { prop: 'inFinishNum', label: '本次入库完成数量', align: 'right' },
    ],
    [ENUM.returnNum]: [
        { prop: 'returnCode', label: '销售退货单号', link: 'returnId', refName: 'salesReturnOperate', align: 'center' },
        { prop: 'returnNum', label: '本次退货数量', align: 'right' },
    ],
}
// 主建配置
const ROW_KEY = {
    [ENUM.CG]: 'uId',
    [ENUM.RK]: 'inId',
    [ENUM.HW]: 'uId',
    [ENUM.TH]: 'uId',
    [ENUM.WC]: 'uId',
    [ENUM.SC]: 'uId',
    [ENUM.XS]: 'uId',
    [ENUM.inventoryNum]: 'uId',
    [ENUM.pickingQuoteNum]: 'uId',
    [ENUM.outQuoteNum]: 'uId',
    [ENUM.outNum]: 'uId',
    [ENUM.returnQuoteNum]: 'uId',
    [ENUM.qiNum]: 'uId',
    [ENUM.qiFinishNum]: 'uId',
    [ENUM.totalQualifiedNum]: 'uId',
    [ENUM.totalUnqualifiedNum]: 'uId',
    [ENUM.damageNum]: 'uId',
    [ENUM.inNum]: 'uId',
    [ENUM.totalInNum]: 'uId',
    [ENUM.inCount]: 'uId',
    [ENUM.inFinishNum]: 'uId',
    [ENUM.invNum]: 'uId',
    [ENUM.purNoInNum]: 'uId',

    [ENUM.demandNum]: 'uId',
    [ENUM.produceNum]: 'uId',
    [ENUM.deliveryNum]: 'uId',
    [ENUM.produceInNum]: 'uId',
    [ENUM.returnNum]: 'uId',
}

// 服务配置
const SERVICE_REQ = {
    [ENUM.CG]: orderListByCt,
    [ENUM.RK]: detailListByCt,
    [ENUM.HW]: placeListByCt,
    [ENUM.XS]: getDetailList,
    [ENUM.SC]: getPlaceListByCt,
    [ENUM.WC]: getDetailListByCt,
    [ENUM.TH]: getReturnList,
    [ENUM.inventoryNum]:inventoryList,
    [ENUM.pickingQuoteNum]:pickingReviewDetail,
    [ENUM.outQuoteNum]:pickingReviewDetail,
    [ENUM.outNum]:pickingReviewDetail,
    [ENUM.returnQuoteNum]:pickingReviewDetail,
    [ENUM.qiNum]:pickingReviewDetail,
    [ENUM.qiFinishNum]:pickingReviewDetail,
    [ENUM.totalQualifiedNum]:pickingReviewDetail,
    [ENUM.totalUnqualifiedNum]:pickingReviewDetail,
    [ENUM.damageNum]:pickingReviewDetail,
    [ENUM.inNum]:pickingReviewDetail,
    [ENUM.totalInNum]:rawDetailInDetailList,
    [ENUM.inCount]:balanceDetailInDetailList,
    [ENUM.inFinishNum]:balanceDetailInDetailList,
    [ENUM.invNum]:getInventoryList,
    [ENUM.purNoInNum]:purNoInDetail,

    [ENUM.demandNum]:demandSaCtDetail,
    [ENUM.produceNum]:mmSaCtDetail,
    [ENUM.deliveryNum]:outSaCtDetail,
    [ENUM.produceInNum]:inSaCtDetail ,
    [ENUM.returnNum]:reSaCtDetail,
}

export const configByType = (type) => {
    const config = {
        req: SERVICE_REQ[type],
        key: ROW_KEY[type],
        headers: TBALE_HEADERS[type]
    }
    return config
}