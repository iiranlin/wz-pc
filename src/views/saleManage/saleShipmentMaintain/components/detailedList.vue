<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <el-table ref="tableRef" class="saleOrderOperateEltable" :data="tableData.detailsList" border max-height="300px" 
            style="width: 100%" @selection-change="(data) => selectData = data">
            <el-table-column fixed="left" align="center" width="50" type="selection" v-if="tableType == '1'"/>  
            <el-table-column align="left" label="来源单号" prop="saleOrderCode" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="来源行号" prop="saleOrderRowNum" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="物料编码" prop="matlCode" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip min-width="150">
                <template slot-scope="{row}">
                    <span>{{ row.matlUnit | orderTypeFilter(dict.MeasureUnit) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="需求日期" prop="requiredDate" show-overflow-tooltip min-width="150">
                <template slot-scope="{row}">
                    <span>{{ parseTime(row.requiredDate, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="单据原量" prop="saleOrderNum" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="已生成出货单数量(累计)" prop="applyDeliveryNum" show-overflow-tooltip min-width="175"></el-table-column>
            <el-table-column align="left" label="本次出货数量" prop="deliveryNum" show-overflow-tooltip width="220">
                <template slot="header">
                    <span style="color: red">*</span>
                    <span>本次出货数量</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.deliveryNum'" :rules="tableData.rules.deliveryNum">
                        <el-input-number @change="numberChange(scope,scope.$index)" v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.deliveryNum" :min="1" :max="scope.row.maxDeliveryNum" controls-position="right"></el-input-number>
                        <span v-else>{{ scope.row.deliveryNum }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <!-- <el-table-column align="center" label="出货仓库" prop="warehouseId" show-overflow-tooltip width="220">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.warehouseId'" :rules="tableData.rules.warehouseId">
                        <el-input-number v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.warehouseId" :min="1" controls-position="right"></el-input-number>
                        <span v-else>{{ scope.row.warehouseName }}</span>
                    </el-form-item>
                </template>
            </el-table-column> -->
            <el-table-column align="left" label="单价(不含税)" prop="price" show-overflow-tooltip min-width="150">
              <template slot-scope="{row}">
                {{ $textMethod.money(row.price) }}
              </template>
            </el-table-column>
            <el-table-column align="left" label="税率(%)" prop="taxRate" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="总金额(含税)" prop="taxAmount" show-overflow-tooltip min-width="150">
              <template slot-scope="{row}">
                {{ $textMethod.money(row.taxAmount) }}
              </template>
            </el-table-column>
            <el-table-column align="left" label="总金额(不含税)" prop="unTaxAmount" show-overflow-tooltip min-width="150">
              <template slot-scope="{row}">
                {{ $textMethod.money(row.unTaxAmount) }}
              </template>
            </el-table-column>
            <el-table-column align="left" label="出货单行号" prop="rowNum" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="100" v-if="queryType !== 'view'">
                <template slot="header">
                    操作
                    <tooltip content="如果误删可以重新选择单据" />
                </template>
                <template slot-scope="scope">
                    <el-button type="text" @click="removeData(scope.row, scope.$index)">删行</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-form>
</template>

<script>
import indexMixin from './mixins';
export default {
    components: {
        tooltip: () => import('@/components/tooltip')
    },
    props: {
        dict: {
            type: Object,
            default: null
        },
        queryType: {
            type: String,
            default: ''
        },
        tableType: {
            type: String,
            default: ''
        },
    },
    mixins: [indexMixin],
    data() {
        return {
            tableData:{
                detailsList: [],
                rules: {
                    deliveryNum: [{ required: true, message: '请输入本次出货数量',trigger: ['blur', 'change'] }],
                }
            },
            originDetailList:[],
            selectData:[],
        }
    },
    methods: {
        init (data, flag = false) {
            if(flag) {
                this.tableData.detailsList = []
            }else {
                this.tableData.detailsList.push(...data.map((item, idx) => ({...item, rowNum: idx + 1})));
                this.originDetailList = JSON.parse(JSON.stringify(this.tableData.detailsList))
            }
          this.$emit('numberChange', this.tableData.detailsList);
        },
        removeData (row, i) {
            this.$modal.confirm('您确定要删除吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.tableData.detailsList.splice(i, 1);
                this.$emit('numberChange', this.tableData.detailsList);
            })
        },
        numberChange (scope,index) {
            if(scope.row.deliveryNum == scope.row.maxDeliveryNum){
                scope.row.taxAmount = this.originDetailList[index].taxAmount
                scope.row.unTaxAmount = this.originDetailList[index].unTaxAmount
                this.$emit('numberChange', this.tableData.detailsList);
            }else{
                const taxRate = Number(scope.row.taxRate || 0);
                const deliveryNum = Number(scope.row.deliveryNum || 0);
                const price = Number(scope.row.price || 0);
                scope.row.taxAmount = (deliveryNum * price * (1 + taxRate / 100)).toFixed(2)
                scope.row.unTaxAmount = (deliveryNum * price).toFixed(2);
                this.$emit('numberChange', this.tableData.detailsList);
            }
        },
        batchRemoveData(){
            if(this.selectData.length == 0){
                return
            }
            this.$modal.confirm('您确定要删除吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let tempArr = [];

                this.tableData.detailsList.forEach((item) => {
                    let result =  this.selectData.some((itemChild) => {
                        return itemChild.matlCode == item.matlCode;
                    })
                    if(!result){
                        tempArr.push(item)
                    }
                })
                this.tableData.detailsList = tempArr;
            })
           
        },
    }
};
</script>
<style lang="scss" scoped>
::v-deep .saleOrderOperateEltable th.el-table__cell.is-leaf{
    background-color: #f0f0f0;
    color: #1b1e22 !important;
}
.slotIcon-color{
    color: #1890ff;
}
</style>
