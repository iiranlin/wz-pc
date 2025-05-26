<template>
  <TabWarp :tabs="tabs">
    <template v-slot:master="{ type, change, refName }">
      <InQuery ref="master" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type">
      </InQuery>
    </template>
    <template v-slot:branch="{ type, change, refName }">
      <InQuery ref="branch" :refName="refName" :refreshChange="handleRefresh" :tabChange="change" :tableType="type">
      </InQuery>
    </template>
  </TabWarp>
</template>
<script>
import InQuery from './inQuery.vue';
import TabWarp from '@/components/TabWarp'
import indexMixin from '@/views/mixins';
export default {
  name: "inventoryMaintenanceQuery",
  mixins: [indexMixin],
  components: {
    TabWarp,
    InQuery
  },
  data() {
    return {
      tabs: ['MASTER', 'BRANCH']
    }
  },
}
</script>