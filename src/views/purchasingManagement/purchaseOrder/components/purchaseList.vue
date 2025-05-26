<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <el-table ref="tableRef" :data="tableData.detailsList" row-key="uid" border class="saleOrderOperateEltable" @selection-change="(data) => selectData = data"
            max-height="300px" style="width: 100%">
            <el-table-column fixed="left" align="center" width="50" type="selection" />  
            <el-table-column align="left" label="物料编码" prop="matlCode" show-overflow-tooltip
                min-width="150"></el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip
                min-width="240"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip width="90">
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="合同数量" prop="ctNum" show-overflow-tooltip width="150">
                <template slot="header">
                    合同数量
                    <tooltip content="如果不是按合同生成该字段为空" />
                </template>
                <template slot-scope="scope">
                    <span>{{ scope.row.ctRawId ? scope.row.ctNum : '' }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="已生成采购订单数量" prop="ctUseNum" show-overflow-tooltip width="190">
                <template slot="header">
                    已生成采购订单数量
                    <tooltip content="如果不是按合同生成该字段为空" />
                </template>
                <template slot-scope="scope">
                    <!-- <span>{{ scope.row.ctRawId ? scope.row.ctUseNum : '' }}</span> -->
                    {{ !scope.row.ctRawId ?'':queryType == 'view'?scope.row.ctUseNum + scope.row.purNum : scope.row.ctUseNum}}
                </template>
            </el-table-column>
            <el-table-column align="left" label="本次采购数量" prop="purNum" show-overflow-tooltip width="220">
                <template slot="header">
                    <span style="color: red">*</span>
                    <span>本次采购数量</span>
                    <tooltip content="按合同创建时，默认=合同数量-已生成采购订单数量" />
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.purNum'" :rules="tableData.rules.purNum">
                        <el-input-number @change="numberChange(scope)"
                            v-if="queryType == 'create' || queryType == 'update'" :min="1" :max="scope.row.sourceType == '2'?undefined:scope.row.maxPurNum"
                            controls-position="right" v-model="scope.row.purNum"></el-input-number>
                        <span v-else>{{ scope.row.purNum || '' }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column label="期望到货日期" align="center" prop="arriveDate" min-width="200">
                <template slot="header">
                    <span style="color: red">*</span>
                    <span>期望到货日期</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.arriveDate'"
                        :rules="[{ required: true, message: '请选择期望到货日期', trigger: ['change', 'blur'] }, { trigger: ['change', 'blur'], validator: planArriveDateValidator }]">
                        <span v-if="queryType == 'view'">{{ parseTime(scope.row.arriveDate,
                            '{y}-{m}-{d}') }}</span>
                        <el-date-picker v-else v-columnFormat="{
                            index: scope.$index,
                            prop: 'arriveDate',
                            list: tableData.detailsList
                        }" value-format="timestamp" v-model="scope.row.arriveDate" type="date" placeholder="选择日期"
                            style="width: 70%"></el-date-picker>
                    </el-form-item>

                </template>
            </el-table-column>
            <el-table-column align="left" label="单价(不含税，单位：元)" prop="price" show-overflow-tooltip width="200"
                v-if="$route.query.name != 'qualityTesting'">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.price'" :rules="tableData.rules.price">
                        <money-input v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.price"
                            @change="numberChange(scope)"></money-input>
                        <span v-else>{{ $textMethod.money(scope.row.price) }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="left" label="单价(含税，单位：元)" prop="taxPrice" show-overflow-tooltip width="200"
                v-if="$route.query.name != 'qualityTesting'">
                <template slot-scope="{row}">
                  <span>{{ $textMethod.money(row.taxPrice) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="税率(%)" prop="taxRate" show-overflow-tooltip width="200"
                v-if="$route.query.name != 'qualityTesting'">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.taxRate'" :rules="tableData.rules.taxRate">
                        <el-select v-columnFormat="{
                            index: scope.$index,
                            prop: 'taxRate',
                            list: tableData.detailsList
                        }" @change="numberChange(scope)" v-if="queryType == 'create' || queryType == 'update'"
                            v-model="scope.row.taxRate" clearable>
                            <el-option v-for="(item, key)  in dict.taxPre" :key="key" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <span v-else>{{ scope.row.taxRate }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            
            <el-table-column align="left" label="总金额(含税，单位：元)" prop="taxAmount" show-overflow-tooltip width="190"
                v-if="$route.query.name != 'qualityTesting'">
                  <template slot-scope="{row}">
                    {{ $textMethod.money(row.taxAmount) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="总金额(不含税，单位：元)" prop="amount" show-overflow-tooltip width="190"
                v-if="$route.query.name != 'qualityTesting'">
                <template slot-scope="{row}">
                    {{ $textMethod.money(row.amount) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="行号" prop="rowNum" show-overflow-tooltip width="80"></el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="100" v-if="queryType != 'view'">
                <template slot="header">
                    操作
                    <tooltip content="如果误删可以重新选择合同" />
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
import { generateUUID } from '@/utils'
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
            tableData: {
                detailsList: [],
                rules: {
                    purNum: [{ required: true, trigger: ['change', 'blur'], message: '本次采购数量不能为空' }],
                    price: [{ required: true, trigger: ['change', 'blur'], message: '单价(不含税)不能为空' }],
                    taxRate: [{ required: true, trigger: 'change', message: '税率不能为空' }],
                }
            },
            selectData: []
        }
    },
    methods: {
        planArriveDateValidator(rule, value, callback) {
            if (!value) {
                callback(new Error('请选择期望到货日期'));
            } else {
                callback();
            }
        },
        init(data) {
            data.forEach((item, index) => {
                item.taxRate = item.taxRate || '13'
                item.arriveDate = item.arriveDate || ''
                item.taxPrice = item.taxPrice || '',
                item.rowNum = index+1
            });
            this.$set(this.tableData, 'detailsList', data)
        },
        removeData(row, i) {
            this.tableData.detailsList.splice(i, 1);
            this.$emit('numberChange', this.tableData.detailsList);
        },
        numberChange(scope) {
            const property = scope.column.property
            const taxRate = Number(scope.row.taxRate || 0);
            const num = Number(scope.row.purNum || 0);
            const price = Number(scope.row.price || 0);
            const taxAmount = Number(scope.row.taxAmount || 0);
            const amount = Number(scope.row.amount || 0);
           
            if (['purNum', 'taxRate', 'price'].includes(property)) {
                 // 单价 数量 税率 改变
                scope.row.taxAmount = (num * price * (1 + taxRate / 100)).toFixed(2)
                scope.row.amount = (num * price).toFixed(2)
                scope.row.taxPrice = (price *(1 + taxRate / 100)).toFixed(2)
            } 
            
            // else if (['taxAmount'].includes(property)) {
            //      //含税总金额  改变
            //     const tempAmount = (taxAmount / (1 + taxRate / 100))
            //     scope.row.amount = (tempAmount).toFixed(2);
            //     scope.row.price = Number(tempAmount / num || 0).toPrecision(2);
            // } else if (['amount'].includes(property)) {
            //      //总金额  改变
            //     scope.row.price = Number(amount / num || 0).toPrecision(2);
            //     scope.row.taxAmount = (amount * (1 + taxRate / 100)).toFixed(2)
            // }

            this.$emit('numberChange', this.tableData.detailsList);
        }
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
}
</style>
