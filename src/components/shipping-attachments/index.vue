<template>
  <div>
    <el-form-item v-for="field in fields" :key="field.key" :prop="field.key" :label="field.label"
      class="label-right-align shipping-attachment-field"
      :rules="required && field.required ? [{ required: true, type: 'array', min: 1, message: '请上传' + field.label, trigger: 'change' }] : []">
      <fileUpload :value="model[field.key] || []" @input="$set(model, field.key, $event)"
        :limit="9999" :preview="preview" :fileSize="500" :isShowTip="false"
        :fileType="['pdf', 'jpg', 'png', 'jpeg']" :isImgToPdf="group === 'photos' && imageToPdf" />
    </el-form-item>
  </div>
</template>

<script>
import fileUpload from '@/components/upload';
import { loadingPhotoFields, qualityFileFields } from '@/utils/shipping-attachments';

export default {
  name: 'ShippingAttachments',
  components: { fileUpload },
  props: {
    model: { type: Object, required: true },
    group: { type: String, default: 'photos' },
    preview: { type: Boolean, default: true },
    required: { type: Boolean, default: false },
    imageToPdf: { type: Boolean, default: false },
    qualityProp: { type: String, default: 'zlzmwj' },
    fieldKey: { type: String, default: '' }
  },
  computed: {
    fields() {
      const fields = this.group === 'photos' ? loadingPhotoFields : qualityFileFields;
      const result = fields.map(field => ({ ...field, required: true }));
      if (this.group === 'quality') {
        result.push({ key: this.qualityProp, label: '其他质量文件', required: false });
      }
      if (this.fieldKey === 'otherQuality') return result.filter(field => field.key === this.qualityProp);
      return this.fieldKey ? result.filter(field => field.key === this.fieldKey) : result;
    }
  }
};
</script>

<style lang="scss" scoped>
.shipping-attachment-field {
  margin-bottom: 0;
  min-height: 38px;

  ::v-deep .el-form-item__label {
    text-align: right;
    white-space: nowrap;
    padding-left: 2px;
    padding-right: 8px;
  }

  ::v-deep .el-form-item__content {
    min-width: 0;
    overflow-wrap: anywhere;
  }
}
</style>
