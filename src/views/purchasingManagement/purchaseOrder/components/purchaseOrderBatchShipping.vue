<template>
    <Dialog class="max-height-dialog flex-dialog" :title="title" :visible.sync="openDataScope" :close-on-click-modal="false" width="900px" append-to-body v-loading="loading"  >
        <div class="container_flex_form">
            <VFormRender ref="vFormRef" class="container_flex_form_dialog" :global-dsv="globalDsv"
                @treeSelectSelect="treeSelectSelect" @treeSelectInput="treeSelectInput" @formChange="handleFormChange">
            </VFormRender>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">确定</el-button>
            <el-button @click="openDataScope = false">取消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { sendCreateAll } from '@/api/prodmgr-pu/send';
import { getWarehouseTree } from '@/api/warehouseManage/warehouse';
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import VFormRender from '@/components/form-render/index'
export default {
    components: {
        VFormRender
    },
    data() {
        return {
            loading: false,
            openDataScope: false,
            title: "批量发运填报",
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '14',
            },
            id: null,
            dataOptions: [],
            rowArr: [],
        };
    },
    created() {
        this.getWarehouseTree();
    },
    methods: {
        init(rowArr = []) {
            this.rowArr = rowArr;
            this.openDataScope = true;
            this.$nextTick(async () => {
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();
                this.$refs['vFormRef'].getWidgetRef('warehouseId').loadOptions(this.dataOptions || []);
            });
        },
        getWarehouseTree () {
            getWarehouseTree().then(({ data }) => {
                this.dataOptions = data || [];
            })
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('purchaseOrderBatchShipping').then(res => {
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
        handleFormChange(fieldName, newValue, oldValue, formModel) {
            if(fieldName === 'sendMethod'){
                if(newValue == '1'){
                    this.$refs.vFormRef.enableWidgets('expressName');
                    this.$refs.vFormRef.enableWidgets('sendExpressCode');
                }else{
                    this.$refs.vFormRef.setFieldValue("expressName", "");
                    this.$refs.vFormRef.setFieldValue("sendExpressCode", "");
                    this.$refs.vFormRef.disableWidgets('expressName');
                    this.$refs.vFormRef.disableWidgets('sendExpressCode');
                }
            }
        },
        submitDataScope () {
            this.$refs.vFormRef.getFormData().then(formData => {
                this.loading = true;
                const dataArr = this.rowArr.map( (item) => {
                    return Object.assign(item, formData, {puSuId: item.suOrderId,account: item.num, planArriverStartDate: formData.planArriverStartDate && formData.planArriverStartDate[0], planArriverEndDate: formData.planArriverStartDate && formData.planArriverStartDate[1]})
                })
                sendCreateAll(dataArr).then(({ message }) => {
                    this.$modal.msgSuccess(message);
                    this.openDataScope = false;
                    this.$emit('purchaseOrderBatchShippingSuccess');
                }).finally(() => {
                    this.loading = false;
                });
            }).catch(err => {
                this.$modal.msgError('表单数据校验失败');
            })
        },
    },
};
</script>
<style lang="scss" scoped>
::v-deep .el-dialog{
  border-radius: 16px;
  .el-dialog__title{
    color: #18223e;
  }
}
::v-deep .el-dialog__body{
  padding: 0 16px !important;
}
::v-deep .el-dialog__header{
  padding: 12px 20px;
  background: none !important;
}
::v-deep .el-form-item__label{
  padding: 0;
}
::v-deep .container_flex_form_select{
  .el-form-item__label{
    &::before {
      content: "";
      width: 4px;
      height: 4px;
      background: #3185ff;
      display: inline-block;
      margin-right: 5px;
      margin-bottom: 3px;
    }
  }
}
::v-deep .dialog_p{
  width: 100%;
  height: 32px;
  line-height: 32px;
  background: #f2f2f2;
  margin: 12px 0;
  padding: 0;
  color: #18223e;
  font-size: 12px;
  text-indent: 14px;
}
::v-deep .dialog-footer{
  .el-button--medium{
    padding: 8px 45px;
    font-size: 14px;
    border-radius: 5px;
  }
  .el-button--primary{
    background-color: #2054d0;
    border-color: #2054d0;
  }
}
.container_flex_form{
    overflow-x: hidden;
    margin: 0;
}
</style>