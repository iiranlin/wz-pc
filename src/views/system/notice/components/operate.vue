<template>
    <!-- 分配角色数据权限对话框 -->
    <Dialog :title="title" :visible.sync="openDataScope" append-to-body :close-on-click-modal="false"
        v-loading="loading" >
        <el-form ref="elForm" :model="form" :rules="rules" label-width="85px">
            <el-form-item label="通知标题:" prop="noticeTitle">
                <el-input :maxlength="50" v-model="form.noticeTitle" />
            </el-form-item>
            <el-form-item label="通知内容:" prop="noticeMessage">
                <Editor :value="form.noticeMessage" :min-height="200" @on-change="onChange"></Editor>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="type == 'create' ? submitDataScope() : noticeModify()">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import Editor from "@/components/Editor"
import { noticeCreate, noticeDetail, noticeModify } from '@/api/system/notice'
export default {
    components: {Editor},
    data() {
        return {
            loading: false,
            title: '新增通知',
            type: 'add',
            id: '',
            openDataScope: false,
            form: {
                noticeTitle: '',
                noticeMessage: ''
                // groupCode: '0'
            },
            // 表单校验
            rules: {
                noticeTitle: [
                    { required: true, message: "通知标题不能为空", trigger: "blur" },
                    {
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            let reg = /\S/
                            if (!reg.test(value)) {
                                callback(
                                    new Error(
                                        '通知标题不能为空'
                                    )
                                )
                            } else {
                                callback()
                            }
                        }
                    }
                ],
            }
        }
    },
    methods: {
        /** 提交按钮（数据权限） */
        init(type, id) {
            this.type = type;
            this.id = id;

            this.openDataScope = true;
            if (this.$refs.elForm) this.$refs.elForm.resetFields();
            this.$nextTick(() => {
                if (type === 'update') {
                    this.title = "修改通知";
                    this.noticeDetail(id);
                } else if (type === 'create') {
                    this.title = "新增通知";
                }
            })
        },
        noticeDetail(id) {
            noticeDetail(id).then(({ data }) => {
                this.form = data;
            })
        },
        submitDataScope() {
            this.$refs["elForm"].validate(valid => {
                if (valid) {
                    this.loading = true;
                     delete this.form.id
                    noticeCreate(this.form).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.loading = false;
                        this.$emit('operateSuccess')
                    });
                }
            })
        },
        noticeModify() {
            this.$refs["elForm"].validate(valid => {
                if (valid) {
                    this.loading = true;
                    noticeModify(Object.assign({}, this.form, { id: this.id })).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.loading = false;
                        this.$emit('operateSuccess')
                    });
                }
            })
        },
        onChange ({html, text, quill}) {
            this.form.noticeMessage = html;
        }
    }
};
</script>
