<template>
    <el-form-item v-if="propInfo.tableSelected.length > 0" :label="i18nt('designer.setting.tableName')" :rules="tableRequiredRule">
      <el-select v-model="optionModel.tableName">
        <el-option v-for="item in propInfo.tableSelected" :key="item.tableName" :label="item.tableName"
                   :value="item.tableName">
        </el-option>
      </el-select>
    </el-form-item>
  </template>
  
  <script>
    import i18n from "@/utils/i18n"
  
    export default {
      name: "table-editor",
      mixins: [i18n],
      props: {
        designer: Object,
        selectedWidget: Object,
        optionModel: Object,
      },
      inject: ['propInfo'],
      data() {
        return {
          tableRequiredRule: [{required: true, message: 'tableName required'}],
        }
      }
    }
  </script>
  
  <style scoped>
  
  </style>
  