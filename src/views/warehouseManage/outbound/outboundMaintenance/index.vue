<template>
  <TabWarp :tabs="tabs">
    <template v-slot:master="{ type, change, refName }">
      <maintenance ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type">
      </maintenance>
    </template>
    <template v-slot:branch="{ type, change, refName }">
      <maintenance ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type">
      </maintenance>
    </template>
  </TabWarp>
</template>
<script>
import maintenance from './maintenance.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
  name: "outboundMaintenance",
  mixins: [indexMixin],
  components: {
    TabWarp,
    maintenance
  },
  data() {
    return {
      tabs: ['MASTER', 'BRANCH']
    }
  },
}
</script>