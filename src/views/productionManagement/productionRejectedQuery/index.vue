<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Rejected ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Rejected>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Rejected ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Rejected>
        </template>
    </TabWarp>
</template>
<script>
import Rejected from './rejected.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "productionRejectedQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Rejected
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>