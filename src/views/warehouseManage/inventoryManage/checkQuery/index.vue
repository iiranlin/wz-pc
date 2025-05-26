<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <CheckQuery ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <CheckQuery ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import CheckQuery from './checkQuery.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "checkQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        CheckQuery
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>