<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Product ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Product ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Product from './product.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';

export default {
    name: "productionOrderQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Product
    },
    data() {
        return {
            tabs: ['MASTER', 'BRANCH']
        }
    },
}
</script>