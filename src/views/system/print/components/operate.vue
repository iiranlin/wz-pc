<template>
    <Dialog :title="title" :close-on-click-modal="false" :visible.sync="openDataScope" width="500px" append-to-body>
        <el-form v-if="openDataScope" ref="elForm" :model="formData" :rules="rules" label-width="120px">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="模板编号:" prop="templateCode">
                        <el-input v-model="formData.templateCode" placeholder="请输入模板编号"
                            :disabled="this.type == 'update'" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="模板名称:" prop="templateName">
                        <el-input v-model="formData.templateName" placeholder="请输入模板名称" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="字典名称:" prop="dictId">
                        <treeselect :appendToBody="true" z-index="9999" @select="selectDictselect($event)"
                            :disableBranchNodes="true" :value="formData.dictId" :options="dictTreeList"
                            :normalizer="dictNormalizera" placeholder="请选择字典" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="模板字段来源:" prop="menuId">

                        <el-tree :data="menusList" ref="muneTree" node-key="id"
                            style="max-height: 300px;overflow-y: auto;" :props="{
                                children: 'children',
                                label: 'menuName'
                            }" show-checkbox @check-change="handleCheckChange">
                        </el-tree>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="业务字段:" prop="fieldId">
                        <el-select style="width: 100%;" @change="handleFieldChange" :value="formData.fieldId" filterable
                            clearable placeholder="请选择业务字段">
                            <el-option v-for="item in fieldsList" :key="item.id" :label="item.fieldName"
                                :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope" :loading="loading">确定
            </el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { save, detailById } from "@/api/system/print";
