<template>
    <Dialog :title="titleObj[type]" :visible.sync="openDataScope"  tabindex='1' :close-on-click-modal="false" width="800px" append-to-body v-loading="loading" >
        <VFormRender ref="vFormRef"
            @treeSelectSelect="treeSelectSelect"
            @treeSelectInput="treeSelectInput"
            @appendButtonClick="handleAppendButtonClick"
            @selectChange="selectChange">

            <template slot="batchAddPlaceStatusTips">
                <el-tooltip class="slotIcon-batchAddPlaceStatus" placement="top" effect="light">
                    <div slot="content" class="slotIcon-color-content">
                        可一次性新增多个货位；数量在批量规格中设置
                    </div>
                    <i class="el-icon-question"></i>
                </el-tooltip>
            </template>
            <div slot="specifications" v-if="specificationsShow">
                <el-form ref="elform" :model="formData" label-width="80px" label-position="right">
                    <el-form-item label="批量规格" prop="modelTotal">
                        <div v-if="type == 'create' || type == 'update'">
                            <el-input-number v-model="formData.batchSpecsRow" :controls="false" style="width: 50px; margin-right: 4px" :precision="0" :min="1" :max="10"
                                :disabled="frameDisabled" @change="handleRowChange"/>
                            <span>层</span>
                            <el-input-number v-model="formData.batchSpecsCol" :controls="false" style="width: 50px; margin: 0 4px;" :precision="0" :min="1" :max="10"
                                :disabled="frameDisabled" @change="handleColChange"/>
                            <span>列</span>
                            <span style="margin-left: 8px">共</span>
                            <span style="margin: 0 4px">{{formData.modelTotal}}</span>
                            <span>货位</span>
                        </div>
                        <div v-else>
                            <span style="width: 50px; margin-right: 4px">{{formData.batchSpecsRow}}</span>
                            <span>层</span>
                            <span style="width: 50px; margin: 0 4px;">{{formData.batchSpecsCol}}</span>
                            <span>列</span>
                            <span style="margin-left: 8px">共</span>
                            <span style="margin: 0 4px">{{formData.modelTotal}}</span>
                            <span>货位</span>
                        </div>
                    </el-form-item>
                    <el-tooltip class="slotIcon-specifications" placement="top" effect="light" v-if="type != 'view'">
                        <div slot="content" class="slotIcon-color-content">
                            批量新增几层几列共多少个货位
                        </div>
                        <i class="el-icon-question"></i>
                    </el-tooltip>
                </el-form>
            </div>
        </VFormRender>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
        <choicePlaceFrame ref="choicePlaceFrameRef" singleMode @confirm="handleConfirm"/>
    </Dialog>
</template>

