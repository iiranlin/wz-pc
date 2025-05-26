<template>
    <el-form-item :label="i18nt('designer.setting.labelTipHidden')">
      <el-switch v-model="optionModel.labelTipHidden"></el-switch>
    </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"

  export default {
    name: "labelTipHidden-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
  }
</script>

<style lang="scss" scoped>
</style>
