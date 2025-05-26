<template>
    <TabWarp :tabs="tabs">
        <template v-slot:master="{ type, change, refName }">
            <Workbench ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
        <template v-slot:branch="{ type, change, refName }">
            <Workbench ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
        <template v-slot:branch0="{ type, change, refName }">
            <Workbench ref="branch0" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
        <template v-slot:branch1="{ type, change, refName }">
            <Workbench ref="branch1" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
        <template v-slot:branch2="{ type, change, refName }">
            <Workbench ref="branch2" :refName="refName" :refreshChange="handleRefresh" :tabChange="change"
                :tableType="type" />
        </template>
    </TabWarp>
</template>
<script>
import Workbench from './workbench.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
    name: "demandPlanWorkbenchQuery",
    mixins: [indexMixin],
    components: {
        TabWarp,
        Workbench
    },
    data() {
        return {
            tabs: ['1', '2', '3', '4', '5']
        }
    },
}
</script>