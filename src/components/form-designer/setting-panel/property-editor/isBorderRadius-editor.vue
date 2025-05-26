<template>
    <el-form-item :label="i18nt('designer.setting.isBorderRadius')">
      <el-switch v-model="optionModel.isBorderRadius"></el-switch>
    </el-form-item>
  </template>
  
  <script>
    import i18n from "@/utils/i18n"
  
    export default {
      name: "isBorderRadius-editor",
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
  