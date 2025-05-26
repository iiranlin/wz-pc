<template>
    <Dialog :title="titleObj[type]" :visible.sync="openDataScope"  tabindex='1' :close-on-click-modal="false" width="800px" append-to-body v-loading="loading" >
        <VFormRender ref="vFormRef"
            @selectChange="selectChange">
        </VFormRender>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>
<script>
import {baseApplyDetail,baseApplySave} from '@/api/warehouseManage/intelligentApplication'
import { formFillInPage } from '@/api/form/form'
import VFormRender from '@/components/form-render/index'

export default {
    components: {VFormRender},
    dicts: ['applyCategory','frameType', 'workbenchApplyType'],

    data() {
        return {
            loading: false,
            openDataScope: false,
            title: "",
            titleObj: {
              'create': '新增设备',
              'update': '修改设备',
              'view': '设备详情',
            },
            type: "create",
            id: null
        };
    },
    created(){ 

    },
    methods: {
        init(type, row = {}) {
            this.id = row.id || null
            this.type = type;
            this.openDataScope = true;
            this.$nextTick(async () => {
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();

                if(type == 'view'){
                    this.$refs['vFormRef'].setReadMode(true);
                    this.baseApplyDetail(row.id);
                }else{
                    this.$refs['vFormRef'].setReadMode(false);
                }
                if(type === 'update'){
                    let rowData = JSON.parse(JSON.stringify(row));
                    rowData.status = rowData.status == '0'? true:false;
                    this.$refs['vFormRef'].setFormData(rowData || undefined);

                    this.applyCategoryChange();
                }
            });
        },
        baseApplyDetail (id) {
            this.loading = true;

            baseApplyDetail(id).then(({ data }) => {
                this.$refs['vFormRef'].setFormData(data || undefined);
                this.applyCategoryChange();
            }).finally(() => {
                this.loading = false;
            });
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('intelligentApplication').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        selectChange(name, node){
            if(name == 'applyCategory'){
                this.$refs['vFormRef'].setFieldValue("applyType","");
                this.$refs['vFormRef'].setFieldValue("machineType","");
                this.applyCategoryChange();
            }
        },
        applyCategoryChange(){
            let applyCategory = this.$refs['vFormRef'].getFieldValue("applyCategory");

            if(applyCategory == 1){
                this.$refs['vFormRef'].getWidgetRef('applyType').loadOptions(this.dict.type.frameType || []);
                this.$refs['vFormRef'].hideWidgets('machineType');
            }else if(applyCategory == 2){
                this.$refs['vFormRef'].getWidgetRef('applyType').loadOptions(this.dict.type.workbenchApplyType || []);
                this.$refs['vFormRef'].showWidgets('machineType');
            }
        },
        submitDataScope () {
            this.$refs.vFormRef.getFormData().then(formData => {
                this.loading = true;
                formData.status = formData.status? '0':'1';
                baseApplySave(Object.assign({}, formData, {id: this.id})).then(({ message }) => {
                    this.$modal.msgSuccess(message);
                    this.openDataScope = false;
                    this.$emit('operateSuccess');
                }).finally(() => {
                    this.loading = false;
                });
            }).catch(() => {
                this.$modal.msgError('表单数据验证失败')
            })
        }
    },
};
</script>
