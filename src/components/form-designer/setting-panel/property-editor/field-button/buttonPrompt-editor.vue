<template>
  <el-form-item :label="i18nt('designer.setting.buttonPrompt')">
    <el-input type="text" v-model="optionModel.buttonPrompt"></el-input>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"

  export default {
    name: "buttonPrompt-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
  }
</script>

<style scoped>

</style>
