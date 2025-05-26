<template>
    <div>
        <dialogWrapper ref="projectManagementOperate" title="项目详情">
            <template v-slot="{ query }">
                <projectManagementOperate :key="query.id" isDialog :dialogQuery="query"></projectManagementOperate>
            </template>
        </dialogWrapper>
        <dialogWrapper ref="demandPlanWorkbenchOperate" title="计划单详情">
            <template v-slot="{ query }">
                <demandPlanWorkbenchOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>

        </dialogWrapper>
        <dialogWrapper ref="materialArchivesOperate" title="物料详情">
            <template v-slot="{ query }">
                <materialArchivesOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>

        </dialogWrapper>
        <dialogWrapper ref="customerProfileAdd" title="客户详情">
            <template v-slot="{ query }">
                <customerProfileAdd :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="bomAdministrationOperate" title="BOM详情">
            <template v-slot="{ query }">
                <bomAdministrationOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="saleOrderOperate" title="销售详情">
            <template v-slot="{ query }">
                <saleOrderOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="saleShipmentMaintainOperate" title="销售出货详情">
            <template v-slot="{ query }">
                <saleShipmentMaintainOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="contractManagementOperate" title="合同详情">
            <template v-slot="{ query }">
                <contractManagementOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="standardProcessCreate" title="工序详情">
            <template v-slot="{ query }">
                <standardProcessCreate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="productionOrderOperate" title="生产详情">
            <template v-slot="{ query }">
                <productionOrderOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="processRouteOperate" title="工艺详情">
            <template v-slot="{ query }">
                <processRouteOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="supplierOperate" title="供应商详情">
            <template v-slot="{ query }">
                <supplierOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="inventoryQueryDetail" title="入库批次号详情">
            <template v-slot="{ query }">
                <inventoryQueryDetail :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="purchaseOrderOperate" title="采购订单详情">
            <template v-slot="{ query }">
                <purchaseOrderOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="createInventoryMaintenance" title="入库单详情">
            <template v-slot="{ query }">
                <createInventoryMaintenance :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="batchNoDetail" title="批次详情">
            <template v-slot="{ query }">
                <batchNoDetail :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="salesReturnOperate" title="退货详情">
            <template v-slot="{ query }">
                <salesReturnOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="purchasePlanOperate" title="采购计划详情">
            <template v-slot="{ query }">
                <purchasePlanOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="productionRejectedOperate" title="退料申请详情">
            <template v-slot="{ query }">
                <productionRejectedOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="qualityTestingOperate" title="质检详情">
            <template v-slot="{ query }">
                <qualityTestingOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="productionReceiveOperate" title="领料详情">
            <template v-slot="{ query }">
                <productionReceiveOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="outboundMaintenanceOperate" title="出库详情">
            <template v-slot="{ query }">
                <outboundMaintenanceOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="createTransferOutOrder" title="调拨单详情">
            <template v-slot="{ query }">
                <createTransferOutOrder :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="scrapHandleOperate" title="报废处置详情">
            <template v-slot="{ query }">
                <scrapHandleOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="createLendOrder" title="借出单详情">
            <template v-slot="{ query }">
                <createLendOrder :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="materialApplicationOperate" title="用料申请详情">
            <template v-slot="{ query }">
                <materialApplicationOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="purchaseReturnOperate" title="退供单详情">
            <template v-slot="{ query }">
                <purchaseReturnOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="lendReturnOrder" title="归还单详情">
            <template v-slot="{ query }">
                <lendReturnOrder :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="quotationOperate" title="报价单详情">
            <template v-slot="{ query }">
                <quotationOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="accountantCycleOperate" title="期间详情">
            <template v-slot="{ query }">
                <accountantCycleOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>


        <dialogWrapper ref="inventoryAdjustDetail" title="调整单详情">
            <template v-slot="{ query }">
                <inventoryAdjustDetail :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="inventorySheetMainDetail" title="盘点单详情">
            <template v-slot="{ query }">
                <inventorySheetMainDetail :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="preOperate" title="预投单详情">
            <template v-slot="{ query }">
                <preOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="selfResearchDemandOperate" title="需求计划详情">
            <template v-slot="{ query }">
                <selfResearchDemandOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="requirementPlanMaintenanceOperate" title="需求单详情">
            <template v-slot="{ query }">
                <requirementPlanMaintenanceOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="productionDamageOperate" title="制损单详情">
            <template v-slot="{ query }">
                <productionDamageOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="BOMAdministrationOperate" title="BOM详情">
            <template v-slot="{ query }">
                <BOMAdministrationOperate :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>

        <dialogWrapper ref="productionOrderReport" title="完工报告详情">
            <template v-slot="{ query }">
                <productionOrderReport :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
        <dialogWrapper ref="saleChart" title="详情">
            <template v-slot="{ query }">
                <saleChart :key="query.id" isDialog :dialogQuery="query" />
            </template>
        </dialogWrapper>
    </div>
