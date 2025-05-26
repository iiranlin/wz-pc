<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Order ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Order>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Order ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Order>
        </template>
    </TabWarp>
</template>
<script>
import Order from './order.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "purchaseOrderQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Order
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>