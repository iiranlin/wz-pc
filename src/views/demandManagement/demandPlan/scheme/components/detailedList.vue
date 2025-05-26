<template>
    <fragment>
        <el-table ref="tableRef" row-key="uid" :data="tableList" border class="saleOrderOperateEltable" height="335px"
            style="width: 100%">
            <el-table-column align="center" label="序号" width="50px" type="index" :index="tableIndex" />
            <el-table-column align="center" label="需求来源" prop="a" show-overflow-tooltip width="150">
            </el-table-column>
            <el-table-column align="center" label="是否作为需求" prop="b" show-overflow-tooltip
                width="240">
                <template slot-scope="{row}">
                    <el-switch class="switch-12" v-model="row.b" :active-value="true" :inactive-value="false" active-color="#4998ff" inactive-color="#c5d1d8"></el-switch>
                </template>
            </el-table-column>
            <el-table-column align="center" label="供应优先级" prop="c" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="作为供应的固定条件" prop="d" show-overflow-tooltip>
                <template slot-scope="{row}">
                    <div v-html="row.d"></div>
                </template>
            </el-table-column>
        </el-table>
    </fragment>
</template>

<script>
import Fragment from 'vue-fragment'
import Vue from 'vue'
import indexMixin from '@/views/mixins';
import { getRouteByDemandPlanSourceType } from '@/utils'

Vue.use(Fragment.Plugin)
export default {
    dicts: ['MeasureUnit', 'planAttribute', 'demandPlanSourceType', 'YesNo'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog'),
    },
    props: {
        queryType: {
            type: String,
            default: ''
        },
        tableType: {
            type: String,
            default: '1'
        },
    },
    mixins: [indexMixin],
    data() {
        return {
            tableList: [
                {id: '1', a: '销售订单', b: true, c: 1, d: '<div>1.销售订单审核状态=已审核</div><div>2.需求日期靠前的优先作为供应</div><div>3.需求数量=剩余未生成需求计划数量</div>'},
                {id: '2', a: '销售预测单', b: true, c: 2, d: '<div>1.销售预测单审核状态=已审核</div><div>2.需求日期靠前的优先作为供应</div><div>3.需求数量=剩余未生成需求计划数量</div>'},
                {id: '3', a: '自研需求', b: true, c: 3, d: '<div>1.自研需求审核状态=已审核</div><div>2.需求日期靠前的优先作为供应</div><div>3.需求数量=剩余未生成需求计划数量</div>'},
            ]
        }
    },
    computed: {
    },
    methods: {
        getRouteByDemandPlanSourceType: getRouteByDemandPlanSourceType,
        async init(list) {
        },
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