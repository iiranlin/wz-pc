<template>
    <Dialog class="max-height-dialog flex-dialog" :visible.sync="openDataScope" :destroy-on-close="true" :close-on-click-modal="false" :width="type === 'alreadyShipped' || type === 'view'?'1200px': '1000px'" append-to-body v-loading="loading" >
        <div slot="title">
            <span class="el-dialog__title">{{ type == 'normalDelivery' || type == 'reissueDelivery'?`${row.purCode}-${row.rowNum}`: ''}}{{ titleObj[type] }}<tooltip content="已质检的数据不支持调整"  v-if="type == 'deliveryAdjustment'" /></span>
        </div>
        <div class="container_flex_form">
            <div class="container_flex_form_tree">
                <el-tree
                    v-if="type != 'normalDelivery' && type != 'reissueDelivery' && type != 'purCode'"
                    class="drawer-tree"
                    node-key="id"
                    :indent="0"
                    :data="sendOptions"
                    :props="defaultProps"
                    :expand-on-click-node="false"
                    ref="tree"
                    :highlight-current="true"
                    @node-click="handleNodeClick"
                >
                </el-tree>
                <div class="container_flex_form_dialog" :key="row.contractId + row.matlClassifyId + row.matlId + row.puOrderRawId + row.sourceRawId + row.suId">
                    <VFormRender ref="vFormRef" :global-dsv="globalDsv"
                        @treeSelectSelect="treeSelectSelect" @treeSelectInput="treeSelectInput" @formChange="handleFormChange">
                        <template slot="fileList">
                            <div style="display: flex;flex-direction: column;" >
                                <attachmentTable ref="attachmentTable" :queryType="type == 'arrivalDetails' || type == 'purCode' || type == 'listDetails' ? 'view' : 'create'" v-model="fileList"></attachmentTable>
                            </div>
                    </template>
                    </VFormRender>
                    
                </div>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button :type="['1', '2'].includes(puSendData.bizStatus) && type === 'deliveryAdjustment'?'info':'primary'" @click="submitDataScope" v-if="!['arrivalDetails', 'purCode', 'listDetails'].includes(type)" :disabled="['1', '2'].includes(puSendData.bizStatus) && type === 'deliveryAdjustment'">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import attachmentTable from '@/views/components/attachmentTable'
