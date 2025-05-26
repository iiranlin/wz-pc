<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Receive ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Receive ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Receive from './receive.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "productionReceive",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Receive
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>