<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Material ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Material>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Material ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Material>
        </template>
    </TabWarp>
</template>
<script>
import Material from './material.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "materialApplicationMaintenance",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Material
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>