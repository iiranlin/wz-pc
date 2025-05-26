<template>
    <Dialog :title="title" :visible.sync="openDataScope" width="1000px" append-to-body :close-on-click-modal="false"  >
        <el-form ref="elForm" v-loading="loading" :model="form" label-width="85px">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="模板编号:" prop="templateCode">
                        <el-input v-model="form.templateCode" maxlength="20" :disabled="title === '修改角色'" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="模板名称:" prop="templateName">
                        <el-input v-model="form.templateName" maxlength="50" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="归类:" prop="templateCode">
                        <el-input v-model="form.templateType" maxlength="20" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="状态">
                        <el-radio-group v-model="form.status">
                            <el-radio :label="0">启用</el-radio>
                            <el-radio :label="1">停用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <code-editor v-model="form.templateContent"></code-editor>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="type == 'create' ? create() : modify()">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { createOnlCodeTemplate, modifyOnlCodeTemplate } from '@/api/onl-code/code-template'
import codeEditor from '@/components/code-editor'

export default {
    components: {
        codeEditor,
    },
    data() {
        return {
            loading: false,
            title: "新增模板",
            type: "add",
            openDataScope: false,
            form: {
                templateCode:"",
                templateName:"",
                templateContent: "",
                templateType: "",
                status: 0
            },
        };
    },
    methods: {
        /** 提交按钮（数据权限） */
        init(type, id) {
            this.type = type;
            this.id = id;
            this.openDataScope = true;
            this.$nextTick(async () => {
                this.$refs.elForm.resetFields();
                if (type === "update") {
                    this.title = "修改角色";
                    this.roleDetail(id);
                } else {
                    this.title = "新增角色";
                }
            });
        },
        create() {
            const data = {
                ...this.form
            }
            createOnlCodeTemplate(data).then(() => {

            })
        }
    },
};
</script>