import {arrivedSave, arrivedDetail, detailByArrivedId} from '@/api/prodmgr-pu/arrived'
import { getWarehouseTree } from '@/api/warehouseManage/warehouse';
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import { userListAll } from '@/api/system/user'
import { getUserInfo } from '@/utils/user-info'
import { generateUUID } from '@/utils'
import VFormRender from '@/components/form-render/index'
import dayjs from 'dayjs';
export default {
    components: {
        attachmentTable,
        VFormRender,
        tooltip: () => import('@/components/tooltip')
    },
    data() {
        return {
            loading: false,
            openDataScope: false,
            titleObj: {
                'normalDelivery': '正常到货',
                'reissueDelivery': '补发到货',
                'deliveryAdjustment': '到货调整',
                'arrivalDetails': '到货详情',
                'purCode': '到货详情',
                'listDetails': '到货详情',
            },
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
                label: "batchNo",
            },
            type: '',
            puSendData: {},
            userInfo: getUserInfo(),
            formData: {

            },
            fileList: [],
        };
    },
    created() {
        this.getWarehouseTree();
    },
    methods: {
        init(type, row = {}) {
            this.fileList = []
            this.type = type;
            if(type == 'normalDelivery') {
                row.arrivedDate = dayjs().valueOf()
            }
            this.row = row;
            this.openDataScope = true;
            this.$nextTick(async () => {
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();
                this.$refs['vFormRef'].getWidgetRef('warehouseId').loadOptions(this.dataOptions || []);
                const {deptId, nickName, id: nickId} = this.userInfo;
                await this.getUserListAll(deptId);
                this.$refs['vFormRef'].setFieldValue("confirmUserId", nickId);
                this.$refs['vFormRef'].setFieldValue("confirmUserName", nickName);
                this.$refs['vFormRef'].setFieldValue("planArriverStartDate", new Date().getTime());
                // 正常到货
                if(type === 'normalDelivery'){
                    this.$refs['vFormRef'].setReadMode(false);
                    this.$refs['vFormRef'].setFormData(Object.assign({}, row, {arrivedNum: row.arrivedNum? row.arrivedNum : row.purNum - row.arrivedQuoteNum ,warehouseId: row.warehouseId || undefined, account: row.num - (row.sendNum || 0), receiverDate: new Date().getTime()}));
                }
                if(type === 'reissueDelivery'){
                    this.$refs['vFormRef'].setReadMode(false);
                    this.$refs['vFormRef'].setFormData(Object.assign({}, row, {warehouseId: row.warehouseId || undefined, receiverDate: new Date().getTime()}));
                }
                //  到货调整
                if(this.type === 'deliveryAdjustment'){
                    this.$refs['vFormRef'].setReadMode(false);
                    this.sendList(row.id);
                }
                if(this.type === 'arrivalDetails'){
                    this.$refs['vFormRef'].setReadMode(true);
                    this.sendList(row.id);
                }
                if(this.type === 'purCode'){
                    this.$refs['vFormRef'].setReadMode(true);
                    this.sendDetail(row.puSendId);
                }
                //质检列明细列表点批号
                if(this.type === 'listDetails'){
                    this.$refs['vFormRef'].setReadMode(true);
                    this.detailByArrivedId(row.arrivedId);
                }
            });
        },
        loadDetail(id) {

        },
        async getUserListAll(deptId){
            const res = await userListAll({deptId});
            this.$refs['vFormRef'].getWidgetRef('confirmUserId').loadOptions(res.data.list || []);
        },
        handleNodeClick (data) {
            this.sendDetail(data.id);
        },
        getWarehouseTree () {
            getWarehouseTree().then(({ data }) => {
                this.dataOptions = data || [];
            })
        },
        sendList (puOrderRawId) {
            arrivedDetail(puOrderRawId).then(({ data }) => {
                this.sendOptions = data || [];
                this.$nextTick( () => {
                    const lastId = data[data.length - 1].id
                    this.$refs.tree.setCurrentKey(lastId);
                    this.sendDetail(lastId);
                })
                
            })
        },
        sendDetail (id) {
           const [node] =  this.sendOptions.filter(item => item.id == id)
            this.puSendData = node;
                    this.fileList = !!node.fileList.length ? node.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                    this.$refs['vFormRef'].setFormData(Object.assign({}, node, {
                        warehouseId: node.warehouseId || undefined,
                    }));
            // this.loading = true;
            // sendDetail(id).then(({ data }) => {
            //     this.puSendData = data;
            //     this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
            //     this.$refs['vFormRef'].setFormData(Object.assign({}, data, {
            //         warehouseId: data.warehouseId || undefined,
            //     }));
            // }).finally(() => {
            //     this.loading = false;
            // });
        },
        detailByArrivedId (id) {
          detailByArrivedId(id).then(({ data }) => {
            this.sendOptions = [data];
            this.$nextTick( () => {
              this.$refs.tree.setCurrentKey(data.id);
              this.sendDetail(data.id);
            })
          })
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('normalDelivery').then(res => {
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
                if (name === "confirmUserId") {
                    this.$refs.vFormRef.setFieldValue("confirmUserId", "");
                    this.$refs.vFormRef.setFieldValue("confirmUserName", "");
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
            if (name === "confirmUserId") {
                this.$refs.vFormRef.setFieldValue("confirmUserId", node.id);
                this.$refs.vFormRef.setFieldValue("confirmUserName", node.nickName);
            }
        },
        submitDataScope () {
            this.$refs.vFormRef.getFormData().then(formData => {
                this.loading = true;
                if(this.type === 'normalDelivery' || this.type === 'reissueDelivery'){
                    const arrivedType = this.type === 'normalDelivery'?'1':'2'
                    const data = Object.assign(this.row, formData, {fileList: this.fileList,purOrderCode: this.row.purCode,purOrderDetailId: this.row.id, purOrderRowNum: this.row.rowNum,   planArriverStartDate: formData.planArriverStartDate, planArriverEndDate: formData.planArriverStartDate, arrivedType})
                    if(parseFloat(data.arrivedNum) <= 0) {
                        this.loading = false;
                        this.$modal.msgError('本次到货数量不能为0')
                       
                        return
                    }
                    delete data.id
                    arrivedSave([data]).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.$emit('normalDeliverySuccess');
                    }).finally(() => {
                        this.loading = false;
                    });
                }else{
                    const data = Object.assign(this.puSendData, formData, {fileList: this.fileList, planArriverStartDate: formData.planArriverStartDate, planArriverEndDate: formData.planArriverStartDate})
                    if(parseFloat(data.arrivedNum) <= 0) {
                        this.loading = false;
                        this.$modal.msgError('本次到货数量不能为0')
                        return
                    }
                    arrivedSave([data]).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.$emit('normalDeliverySuccess');
                    }).finally(() => {
                        this.loading = false;
                    });
                }
            }).catch(() => {
                this.$modal.msgError('表单数据验证失败')
            })
        },
       
    },
};
</script>
<style lang="scss" scoped>
.slotIcon-color{
    color: #1890ff;
    font-size: 16px;
}
.container_flex_form{
    overflow-x: hidden;
}
.container_flex_form_tree{
    display: flex;
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
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }
}
.dialog-footer{
  .el-button--info.is-disabled{
    margin-right: 16px;
  }
}
</style>