<template>
    <Dialog :title="titleObj[type]" :visible.sync="openDataScope"  tabindex='1' :close-on-click-modal="false" width="800px" append-to-body v-loading="loading" >
        <VFormRender ref="vFormRef"
            @treeSelectSelect="treeSelectSelect"
            @treeSelectInput="treeSelectInput"
            @formChange="handleFormChange"
            >
        </VFormRender>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { baseStorageSave, baseStorageDetail } from '@/api/warehouseManage/baseStorage';
import { getWarehouseTree } from '@/api/warehouseManage/warehouse';
import { formFillInPage } from '@/api/form/form'
 import VFormRender from '@/components/form-render/index'
export default {
    components: {VFormRender},
    data() {
        return {
            loading: false,
            openDataScope: false,
            title: "",
            titleObj: {
                'create': '新增储区',
                'update': '修改储区',
                'view': '储区详情',
            },
            type: "create",
            id: null
        };
    },
    created() { },
    methods: {
        init(type, row = {}) {
            this.id = row.id || null
            this.type = type;
            this.openDataScope = true;
            this.$nextTick(async () => {
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();
                const res = await getWarehouseTree();
                this.$refs['vFormRef'].getWidgetRef('warehouseId').loadOptions(res.data || []);
                if(type == 'view'){
                    this.$refs['vFormRef'].setReadMode(true);
                    this.baseStorageDetail(row.id);
                }else{
                    this.$refs['vFormRef'].setReadMode(false);
                }
                if(type === 'update'){
                    let rowData = JSON.parse(JSON.stringify(row));
                    rowData.status = rowData.status == '0'? true:false;
                    this.$refs['vFormRef'].setFormData(Object.assign({}, rowData, {warehouseId: rowData.warehouseId || undefined}));
                }
            });
        },
        handleFormChange(fieldName, newValue, oldValue) {
            if(fieldName === 'warehouseId' && !newValue && newValue != oldValue) {
                this.$refs['vFormRef'].setFormData({
                    warehouseId: '',
                    warehouseCode: '',
                    warehouseName: ''
                })
            }
           
        },
        baseStorageDetail (id) {
            this.loading = true;
            baseStorageDetail(id).then(({ data }) => {
                this.$refs['vFormRef'].setFormData(Object.assign({}, data, {warehouseId: data.warehouseId || undefined}));
            }).finally(() => {
                this.loading = false;
            });
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('storageArea').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        treeSelectInput (vm, node) {
            let {
                field: {
                    options: {name},
                },
            } = vm || {};
            if(!node){
                if (name === "warehouseId") {
                    this.$refs.vFormRef.setFieldValue("warehouseCode", "");
                    this.$refs.vFormRef.setFieldValue("warehouseName", "");
                }
            }
        },
        // 部门树选择
        treeSelectSelect(vm, node) {
            let {
                field: {
                    options: {name},
                },
            } = vm || {};
            if (name === "warehouseId") {
                this.$refs.vFormRef.setFieldValue("warehouseCode", node.code);
                this.$refs.vFormRef.setFieldValue("warehouseName", node.name);
            }
        },
        submitDataScope () {
            this.$refs.vFormRef.getFormData().then(formData => {
                this.loading = true;
                formData.status = formData.status? '0':'1';
                baseStorageSave(Object.assign({}, formData, {id: this.id})).then(({ message }) => {
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
