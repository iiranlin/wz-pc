<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Pre ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Pre>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Pre ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Pre>
        </template>
    </TabWarp>
</template>
<script>
import Pre from './pre.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "preOrderQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Pre
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>