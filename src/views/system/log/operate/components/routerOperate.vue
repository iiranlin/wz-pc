<template>
    <Dialog :title="title" :visible.sync="openDataScope" :close-on-click-modal="false" width="600px" append-to-body v-loading="loading" >
        <el-form ref="elForm" :model="formData" label-width="90px" :rules="rules">
            <el-form-item label="单据id" class="border-radius50" prop="id">
                <el-input v-model="formData.id" placeholder="请输入单据id" clearable/>
            </el-form-item>
             <el-form-item label="业务类型" class="border-radius50" prop="businessType">
                <el-select v-model="formData.businessType" placeholder="请选择业务类型" filterable>
                    <el-option v-for="(item, index) in dict.type.flowBusinessType" :key="index" 
                        :label="item.label" 
                        :value="item.value"></el-option>
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
export default {
    dicts: ['flowBusinessType'],

    data() {
        return {
            loading: false,
            openDataScope: false,
            title: "跳转业务详情",

            formData: {
               id:'',
               businessType:'',
            },
            rules: {
                id: [
                    { required: true, message: '单据id不能为空', trigger: 'blur' }
                ],
                businessType: [
                    { required: true, message: '业务类型不能为空', trigger: 'change' }
                ],
            },
        };
    },
    created() { 

    },
    methods: {
        init() {
            this.openDataScope = true;

            this.$nextTick(async () => {
                this.$refs.elForm.resetFields()
            });
        },
        submitDataScope () {
            this.$refs.elForm.validate(valid => {
                if (valid) {
                    this.$emit('routerOperateConfirm', this.formData)
                    this.openDataScope = false;
                }
            })
        }
    },
};
</script>
