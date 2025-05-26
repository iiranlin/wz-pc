<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Lend ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Lend>
        </template>
        <template v-slot:branch="{ type, change }">
            <Lend ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Lend>
        </template>
    </TabWarp>
</template>
<script>
import Lend from './lend.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "lendOrderQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Lend
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>