<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Plan ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Plan>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Plan ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Plan>
        </template>
    </TabWarp>
</template>
<script>
import Plan from './plan.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "purchasePlan",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Plan
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>