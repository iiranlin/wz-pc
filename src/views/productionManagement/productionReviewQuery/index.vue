<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Review ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Review from './review.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "productionReviewQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Review
    },
    data() {
        return {
            tabs: ['MASTER']
        }
    },
}
</script>