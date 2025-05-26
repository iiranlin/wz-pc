<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Demand ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Demand>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Demand ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Demand>
        </template>
    </TabWarp>
</template>
<script>
import Demand from './demand.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "selfResearchDemand",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Demand
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>