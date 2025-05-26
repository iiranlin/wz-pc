<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Adjust ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Adjust>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Adjust ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Adjust>
        </template>
    </TabWarp>
</template>
<script>
import Adjust from './adjust.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "adjustFormReview",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Adjust
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>