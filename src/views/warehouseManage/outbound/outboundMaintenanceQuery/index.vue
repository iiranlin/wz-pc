<template>
  <TabWarp :tabs="tabs">
    <template v-slot:master="{ type, change, refName }">
      <OuQuery ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type">
      </OuQuery>
    </template>
    <template v-slot:branch="{ type, change, refName }">
      <OuQuery ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type">
      </OuQuery>
    </template>
  </TabWarp>
</template>
<script>
import OuQuery from './ouQuery.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
  name: "outboundMaintenanceQuery",
  mixins: [indexMixin],
  components: {
    TabWarp,
    OuQuery
  },
  data() {
    return {
      tabs: ['MASTER', 'BRANCH']
    }
  },
}
</script>