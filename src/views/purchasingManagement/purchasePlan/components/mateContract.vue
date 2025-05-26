<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="匹配合同" :visible.sync="visible"
        :close-on-click-modal="false" width="1300px" v-loading="loading" :append-to-body="true">
        <el-row style="padding: 0 20px;margin-bottom: 20px;">
            <el-col>
                <el-button plain round type="primary" @click="removeData()">删除</el-button>
            </el-col>
        </el-row>
        <div class="table-wrapper">
            <el-table ref="tableRef" :data="tableData" border height="100%" @row-click="rowClick"
                @selection-change="handleSelect" row-key="puPlanRawId">
                <el-table-column align="center" key="selectable" type="selection" width="50" fixed="left" />
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column label="项目编码" align="left" prop="projectCode" min-width="120">
                    <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                                        row.projectCode }}</el-button>
                            </template>
                </el-table-column>
                <el-table-column label="项目名称" align="left" prop="projectName" min-width="120"></el-table-column>
                <el-table-column label="合同编码" align="left" prop="ctCode" min-width="120">
                    <template slot-scope="scope">
                        <el-select v-if="scope.row && scope.row.ctList && scope.row.ctList.length > 1"
                            value-key="ctCode" v-model="scope.row.contractCodeA" clearable
                            @change="contractChange(scope)">
                            <el-option v-for="(item)  in scope.row.ctList" :key="item.ctRawId" :label="item.ctCode"
                                :value="item" />
                        </el-select>
                        <el-button v-else type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: scope.row.ctId, refName: 'contractManagementOperate'})">{{ contractData(scope.row.ctList, scope) }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="合同名称" align="left" prop="ctName" min-width="120"></el-table-column>
                <el-table-column label="合同数量" align="right" prop="ctNum" min-width="120"></el-table-column>
                <el-table-column label="合同单价(元)" align="right" prop="ctPrice" min-width="120">
                    <template slot-scope="{row}">
                        <span v-thousand-separator="row.ctPrice"></span>
                    </template>
                </el-table-column>
                <el-table-column label="合同税率(%)" align="right" prop="ctTaxPre" min-width="120"></el-table-column>
                <el-table-column label="供应商编码" align="left" prop="suCode" min-width="120">
                  <template slot-scope="{row}">
                    <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: row.suId, refName: 'supplierOperate'})">{{ row.suCode }}</el-button>
                  </template> 
                </el-table-column>
                <el-table-column label="供应商名称" align="left" prop="suName" min-width="120"></el-table-column>
                <el-table-column label="采购计划单号" align="left" prop="planCode" min-width="150">
                  <template slot-scope="{row}">
                    <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: row.planId, refName: 'purchasePlanOperate'})">{{ row.planCode }}</el-button>
                  </template> 
                </el-table-column>
                <el-table-column label="采购计划行号" align="left" prop="rowNum" min-width="120"></el-table-column>
                <el-table-column label="物料编码" align="left" prop="matlCode" min-width="150">
                  <template slot-scope="{row}">
                    <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {matlCode: row.matlCode, refName: 'materialArchivesOperate'})">{{ row.matlCode }}</el-button>
                  </template> 
                </el-table-column>
                <el-table-column label="物料名称" align="left" prop="matlName" min-width="120"></el-table-column>
                <el-table-column label="规格型号" align="left" prop="matlType" min-width="120"></el-table-column>
                <el-table-column label="计量单位" align="left" prop="matlUnit" min-width="120">
                    <template slot-scope="{row}">
                        {{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                    </template>
                </el-table-column>
                <el-table-column label="需求数量" align="right" prop="demandNum" min-width="120"></el-table-column>
                <!-- <el-table-column label="需求日期" align="center" prop="needDate" min-width="120">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.needDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column> -->
                <el-table-column label="已完成数量" align="right" prop="purOrderQuoteNum" min-width="120"></el-table-column>
                <el-table-column label="本次计划采购数量" align="right" prop="planNum" min-width="120"></el-table-column>
                <el-table-column label="采购数量" align="right" prop="purNum" min-width="120">
                </el-table-column>
                <el-table-column label="期望到货日期" align="center" prop="arriveDate" min-width="120">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.arriveDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="预计单价(不含税)(元)" align="right" prop="price" min-width="120">
                    <template slot-scope="{row}">
                        <span v-thousand-separator="row.price"></span>
                    </template>
                </el-table-column>
                <el-table-column label="总金额(不含税)(元)" align="right" prop="amount" min-width="120">
                    <template slot-scope="{row}">
                        <span v-thousand-separator="row.amount"></span>
                    </template>
                </el-table-column>
                <el-table-column label="税率(%)" align="right" prop="taxRate" min-width="120"></el-table-column>
                <el-table-column label="预计单价(含税)(元)" align="right" prop="taxPrice" min-width="120">
                    <template slot-scope="{row}">
                        <span v-thousand-separator="row.taxPrice"></span>
                    </template>
                </el-table-column>
                <el-table-column label="总金额(含税)(元)" align="right" prop="taxAmount" min-width="120">
                    <template slot-scope="{row}">
                        <span v-thousand-separator:2="row.taxAmount"></span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" fixed="right" width="100">
                    <template slot-scope="scope">
                        <el-button type="text" @click="removeData(scope.row, scope.$index)">删行</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <template #footer>
            <el-button plain round type="primary" @click="saveSelection">生成采购订单</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
        <detail-dialog ref="detailDialogRef"/>
    </Dialog>
</template>

<script>

import indexMixin from '@/views/mixins'
import { matchingCt } from '@/api/prodmgr-pu/Ct'
import { matchingCtCreate } from '@/api/prodmgr-pu/order'


export default {
    dicts: ['MeasureUnit'],
    mixins: [indexMixin],
    components: {
      DetailDialog: () => import('@/views/components/DetailDialog')
    },
    data() {
        return {
            visible: false,
            loading: false,
            tableData: [],
            selectData: [],
            matlCodeList: {}
        }
    },
    filters: {
        orderTypeFilter(val, code) {
            for (let key of code) {
                if (key.value == val) {
                    return key.label
                }
            }
        }
    },
    methods: {
        init(data, api = matchingCt) {
            this.api = api
            this.visible = true;
            this.tableData = JSON.parse(JSON.stringify(data));
            const ids = this.tableData.map(item => item.id);
            this.rawListByMatlCode(ids);
        },
        handleSelect(selectData) {
            this.selectData = selectData;
        },
        async rawListByMatlCode(ids) {
            this.api({ ids }).then(({ data }) => {
                // this.matlCodeList = data;
                this.tableData = data //this.tableData.filter(item => data[item.matlCode] && data[item.matlCode].length > 0);
                this.$nextTick(() => {
                    this.$refs.tableRef.doLayout()
                })
            })
        },
        contractData (data, scope) {
            if(data && data.length){
                scope.row.ctCode = data[0].ctCode;
                scope.row.ctRawId = data[0].ctRawId;
                scope.row.ctId = data[0].ctId;
                scope.row.ctName = data[0].ctName;
                scope.row.ctNum = data[0].num - data[0].useNum;
                scope.row.ctPrice = data[0].price;
                scope.row.ctTaxPrice = data[0].taxPrice;
                scope.row.ctTaxPre = data[0].taxPre;
                scope.row.suCode = data[0].relativeCode;
                scope.row.suName = data[0].relativeName;
                scope.row.suId = data[0].relativeId;
                scope.row.purPlanId = scope.row.planId;
                scope.row.purPlanCode = scope.row.planCode;
                scope.row.purPlanDetailId = scope.row.id;
                scope.row.purPlanRowNum = scope.row.rowNum;
                // if(scope.row.planPuNum > scope.row.ctNum){
                //     scope.row.planPuNum = scope.row.ctNum;
                // }
                scope.row.purNum = Math.min(scope.row.maxPlanNum, data[0].maxCtNum);
                return data[0].ctCode
            }
        },
        contractChange(scope) {
            const data = scope.row.contractCodeA;
            if (data) {
                scope.row.ctRawId = data.ctRawId;
                scope.row.ctCode = data.ctCode;
                scope.row.ctId = data.ctId;
                scope.row.ctName = data.ctName;
                scope.row.ctNum = data.num - data.useNum;
                scope.row.ctPrice = data.price;
                scope.row.ctTaxPrice = data.taxPrice;
                scope.row.ctTaxPre = data.taxPre;
                scope.row.suCode = data.relativeCode;
                scope.row.suName = data.relativeName;
                scope.row.suId = data.relativeId;
                scope.row.purPlanId = scope.row.planId;
                scope.row.purPlanCode = scope.row.planCode;
                scope.row.purPlanDetailId = scope.row.id;
                scope.row.purPlanRowNum = scope.row.rowNum;
                // if(scope.row.planPuNum > scope.row.ctNum){
                //     scope.row.planPuNum = scope.row.ctNum;
                // }
                scope.row.purNum = Math.min(scope.row.maxPlanNum, data.maxCtNum);
            }

        },
        // 保存选择
        async saveSelection() {
            if (!this.tableData.length) {
                this.$message.warning('暂无数据可匹配合同')
                return
            }
            if (this.tableData.some(item => !item.ctCode)) {
                this.$message.warning('请选择合同')
                return
            }
            let flag = []
            for (let i = 0; i < this.tableData.length; i++) {
                const { ctPrice, ctTaxPre, price, taxRate } = this.tableData[i]
                if (ctPrice !== price || ctTaxPre !== taxRate) {
                    flag.push(i + 1)
                }
            }
            let arr = [...this.tableData]
            if (!!flag.length) {

                const res = await this.$modal.confirm(`第${flag.join(',')}行采购计划单价与合同单价不一致，将按合同单价等合同信息生成采购订单，是否确认?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                if (res == 'confirm') {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i]['price'] = arr[i]['ctPrice']
                        arr[i]['taxPrice'] = arr[i]['ctTaxPrice']
                        arr[i]['taxRate'] = arr[i]['ctTaxPre']
                        arr[i]['amount'] = Number(arr[i]['ctPrice']) * Number(arr[i]['purNum'])
                        arr[i]['taxAmount'] = Number(arr[i]['ctPrice']) * (1 + Number(arr[i]['ctTaxPre']) / 100) * Number(arr[i]['purNum'])
                    }
                }
            }
            arr = arr.map(item => {
              return Object.assign({}, item, {sourceType: '4'} )
            })
            this.loading = true;
            matchingCtCreate(arr).then(({ message }) => {
                this.$modal.msgSuccess(message)
                this.$emit('selections')
                this.visible = false
            }).finally(() => {
                this.loading = false
            })

        },
        filterContractCode(list, key) {
            const keysArr = list.map(item => item[key]);
            const keys = [...new Set(keysArr)];
            const newList = keys.map(item => {
                const rawList = list.filter(i => i[key] == item);
                return {
                    [key]: item,
                    ctId: rawList[0].ctId,
                    contractName: rawList[0].ctName,
                    suCode: rawList[0].suCode,
                    suId: rawList[0].suId,
                    suName: rawList[0].suName,
                    rawList
                }
            })
            return newList
        },
        rowClick(row) {
            // 多选选中行
            // 根据id判断当前点击的是否被选中
            const selected = this.selectData.some(item => item.puPlanRawId === row.puPlanRawId)
            if (!selected) {
                // 选择
                this.selectData.push(row)
                this.$refs.tableRef.toggleRowSelection(row, true);
            } else {
                // 取消
                var finalArr = this.selectData.filter((item) => {
                    return item.puPlanRawId !== row.puPlanRawId
                })
                // 取消后剩余选中的
                this.selectData = finalArr
                this.$refs.tableRef.toggleRowSelection(row, false);
            }
        },
        removeData(row, i) {
            if (row) {
                this.tableData.splice(i, 1);
            } else {
                if (this.selectData.length > 0) {
                    this.$modal.confirm('您确定要删除吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let newData = this.tableData.filter((a) => !this.selectData.some((b) => a.puPlanRawId === b.puPlanRawId));
                        this.tableData = newData;
                    })
                } else {
                    this.$modal.msgError('请选择数据')
                }
            }
        }
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>
