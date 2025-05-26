<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Scrap ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Scrap>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Scrap ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Scrap>
        </template>
    </TabWarp>
</template>
<script>
import Scrap from './scrap.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "scrapApplyQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Scrap
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>