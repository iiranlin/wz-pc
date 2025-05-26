<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Query ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Query ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
        <template v-slot:branch0="{ type, change, refName }">
            <Query ref="branch0" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Query from './query.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';

export default {
    name: "inventoryQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Query
    },
    data() {
        return {
            tabs: ['MASTER', 'PROJECT','BRANCH']
        }
    },
}
</script>