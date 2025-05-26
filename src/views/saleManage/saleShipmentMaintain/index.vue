<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Shipment ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Shipment>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Shipment ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Shipment>
        </template>
    </TabWarp>
</template>
<script>
import Shipment from './shipment.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "saleShipmentMaintain",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Shipment
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>