<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Inventory ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Inventory ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Inventory from './inventory.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "InventoryTab",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Inventory
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>