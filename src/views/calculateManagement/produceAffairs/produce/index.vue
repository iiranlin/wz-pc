<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Produce ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Produce ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Produce from './produce.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "ProduceTab",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Produce
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>