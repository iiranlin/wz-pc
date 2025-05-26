<template>
  <el-form-item :label="i18nt('designer.setting.dateFrame')">
    <el-select v-model="optionModel.dateFrame" @change="selectChange">
      <el-option label="默认" value="default"></el-option>
      <el-option label="不大于当前时间" value="precurrenttime"></el-option>
      <el-option label="开始时间" value="startDate"></el-option>
      <el-option label="截止时间" value="endDate"></el-option>
    </el-select>
    <el-input v-if="optionModel.dateFrame == 'startDate' || optionModel.dateFrame == 'endDate'" v-model="optionModel.dateFrameName"></el-input>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n";

  export default {
    name: "date-frame-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    mounted () {
    },
    methods: {
        selectChange () {
            this.optionModel.dateFrameName = '';
        }
    }
  }
</script>

<style scoped>

</style>