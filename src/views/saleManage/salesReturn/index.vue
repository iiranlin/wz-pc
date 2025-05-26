<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <SaleReturn ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></SaleReturn>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <SaleReturn ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></SaleReturn>
        </template>
    </TabWarp>
</template>
<script>
import SaleReturn from './salesReturn.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "salesReturn",
    mixins: [indexMixin],
    components: {
        TabWarp,
        SaleReturn
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>