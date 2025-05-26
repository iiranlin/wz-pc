<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <el-table ref="tableRef" @selection-change="(data) => selectData = data" :data="tableData.detailsList" border class="saleOrderOperateEltable" max-height="300px" style="width: 100%">
            <el-table-column fixed="left" align="center" key="selectable" type="selection" width="50" v-if="queryType == 'create' || queryType == 'update'" />
            <el-table-column align="left" label="序号" type="index" width="50" />
            <el-table-column align="left" label="物料编码" prop="matlCode" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip min-width="240"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip min-width="240"></el-table-column>
            <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip min-width="90">
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="需求数量" prop="demandNum" show-overflow-tooltip :width="queryType == 'create' || queryType == 'update'?'168':'100'">
                <template slot="header">
                    <span style="color: red">*</span>
                    <span>需求数量</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.demandNum'" :rules="tableData.rules.demandNum">
                        <el-input-number style="width: 150px;" v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.demandNum" :min="1" :max="10000" controls-position="right"></el-input-number>
                        <span v-else>{{ scope.row.demandNum }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="需求日期" prop="demandDate" show-overflow-tooltip width="200">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.demandDate'" :rules="tableData.rules.demandDate">
                        <el-date-picker  v-columnFormat="{
                            index: scope.$index, 
                            prop: 'demandDate', 
                            list: tableData.detailsList
                        }" style="width: 100%;" v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.demandDate" type="date" format="yyyy-MM-dd" value-format="timestamp"></el-date-picker>
                        <span v-else>{{ parseTime(scope.row.demandDate, '{y}-{m}-{d}') }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="100" v-if="queryType != 'view'">
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
                    demandNum: [{ required: true, message: '请输入需求数量', trigger: ['blur', 'change'] }],
                }
            },
            selectData: []
        }
    },
    methods: {
        init (data) {
            const nextData = data.map(item => ({...item, demandDate: item.demandDate || ''}))
            this.tableData.detailsList = this.tableData.detailsList.concat(nextData);
        },
        removeData (row, i) {
            if(row){
                this.tableData.detailsList.splice(i, 1);
            }else{
                if(this.selectData.length > 0) {
                    this.$modal.confirm('您确定要删除吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let newData = this.tableData.detailsList.filter((a) => !this.selectData.some((b) => a.matlCode === b.matlCode));
                        this.tableData.detailsList = newData;
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
