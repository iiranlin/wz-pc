<template>
    <el-form-item>
        <span slot="label">{{ i18nt('designer.setting.fileDrag') }}
        </span>
        <el-switch v-model="optionModel.fileDrag"></el-switch>
    </el-form-item>
</template>

<script>
import i18n from "@/utils/i18n"

export default {
    name: "file-upload-fileDrag-editor",
    mixins: [i18n],
    props: {
        designer: Object,
        selectedWidget: Object,
        optionModel: Object,
    },
}
</script>

<style scoped></style>
