<template>
    <Dialog class="max-height-dialog flex-dialog" :title="title" :visible.sync="openDataScope" :close-on-click-modal="false" :width="'900px'" append-to-body v-loading="loading"  >
        <div class="container_flex_form">
            <div class="container_flex_form_tree">
              <el-form :inline="true" v-if="type === 'alreadyShipped' || type === 'view'">
                <el-form-item label="发运批号：" prop="startPageNum" class="container_flex_form_select">
                  <el-select v-model="puSendId" @change="handleNodeChange" style="width: 300px;">
                    <el-option v-for="item  in sendOptions" :key="item.puSendId" :label="item.puSuCode" :value="item.puSendId" />
                  </el-select>
                </el-form-item>
              </el-form>
                <!-- <el-tree
                    v-if="type === 'alreadyShipped' || type === 'view'"
                    class="drawer-tree"
                    node-key="puSendId"
                    :indent="0"
                    :data="sendOptions"
                    :props="defaultProps"
                    :expand-on-click-node="false"
                    ref="tree"
                    :highlight-current="true"
                    @node-click="handleNodeClick"
                >
                </el-tree> -->
                <VFormRender ref="vFormRef" class="container_flex_form_dialog" :global-dsv="globalDsv"
                    @treeSelectSelect="treeSelectSelect" @treeSelectInput="treeSelectInput" @formChange="handleFormChange">
                </VFormRender>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">确定</el-button>
            <el-button @click="openDataScope = false">取消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { sendCreate, sendModify, sendDetail, sendList } from '@/api/prodmgr-pu/send';
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
            title: "发运填报",
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '14',
            },
            id: null,
            dataOptions: [],
            row: {},
            sendOptions: [],
            defaultProps:{
                children: "children",
                label: "puSuCode",
            },
            type: '',
            puSendData: {},
            puSendId: ''
        };
    },
    created() {
        this.getWarehouseTree();
    },
    methods: {
        init(row = {}, type) {
            this.type = type;
            this.row = row;
            this.openDataScope = true;
            if(type === 'alreadyShipped'){
                this.title = '已发运';
            }else if(type === 'view'){
                this.title = '发运填报详情';
            }else{
                this.title = '发运填报';
            }
            this.$nextTick(async () => {
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();
                this.$refs['vFormRef'].getWidgetRef('warehouseId').loadOptions(this.dataOptions || []);
                if(this.type === 'alreadyShipped' || this.type === 'view'){
                    this.$refs['vFormRef'].setReadMode(true);
                    this.sendList(row.puOrderRawId);
                }else{
                    this.$refs['vFormRef'].setReadMode(false);
                    if(this.type === 'shipping'){
                        this.$refs['vFormRef'].setFormData(Object.assign({}, row, {warehouseId: row.warehouseId || undefined, account: row.num - (row.sendNum || 0)}));
                    }else{
                        this.$refs['vFormRef'].setFormData(Object.assign({}, row, {warehouseId: row.warehouseId || undefined}));
                    }
                }
            });
        },
        handleNodeChange (puSendId) {
            this.sendDetail(puSendId);
        },
        getWarehouseTree () {
            getWarehouseTree().then(({ data }) => {
                this.dataOptions = data || [];
            })
        },
        sendList (puOrderRawId = '') {
            sendList({puOrderRawId: puOrderRawId}).then(({ data }) => {
                this.sendOptions = data.list || [];
                this.$nextTick( () => {
                  if(data.list[0]){
                    // this.$refs.tree.setCurrentKey(data.list[0].puSendId);
                    this.puSendId = data.list[0].puSendId
                    this.sendDetail(data.list[0].puSendId);
                  }
                })
            })
        },
        sendDetail (id) {
            this.loading = true;
            sendDetail(id).then(({ data }) => {
                this.puSendData = data;
                this.$refs['vFormRef'].setFormData(Object.assign({}, data, {
                    warehouseId: data.warehouseId || undefined,
                    planArriverStartDate: data.planArriverStartDate && data.planArriverEndDate?[data.planArriverStartDate, data.planArriverEndDate]:[],
                }));
            }).finally(() => {
                this.loading = false;
            });
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('purchaseOrderShipping').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
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
        submitDataScope () {
            this.$refs.vFormRef.getFormData().then(formData => {
                this.loading = true;
                if(this.type === 'alreadyShipped'){
                    const data = Object.assign(this.puSendData, formData, {puSuId: this.row.suOrderId, planArriverStartDate: formData.planArriverStartDate && formData.planArriverStartDate[0], planArriverEndDate: formData.planArriverStartDate && formData.planArriverStartDate[1]})
                    sendModify(data).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.$emit('purchaseOrderShippingSuccess');
                    }).finally(() => {
                        this.loading = false;
                    });
                }else{
                    const data = Object.assign(this.row, formData, {puSuId: this.row.suOrderId, planArriverStartDate: formData.planArriverStartDate && formData.planArriverStartDate[0], planArriverEndDate: formData.planArriverStartDate && formData.planArriverStartDate[1]})
                    sendCreate(data).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.$emit('purchaseOrderShippingSuccess');
                    }).finally(() => {
                        this.loading = false;
                    });
                }
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
::v-deep .el-select__caret.el-icon-arrow-up::before {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 6px solid #141a30;
  position: absolute;
  top: 13px;
  left: 7px;
}
.container_flex_form{
    overflow-x: hidden;
    margin: 0;
}
.container_flex_form_tree{
    display: flex;
    flex-direction: column;
    height: 100%;
    .drawer-tree{
        width: 300px;
        height: 100%;
        border-right: 1px solid #dfe4ed;
        margin-right: 20px;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .container_flex_form_dialog{
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }
}
</style>