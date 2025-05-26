<template>
  <TabWarp :tabs="tabs">
    <template v-slot:master="{ type, change, refName }">
      <InMaintenance ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type">
      </InMaintenance>
    </template>
    <template v-slot:branch="{ type, change, refName }">
      <InMaintenance ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type">
      </InMaintenance>
    </template>
  </TabWarp>
</template>
<script>
import InMaintenance from './inMaintenance.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
  name: "inventoryMaintenance",
  mixins: [indexMixin],
  components: {
    TabWarp,
    InMaintenance
  },
  data() {
    return {
      tabs: ['MASTER', 'BRANCH']
    }
  },
}
</script>