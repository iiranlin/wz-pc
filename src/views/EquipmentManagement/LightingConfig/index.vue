<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="区域配置" name="area">
        <areaConfig></areaConfig>
      </el-tab-pane>
      <el-tab-pane label="回路配置" name="loop">
        <loopConfig></loopConfig>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import areaConfig from './areaConfig.vue'  //区域配置
import loopConfig from './loopConfig.vue'  //回路配置
export default {
    name:'lightingConfig',
    components: {areaConfig,loopConfig},
    props: {},
    data() {
      return {
        activeName: 'area'
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
