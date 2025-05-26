<template>
    <el-form-item :label="i18nt('designer.setting.fieldCode')" :rules="fieldRequiredRule">
      <el-select v-model="optionModel.fieldCode">
        <el-option v-for="item in propInfo.columnList" :key="item.javaField" :label="item.javaField"
                   :value="item.javaField">
        </el-option>
      </el-select>
    </el-form-item>
  </template>
  
  <script>
    import i18n from "@/utils/i18n"
  
    export default {
      name: "field-editor",
      mixins: [i18n],
      props: {
        designer: Object,
        selectedWidget: Object,
        optionModel: Object,
      },
      inject: ['propInfo'],
      data() {
        return {
            fieldRequiredRule: [{required: true, message: 'fieldCode required'}],
        }
      }
    }
  </script>
  
  <style scoped>
  
  </style>
  