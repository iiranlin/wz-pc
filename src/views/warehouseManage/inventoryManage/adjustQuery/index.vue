<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <AdjustQuery ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <AdjustQuery ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import AdjustQuery from './adjustQuery.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "adjustQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        AdjustQuery
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>