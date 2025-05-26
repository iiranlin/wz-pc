<template>
  <div>
    <el-tabs v-model="activeName">
      <!-- <el-tab-pane label="客票设备" name="first">
        <visitorDevice></visitorDevice>
      </el-tab-pane>
      <el-tab-pane label="旅服设备" name="second">
        <tourismDevice></tourismDevice>
      </el-tab-pane>
      <el-tab-pane label="电梯" name="third">
        <liftList></liftList>
      </el-tab-pane> -->
      <el-tab-pane label="空调" name="fourth">
        <airList></airList>
      </el-tab-pane>
      <el-tab-pane label="传感器" name="fourth1">
        <sensor></sensor>
      </el-tab-pane>
      <!-- <el-tab-pane label="消防设备" name="fourth2">
        <drainage></drainage>
      </el-tab-pane>
      <el-tab-pane label="门禁" name="fourth3">
        <heatSource></heatSource>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>
<script>
import visitorDevice from './visitorDevice.vue'  //客票3
import tourismDevice from './tourismDevice.vue'  //旅服
import liftList from './liftList.vue'  //电梯
import airList from './airList.vue'  //空调
import sensor from './sensor.vue'  //传感器
import drainage from './drainage.vue'  // 排水
import heatSource from './heatSource.vue'  //电梯
export default {
    name:'first',
    components: {visitorDevice,tourismDevice,liftList,airList,sensor,drainage,heatSource},
    props: {},
    data() {
      return {
        activeName: 'fourth'
      }
    },
    watch: {},
    computed: {},
    methods: {},
    created() {
    },
    mounted() { },
  }
</script>
<style lang="scss" scoped>
::v-deep .el-tabs__nav {
  transform: translateX(25px) !important;
}
</style>
