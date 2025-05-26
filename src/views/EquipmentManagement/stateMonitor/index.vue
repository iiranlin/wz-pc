<template>
  <div>
    <el-tabs v-model="activeName">
      <!-- <el-tab-pane label="电梯" name="first">
          <deviceBus></deviceBus>
      </el-tab-pane> -->
      <el-tab-pane label="空调" name="second">
        <airConditioning></airConditioning>
      </el-tab-pane>
      <!-- <el-tab-pane label="检票机" name="third">
        <ticketCheck></ticketCheck>
      </el-tab-pane>
      <el-tab-pane label="自动售票机" name="fourth">
        <automaticRetrieval></automaticRetrieval>
      </el-tab-pane> -->
      <!-- <el-tab-pane label="广播" name="fourth1">
        <broadcast></broadcast>
      </el-tab-pane>
      <el-tab-pane label="导向屏" name="fourth2">
        <guide></guide>
      </el-tab-pane>
      <el-tab-pane label="环境舒适度" name="fourth3">
        <comfort></comfort>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
  import deviceBus from './deviceBus.vue' // 电梯
  import airConditioning from './airConditioning.vue' // 空调
  import ticketCheck from './ticketCheck.vue' // 检票机
  import automaticRetrieval from './automaticRetrieval.vue' // 自动取票
  import broadcast from './broadcast.vue' // 广播
  import guide from './guide.vue' // 导向屏
  import comfort from './comfort.vue' //  环境舒适度
  export default {
    name: 'stateMonitor',
    components: {deviceBus,airConditioning, ticketCheck,automaticRetrieval,broadcast,guide,comfort},
    props: {},
    data() {
      return {
        activeName: 'second',
      }
    },
    watch: {},
    computed: {},
    methods: {

    },
    created() { },
    mounted() { },
  }
</script>
<style lang="scss" scoped>
::v-deep .el-tabs__nav {
  transform: translateX(25px) !important;
}
</style>
