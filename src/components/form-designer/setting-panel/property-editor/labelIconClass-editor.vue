<template>
  <div>
    <el-form-item label-width="0">
      <el-divider class="custom-divider">{{i18nt('designer.setting.customLabelTip')}}</el-divider>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.labelTipHidden')">
      <el-switch v-model="optionModel.labelTipHidden"></el-switch>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.labelIconClass')">
      <el-input type="text" v-model="optionModel.labelIconClass"></el-input>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.labelTextClass')">
      <el-input type="text" v-model="optionModel.labelTextClass"></el-input>
    </el-form-item>
  </div>
</template>

<script>
  import i18n from "@/utils/i18n"

  export default {
    name: "labelIconClass-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
  }
</script>

<style lang="scss" scoped>
.custom-divider {
  ::v-deep .el-divider__text.is-center {
    width: 185px;
    text-align: center;
  }
}
</style>
