<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <el-table ref="tableRef" :data="tableData.detailsList" border
            class="container_flex_form_table saleOrderOperateEltable" @current-change="handleCurrentChange"
            max-height="300px" style="width: 100%" @selection-change="(data) => { selectData = data }"
            @row-click="rowClick" highlight-current-row>
            <el-table-column align="center" label="序号" type="index" width="50">
                <template slot-scope="{$index}">
                    {{ ($index + 1) }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="物料编码" prop="matlCode" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip
                width="240"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="计量单位" prop="matlUnit" show-overflow-tooltip width="90">

                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="计划属性" prop="planAttribute" show-overflow-tooltip min-width="120">
                <template slot="header">
                    <span style="color: red">*</span> 计划属性
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.planAttribute'"
                        :rules="tableData.rules.planAttribute">
                        <el-select v-if="queryType != 'view'" v-model="scope.row.planAttribute" clearable
                            @change="isMainMatlChange(scope)">
                            <el-option v-for="(item, key) in dict.planAttribute" :key="key" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <span v-else>{{ scope.row.planAttribute | orderTypeFilter(dict.planAttribute) }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="right" label="子件用量" prop="childNum" width="150">
                <template slot="header">
                    <span style="color: red">*</span> 子件用量
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.childNum'" :rules="tableData.rules.childNum">
                        <el-input-number v-if="queryType != 'view'" style="width: 100%;" v-model="scope.row.childNum"
                            controls-position="right" :min="1" @change="numChange(scope)"></el-input-number>
                        <span v-else>{{ scope.row.childNum }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="right" label="母件底数" prop="baseNum" width="150">
                <template slot="header">
                    <span style="color: red">*</span> 母件底数
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.baseNum'" :rules="tableData.rules.baseNum">
                        <el-input-number v-if="queryType != 'view'" style="width: 100%;" v-model="scope.row.baseNum"
                            controls-position="right" :min="1" @change="numChange(scope)"></el-input-number>
                        <span v-else>{{ scope.row.baseNum }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="right" label="单位用量" prop="unitNum" show-overflow-tooltip width="150">
                <template slot="header">
                    <span>单位用量</span>
                    <tooltip content="=子件用量/母件底数；即生产一个母件需用的子件数量。" />
                </template>
            </el-table-column>
            <el-table-column align="right" label="损耗率(%)" prop="lossRate" width="150">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.lossRate'" :rules="tableData.rules.lossRate">
                        <el-input-number v-if="queryType != 'view'" v-model.number="scope.row.lossRate" :precision="2"
                            controls-position="right" :min="0" :max="100" style="width: 100%"></el-input-number>
                        <span v-else>{{ scope.row.lossRate }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="替代方式" prop="replaceMethod" width="150">
                <template slot="header">
                    <span>替代方式</span>
                    <tooltip content="替代方式有三种：<br/>
                      1.全部替代：比如子件需求量100，有三个替代件分别是，A-替代次序1-库存50、B-替代次序2-库存60、C-替代次序3-库存80；替代比1:1；ABC三种替代件都不能全部满足替代量，则都不使用。<br/>
                      2.部分替代：比如子件需求量100，有三个替代件分别是，A-替代次序1-库存50、B-替代次序2-库存60、C-替代次序3-库存80；替代比1:1；则按替代次序依次消耗替代料，即消耗A的50+B的50。<br/>
                      3.全部+ 部分替代：比如子件需求量100，有三个替代件分别是，A-替代次序1-库存50、B-替代次序2-库存60、C-替代次序3-库存120；替代比1:1；则优先消耗库存满足的C，如果都不满足，再执行部分替代的逻辑。
                    " />
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.replaceMethod'"
                        :rules="tableData.rules.replaceMethod">
                        <el-select v-if="queryType != 'view'" v-model="scope.row.replaceMethod"
                            :disabled="scope.row.isReplaceMethod">
                            <el-option v-for="(item, key) in dict.replaceMethod" :key="key" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <span v-else>{{ scope.row.replaceMethod | orderTypeFilter(dict.replaceMethod) }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="发料方式" prop="issueType" width="150">
                <template slot="header">
                    <span style="color: red">*</span> 发料方式
                </template>
                <template slot-scope="scope">
                    <!-- {{ scope.row.issueType | orderTypeFilter(dict.hmMode) }} -->
                    <el-form-item :prop="'detailsList.' + scope.$index + '.issueType'"
                        :rules="tableData.rules.issueType">
                        <el-select v-if="queryType != 'view'" v-model="scope.row.issueType" clearable>
                            <el-option v-for="(item, key) in dict.hmMode" :key="key" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <span v-else>{{ scope.row.issueType | orderTypeFilter(dict.hmMode) }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="是否主料" prop="isMainMatl" width="150">
                <template slot="header">
                    是否主料
                    <tooltip
                        content="业务含义是，比如子件需求100，使用了替代料50，还差50采购，那到底是采购子件还是采购替代件，如果子件是主料，物料需求计划新增时， 会产生子件的采购计划单；如果替代件是主料，会产生替代件的采购计划单；即其作用是当需求不能满足时，是采买标准件，还是采买替代件。" />
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.isMainMatl'"
                        :rules="tableData.rules.isMainMatl">
                        <el-select v-if="queryType != 'view'" v-model="scope.row.isMainMatl"
                            :disabled="scope.row.isMainMatl == '1' || scope.row.isMainMatlShow"
                            @change="isMainMatlChange(scope)">
                            <el-option v-for="(item, key) in dict.YesNo" :key="key" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <span v-else>{{ scope.row.isMainMatl | orderTypeFilter(dict.YesNo) }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="100" v-if="queryType != 'view'">
                <template slot-scope="scope">
                    <el-button type="text" @click="removeData(scope.row, scope.$index)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-form>
</template>

<script>
import indexMixin from './mixins';
import tooltip from '@/components/tooltip'
export default {
    components: {
        tooltip
    },
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
            tableData: {
                detailsList: [],
                rules: {
                    childNum: [{ required: true, message: '请输入子件用量', trigger: 'blur' }],
                    baseNum: [{ required: true, message: '请输入母件底数', trigger: 'blur' }],
                    issueType: [{ required: true, message: '请选择发料方式', trigger: 'change' }],
                    planAttribute: [{ required: true, message: '请选择计划属性', trigger: 'change' }],
                }
            },
            selectData: [],
            selectRow: null
        }
    },
    watch: {
        selectRow: {
            handler: function (val) {
                this.$emit('sonInput', val);
            },
        }
    },
    methods: {
        init(data) {
            if (this.tableData.detailsList.length <= 0) {
                this.selectRow = data[0];
                this.$refs.tableRef.setCurrentRow(this.selectRow);
            }
            this.tableData.detailsList = this.tableData.detailsList.concat(data);
        },
        rowClick(row) {
            this.selectRow = row;
            // // 多选选中行
            // // 根据id判断当前点击的是否被选中
            // const selected = this.selectData.some(item => item.matlCode === row.matlCode)
            // if (!selected) {
            //     // 选择
            //     this.selectData.push(row)
            //     this.$refs.tableRef.toggleRowSelection(row, true);
            // } else {
            //     // 取消
            //     var finalArr = this.selectData.filter((item) => {
            //         return item.matlCode !== row.matlCode
            //     })
            //     // 取消后剩余选中的
            //     this.selectData = finalArr  
            //     this.$refs.tableRef.toggleRowSelection(row, false);
            // }
        },
        removeData(row, i) {
            if (row) {
                this.tableData.detailsList.splice(i, 1);
                this.$emit('sonInput', row, 'remove');
            } else {
                if (this.selectData.length > 0) {
                    this.$modal.confirm('您确定要删除吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let newData = this.tableData.detailsList.filter((a) => !this.selectData.some((b) => a.matlCode === b.matlCode));
                        this.tableData.detailsList = newData;
                    })
                } else {
                    this.$modal.msgError('请选择数据')
                }
            }
        },
        numChange(scope) {
            const { childNum, baseNum } = scope.row;
            const num = (childNum / baseNum).toFixed(2);
            scope.row.unitNum = isNaN(num) ? 0 : num
        },
        handleCurrentChange(val) {
            this.selectRow = val
        },
        isMainMatlChange(scope) {
            this.$emit('isMainMatlChange', scope)
        }
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
    font-size: 16px;
    margin-left: 2px;
}
</style>
