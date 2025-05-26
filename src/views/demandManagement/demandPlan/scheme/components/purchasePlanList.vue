<template>
    <fragment>
        <el-table ref="tableRef" row-key="uid" :data="tableList" border class="saleOrderOperateEltable" height="335px"
            style="width: 100%">
            <el-table-column align="center" label="序号" width="50px" type="index" :index="tableIndex" />
            <el-table-column align="center" label="供应来源" prop="a" show-overflow-tooltip width="150">
            </el-table-column>
            <el-table-column align="center" label="是否作为供应" prop="b" show-overflow-tooltip
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
                {id: '1', a: '库存', b: true, c: 1, d: '合格品可用量>0'},
                {id: '2', a: '采购订单', b: true, c: 2, d: '<div>1.采购订单审核状态=已审核</div><div>2.采购到货日期靠前的优先作为供应</div><div>3.可供应数量=剩余未入库完成数量</div>'},
                {id: '3', a: '采购计划', b: true, c: 3, d: '<div>1.采购计划审核状态=已审核</div><div>2.预计到货日期靠前的优先作为供应</div><div>3.可供应数量取剩余未生成采购订单的数量</div>'},
                {id: '4', a: '调入单', b: true, c: 4, d: '<div>1.调拨订单审核状态=已审核</div><div>2.预计到货日期靠前的优先作为供应</div><div>3.可供应数量=剩余未入库完成数量</div>'},
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