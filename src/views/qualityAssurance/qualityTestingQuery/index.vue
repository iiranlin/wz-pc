<template>
    <TabWarp :tabs="tabs" value="2">
        <template v-slot:master="{ type, change, refName }">
            <Testing ref="master" :tabChange="change" :tableType="type" :refName="refName" :refreshChange="handleRefresh"></Testing>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Testing ref="branch" :tabChange="change" :tableType="type" :refName="refName" :refreshChange="handleRefresh"></Testing>
        </template>
    </TabWarp>
</template>
<script>
import Testing from './testing.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "qualityTestingQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Testing
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>