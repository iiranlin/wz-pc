<template>
    <Dialog :title="titleObj[type]" :destroy-on-close="true" tabindex='1' :visible.sync="openDataScope"
        :close-on-click-modal="false" width="610px" append-to-body>
        <el-form ref="elForm" :model="formData" :rules="rules" label-width="85px">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="上级分类:" prop="parentCode">
                        <treeselect v-model="formData.parentCode" :options="dataOptions" :normalizer="normalizer"
                            @input="handleTreeSelectInputEvent" @select="handleTreeSelectSelectEvent"
                            noChildrenText="无子数据" noResultsText="无匹配数据" noOptionsText="无数据" clearValueText=""
                            placeholder="请选择上级分类" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="分类编码:" prop="matlClassifyCode">
                        <el-input v-model="formData.matlClassifyCode" placeholder="自动生成" disabled maxlength="150" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="分类名称:" prop="matlClassifyName">
                        <el-input v-model="formData.matlClassifyName" placeholder="请输入分类名称" maxlength="150" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="排序:" prop="sort">
                        <el-input-number v-model="formData.sort" controls-position="right" :precision="0" :min="1"
                            :max="99"></el-input-number>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="状态:" prop="bizStatus">
                        <el-switch v-model="formData.bizStatus" active-value="0" inactive-value="1" active-text="启用"
                            inactive-text="停用"></el-switch>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="loading" @click="submitDataScope">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { classCreateModify } from '@/api/prodmgr-mm/matlClass';
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    props: {
        dataOptions: {
            type: Array,
            default: () => null
        }
    },
    components: { Treeselect },
    data() {
        return {
            loading: false,
            title: "新增物料分类",
            titleObj: {
                'create': '新增物料分类',
                'update': '修改物料分类',
            },
            openDataScope: false,
            // 表单数据
            formData: {
                matlClassifyId: null,
                matlClassifyCode: '',
                matlClassifyName: '',
                parentCode: undefined,
                parentId: undefined,
                parentName: '',
                sort: '',
                bizStatus: '0'
            },
            // 表单校验
            rules: {
                matlClassifyName: [
                    { required: true, message: "请输入分类名称", trigger: "blur" },
                ],
            },
            type: "create",
            id: ""
        };
    },
    created() { },
    methods: {
        init(type, row, parent) {
            this.type = type;
            this.openDataScope = true;
            this.formData = this.$options.data().formData
      
            this.$nextTick(() => {

                if (type === 'update') {
                    this.formData = Object.assign({}, row, { parentCode: row.parentCode || undefined, parentId: row.parentId || undefined });
                } else {
                    if (parent) {
                        this.formData.parentCode = parent.parentCode || undefined
                        this.formData.parentName = parent.parentName || undefined
                        this.formData.parentId = parent.parentId || undefined
                        this.formData.matlClassifyCode = ''
                        this.formData.matlClassifyName = ''
                    }
                }
            });
        },
        /** 转换部门数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children;
            }
            return {
                id: node.matlClassifyCode,
                label: node.matlClassifyName,
                children: node.children,
            };
        },
        handleTreeSelectInputEvent(val) {
            if (!val) {
                this.formData.parentName = '';
                this.formData.parentCode = undefined;
                this.formData.parentId = '';
            }
        },
        // 节点单击事件
        handleTreeSelectSelectEvent(data) {
            this.formData.parentName = data.matlClassifyName;
            this.formData.parentCode = data.matlClassifyCode;
            this.formData.parentId = data.matlClassifyId;
        },
        submitDataScope() {
            this.$refs["elForm"].validate(valid => {
                if (valid) {
                    let typeUrl = 'create';
                    if (this.type === 'update') {
                        typeUrl = 'modify';
                    }
                    this.loading = true;
                    classCreateModify(this.formData, typeUrl).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.$emit('operateSuccess');
                    }).finally(() => {
                        this.loading = false;
                    });
                }
            })
        }
    },
};
</script>