<script>
import { basePassageGetPassageTree } from '@/api/warehouseManage/basePassage';
import { basePlaceSave,basePlaceDetail } from '@/api/warehouseManage/basePlace';
import { formFillInPage } from '@/api/form/form'
import VFormRender from '@/components/form-render/index'
export default {
    dicts: ['placeFrame'],
    components: {
        VFormRender,
        choicePlaceFrame: () => import('@/views/components/choice-placeFrame')
    },
    data() {
        return {
            loading: false,
            openDataScope: false,
            placeFrameArr: [],
            title: "",
            titleObj: {
                'create': '新增货位',
                'update': '修改货位',
                'view': '货位详情',
            },
            type: "create",
            id: null,

            formData:{
                batchSpecsRow:'',
                batchSpecsCol:'',
                modelTotal:'',
            },
            frameDisabled:false,
            specificationsShow:true,
        };
    },
    watch: {
        formData: {
            handler: function(val) {
                this.formData.modelTotal = val.batchSpecsRow * val.batchSpecsCol
            },
            deep: true
        }
    },
    created() { 

    },
    methods: {
        handleConfirm(data) {
            this.$refs.vFormRef.setFieldValue("frameCode", data.frameCode);
            this.$refs.vFormRef.setFieldValue("frameId", data.id);

            this.$refs.vFormRef.setFieldValue("passageId", data.passageId);
            this.$refs.vFormRef.setFieldValue("passageName", data.passageName);
            this.$refs.vFormRef.setFieldValue("passageCode", data.passageCode);

            this.$refs.vFormRef.setFieldValue("batchAddPlaceStatus", '1');

            this.$refs.vFormRef.disableWidgets('passageId');
            this.$refs.vFormRef.disableWidgets('batchAddPlaceStatus');

            this.formData.batchSpecsRow = data.frameRow;
            this.formData.batchSpecsCol = data.frameCol;
            this.frameDisabled = true;
            this.showSpecifications();
            this.hidePlaceItem();
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            if(name === 'frameCode') {
                const frameCode = this.$refs.vFormRef.getFieldValue("frameCode");
                this.$refs.choicePlaceFrameRef.init(frameCode)
            }
        }, 
        init(type, row = {}) {
            this.id = row.id || null
            this.type = type;
            this.openDataScope = true;
            this.frameDisabled = false;
            this.formData = {
              batchSpecsRow:'',
              batchSpecsCol:'',
              modelTotal:'',
            }
            this.$nextTick(async () => {
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();

                this.showSpecifications();

                const res = await basePassageGetPassageTree();
                this.$refs['vFormRef'].getWidgetRef('passageId').loadOptions(res.data || []);
                if(type == 'view'){
                    this.$refs['vFormRef'].setReadMode(true);
                }else{
                    this.$refs['vFormRef'].setReadMode(false);
                }
                if(type === 'update' || type == 'view'){
                    let {data} = await basePlaceDetail(row.id);

                    data.status = data.status == '0'? true:false;
                    this.$refs['vFormRef'].setFormData(Object.assign({}, data, {passageId: data.passageId || undefined}));
              
                    if(!!data.frameCode){
                        this.$refs.vFormRef.disableWidgets('passageId');
                    }
                    this.$refs.vFormRef.disableWidgets('batchAddPlaceStatus');

                    this.hideSpecifications();
                    this.showPlaceItem();
                }
            });
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('goodsPosition').then(res => {
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
                if (name === "passageId") {
                    this.$refs.vFormRef.setFieldValue("passageCode", "");
                    this.$refs.vFormRef.setFieldValue("passageName", "");
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
            if (name === "passageId") {
                this.$refs.vFormRef.setFieldValue("passageCode", node.code);
                this.$refs.vFormRef.setFieldValue("passageName", node.name);
            }
        },
        selectChange(name, node, type) {
            if(name == 'frameCode'){
                let frameCode = this.$refs.vFormRef.getFieldValue("frameCode");

                if(!frameCode){
                    this.$refs.vFormRef.setFieldValue("frameCode", '');
                    this.$refs.vFormRef.setFieldValue("frameId",'');

                    this.$refs.vFormRef.setFieldValue("passageId", '');
                    this.$refs.vFormRef.setFieldValue("passageName", '');
                    this.$refs.vFormRef.setFieldValue("passageCode", '');

                    this.$refs.vFormRef.enableWidgets('passageId');
                    this.$refs.vFormRef.enableWidgets('batchAddPlaceStatus');
                    
                    this.formData.batchSpecsRow = '1';
                    this.formData.batchSpecsCol = '1';
                    this.frameDisabled = false;
                }
            }else if(name == 'batchAddPlaceStatus'){
                if(node== '1'){
                    this.showSpecifications();
                    this.hidePlaceItem();
                }else{
                    this.hideSpecifications();
                    this.showPlaceItem();
                }
            }else if(name == 'status' && !node){
                this.$modal.confirm('是否确定停用？', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {

                }).catch((err) => {
                    this.$refs.vFormRef.setFieldValue("status", true);
                })
            }
        },
        showSpecifications(){
            this.specificationsShow = true;
        },
        hideSpecifications(){
            this.formData.batchSpecsRow = '';
            this.formData.batchSpecsCol = '';
            this.specificationsShow = false;
        },
        showPlaceItem(){
            this.$refs.vFormRef.showWidgets('placeCode')
            this.$refs.vFormRef.showWidgets('placeName')
            this.$refs.vFormRef.showWidgets('placeRow')
            this.$refs.vFormRef.showWidgets('placeCol')
        },
        hidePlaceItem(){
            this.$refs.vFormRef.setFieldValue("placeCode", "");
            this.$refs.vFormRef.setFieldValue("placeName", "");
            this.$refs.vFormRef.setFieldValue("placeRow", "");
            this.$refs.vFormRef.setFieldValue("placeCol", "");

            this.$refs.vFormRef.hideWidgets('placeCode')
            this.$refs.vFormRef.hideWidgets('placeName')
            this.$refs.vFormRef.hideWidgets('placeRow')
            this.$refs.vFormRef.hideWidgets('placeCol')
        },
        handleRowChange(currentValue, oldValue){
            if(!currentValue){
                this.formData.batchSpecsRow = '1'
            }
        },
        handleColChange(currentValue, oldValue){
            if(!currentValue){
                this.formData.batchSpecsCol = '1'
            }
        },
        submitDataScope () {
            this.$refs.vFormRef.getFormData().then(formData => {
                this.loading = true;
                formData.status = formData.status? '0':'1';
                formData.batchSpecsRow = this.formData.batchSpecsRow;
                formData.batchSpecsCol = this.formData.batchSpecsCol;
                basePlaceSave(Object.assign({}, formData, {id: this.id})).then(({ message }) => {
                    this.$modal.msgSuccess(message);
                    this.openDataScope = false;
                    this.$emit('operateSuccess');
                }).finally(() => {
                    this.loading = false;
                });
            }).catch(err => {
                this.$modal.msgError('表单数据验证失败')
            })
        }
    },
};
</script>
<style lang="scss" scoped>
.slotIcon-specifications{
    position: absolute;
    right: 45px;
    top: 13px;
    color: #1890ff;
    z-index: 10;
    font-size: 14px;
}
.slotIcon-batchAddPlaceStatus {
    position: absolute;
    right: 175px;
    top: -47px;
    color: #1890ff;
    z-index: 10;
    font-size: 14px;
}
.slotIcon-color-yes-no{
    left: 147px;
    top: -26px;
}
::v-deep .batchAddPlaceStatusTips{
  display: inline !important;
}
::v-deep .el-form--label-left .el-form-item__label {
    text-align: right;
}
</style>
