<template>
    <Dialog  :title="titleObj[type]" :visible.sync="openDataScope"  tabindex='1' :close-on-click-modal="false" width="800px" append-to-body v-loading="loading" >
        <VFormRender ref="vFormRef"
            @treeSelectSelect="treeSelectSelect"
            @treeSelectInput="treeSelectInput"
            @appendButtonClick="handleAppendButtonClick"
            @selectChange="selectChange">
            <div slot="specifications">
                <el-form ref="elform" :model="formData" label-width="80px" label-position="right" style="margin-left:10px">
                    <el-form-item label="货架规格" prop="modelTotal" required>
                        <div v-if="type == 'create' || type == 'update'">
                            <el-input-number v-model="formData.frameRow" :controls="false" style="width: 50px; margin-right: 4px" :precision="0" :min="1" 
                                :disabled="frameDisabled" @change="handleRowChange"/>
                            <span>层</span>
                            <el-input-number v-model="formData.frameCol" :controls="false" style="width: 50px; margin: 0 4px;" :precision="0" :min="1" 
                                :disabled="frameDisabled" @change="handleColChange"/>
                            <span>列</span>
                            <span style="margin-left: 8px">共</span>
                            <span style="margin: 0 4px">{{formData.modelTotal}}</span>
                            <span>货位</span>
                        </div>
                        <div v-else>
                            <span style="width: 50px; margin-right: 4px">{{formData.frameRow}}</span>
                            <span>层</span>
                            <span style="width: 50px; margin: 0 4px;">{{formData.frameCol}}</span>
                            <span>列</span>
                            <span style="margin-left: 8px">共</span>
                            <span style="margin: 0 4px">{{formData.modelTotal}}</span>
                            <span>货位</span>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
        </VFormRender>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
        <choicePlaceFrame ref="choicePlaceFrameRef"/>
    </Dialog>
</template>

<script>
import { basePassageGetPassageTree } from '@/api/warehouseManage/basePassage';
import { baseFrameSave, frameDetail,baseFrameReferenced } from '@/api/warehouseManage/frame';
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
                'create': '新增货架',
                'update': '修改货架',
                'view': '货架详情',
            },
            type: "create",
            id: null,
            formData:{
                frameRow:'',
                frameCol:'',
                modelTotal:'',
            },
            frameDisabled:false,
        };
    },
    watch: {
        formData: {
            handler: function(val) {
                this.formData.modelTotal = val.frameRow * val.frameCol
            },
            deep: true
        }
    },
    created() {

    },
    methods: {
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            if(name === 'placeFrame') {
                this.$refs.choicePlaceFrameRef.init()
            }
        }, 
       
        init(type, row = {}) {
            this.id = row.id || null
            this.type = type;
            this.openDataScope = true;
            this.$nextTick(async () => {
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();
                this.formData.frameRow = '',
                this.formData.frameCol = '',
                this.formData.modelTotal = '',
                this.$refs.vFormRef.hideWidgets('specifications')

                const res = await basePassageGetPassageTree();
                this.$refs['vFormRef'].getWidgetRef('passageId').loadOptions(res.data || []);
                if(type == 'view'){
                    this.$refs['vFormRef'].setReadMode(true);
                }else{
                    this.$refs['vFormRef'].setReadMode(false);
                }
                if(type === 'update' || type == 'view'){
                    let {data} = await frameDetail(row.id);
                  
                    data.status = data.status == '0'? true:false;
                    this.$refs['vFormRef'].setFormData(Object.assign({}, data ));

                    if(data.warehouseMode == '2'){
                        this.$refs.vFormRef.showWidgets('frameType')
                        this.$refs.vFormRef.showWidgets('specifications')
                        this.formData.frameRow = data.frameRow;
                        this.formData.frameCol = data.frameCol;
                    }
                }
                if(type == 'update'){
                    let params = {
                        id: row.id,
                    }
                    baseFrameReferenced(params).then(({data}) => {
                        this.frameDisabled = data;
                    }).catch((err) => {
                        
                    })
                }
            });
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('frame').then(res => {
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
                this.$refs.vFormRef.setFieldValue("warehouseMode", node.warehouseMode);
                this.$refs.vFormRef.setFieldValue("frameType", "");

                this.formData.frameRow = '';
                this.formData.frameCol = '';
                this.formData.modelTotal = '';

                if(node.warehouseMode == '2'){
                    this.$refs.vFormRef.showWidgets('frameType')
                    this.$refs.vFormRef.showWidgets('specifications')
                }else{
                    this.$refs.vFormRef.hideWidgets('frameType')
                    this.$refs.vFormRef.hideWidgets('specifications')
                }
            }
        },
        selectChange(name, node, type) {
            if(name == 'status' && !node){
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
        handleRowChange(currentValue, oldValue){
            if(!currentValue){
                this.formData.frameRow = '1'
            }
        },
        handleColChange(currentValue, oldValue){
            if(!currentValue){
                this.formData.frameCol = '1'
            }
        },
        submitDataScope () {
            this.$refs.vFormRef.getFormData().then(formData => {
                this.loading = true;
                formData.status = formData.status? '0':'1';
                formData.frameRow = this.formData.frameRow;
                formData.frameCol = this.formData.frameCol;
                baseFrameSave(Object.assign({}, formData, {id: this.id})).then(({ message }) => {
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
