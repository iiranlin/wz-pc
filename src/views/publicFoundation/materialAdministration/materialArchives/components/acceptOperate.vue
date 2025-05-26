<template>
    <Dialog :title="title" :visible.sync="openDataScope" :close-on-click-modal="false" width="600px" append-to-body v-loading="loading" >
        <el-form ref="elForm" :model="formData" label-width="110px" :rules="rules">
            <el-form-item label="抽检率（%）" prop="samplingRate">
                <el-input-number 
                    style="width: 100%"  
                    v-model.trim="formData.samplingRate"
                    controls-position="right" 
                    :min="0" 
                    :precision="2"
                    :max="100"/>
            </el-form-item>
            <el-form-item label="不良率（%）" prop="rejectRate">
                <el-input-number 
                    style="width: 100%"  
                    v-model.trim="formData.rejectRate"
                    controls-position="right" 
                    :min="0" 
                    :precision="2"
                    :max="100"/>
            </el-form-item>
            <el-form-item label="处理方式" class="border-radius50" prop="rejectResult">
                <el-select v-model="formData.rejectResult" clearable style="width:100%">
                    <el-option v-for="(item, index) in dict.type.rejectResult" :key="index"
                        :label="item.label" 
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>
<script>
import {matlCreateModify} from '@/api/prodmgr-mm/matlMatl';

export default {
    name:'markOperate',
    dicts: ['rejectResult'],

    data() {
        return {
            loading: false,
            openDataScope: false,
            title: "验收标准",
            row:[],

            formData: {
               rejectResult:'',
               samplingRate: undefined,
               rejectRate: undefined,
            },
            rules: {
                samplingRate: [
                    { required: true, message: '请输入抽检率', trigger: 'blur' }
                ],
                rejectRate: [
                    { required: true, message: '请输入不良率', trigger: 'blur' }
                ],
                rejectResult: [
                    { required: true, message: '请选择处理方式', trigger: 'change' }
                ],
             
            },
        };
    },
    created() { 

    },
    methods: {
        init(row) {
            this.openDataScope = true;
            this.row = row;

            this.formData.samplingRate = this.row.bizParam.samplingRate || undefined;
            this.formData.rejectRate = this.row.bizParam.rejectRate || undefined;
            this.formData.rejectResult = this.row.bizParam.rejectResult;
        },
        submitDataScope () {
            this.$refs.elForm.validate(valid => {
                if (valid) {
                    this.loading = true;

                    this.row.bizParam.samplingRate = this.formData.samplingRate;
                    this.row.bizParam.rejectRate = this.formData.rejectRate;
                    this.row.bizParam.rejectResult = this.formData.rejectResult;
                    this.row.bizStatus = this.row.bizStatus == '1' ? '0' : '1';

                    matlCreateModify(this.row,'modify').then(({message}) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.$emit('acceptOperateConfirm')
                    }).catch((err) => {
                        
                    }).finally(() => {
                        this.loading = false;
                    })
                }
            })
        }
    },
};
</script>
