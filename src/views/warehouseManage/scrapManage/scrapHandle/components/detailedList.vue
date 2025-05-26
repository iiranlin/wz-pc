<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <el-table ref="tableRef" @selection-change="(data) => selectData = data" row-key="id" :data="tableData.detailsList" border class="saleOrderOperateEltable" max-height="300px" style="width: 100%">
            <el-table-column fixed="left" align="center" key="selectable" type="selection" width="50" v-if="queryType == 'create' || queryType == 'update' || queryType == 'pushDown'" />
            <el-table-column align="left" label="报废单号" prop="scrapCode" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="left" label="报废单行号" prop="scrapRowNum" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="left" label="仓库" prop="warehouseName" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="left" label="货位" prop="placeName" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="批次号" prop="batchNo" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="物料编码" prop="matlCode" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip min-width="150">
                <template slot-scope="scope">
                    {{ scope.row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="报废数量" prop="scrapNum" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="已累计生成处置单数量" prop="totalHandleNum" show-overflow-tooltip min-width="200"></el-table-column>
            <el-table-column align="left" label="本次处置数量" prop="handleNum" show-overflow-tooltip width="220">
                <template slot="header">
                    <span style="color: red">*</span>
                    <span>本次处置数量</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.handleNum'" :rules="tableData.rules.handleNum">
                        <el-input-number v-if="queryType == 'create' || queryType == 'update' || queryType == 'pushDown'" v-model="scope.row.handleNum" :min="1" :max="scope.row.scrapNum - scope.row.totalHandleNum" controls-position="right" @input="numInput(scope)"></el-input-number>
                        <span v-else>{{ scope.row.handleNum }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="left" label="处置厂家" prop="handleFactory" show-overflow-tooltip width="200">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.handleFactory'" :rules="tableData.rules.handleFactory">
                        <el-input v-if="queryType == 'create' || queryType == 'update' || queryType == 'pushDown'" v-model="scope.row.handleFactory"></el-input>
                        <span v-else>{{ scope.row.handleFactory }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="left" label="处置单价（元,不含税）" prop="price" width="220">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.price'" :rules="tableData.rules.price">
                        <el-input-number style="width: 100%" v-if="queryType == 'create' || queryType == 'update' || queryType == 'pushDown'" v-model="scope.row.price" :min="1" controls-position="right" @input="numInput(scope)"></el-input-number>
                        <span v-else>{{ $textMethod.money(scope.row.price) }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="left" label="处置金额（元）" prop="handleAmount" show-overflow-tooltip min-width="150">
              <template slot-scope="scope">
                {{ $textMethod.money(scope.row.handleAmount) }}
              </template>
            </el-table-column>
            <el-table-column align="left" label="应收/应付" prop="payment" show-overflow-tooltip width="220">
                <template slot="header">
                    <span style="color: red">*</span>
                    <span>应收/应付</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.payment'" :rules="tableData.rules.payment">
                        <el-select v-if="queryType == 'create' || queryType == 'update' || queryType == 'pushDown'" v-model="scope.row.payment">
                            <el-option v-for="item in dict.type.payment" :label="item.label" :value="item.value" :key="item.value"/>
                        </el-select>
                        <span v-else>{{ scope.row.payment | orderTypeFilter(dict.type.payment) }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="100" v-if="queryType == 'create' || queryType == 'pushDown'">
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
    props: {
        dict: {
            type: Object,
            default: null
        },
        queryType: {
            type: String,
            default: ''
        }
    },
    mixins: [indexMixin],
    data() {
        return {
            tableData:{
                detailsList: [],
                rules: {
                    handleNum: [{ required: true, message: '请输入本次处置数量', trigger: ['blur', 'change'] }],
                    payment: [{ required: true, message: '请选择应收/应付', trigger: 'change' }],
                }
            },
            selectData: []
        }
    },
    methods: {
        init (data) {
            this.tableData.detailsList.push(...data);
        },
        update(arr = []) {
            this.tableData.detailsList = arr
        },
        numInput (scope) {
            scope.row.handleAmount = Number(scope.row.handleNum) * Number(scope.row.price);
            this.$emit('numInput')
        },
        removeData (row, i) {
            if(row){
                this.tableData.detailsList.splice(i, 1);
                this.$emit('change', this.tableData.detailsList)
            }else{
                if(this.selectData.length > 0) {
                    this.$modal.confirm('您确定要删除吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let newData = this.tableData.detailsList.filter((a) => !this.selectData.some((b) => a.id === b.id));
                        this.tableData.detailsList = newData;
                        this.$emit('change', newData)
                    })
                }else{
                    this.$modal.msgError('请选择数据')
                }
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color{
    color: #1890ff;
}
</style>