import { menuTree } from '@/api/system/menu'
import { disabledFieldTree, flattenChildList } from '@/utils'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { commonTree } from '@/api/system/dict'
import { menuProperty } from '@/api/system/menu'
export default {
    components: { Treeselect },
    data() {
        return {
            dictTreeList: [],
            checkedList: [],
            fieldsList: [],
            loading: false,
            title: "新增模板",
            type: "add",
            openDataScope: false,
            objField: {},
            formData: {
                templateCode: "",
                templateName: "",
                id: '',
                menuId: [],
                dictCode: "",
                dictId: undefined,
                dictName: "",
                fieldName: "",
                fieldCode: "",
                fieldId: "",
            },
            menusList: [],
            // 表单校验
            rules: {
                templateCode: [
                    { required: true, message: "模板编号不能为空", trigger: "blur" },
                ],
                templateName: [
                    { required: true, message: "模板名称不能为空", trigger: "blur" },
                ],
            },

        };
    },
    created() {
        this.loadDictTree()
    },
    watch: {
        async checkedList() {
            this.loadFields()
        }
    },
    methods: {
        async loadFields() {
            let filedsArr = []
            const reqArr = []
            const ids = []
            for (let i = 0; i < this.checkedList.length; i++) {
                if (!!this.objField[this.checkedList[i].id].length) {
                    filedsArr = filedsArr.concat(this.objField[this.checkedList[i].id])
                } else {
                    ids.push(this.checkedList[i].id)
                    reqArr.push(menuProperty(this.checkedList[i].id))
                }

            }
            const resArr = await Promise.all(reqArr)
            for (let j = 0; j < resArr.length; j++) {
                const { fields } = resArr[j].data
                this.objField[ids[j]] = fields
                filedsArr = filedsArr.concat(fields)
            }
            const nextFieldArr = flattenChildList(filedsArr, 'children').filter(item => item.fieldType == 'dict')
            this.fieldsList = [...new Map(nextFieldArr.map(item => [item['fieldCode'], item])).values()]
        },
        loadDictTree() {
            commonTree().then(({ data }) => {
                this.dictTreeList = data
            })
        },
        dictNormalizera(node) {
            if (node.children && !node.children.length) {
                delete node.children
            }
            return {
                id: node.id,
                label: node.name,
                children: node.children
            }
        },
        selectDictselect(e) {
            this.formData.dictId = e.id
            this.formData.dictCode = e.code
            this.formData.dictName = e.name

        },
        handleFieldChange(id) {
            if (id) {
                const idx = this.fieldsList.findIndex(item => item.id == id)
                const field = this.fieldsList[idx]
                this.formData = Object.assign({}, this.formData, { fieldId: id, fieldCode: field.fieldCode, fieldName: field.fieldName })

            } else {
                this.formData = Object.assign({}, this.formData, { fieldId: '', fieldCode: '', fieldName: '' })
            }
        },
        handleCheckChange(data, checked, indeterminate) {
            this.formData.fieldName = ''
            this.formData.fieldId = ''
            this.formData.fieldCode = ''
            if (!(`${data.id}` in this.objField)) {
                this.objField[data.id] = []
            }
            if (checked) {
                this.checkedList.push(data)

            } else {
                this.checkedList = this.checkedList.filter(item => item.id != data.id)

            }
        },
        /** 提交按钮（数据权限） */
        async init(type, id) {
            this.type = type;
            this.openDataScope = true;
            this.formData = {
                templateCode: "",
                templateName: "",
                id: '',
                menuId: [],
                dictCode: "",
                dictId: undefined,
                dictName: "",
                fieldName: "",
                fieldCode: "",
                fieldId: "",
            }

            await this.loadMenusData()
            this.$nextTick(() => {
                this.$refs.muneTree.setCheckedKeys([])
                this.$refs.elForm.resetFields();
                if (type === "update") {
                    this.title = "修改模板";
                    this.detail(id);
                } else if (type === 'copy') {
                    this.title = "复制模板";
                    this.detail(id);
                } else {
                    this.title = "新增模板"
                }
            });
        },
        async loadMenusData() {
            const { data } = await menuTree()
            this.menusList = disabledFieldTree(data)
        },
        detail(id) {
            detailById(id).then(({ data }) => {
                const menuId = data.menuId ? data.menuId.split(',') : []
                if (!!menuId.length) {
                    this.checkedList = menuId.map(id => {
                        this.objField[id] = []
                        return { id: id }
                    })
                    this.loadFields()


                }
                const temp = Object.assign({}, data, { menuId: menuId })
                if (this.type === 'copy') {
                    delete temp.id
                    delete temp.templateCode
                    delete temp.templateName

                }
                let properties = {
                    dictId: undefined,
                    dictCode: '',
                    dictName: '',
                    fieldId: '',
                    fieldName: '',
                    fieldCode: ''
                }
                if (data.properties) {
                    properties = JSON.parse(data.properties)
                }
                this.$nextTick(() => {
                    this.formData = Object.assign({}, temp, properties)
                })

                this.$refs.muneTree.setCheckedKeys(menuId)
            });
        },
        submitDataScope() {
            const menuId = this.$refs.muneTree.getCheckedKeys()
            if (!menuId.length) {
                this.$modal.msgError('模板字段来源不能为空');
                return
            }
            this.$refs["elForm"].validate((valid) => {
                if (valid) {
                    this.loading = true;
                   
                    const params = { ...this.formData, menuId: menuId.join(',') }

                    const properties = {
                        dictId: undefined,
                        dictCode: '',
                        dictName: '',
                        fieldId: '',
                        fieldName: '',
                        fieldCode: ''
                    }
                    const keys = Object.keys(this.formData)
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i]
                        if (key in properties) {
                            properties[key] = this.formData[key] || ''
                            delete this.formData[key]
                        }
                    }
                    params.properties = JSON.stringify(properties)
                    save(params).then(({ success, message, data }) => {
                        if (success) {
                            this.$modal.msgSuccess(message);
                            this.openDataScope = false;
                            this.loading = false;
                            this.$emit("formSuccess");
                        } else {
                            this.$modal.msgError(message);
                        }
                    });
                }
            });
        },
    },
};
</script>