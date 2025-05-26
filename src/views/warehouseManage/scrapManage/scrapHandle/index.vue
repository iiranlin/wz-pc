<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Handle  ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Handle>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Handle ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Handle>
        </template>
    </TabWarp>
</template>
<script>
import Handle from './handle.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "scrapHandle",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Handle
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>