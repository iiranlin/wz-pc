<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Ledger ref="ledger" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Ledger ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
        <template v-slot:branch0="{ type, change, refName }">
            <Ledger ref="branch0" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
        <template v-slot:branch1="{ type, change, refName }">
            <Ledger ref="branch1" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
        <template v-slot:branch2="{ type, change, refName }">
            <Ledger ref="branch2" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Ledger from './ledger.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "LedgerTab",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Ledger
    },
    data() {
        return {
            tabs: ['ledger', 'storageDetail', 'outboundShipmentsDetail', 'allocateDetail', 'inventoryDetail']
        }
    },
}
</script>