<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <el-table ref="tableRef" :data="tableData.detailsList" border class="saleOrderOperateEltable" max-height="300px"
            style="width: 100%">
            <el-table-column align="left" label="序号" type="index" width="50"></el-table-column>
            <el-table-column align="left" label="批号" prop="batchNo" show-overflow-tooltip width="180">
                <template slot="header">
                    <span>批号</span>
                    <tooltip content="如果分批到货，会产生批号；<br/>如果不涉及到货，请忽略；" />
                </template>
                <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickBatchNo(row)">{{
                                        row.batchNo }}</el-button>
                            </template>
            </el-table-column>
            <el-table-column align="left" label="来源单号" prop="sourceCode" show-overflow-tooltip
                width="150">
                <template slot-scope="{row}">
                                <el-button type="text" size="small"
                                    @click="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: getRouteByInsource(qiSource) })">{{
                                        row.sourceCode }}</el-button>
                            </template>
            </el-table-column>
            <el-table-column align="left" label="来源行号" prop="sourceRowNum" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="物料编码" prop="matlCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="单据原量" prop="originalNum" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="本次可质检数量" prop="qiNum" show-overflow-tooltip width="150">
                <template slot="header">
                    <span>本次可质检数量</span>
                    <tooltip content="如果分批到货，等于本次到货数量；<br/>如果不涉及到货，等于单据原量；" />
                </template>
            </el-table-column>
            <el-table-column align="left" label="所属组织" prop="unitName" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="项目编码" prop="projectCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                            row.projectCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="项目名称" prop="projectName" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="供应商编码" prop="suCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click="clickRouterInDialog($refs.detailDialogRef, { id: row.suId, refName: 'supplierOperate' })">{{
                            row.suCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="供应商名称" prop="suName" show-overflow-tooltip width="150">

            </el-table-column>
            <el-table-column v-if="queryType !== 'view'" fixed="right" align="center" label="操作" width="90">
                <template slot-scope="scope">
                    <el-button @click="removeData(scope.row, scope.$index)" type="text" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <detail-dialog ref="detailDialogRef" />
        <normalDelivery ref="normalDelivery"></normalDelivery>
    </el-form>
</template>

<script>
import indexMixin from './mixins';
import idxMixin from '@/views/mixins'
import { getRouteByInsource } from '@/utils'
import normalDelivery from '@/views/warehouseManage/warehousing/arrivedGoodsConfirm/components/normalDelivery'
export default {
    props: {
        queryType: {
            type: String,
            default: ''
        },
        qiSource: {
            type: String,
            default: ''
        },
    },
    mixins: [indexMixin, idxMixin],
    dicts: ['MeasureUnit'],
    components: {
        normalDelivery,
        DetailDialog: () => import('@/views/components/DetailDialog'),
        tooltip: () => import('@/components/tooltip')
    },
    data() {
        return {
            tableData: {
                detailsList: [],
                rules: {
                    childNum: [{ required: true, trigger: 'blur' }],
                    baseNum: [{ required: true, trigger: 'blur' }],
                    issueType: [{ required: true, trigger: 'change' }],
                    isMainMatl: [{ required: true, trigger: 'change' }],
                }
            },
            getRouteByInsource: getRouteByInsource
        }
    },
    methods: {
        clickBatchNo(row) {
            this.$refs.normalDelivery.init('listDetails', row)
        },
        init(data) {
            this.tableData.detailsList.push(...data);
        },
        removeData(row, i) {
            this.tableData.detailsList.splice(i, 1);
            this.$emit('sonInput', row, 'remove');
            this.$emit('remove', this.tableData.detailsList);
        },
        numChange(scope) {
            const { childNum, baseNum } = scope.row;
            scope.row.unitNum = (childNum / baseNum).toFixed(2);
        }
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;

    .slotIcon-color-content {
        color: red;
    }
}

::v-deep .saleOrderOperateEltable th.el-table__cell.is-leaf {
    background-color: #f0f0f0;
    color: #1b1e22 !important;
}
</style>
