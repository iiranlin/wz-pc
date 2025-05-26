<template>
  <div class="app-container container_flex">
    <!-- 今日能耗 -->
    <el-tabs v-model="activeName">
      <el-tab-pane label="今日能耗" name="today">
        <todaysEnergy></todaysEnergy>
      </el-tab-pane>
      <el-tab-pane label="历史能耗" name="historical">
        <HistoricalEnergy></HistoricalEnergy>
      </el-tab-pane>
      <el-tab-pane label="仪表统计" name="energy">
        <EnergyInstrument></EnergyInstrument>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import todaysEnergy from '@/views/EquipmentManagement/energyManagement/todaysEnergy.vue'
import HistoricalEnergy from '@/views/EquipmentManagement/energyManagement/HistoricalEnergy.vue'
import EnergyInstrument from '@/views/EquipmentManagement/energyManagement/EnergyInstrument.vue'

export default {
  name: 'energyManagement',
  mixins: [indexMixin],
  data() {
    return {
      activeName: 'today',
    }
  },
  components:{todaysEnergy,HistoricalEnergy,EnergyInstrument},
  created() {},
  methods: {}
};
</script>
<style lang="scss" scoped>
::v-deep .el-tabs__nav {
  transform: translateX(25px) !important;
}
</style>
