<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Return ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Return>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Return ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Return>
        </template>
    </TabWarp>
</template>
<script>
import Return from './return.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "returnOrder",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Return
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>