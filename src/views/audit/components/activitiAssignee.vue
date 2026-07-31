<template>
    <Dialog title="下一级审批人" :visible.sync="openWorkflow" width="600px" center :close-on-click-modal="false"
        append-to-body>
        <el-form ref="elForm" :model="form" label-width="110px">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="下一级审批人:" prop="code"
                        :rules="{ required: true, message: '请选择下一级审批人', trigger: ['blur', 'change'] }">
                        <el-select :multiple="multiple" v-model="form.code" placeholder="请选择下一级审批人"
                            filterable style="width:100%;">
                            <el-option v-for="item in assigneeList" :key="item.id" :label="item.nickName"
                                :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="openWorkflow = false">取 消</el-button>
            <el-button type="primary" @click="submitDataScope" :loading="loading" style="margin-left: 50px;">确
                定</el-button>
        </div>
    </Dialog>
</template>

<script>
export default {
    props: {
        multiple: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            loading: false,
            openWorkflow: false,
            assigneeList: [],
            form: {
                code: null
            }
        }
    },
    watch: {
        openWorkflow: {
            handler: function (val) {
                if (!val) {
                    this.remove && this.remove()
                }
            }
        }
    },
    methods: {
        init(assigneeList) {
            this.form.code = null
            this.assigneeList = assigneeList;
            this.openWorkflow = true;
            this.$nextTick(() => {
                this.$refs.elForm.resetFields()
            })
        },
        submitDataScope() {
            this.$refs.elForm.validate(valid => {
                if (valid) {
                    this.openWorkflow = false;
                    this.$emit("activitiAssigneeSelected", this.form.code);
                    this.success && this.success(this.form.code)
                }
            })
        },
    }
};
</script>
