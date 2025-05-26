<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <el-table ref="tableRef" @selection-change="(data) => selectData = data" :data="tableData.detailsList" border class="saleOrderOperateEltable" max-height="300px" style="width: 100%">
            <el-table-column fixed="left" align="center" width="50" type="selection" />  
            <el-table-column align="left" label="序号" type="index" width="50" />
            <el-table-column align="left" label="物料编码" prop="matlCode" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip>
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="需求数量" prop="matlNum" show-overflow-tooltip width="220">
            </el-table-column>
            <el-table-column align="center" label="需求日期" prop="requiredDate" show-overflow-tooltip width="200">
                <template slot="header" v-if="['create', 'update'].includes(queryType)">
                    <span style="color: red">*</span>
                    <span>需求日期</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.requiredDate'"
                        :rules="tableData.rules.requiredDate">
                        <el-date-picker style="width: 100%;" v-if="['create', 'update'].includes(queryType)"
                            v-columnFormat="{
                                index: scope.$index,
                                prop: 'requiredDate',
                                list: tableData.detailsList
                            }" v-model="scope.row.requiredDate" type="date" format="yyyy-MM-dd"
                            value-format="timestamp"></el-date-picker>
                        <span v-else>{{ parseTime(scope.row.requiredDate, '{y}-{m}-{d}') }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="left" label="单价(含税)" prop="taxPrice" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    {{ $textMethod.money(row.taxPrice) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="税率(%)" prop="taxRate" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="总金额(含税)" prop="taxAmount" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    {{ $textMethod.money(row.taxAmount) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="总金额(不含税)" prop="unTaxAmount" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    {{ $textMethod.money(row.unTaxAmount) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="行号" prop="rowNumber" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="100"
                v-if="['create', 'update'].includes(queryType) && this.tableType == '1'">
                <template slot-scope="scope">
                    <el-button type="text" @click="removeData(scope.row, scope.$index)">删行</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-form>
</template>

<script>
import indexMixin from '@/views/mixins'
export default {
    props: {
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
    dicts: ['MeasureUnit'],
    data() {
        return {
            tableData: {
                detailsList: [],
                rules: {
                    requiredDate: [{ required: true, message: '请选择需求日期', trigger: ['blur', 'change'] }],
                }
            },
            selectData: []
        }
    },
    methods: {
        init (data = []) {
          this.tableData.detailsList = data.map((item, idx) => (Object.assign({}, item,{rowNumber: item.rowNumber || idx + 1, requiredDate: item.requiredDate || ''}))) //this.tableData.detailsList.concat(data);
        },
        removeData(row, i) {
            this.tableData.detailsList.splice(i, 1);
            this.$emit('removeData', this.tableData.detailsList)
        }
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
}
</style>
