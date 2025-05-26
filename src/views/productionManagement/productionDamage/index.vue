<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Damage ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Damage from './damage.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "productionDamage",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Damage
    },
    data() {
        return {
            tabs: ['MASTER']
        }
    },
}
</script>