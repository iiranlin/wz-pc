<template>
    <Dialog :title="title" :close-on-click-modal="false" :visible.sync="openDataScope" width="500px" append-to-body  >
        <el-form ref="elForm" :model="formData" :rules="rules" label-width="100px">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="表单编号:" prop="formCode">
                        <el-input v-model="formData.formCode" placeholder="请输入表单编号" :disabled="this.type == 'update'" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="表单名称:" prop="formName">
                        <el-input v-model="formData.formName" placeholder="请输入表单名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="绑定业务表:" prop="bindTable">
                        <el-select v-model="formData.bindTable" :placeholder="'请选择绑定业务表'" clearable>
                            <el-option v-for="(item, key)  in getFormTableArr" :key="key"
                                :label="!item.tableComment ? item.tableName : `${item.tableComment}【${item.tableName}】`"
                                :value="item.tableName" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row v-if="type != 'create'">
                <el-col :span="24">
                    <el-form-item label="状态:">
                        <el-switch v-model="formData.status" :active-value="0" :inactive-value="1">
                        </el-switch>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="是否直接打开设计页面:" label-width="165px">
                        <el-switch v-model="formData.isOpenDesign" :active-value="1" :inactive-value="0">
                        </el-switch>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary"
                @click="(['create', 'cpForm'].indexOf(type) != -1) ? submitDataScope() : modifyData()"
                :loading="loading">确定
            </el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { create, detail, modify, getFormTable } from "@/api/form/form";

export default {
    data() {
        return {
            loading: false,
            title: "新增表单",
            type: "add",
            id: "",
            openDataScope: false,
            formData: {
                formCode: "",
                formName: "",
                bindTable: '',
                isOpenDesign: '',
                status: 0
            },
            // 表单校验
            rules: {
                formCode: [
                    { required: true, message: "表单编号不能为空", trigger: "blur" },
                ],
                formName: [
                    { required: true, message: "表单名称不能为空", trigger: "blur" },
                ],
            },
            getFormTableArr: []
        };
    },
    created() {
    },
    methods: {
        /** 提交按钮（数据权限） */
        init(type, id) {
            this.type = type;
            this.id = id || null;
            this.openDataScope = true;
            if (type == 'cpForm') {
                this.id = id.id
                this.getFormTable();
            } else {
                this.getFormTable(id);
            }
            this.$nextTick(() => {
                this.$refs.elForm.resetFields();
                if (type === "update") {
                    this.title = "修改表单";
                    this.detail(id);
                } else if (type == 'cpForm') {
                    this.title = '复制表单'
                    this.copyDetail(id, id.id);
                } else {
                    this.title = "新增表单"
                    this.formData.status = 0
                    this.formData.parentId = id || undefined;
                }
            });
        },
        getFormTable(id) {
            getFormTable({ id }).then(({ data }) => {
                this.getFormTableArr = data || [];
            })
        },
        detail(id) {
            detail(id).then(({ data }) => {
                this.formData = {
                    formCode: data.formCode,
                    formName: data.formName,
                    bindTable: data.bindTable,
                    isOpenDesign: '',
                    status: data.status,
                }
            });
        },
        copyDetail(row, id) {
            detail(id).then(({ data }) => {
                this.formData = {
                    formCode: '',
                    formName: data.formName,
                    bindTable: '',
                    isOpenDesign: '',
                    status: data.status,
                }
                this.formData.formContent = row.formContent
            });
        },
        submitDataScope() {
            this.$refs["elForm"].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    create(this.formData).then(({ success, message, data }) => {
                        if (success) {
                            this.$modal.msgSuccess(message);
                            this.openDataScope = false;
                            this.loading = false;
                            this.$emit("formSuccess");
                            if (this.formData.isOpenDesign === 1) {
                                this.$emit('handleOpenDesign', data)
                            }
                        } else {
                            this.$modal.msgError(message);
                        }
                    });
                }
            });
        },
        modifyData() {
            this.$refs["elForm"].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    modify(Object.assign({}, this.formData, { id: this.id })).then(({ message, data }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.loading = false;
                        this.$emit("formSuccess");
                        if (this.formData.isOpenDesign === 1) {
                            this.$emit('handleOpenDesign', data)
                        }
                    }
                    );
                }
            });
        },
    },
};
</script>