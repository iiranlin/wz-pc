<template>
    <div>
        <el-form ref="elForm" :model="formData" label-width="110px">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="所属组织:" class="border-radius50">
                       <FormUnitId class="form_unitId_h" :formData="formData" :i18nData="i18nData"
                            :fieldData="{ fieldCode: 'unitName', fieldName: '所属组织' }" z-index="99999"/>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="来源单号:" prop="sourceCode" class="border-radius50">
                        <el-input v-model="formData.sourceCode" placeholder="请输入来源单号" clearable
                            @keyup.enter.native="handleQuery" size="small"/>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="物料编码:" prop="matlCode" class="border-radius50">
                        <el-input v-model="formData.matlCode" placeholder="请输入物料编码" clearable
                            @keyup.enter.native="handleQuery" size="small" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="物料名称:" prop="matlName" class="border-radius50">
                        <el-input v-model="formData.matlName" placeholder="请输入物料名称" clearable
                            @keyup.enter.native="handleQuery" size="small"/>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="规格型号:" prop="matlType" class="border-radius50">
                        <el-input v-model="formData.matlType" placeholder="请输入规格型号" clearable
                            @keyup.enter.native="handleQuery" size="small"/>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="项目编码:" prop="projectCode" class="border-radius50">
                        <el-input v-model="formData.projectCode" placeholder="请输入项目编码" clearable
                            @keyup.enter.native="handleQuery" size="small"/>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="项目名称:" prop="projectName" class="border-radius50">
                        <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable
                            @keyup.enter.native="handleQuery" size="small"/>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="创建人:" prop="createUserName" class="border-radius50">
                        <el-input v-model="formData.createUserName" placeholder="请输入创建人" clearable
                            @keyup.enter.native="handleQuery" size="small"/>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="创建日期:" class="border-radius50">
                        <el-date-picker v-model="createDateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="-" 
                            style="width: 100%" start-placeholder="开始日期" end-placeholder="结束日期" size="small"/>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" :data="tableData" border row-key="sourceDetailId" v-loading="loading"
                @row-click="rowClick" height="100%" @row-dblclick="dbClick" @sort-change="sortableColumnChange" @selection-change="selectionChange">
                <el-table-column fixed="left" align="center" width="50" v-if="singleMode" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.sourceDetailId" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column v-else fixed="left" align="center" :selectable="selectable" :reserve-selection="true"
                    type="selection" width="55"/>
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="sourceCode" label="来源单号" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: refNameObj[outSource] })">{{
                            row.sourceCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="sourceRowNum" label="来源行号" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.matlCode, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="originalNum" label="单据原量" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="totalOutNum" label="已出库数量" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="inventoryNum" label="库存数量" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="unitName" label="所属组织" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="projectCode" label="项目编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                            row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="projectName" label="项目名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="createUserName" label="创建人" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="createDate" label="创建日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.createDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        
        <detail-dialog ref="detailDialogRef" />
    </div>
</template>
<script>
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import FormUnitId from '@/views/components/form-unitId'

import { MaRawBatchWhiListById } from '@/api/prodmgr-pu/Ma';
import { outQuoteList,warehouseLendOutQuoteList} from '@/api/warehouseManage/outboundMaintenance'
import { handleOutQuoteList } from '@/api/prodmgr-inv/scrapHandle'
import { deliveryOutQuoteList } from '@/api/prodmgr-sa/delivery';
import { getOrderOutQuoteList } from '@/api/projectManagement/productionOrder';
import { getRefundoutQuoteList } from '@/api/purchasingManagement/return'
import { pickingOutQuoteList } from '@/api/projectManagement/productionReview'

