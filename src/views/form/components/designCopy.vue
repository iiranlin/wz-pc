<template>
  <VFormDesigner v-if="openDataScope" ref="vfDesignerRef" :designer-config="designerConfig" :formData="formData">
    <template #customToolButtons>
      <el-button type="text" @click="printFormJson">保存</el-button>
    </template>
  </VFormDesigner>
</template>

<script>
import VFormDesigner from '@/components/form-designer/index.vue';
import { modify as formModify, detail as formDetail } from '@/api/form/form';
export default {
  components: { VFormDesigner },
  data() {
    return {
      title: '表单设计',
      type: 'form',
      openDataScope: false,
      dialogFull: true,
      formData: {},
      designerConfig: {
        resetFormJson: true,
        toolbarMaxWidth: 520,
      },
      formInfo: {},
      tableSelected: [],
      columnList: []
    }
  },
  provide() {
    return {
      formInfo: this.formInfo,
      propInfo: this
    }
  },
  created() {
  },
  methods: {
    init(type, designId) {
      this.type = type;
      this.openDataScope = true;
      if (designId) {
        if (type === 'form') {
          formDetail(designId).then(({ data }) => {
            this.formInfo.formData = data;
            this.formData = data;
            this.$refs.vfDesignerRef.setFormJson(data.formContent)
          })
        } else {
          this.designerConfig.logoHeader = false
          this.columnList = designId.columnList
          this.tableSelected = designId.tableSelected
        }
      }
    },
    printFormJson() {
      if (this.type === 'form') {
        this.formData.formContent = JSON.stringify(this.$refs.vfDesignerRef.getFormJson())
        formModify(this.formData).then(({ data }) => {
          this.$modal.msgSuccess("保存成功");
        })
      } 
    },
    closeVFormDesigner() {
      this.$router.go(-1)
    }
  },
  destroyed() {
    sessionStorage.removeItem('designId')
  }
};
</script>
<style lang="scss" scoped>
</style>