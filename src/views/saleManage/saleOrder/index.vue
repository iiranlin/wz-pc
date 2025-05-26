<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Sale ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Sale>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Sale ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Sale>
        </template>
    </TabWarp>
</template>
<script>
import Sale from './sale.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "saleOrder",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Sale
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>