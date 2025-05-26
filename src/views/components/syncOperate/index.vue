<template>
    <Dialog :title="title" :visible.sync="openDataScope" :close-on-click-modal="false" width="600px" append-to-body
        >
        <el-form ref="elForm" :model="formData" label-width="90px" :rules="rules">
            <el-form-item label="同步日期" class="border-radius50" prop="syncDate">
                <el-date-picker size="small" v-model="formData.syncDate" style="width:100%" placeholder="请选择同步日期"
                    type="date" value-format="yyyy-MM-dd">
                </el-date-picker>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope" v-preventReClick>确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>
<script>
import { cuInfoSyncSuInfo } from '@/api/saleManage/customerProfile'

export default {
    props: {
        callback: {
            type: Function,
        },
    },
    data() {
        return {
            openDataScope: false,
            title: "同步供应商",

            formData: {
                syncDate: '',
            },
            rules: {
                syncDate: [
                    { required: true, message: '请选择同步日期', trigger: 'change' }
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
     
        submitDataScope() {
            this.$refs.elForm.validate(async (valid) => {
                if (valid) {
                    this.openDataScope = false;
                    this.callback(cuInfoSyncSuInfo, this.formData)
                }
            })
        }
    },
};
</script>