export default {
    mixins: [indexMixin, inMixin],
    dicts: ['MeasureUnit'],

    components: {
        FormUnitId,
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        singleMode: {
            type: Boolean,
            default: false
        },
        outSource: {
            type: String,
            default: '',
        },
        selectedRows: {
            type: Array,
            default: [],
        },
        propsFormData: {
            type: Object,
            default: null
        },
    },
    data() {
        return {
            loading: false,

            formData:{
                sourceCode:'',
                matlCode:'',
                matlName: '',
                matlType: '',
                projectCode: '',
                projectName: '',
                createUserName: '',
                createDateEnd: null,
                createDateStart: null,
            },
            createDateRange:[],

            tableData:[],
            total: 0,
            selectDataRow:'',
            selectData:[],

            refNameObj: {
                '1': 'materialApplicationOperate',  //维修出库
                '2': 'createTransferOutOrder',  //调拨出库
                '3': 'scrapHandleOperate',  //报废出库
                '4': 'saleShipmentMaintainOperate',  //销售出库
                '5': 'createLendOrder',  //借出出库
                '6': 'materialApplicationOperate',  //用料申请出库
                '7': 'productionOrderOperate',  //领料出库
                '8': 'purchaseReturnOperate',  //退供出库
                '9': 'productionReceiveOperate',  //生产领料
            }
        }
    },
    created() {
        
    },
    methods: {
        init(){
            this.formData = this.$options.data().formData;
            this.createDateRange = [];
            this.tableData = [];
            this.total = 0;
            this.selectData = [];
            this.selectDataRow = '';
            this.getList();
        },
        getList(){
            let api = ''

            if (this.outSource == '1') { //维修出库
                api = MaRawBatchWhiListById
            } else if (this.outSource == '2') { //调拨出库
                api = outQuoteList
            } else if (this.outSource == '3') { //报废出库
                api = handleOutQuoteList
            } else if (this.outSource == '4') { //销售出库
                api = deliveryOutQuoteList
            } else if (this.outSource == '5') { //借出出库
                api = warehouseLendOutQuoteList
            } else if (this.outSource == '6') { //用料申请出库
                api = MaRawBatchWhiListById
            } else if (this.outSource == '7') { //领料出库
                api = getOrderOutQuoteList
            } else if (this.outSource == '8') { //退供出库
                api = getRefundoutQuoteList
            } else if (this.outSource == '9') { //生产领料
                api = pickingOutQuoteList
            }
            this.loading = true

            if (!!this.createDateRange.length) {
                this.formData.createDateStart = this.createDateRange[0]
                this.formData.createDateEnd = this.createDateRange[1]
            }
            let params = {
                matlPurpose: this.outSource === '1' ? '1' : null,
            }
            api(Object.assign({}, this.formData,this.propsFormData,this.listQuery,params)).then(({ data }) => {
                this.tableData = data.list || []
                this.total = data.total || data.list.length
            }).finally(() => {
                this.loading = false
            })
        },
        handleQuery(){
            this.selectData = [];
            this.selectDataRow = '';
            this.listQuery.pageNum = '1'
            this.getList();
        },
        selectionChange(selection){
            this.selectData = selection;
            this.$emit('detailModeSelectionChange', selection);
        },
        rowClick(row){
            if (this.singleMode) {
                // 单选选中行
                this.selectDataRow = row.sourceDetailId
            } else {
                const idList = this.selectedRows.map((item) => item.sourceDetailId)
                if (idList.includes(row.sourceDetailId)) {
                    return
                }
                // 多选选中行
                // 根据id判断当前点击的是否被选中
                const selected = this.selectData.some(item => item.sourceDetailId === row.sourceDetailId)
                if (!selected) {
                    // 选择
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true)
                } else {
                    // 取消
                    var finalArr = this.selectData.filter((item) => {
                        return item.sourceDetailId !== row.sourceDetailId
                    })
                    // 取消后剩余选中的
                    this.selectData = finalArr
                    this.$refs.tableRef.toggleRowSelection(row, false)
                }
            }
        },
        dbClick(row){
            if (!this.singleMode) {
                const flag = this.selectedRows.some(item => item.sourceDetailId === row.sourceDetailId)
                if (flag) {
                    this.$message.warning('此条数据已经添加')
                    return
                }
            }
            this.$emit('detailModeSelected',[row])
        },
        selectable(row, index){
            let selectRowsGroup = this.selectedRows.map(item => item.sourceDetailId)
            return !selectRowsGroup.includes(row.sourceDetailId)
        },
        getSelectedRows(){
            return this.selectData;
        }
    }
}
</script>
<style lang="scss" scoped>
.table-wrapper {
    flex: 1;
}
</style>