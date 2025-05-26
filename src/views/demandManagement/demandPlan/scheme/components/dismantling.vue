<template>
    <Dialog tabindex='1' class="flex-dialog" title="分流" :visible.sync="visible" :close-on-click-modal="false"
        append-to-body width="700px">
        <VFormRender ref="vFormRef" @formChange="handleFormChange"></VFormRender>
        <template #footer>
            <el-button plain round type="primary" @click="saveDismantling">保存</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
    </Dialog>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import VFormRender from '@/components/form-render/index'
export default {
    components: { VFormRender },
    data() {
        return {
            visible: false,
        }
    },
    methods: {
        init({planNum = 0, id = ''}) {
            this.visible = true;
            this._planNum = planNum
            this._id = id
            this.$nextTick(async () => {
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();
                this.$refs['vFormRef'].setFieldValue("planNum", planNum);
                this.$refs['vFormRef'].setFieldValue("divideNum", 0);
            })
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('dismantling').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        handleFormChange(key, val) {
            if (key == 'divideNum') {
                const divideNumWidget = this.$refs['vFormRef'].getWidgetRef('divideNum')
                const planNum = this._planNum - val
                divideNumWidget.$options.propsData.field.options.max = this._planNum
                this.$refs['vFormRef'].setFieldValue("planNum", planNum);
            }
        },
        saveDismantling() {
            const planNum = this.$refs['vFormRef'].getFieldValue("planNum");
            const divideNum = this.$refs['vFormRef'].getFieldValue("divideNum");
            if(!planNum || !divideNum) {
                this.$modal.msgError('计划数量和分流数量不能为0')
                return
            }
            this.$refs.vFormRef.getFormData().then(formData => {
                this.$emit('change', {...formData, id: this._id})
                this.visible = false
            })
        },
    }
}
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
    font-size: 16px;
    margin-left: 2px;
}

.slotIcon-color-content {
    color: red;
}
</style>