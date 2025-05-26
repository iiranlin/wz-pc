<template>
  <el-form-item :label="i18nt('designer.setting.i18n')">
    <el-input type="text" v-model="optionModel.i18n"></el-input>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n";

  export default {
    name: "i18n-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
  }
</script>