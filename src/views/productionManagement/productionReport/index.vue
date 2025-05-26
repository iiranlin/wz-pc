<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Report ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Report ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Report from './report.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';

export default {
    name: "productionReport",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Report
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>