<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Quotation ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Quotation>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Quotation ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Quotation>
        </template>
    </TabWarp>
</template>
<script>
import Quotation from './quotation.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "quotationOrderQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Quotation
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>