</template>
<script>
import indexMixin from '@/views/mixins';
// 全局统一维护详情查看
export default {
    mixins: [indexMixin],
    name: 'DetailDialog',
    components: {
        productionOrderReport: () => import('@/views/productionManagement/productionOrder/components/report'),
        saleChart: () => import('@/views/saleManage/salesTracing/charts'),
        BOMAdministrationOperate: () => import('@/views/manufacturingFundamentals/BOMAdministration/BOMAdministrationOperate'),
        productionDamageOperate: () => import('@/views/productionManagement/productionDamage/components/operate'),
        salesReturnOperate: () => import('@/views/saleManage/salesReturn/salesReturnOperate'),
        batchNoDetail:() => import('@/views/warehouseManage/inventoryManage/inventoryQuery/detail'),
        createInventoryMaintenance: () => import('@/views/warehouseManage/warehousing/inventoryMaintenance/operate'),
        purchaseOrderOperate: () => import('@/views/purchasingManagement/purchaseOrder/purchaseOrderOperate'),
        dialogWrapper: () => import('@/views/components/dialogWrapper'),
        projectManagementOperate: () => import('@/views/purchasingManagement/projectManagement/projectManager/components/projectManagementOperate'),
        demandPlanWorkbenchOperate: () => import('@/views/demandManagement/demandPlan/demandPlanWorkbench/demandPlanWorkbenchOperate'),
        materialArchivesOperate: () => import('@/views/publicFoundation/materialAdministration/materialArchives/materialArchivesOperate'),
        customerProfileAdd: () => import('@/views/saleManage/customerProfile/components/customerProfileAdd'),
        bomAdministrationOperate: () => import('@/views/manufacturingFundamentals/BOMAdministration/BOMAdministrationOperate'),
        saleOrderOperate: () => import('@/views/saleManage/saleOrder/saleOrderOperate'),
        saleShipmentMaintainOperate: () => import('@/views/saleManage/saleShipmentMaintain/saleShipmentMaintainOperate'),
        contractManagementOperate: () => import('@/views/purchasingManagement/projectManagement/contractManagement/components/contractManagementOperate'),
        standardProcessCreate: () => import('@/views/manufacturingFundamentals/processAdministration/standardProcess/components/standardProcessCreate'),
        productionOrderOperate: () => import('@/views/productionManagement/productionOrder/components/operate'),
        processRouteOperate: () => import('@/views/manufacturingFundamentals/processAdministration/processRoute/components/operate'),
        supplierOperate: () => import('@/views/purchasingManagement/supplier/components/supplierOperate'),
        inventoryQueryDetail: () => import('@/views/warehouseManage/inventoryManage/inventoryQuery/detail'),
        purchasePlanOperate: () => import('@/views/purchasingManagement/purchasePlan/components/purchasePlanOperate'),
        productionRejectedOperate: () => import('@/views/productionManagement/productionRejected/components/operate'),
        qualityTestingOperate: () => import('@/views/qualityAssurance/qualityTesting/qualityTestingOperate'),
        productionReceiveOperate: () => import('@/views/productionManagement/productionReceive/components/operate'),
        outboundMaintenanceOperate: () => import('@/views/warehouseManage/outbound/outboundMaintenance/components/outboundMaintenanceOperate'),
        createTransferOutOrder: () => import('@/views/warehouseManage/transferManagement/transferOutOrder/operate'),
        scrapHandleOperate: () => import('@/views/warehouseManage/scrapManage/scrapHandle/scrapHandleOperate'),
        createLendOrder: () => import('@/views/warehousBorrowReturn/lendManage/components/operate'),
        materialApplicationOperate: () => import('@/views/demandManagement/operationManagement/materialApplicationMaintenance/materialApplicationOperate'),
        purchaseReturnOperate: () => import('@/views/purchasingManagement/purchaseReturn/components/purchaseReturnOperate'),
        lendReturnOrder: () => import('@/views/warehousBorrowReturn/lendManage/components/return'),
        quotationOperate: () => import('@/views/saleManage/quotationOrder/components/quotationOperate'),
        accountantCycleOperate: () => import('@/views/calculateManagement/baseSetting/accountantCycle/components/operate'),
        inventorySheetMainDetail: () => import('@/views/warehouseManage/inventoryManage/inventorySheetMain/operate'),
        inventoryAdjustDetail: () => import('@/views/warehouseManage/inventoryManage/inventorySheetMain/components/inventoryAdjustDetail'),
        preOperate: () => import('@/views/saleManage/preOrder/components/preOperate'),
        selfResearchDemandOperate: () => import('@/views/demandManagement/selfResearch/selfResearchDemand/selfResearchDemandOperate'),
        requirementPlanMaintenanceOperate: () => import('@/views/demandManagement/operationManagement/requirementPlanMaintenance/requirementPlanMaintenanceOperate')
    },
}
</script>