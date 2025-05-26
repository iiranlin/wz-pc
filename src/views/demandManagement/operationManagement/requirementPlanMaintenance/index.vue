<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Requirement ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Requirement>
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Requirement ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type"></Requirement>
        </template>
    </TabWarp>
</template>
<script>
import Requirement from './requirement.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "requirementPlanMaintenance",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Requirement
    },
    data() {
        return {
            tabs: ['1', '2']
        }
    },
}
</script>