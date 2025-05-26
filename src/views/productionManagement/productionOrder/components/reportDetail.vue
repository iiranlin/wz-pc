<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <el-table ref="tableRef" :data="tableData.detailList" border max-height="300px" style="width: 100%">
            <el-table-column align="center" label="序号" type="index" width="50" />
            <el-table-column align="left" label="生产车间" prop="workshopName" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="center" label="流转卡号" prop="flowCode" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="center" label="物料编码" prop="matlCode" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="center" label="计量单位" prop="matlUnit" show-overflow-tooltip>
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="right" label="预计生产数量" prop="produceNum" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="right" label="实际生产数量" prop="finishNum" show-overflow-tooltip width="200">
                <template slot="header" v-if="['create','update'].includes(queryType)">
                    <span style="color: red">*</span>
                    <span>实际生产数量</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailList.' + scope.$index + '.finishNum'" :rules="tableData.rules.finishNum">
                        <el-input-number style="width: 100%;" v-if="['create','update'].includes(queryType)" v-model="scope.row.finishNum" :min="0" @input="(val) => handleChange('finishNum', val, scope.row)"></el-input-number>
                        <span v-else>{{ scope.row.finishNum }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="right" label="合格数量" prop="qualifiedNum" show-overflow-tooltip width="200">
                <template slot="header" v-if="['create','update'].includes(queryType)">
                    <span style="color: red">*</span>
                    <span>合格数量</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailList.' + scope.$index + '.qualifiedNum'" :rules="tableData.rules.qualifiedNum">
                        <el-input-number style="width: 100%;" v-if="['create','update'].includes(queryType)" v-model="scope.row.qualifiedNum" :min="0" :max="scope.row.finishNum" @input="(val) => handleChange('qualifiedNum', val, scope.row)"></el-input-number>
                        <span v-else>{{ scope.row.qualifiedNum }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="right" label="不良品数量" prop="unqualifiedNum" show-overflow-tooltip width="150">
            </el-table-column>
            <el-table-column align="right" label="返工数量" prop="reworkNum" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column align="right" label="车间完工率(%)" prop="completionRate" show-overflow-tooltip width="150">
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
    },
    mixins: [indexMixin],
    dicts: ['MeasureUnit'],
    data() {
        return {
            tableData:{
                detailList: [],
                rules: {
                    finishNum: [{ required: true,message: '请输入实际生产数量', trigger: 'blur' }],
                    qualifiedNum: [{ required: true,message: '请输入合格数量', trigger: 'blur' }],
                }
            },
        }
    },
    methods: {
        handleChange(key, val, row) {
            if(key == 'finishNum') {
                row[key] = val
                row.qualifiedNum = val - row.unqualifiedNum
            }
            if(key == 'qualifiedNum') {
                row[key] = val
                row.unqualifiedNum = row.finishNum - val
            }
            // if(row.finishNum && row.qualifiedNum) {
            //     row.unqualifiedNum = row.finishNum - row.qualifiedNum
            // }
            if(row.finishNum && row.produceNum) {
                row.completionRate = (row.finishNum / row.produceNum * 100).toFixed(2)
            }
            this.$nextTick(() => {
                this.$emit('tableUpdate', this.tableData.detailList)
            })
           
        },
        init(data = []) {
            this.tableData.detailList = data.map((item, idx) => ({...item, rowNumber: item.rowNumber || idx + 1}))
        }
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color{
    color: #1890ff;
}
</style>
