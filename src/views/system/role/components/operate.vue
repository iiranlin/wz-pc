<template>
    <!-- 分配角色数据权限对话框 -->
    <Dialog :title="title" :visible.sync="openDataScope" width="500px" append-to-body :close-on-click-modal="false" >
        <el-form ref="elForm" v-loading="loading" :model="form" :rules="rules" label-width="85px">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="所属单位:" prop="unitId" :rules="!!userInfo.unitId ? rules.unitId : []">
                        <treeselect v-model="form.unitId" :options="deptOptions" :normalizer="normalizer"
                            placeholder="请选择单位" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="角色编号:" prop="roleCode">
                        <el-input v-model="form.roleCode" maxlength="20" :disabled="title === '修改角色'" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="角色名称:" prop="roleName">
                        <el-input v-model="form.roleName" maxlength="50" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="状态">
                        <el-radio-group v-model="form.status">
                            <el-radio :label="0">启用</el-radio>
                            <el-radio :label="1">停用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="type == 'create' ? submitDataScope() : roleModify()">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { roleCreate, roleDetail, roleModify } from "@/api/system/role";
import { getUnitTree } from "@/api/system/dept";
import { getUserInfo } from '@/utils/user-info'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    components: {Treeselect},
    data() {
        var validateRolecode = (rule, value, callback) => {
            let reg = /^[\da-z_]+$/i
            if (value == '') {
                callback(new Error('角色编号不能为空'))
            } else if (!reg.test(value)) {
                callback(new Error('角色编号只能是字母或数字或下划线'))
            } else {
                callback()
            }
        }
        return {
            loading: false,
            title: "新增角色",
            type: "add",
            id: "",
            openDataScope: false,
            form: {
                unitId: undefined,
                roleCode: "",
                roleName: "",
                status: 0
            },
            deptOptions: [],
            // 表单校验
            rules: {
                roleCode: [
                    { required: true, validator: validateRolecode, trigger: "blur" },
                ],
                roleName: [
                    { required: true, message: "角色名称不能为空", trigger: "blur" },
                    {
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            let reg = /\S/
                            if (!reg.test(value)) {
                                callback(
                                    new Error(
                                        '角色名称不能为空'
                                    )
                                )
                            } else {
                                callback()
                            }
                        }
                    }
                ],
                unitId: [
                    { required: true, message: '请选择单位', trigger: 'change' }
                ]
            },
            userInfo: getUserInfo()
        };
    },
    methods: {
        /** 提交按钮（数据权限） */
        init(type, id) {
            this.type = type;
            this.id = id;
            this.openDataScope = true;
            this.unitTree();
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
        roleDetail(id) {
            roleDetail(id).then(({ data }) => {
                this.form = data;
                this.form.unitId = data.unitId || undefined;
            });
        },
        submitDataScope() {
            this.$refs["elForm"].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    roleCreate(this.form).then(({ success, message }) => {
                        this.openDataScope = false;
                        this.loading = false;
                        if (success) {
                            this.$emit("operateSuccess");
                            this.$modal.msgSuccess(message);
                        } else {
                            this.$message.error(message);
                        }
                    })
                    .catch(() => {
                        this.loading = false;
                    });
                }
            });
        },
        roleModify() {
            this.$refs["elForm"].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    roleModify(Object.assign({}, this.form, { id: this.id }))
                        .then(({ success, message }) => {
                            this.openDataScope = false;
                            this.loading = false;
                            if (success) {
                                this.$emit("operateSuccess");
                                this.$modal.msgSuccess(message);
                            } else {
                                this.$message.error(message);
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                }
            });
        },
        unitTree() {
            getUnitTree({ status: 0, unitId: this.userInfo.unitId }).then(res => {
                this.deptOptions = res.data
            })
        },
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children
            }
            return {
                id: node.id,
                label: node.deptName,
                children: node.children
            }
        },
    },
};
</script>
