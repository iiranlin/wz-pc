import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * meta : {
 noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
 title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
 icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
 breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
 activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
 }
 */

const typeName = {
    create: '新增',
    update: '修改',
    view: '详情',
    change: '变更',
    push: '下推'
}

// 根据环境变量选择登录组件
const getLoginComponent = () => {
    const loginType = process.env.VUE_APP_LOGIN_TYPE || 'old'
    if (loginType === 'old') {
        return () => import('@/views/login1')
    } else {
        return () => import('@/views/login')
    }
}

// 公共路由
export const constantRoutes = [
    {
        path: '/redirect',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '/redirect/:path(.*)',
                component: () => import('@/views/redirect')
            }
        ]
    },
    {
        path: '/login',
        component: getLoginComponent(),
        hidden: true
    },
    {
        path: '/portal',
        component: () => import('@/views/portal'),
        hidden: true
    },
    {
        path: '/404',
        component: () => import('@/views/error/404'),
        hidden: true
    },
    {
        path: '',
        component: Layout,
        redirect: 'index',
        children: [
            {
                path: 'index',
                component: () => import('@/views/dashboard/index'),
                name: 'Index',
                meta: { title: '工作台', icon: 'gongzuotai', affix: true, menuCode:"dashboard" }
            },
            {
                path: 'data-driver-edit',
                component: () => import('@/views/system/gene/components/data-driver'),
                name: 'data-driver-edit',
                meta: { title: '编辑数据驱动' },
                hidden: true
            },
            {
                path: 'form-driver-edit',
                component: () => import('@/views/system/gene/components/form-driver'),
                name: 'form-driver-edit',
                meta: { title: '编辑表单驱动' },
                hidden: true
            },
            {
                path: 'authUser',
                component: () => import('@/views/system/role/components/authUser'),
                name: 'roleUser',
                meta: { title: '分配用户' },
                hidden: true
            },
            {
                path: '/print',
                component: () => import('@/views/print/index.vue'),
                name: 'print',
                meta: { title: '打印', noCache: false },
                hidden: true
            },
            {
                path: '/todoList',
                component: () => import('@/views/dashboard/todoList.vue'),
                name: 'todoList',
                meta: { title: '我的发起', noCache: false },
                hidden: true
            },
        ]
    },
    {
        path: '/admin/design',
        name: 'WorkDesign',
        component: () => import('@/views/admin/FormProcessDesign.vue'),
        hidden: true,
        meta: { title: '表单流程设计' }
    },
    
    {
        path: '/saleManage',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'saleOrder/saleOrderOperate',
                component: () => import('@/views/saleManage/saleOrder/saleOrderOperate.vue'),
                name: 'saleOrderOperate',
                meta: { title: '销售订单', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `销售订单${typeName[to.query.type]}` : `${typeName[to.query.type]}销售订单`
                    next()
                }
            },
            {
                path: 'customerProfile/customerProfileAdd',
                component: () => import('@/views/saleManage/customerProfile/components/customerProfileAdd.vue'),
                name: 'customerProfileAdd',
                meta: { title: '客户档案', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `客户档案${typeName[to.query.type]}` : `${typeName[to.query.type]}客户档案`
                    next()
                }
            },
            {
                path: 'saleShipmentMaintain/saleShipmentMaintainOperate',
                component: () => import('@/views/saleManage/saleShipmentMaintain/saleShipmentMaintainOperate.vue'),
                name: 'saleShipmentMaintainOperate',
                meta: { title: '销售出货', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `销售出货${typeName[to.query.type]}` : `${typeName[to.query.type]}销售出货`
                    next()
                }
            },
            {
                path: 'salesReturn/salesReturnOperate',
                component: () => import('@/views/saleManage/salesReturn/salesReturnOperate.vue'),
                name: 'salesReturnOperate',
                meta: { title: '销售退货', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `销售退货${typeName[to.query.type]}` : `${typeName[to.query.type]}销售退货`
                    next()
                }
            },
            {
                path: 'quotationOrder/quotationOperate',
                component: () => import('@/views/saleManage/quotationOrder/components/quotationOperate.vue'),
                name: 'quotationOperate',
                meta: { title: '报价单', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `报价单${typeName[to.query.type]}` : `${typeName[to.query.type]}报价单`
                    next()
                }
            },
            {
                path: 'preOrder/preOperate',
                component: () => import('@/views/saleManage/preOrder/components/preOperate.vue'),
                name: 'preOperate',
                meta: { title: '预投单', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `预投单${typeName[to.query.type]}` : `${typeName[to.query.type]}预投单`
                    next()
                }
            },
        ]
    },
    {
        path: '/publicFoundation',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'materialAdministration/materialArchives/materialArchivesOperate',
                component: () => import('@/views/publicFoundation/materialAdministration/materialArchives/materialArchivesOperate.vue'),
                name: 'materialArchivesOperate',
                meta: { title: '物料信息', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `物料信息${typeName[to.query.type]}` : `${typeName[to.query.type]}物料信息`
                    next()
                }
            }
        ]
    },
    {
        path: '/manufacturingFundamentals',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '/processAdministration/standardProcessCreate',
                component: () => import('@/views/manufacturingFundamentals/processAdministration/standardProcess/components/standardProcessCreate.vue'),
                name: 'standardProcessCreate',
                meta: { title: '新增工序', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `工序${typeName[to.query.type]}` : `${typeName[to.query.type]}工序`
                    next()
                }
            },
            {
                path: '/processAdministration/processRouteCreate',
                component: () => import('@/views/manufacturingFundamentals/processAdministration/processRoute/components/operate.vue'),
                name: 'processRouteCreate',
                meta: { title: '新增工艺路线', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `工艺路线${typeName[to.query.type]}` : `${typeName[to.query.type]}工艺路线`
                    next()
                }
            }
        ]
    },
    {
        path: '/manufacturingFundamentals',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'BOMAdministration/BOMAdministrationOperate',
                component: () => import('@/views/manufacturingFundamentals/BOMAdministration/BOMAdministrationOperate.vue'),
                name: 'BOMAdministrationOperate',
                meta: { title: '新增BOM信息', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `BOM信息${typeName[to.query.type]}` : `${typeName[to.query.type]}BOM信息`
                    next()
                }
            },
            {
                path: 'BOManalysis/BOManalysisOperate',
                component: () => import('@/views/manufacturingFundamentals/BOManalysis/BOManalysisOperate.vue'),
                name: 'BOManalysisOperate',
                meta: { title: 'BOM差异比较', noCache: false },
            }
        ]
    },
    {
        path: '/warehouseManage',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'warehousFundamentals/areaOperate',
                component: () => import('@/views/warehouseManage/warehousFundamentals/area/areaOperate.vue'),
                name: 'areaOperate',
                meta: { title: '新增地区', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `仓储地区${typeName[to.query.type]}` : `${typeName[to.query.type]}仓储地区`
                    next()
                }
            },
            {
                path: 'warehousing/createInventoryMaintenance',
                component: () => import('@/views/warehouseManage/warehousing/inventoryMaintenance/operate.vue'),
                name: 'createInventoryMaintenance',
                meta: { title: '新增入库单', noCache: false },
                beforeEnter(to, from, next) {
                    if(to.query.type == 'product') {
                        to.meta.title = '生产入库单'
                    }else {
                        to.meta.title = to.query.type == 'view' ? `入库单${typeName[to.query.type]}` : `${typeName[to.query.type]}入库单`
                    }
                   next()
                }
            },
            {
                path: 'warehousing/arrivalDetails',
                component: () => import('@/views/warehouseManage/warehousing/arrivedGoodsConfirm/arrivalDetails.vue'),
                name: 'arrivalDetails',
                meta: { title: '到货详情', noCache: false },
            },
            {
                path: 'transferManagement/createTransferOutOrder',
                component: () => import('@/views/warehouseManage/transferManagement/transferOutOrder/operate.vue'),
                name: 'createTransferOutOrder',
                meta: { title: '新增调出单', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `调${to.query.operateType?to.query.operateType === 'out'? '出' : '入':'拨'}单${typeName[to.query.type]}` : `${typeName[to.query.type]}调${to.query.operateType === 'out'? '出' : '入'}单`
                    next()
                }
            },
          {
            path: 'outbound/outboundMaintenance/outboundMaintenanceOperate',
            component: () => import('@/views/warehouseManage/outbound/outboundMaintenance/components/outboundMaintenanceOperate.vue'),
            name: 'outboundMaintenanceOperate',
            meta: { title: '新增出库单', noCache: false },
            beforeEnter(to, from, next) {
                if(to.query.type == 'receive') {
                    to.meta.title= '领料出库单'
                }else {
                    to.meta.title = to.query.type == 'view' ? `出库单${typeName[to.query.type]}` : to.query.type == 'outbound'?'下推出库单':`${typeName[to.query.type]}出库单`
                }
              next()
            }
          },
          {
            path: 'productionManagement/productionOrder/productionOrderOperate',
            component: () => import('@/views/productionManagement/productionOrder/components/operate.vue'),
            name: 'productionOrderOperate',
            meta: { title: '新增生产订单', noCache: false },
            beforeEnter(to, from, next) {
                to.meta.title = to.query.type == 'view' ? `生产订单${typeName[to.query.type]}` :`${typeName[to.query.type]}生产订单`
              next()
            }
          },
          {
            path: 'productionManagement/productionChange/productionChangeOperate',
            component: () => import('@/views/productionManagement/productionChange/components/operate.vue'),
            name: 'productionChangeOperate',
            meta: { title: '新增生产变更', noCache: false },
            beforeEnter(to, from, next) {
                to.meta.title = to.query.type == 'view' ? `生产变更${typeName[to.query.type]}` :`${typeName[to.query.type]}生产变更`
              next()
            }
          },
          
          {
            path: 'productionManagement/productionDamage/productionDamageOperate',
            component: () => import('@/views/productionManagement/productionDamage/components/operate.vue'),
            name: 'productionDamageOperate',
            meta: { title: '制损单', noCache: false },
            beforeEnter(to, from, next) {
                to.meta.title = to.query.type == 'view' ? `制损单${typeName[to.query.type]}` :`${typeName[to.query.type]}制损单`
              next()
            }
          },
          {
            path: 'productionManagement/productionPiecework/productionPieceworkOperate',
            component: () => import('@/views/productionManagement/productionPiecework/components/operate.vue'),
            name: 'productionPieceworkOperate',
            meta: { title: '新增计时计件单', noCache: false },
            beforeEnter(to, from, next) {
                to.meta.title = to.query.type == 'view' ? `计时计件单${typeName[to.query.type]}` :`${typeName[to.query.type]}计时计件订单`
              next()
            }
          },
          {
            path: 'productionManagement/productionReceive/productionReceiveOperate',
            component: () => import('@/views/productionManagement/productionReceive/components/operate.vue'),
            name: 'productionReceiveOperate',
            meta: { title: '新增领料单', noCache: false },
            beforeEnter(to, from, next) {
                to.meta.title = to.query.type == 'view' ? `领料单${typeName[to.query.type]}` :`${typeName[to.query.type]}领料单`
              next()
            }
          },
          {
            path: 'saleManage/salesTracing/salesTracingCharts',
            component: () => import('@/views/saleManage/salesTracing/charts.vue'),
            name: 'salesTracingCharts',
            meta: { title: '全局联查', noCache: false },
            beforeEnter(to, from, next) {
              next()
            }
          },
          {
            path: 'productionManagement/productionOrder/productionOrderCharts',
            component: () => import('@/views/productionManagement/productionOrder/components/charts.vue'),
            name: 'productionOrderCharts',
            meta: { title: '全局联查', noCache: false },
            beforeEnter(to, from, next) {
              next()
            }
          },
          {
            path: 'productionManagement/productionOrder/productionOrderAnalysis',
            component: () => import('@/views/productionManagement/productionOrder/components/analysis.vue'),
            name: 'productionOrderAnalysis',
            meta: { title: '齐套分析', noCache: false },
            beforeEnter(to, from, next) {
              next()
            }
          },
          {
            path: 'productionManagement/productionOrder/productionOrderReport',
            component: () => import('@/views/productionManagement/productionOrder/components/report.vue'),
            name: 'productionOrderReport',
            meta: { title: '完工报告', noCache: false },
            beforeEnter(to, from, next) {
              next()
            }
          },
          {
            path: 'productionManagement/productionRejected/productionRejectedOperate',
            component: () => import('@/views/productionManagement/productionRejected/components/operate.vue'),
            name: 'productionRejectedOperate',
            meta: { title: '新增退料单', noCache: false },
            beforeEnter(to, from, next) {
                to.meta.title = to.query.type == 'view' ? `退料单${typeName[to.query.type]}` : `${typeName[to.query.type]}退料单`
              next()
            }
          },
          {
            path: 'inventoryManage/inventoryQuery/batchNoDetail',
            component: () => import('@/views/warehouseManage/inventoryManage/inventoryQuery/detail.vue'),
            name: 'batchNoDetail',
            meta: { title: '入库批次号详情', noCache: false },
            beforeEnter(to, from, next) {
              to.meta.title = `入库批次号详情`
              next()
            }
          },
          {
            path: 'inventoryManage/inventorySheetMain/inventorySheetMainDetail',
            component: () => import('@/views/warehouseManage/inventoryManage/inventorySheetMain/operate.vue'),
            name: 'inventorySheetMainDetail',
            meta: { title: '新增盘点单', noCache: false },
            beforeEnter(to, from, next) {
                to.meta.title = to.query.type == 'view' ? `盘点单${typeName[to.query.type]}` : `${typeName[to.query.type]}盘点单`
                next()
              }
          },
          {
            path: 'inventoryManage/inventorySheetMain/inventoryAdjustDetail',
            component: () => import('@/views/warehouseManage/inventoryManage/inventorySheetMain/components/inventoryAdjustDetail'),
            name: 'inventoryAdjustDetail',
            meta: { title: '新增盘点单', noCache: false },
            beforeEnter(to, from, next) {
                to.meta.title = to.query.type == 'view' ? `调整单${typeName[to.query.type]}` : `${typeName[to.query.type]}调整单`
                next()
              }
          },
            {
                path: 'warehousFundamentals/materialStorageOperate',
                component: () => import('@/views/warehouseManage/warehousFundamentals/materialStorage/components/materialStorageOperate.vue'),
                name: 'materialStorageOperate',
                meta: { title: '物料存储关系', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `物料存储关系${typeName[to.query.type]}` : `${typeName[to.query.type]}物料存储关系`
                    next()
                }
            },
        ]
    },
    {
        path: '/purchasingManagement',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'supplierOperate',
                component: () => import('@/views/purchasingManagement/supplier/components/supplierOperate.vue'),
                name: 'supplierOperate',
                meta: { title: '新增供应商档案', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `供应商档案${typeName[to.query.type]}` : `${typeName[to.query.type]}供应商档案`
                    next()
                }
            },
            {
                path: 'purchaseOrder/purchaseOrderOperate',
                component: () => import('@/views/purchasingManagement/purchaseOrder/purchaseOrderOperate.vue'),
                name: 'purchaseOrderOperate',
                meta: { title: '采购订单', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `采购订单${typeName[to.query.type]}` : `${typeName[to.query.type]}采购订单`
                    next()
                }
            },
          {
            path: 'purchaseReturn/purchaseReturnOperate',
            component: () => import('@/views/purchasingManagement/purchaseReturn/components/purchaseReturnOperate.vue'),
            name: 'purchaseReturnOperate',
            meta: { title: '退供单', noCache: false },
            beforeEnter(to, from, next) {
              to.meta.title = to.query.type == 'view' ? `退供单${typeName[to.query.type]}` : `${typeName[to.query.type]}退供单`
              next()
            }
          },
          {
            path: 'purchasePlan/purchasePlanOperate',
            component: () => import('@/views/purchasingManagement/purchasePlan/components/purchasePlanOperate.vue'),
            name: 'purchasePlanOperate',
            meta: { title: '采购计划', noCache: false },
            beforeEnter(to, from, next) {
              to.meta.title = to.query.type == 'view' ? `采购计划${typeName[to.query.type]}` : `${typeName[to.query.type]}采购计划`
              next()
            }
          },
          {
            path: 'purchasePlan/pullDownPurchaseOrder',
            component: () => import('@/views/purchasingManagement/purchasePlan/components/pullDownPurchaseOrder.vue'),
            name: 'pullDownPurchaseOrder',
            meta: { title: '下推采购订单', noCache: false },
            beforeEnter(to, from, next) {
              to.meta.title = "下推采购订单"
              next()
            }
          },
          {
            path: 'projectManagement/contractManagement/contractManagementOperate',
            component: () => import('@/views/purchasingManagement/projectManagement/contractManagement/components/contractManagementOperate'),
            name: 'contractManagementOperate',
            meta: { title: '合同管理', noCache: false },
            beforeEnter(to, from, next) {
              to.meta.title = to.query.type == 'view' ? `合同管理${typeName[to.query.type]}` : `${typeName[to.query.type]}合同管理`
              next()
            }
          },
          {
            path: 'projectManagement/projectManager/projectManagementOperate',
            component: () => import('@/views/purchasingManagement/projectManagement/projectManager/components/projectManagementOperate'),
            name: 'projectManagementOperate',
            meta: { title: '项目维护', noCache: false },
            beforeEnter(to, from, next) {
              to.meta.title = to.query.type == 'view' ? `项目维护${typeName[to.query.type]}` : `${typeName[to.query.type]}项目维护`
              next()
            }
          }
        ]
    },
    {
        path: '/qualityAssurance',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'qualityTesting/qualityTestingOperate',
                component: () => import('@/views/qualityAssurance/qualityTesting/qualityTestingOperate.vue'),
                name: 'qualityTestingOperate',
                meta: { title: '质检单', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `质检单${typeName[to.query.type]}` : `${typeName[to.query.type]}质检单`
                    next()
                }
            }
        ]
    },
    {
        path: '/demandManagement',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'operationManagement/requirementPlanMaintenanceOperate',
                component: () => import('@/views/demandManagement/operationManagement/requirementPlanMaintenance/requirementPlanMaintenanceOperate.vue'),
                name: 'requirementPlanMaintenanceOperate',
                meta: { title: '需求计划', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `需求计划${typeName[to.query.type]}` : `${typeName[to.query.type]}需求计划`
                    next()
                }
            },
            {
                path: 'operationManagement/materialApplicationOperate',
                component: () => import('@/views/demandManagement/operationManagement/materialApplicationMaintenance/materialApplicationOperate.vue'),
                name: 'materialApplicationOperate',
                meta: { title: '用料申请', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `用料申请${typeName[to.query.type]}` : `${typeName[to.query.type]}用料申请`
                    next()
                }
            },
            {
                path: 'selfResearch/selfResearchDemandOperate',
                component: () => import('@/views/demandManagement/selfResearch/selfResearchDemand/selfResearchDemandOperate.vue'),
                name: 'selfResearchDemandOperate',
                meta: { title: '自研需求', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `自研需求${typeName[to.query.type]}` : `${typeName[to.query.type]}自研需求`
                    next()
                }
            },
            {
                path: 'selfResearch/demandPlanWorkbenchOperate',
                component: () => import('@/views/demandManagement/demandPlan/demandPlanWorkbench/demandPlanWorkbenchOperate.vue'),
                name: 'demandPlanWorkbenchOperate',
                meta: { title: '物料需求计划', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `物料需求计划${typeName[to.query.type]}` : `${typeName[to.query.type]}物料需求计划`
                    next()
                }
            },
          
        ]
    },
    {
        path: '/scrapManage',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'scrapApply/scrapApplyOperate',
                component: () => import('@/views/warehouseManage/scrapManage/scrapApply/components/scrapApplyOperate.vue'),
                name: 'scrapApplyOperate',
                meta: { title: '报废申请', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `报废申请${typeName[to.query.type]}` : `${typeName[to.query.type]}报废申请`
                    next()
                }
            },
            {
                path: 'scrapHandle/scrapHandleOperate',
                component: () => import('@/views/warehouseManage/scrapManage/scrapHandle/scrapHandleOperate.vue'),
                name: 'scrapHandleOperate',
                meta: { title: '报废处置', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `报废处置${typeName[to.query.type]}` : to.query.type == 'pushDown'?'下推报废处置' : `${typeName[to.query.type]}报废处置`
                    next()
                }
            }
        ]
    },
    {
        path: '/workshop',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'processFlowOperate',
                component: () => import('@/views/workshop/processFlow/processFlowOperate.vue'),
                name: 'processFlowOperate',
                meta: { title: '工序流转卡', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `工序流转卡${typeName[to.query.type]}` : `${typeName[to.query.type]}工序流转卡`
                    next()
                }
            },
            {
                path: 'reportWork',
                component: () => import('@/views/workshop/processFlow/components/reportWork.vue'),
                name: 'reportWork',
                meta: { title: '工序报工', noCache: false },
            }
        ]
    },
    {
        path: '/productionManufacture',
        component: Layout,
        hidden: true,
        children: [
            {
                path: 'calculateManagement/baseSetting/accountantCycle/accountantCycleOperate',
                component: () => import('@/views/calculateManagement/baseSetting/accountantCycle/components/operate.vue'),
                name: 'accountantCycleOperate',
                meta: { title: '会计期间', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `会计期间${typeName[to.query.type]}` : `${typeName[to.query.type]}会计期间`
                    next()
                }
            },
            {
                path: 'demandPlans/demandPlan/scheme/schemeOperate',
                component: () => import('@/views/demandManagement/demandPlan/scheme/schemeOperate.vue'),
                name: 'schemeOperate',
                meta: { title: '计划方案', noCache: false },
                beforeEnter(to, from, next) {
                    to.meta.title = to.query.type == 'view' ? `计划方案${typeName[to.query.type]}` : `${typeName[to.query.type]}计划方案`
                    next()
                }
            }
        ]
    },
    // {
    //   path: "/prodmgr-front-template/*",
    //   meta: 'prodmgr-front-template',
    //   name: 'prodmgr-front-template',
    //   hidden: true,
    //   meta: { title: '工序报工', isQiankun: true },
    //   component: Layout
    // },
    {
      path: '/calculateManagement',
      component: Layout,
      hidden: true,
      children: [
          {
              path: 'adjustManage/inventoryAdjustOperate',
              component: () => import('@/views/calculateManagement/adjustManage/inventoryAdjustMaintenance/inventoryAdjustOperate.vue'),
              name: 'inventoryAdjustOperate',
              meta: { title: '入库调整单', noCache: false },
              beforeEnter(to, from, next) {
                  to.meta.title = to.query.type == 'view' ? `入库调整单${typeName[to.query.type]}` : `${typeName[to.query.type]}入库调整单`
                  next()
              }
          }
      ]
  },
]

export default new Router({
    mode: 'history',
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
})