<template>
    <!--  添加或修改流程信息对话框  -->
    <Dialog class="flex-dialog max-height-dialog" v-loading="editLoading" :title="title"
        :visible.sync="editformDataFlag" width="1310px" append-to-body :close-on-click-modal="false" >
        <el-form ref="elForm" :inline="true" :model="formData" :rules="rules" label-suffix="：" label-width="95px"
            style="overflow-y: auto">
            <el-form-item label="流程名称" prop="processName" class="border-radius50">
                <el-input v-model="formData.processName" maxlength="50" placeholder="请输入流程名称" clearable />
            </el-form-item>
            <el-form-item label="关联业务" prop="billType" class="border-radius50">
                <el-select v-model="formData.billType" value-key="value" filterable :disabled="command == 'update'" style="width: 100%"
                    placeholder="请选择关联业务" @change="handleBillType">
                    <el-option v-for="item in dict.type.flowBusinessType" :key="item.value" :label="item.label"
                        :value="item"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="单据编码" prop="billCode" class="border-radius50">
                <el-input v-model="formData.billCode" :disabled="true" maxlength="50" placeholder="自动填充" clearable />
            </el-form-item>
            <el-form-item label="状态" prop="enableStatus">
                <el-switch v-model="formData.enableStatus" active-value="0" inactive-value="1" active-text="启用"
                    inactive-text="禁用" />
            </el-form-item>
            <el-form-item label="适用单位" prop="useOrgId" class="border-radius50">
                <treeselect v-model="formData.useOrgId" :multiple="true" :options="deptOptions" style="width: 1154px;"
                    collapse-tags :normalizer="normalizer" noChildrenText="无子数据" noResultsText="无匹配数据"
                    noOptionsText="无数据" :flat="true" :show-count="true" :value-consists-of="valueConsistsOf"
                    @input="handleTreeSelectInputEvent" placeholder="请选择适用单位" />
            </el-form-item>
            <el-form-item label="枢纽指挥部" prop="constructionUnitId" class="border-radius50">
                      <el-select
                        v-model="formData.constructionUnitId"
                        clearable
                        placeholder="请选择枢纽指挥部"
                        style="width: 1154px"
                        >
                        <el-option v-for="(item, key) in constructionUnitOptions"
                        :key="key"
                        :label="item.label"
                        :value="item.value"
                        />
                    </el-select>
            </el-form-item>
            <el-form-item label="建设项目" prop="projectId" class="border-radius50">
                      <el-select
                        v-model="formData.projectId"
                        clearable
                        :multiple="true"
                        placeholder="默认全部建设项目"
                        style="width: 1154px"
                        >
                        <el-option v-for="item in projects"
                        :key="item.id"
                        :label="item.projectName"
                        :value="item.id"
                        />
                    </el-select>
            </el-form-item>
            <el-form-item label="流程描述" prop="remark" class="border-radius50">
                <el-input v-model="formData.remark" type="textarea" style="width: 1154px;" placeholder="请输入流程描述"
                    maxlength="500" show-word-limit />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="addClick">新 增</el-button>
            </el-form-item>
            <el-table :data="formData.formItems" height="400px">
                <el-table-column label="序号" align="left" width="50" type="index">
                </el-table-column>
                <el-table-column label="字段名称" prop="fieldName" align="left">
                    <template v-slot="{ row }">
                        <el-input maxlength="200" v-model="row.fieldName" />
                    </template>
                </el-table-column>
                <el-table-column label="字段标题" prop="fieldTitle" align="left">
                    <template v-slot="{ row }">
                        <el-input maxlength="200" v-model="row.fieldTitle" />
                    </template>
                </el-table-column>
                <el-table-column label="是否字典" prop="isDict" align="left">
                    <template v-slot="{ row }">
                        <el-checkbox v-model="row.isDict" :true-label="1" :false-label="0"></el-checkbox>
                    </template>
                </el-table-column>
                <el-table-column label="字典" align="left">
                    <template v-slot="scope">
                        <treeselect :appendToBody="true" z-index="9999" @select="selectDict($event, scope.$index)"
                            :disabled="scope.row.isDict !== 1" :value="scope.row.dictId" :options="commonTreeList"
                            :normalizer="normalizer" placeholder="请选择字典" />
                    </template>
                </el-table-column>
                <el-table-column label="数据类型" prop="dataType" align="left">
                    <template v-slot="{ row }">
                        <el-radio v-model="row.dataType" label="text">文本</el-radio>
                        <el-radio v-model="row.dataType" label="number">数字</el-radio>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button @click="handleRemove(scope.$index)" type="text" size="small">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="editformDataFlag = false">取 消</el-button>
        </div>
    </Dialog>
</template>
<script>
import { addCategory, updateCategory } from "@/api/workflow/category"
import { newListByDeptCode } from '@/api/system/dept.js'
import { deptTreeAll } from '@/api/system/dept'
import { commonTree } from '@/api/system/dict'
import { getAllProject } from '@/api/prodmgr-inv/project/line.js'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    dicts: ['flowBusinessType'],
    components: { Treeselect },
    data() {
        return {
            editLoading: false,
            editformDataFlag: false,
            title: '新增流程',
            valueConsistsOf: 'ALL',
            deptOptions: [],
            projects:[],
            formData: {
                // 流程名称
                processName: '',
                // 流程类型 表单类型
                billType: '',
                // 适用单位
                useOrgId: null,
                projectId:null,
                useOrgName: [],
                // 状态 状态 0-启用 1-停用
                enableStatus: '0',
                // 流程描述
                remark: '',
                formItems: [],
                billCode: '',
                constructionUnitId: '',
            },
            // 表单校验
            rules: {
                processName: [
                    { required: true, message: '请输入流程名称', trigger: 'blur' },
                    {
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            let reg = /\S/
                            if (!reg.test(value)) {
                                callback(new Error('流程名称不能为空'))
                            } else {
                                callback()
                            }
                        }
                    },
                ],
                billType: [
                    { required: true, message: '请选择关联业务', trigger: 'change' },
                ],
                useOrgId: [
                    { required: true, message: "请选择适用单位", trigger: "change" }
                ],
                constructionUnitId: [
                    { required: true, message: "请选择枢纽指挥部", trigger: "change" }
                ],
                enableStatus: [
                    { required: true, message: '请选择状态', trigger: 'change' },
                ],
                // billCode: [
                //     { required: true, message: '请输入单据编码', trigger: 'blur' },
                // ],
            },
            commonTreeList: [],
            id: null,
            command: '',
            dictObj: {},
            constructionUnitOptions: []
        }
    },
    async created() {
        this.constructionUnitOptions = await this.getDeptTree('SN')
        this.deptTreeAll();
        this.commonTree();
        this.searchProject();
    },
    methods: {
        // 加载枢纽
        async getDeptTree(deptCodePrefix, status = '') {
            const res = await newListByDeptCode({
                deptCodePrefix,
                status
            })
            const data = res.data.map(item => {
                return {
                    value: item.id,
                    label: item.deptName
                }
            })
            return Promise.resolve(data)
        },
        init(row, buttonCode) {
            for(let i=0; i< this.dict.type.flowBusinessType.length; i++) {
                const dict = this.dict.type.flowBusinessType[i]
                this.dictObj[dict.value] = dict
            }
            this.command = buttonCode;
            this.editformDataFlag = true;
            this.$nextTick(() => {
                this.$refs.elForm.resetFields();
                if (row) {
                    this.id = row.id;
                    let data = Object.assign({}, row);
                    const useOrgName = data.useOrgName && data.useOrgName.split(',');
                // 处理 projectId - 将字符串转换为数组
                    let projectIdArry = [];
                    if (data.projectId) {
                        // 如果 projectId 是逗号分隔的字符串，转换为数组
                        projectIdArry = data.projectId.split(',').map(id => id.trim());
                    }

                    this.formData = {
                        projectId: projectIdArry, // 这里赋值为数组
                        processName: data.processName,
                        billType: this.dictObj[data.billType],
                        useOrgId: data.useOrgId && data.useOrgId.split(',').map((item, i) => item + ',' + useOrgName[i]),
                        useOrgName: useOrgName,
                        enableStatus: data.enableStatus,
                        remark: data.remark,
                        formItems: data.formItems && JSON.parse(data.formItems) || [],
                        billCode: data.billCode,
                        constructionUnitId: data.constructionUnitId
                    }
                } else {
                    this.formData.formItems = [];
                    this.formData.useOrgId = null;
                    this.formData.useOrgName = [];
                    this.formData.projectId = []; // 新增时初始化为空数组
                }
                buttonCode === 'update' ? this.title = "编辑流程" : this.title = "新增流程";
            })
        },
        handleBillType(v) {
            for (let i = 0; i < this.dict.type.flowBusinessType.length; i++) {
                const item = this.dict.type.flowBusinessType[i]
                if (v.value == item.value) {
                    this.formData.billCode = item.raw.remark
                    break
                }
            }
        },
        handleRemove(index) {
            this.formData.formItems.splice(index, 1)
        },
        /** 转换用户数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children
            }
            return {
                id: node.name ? node.id : node.id + ',' + node.deptName,
                label: node.name || node.deptName,
                children: node.children
            }
        },
        handleTreeSelectInputEvent(data) {
            this.formData.useOrgName = data.map(item => item.split(',')[1])
        },
        deptTreeAll() {
            deptTreeAll().then(({ data }) => {
                this.deptOptions = data || [];
            })
        },
        commonTree() {
            commonTree().then(({ data }) => {
                this.commonTreeList = data
            })
        },
        selectDict(row, index) {
            this.formData.formItems[index].dictId = row.id
        },
        addClick() {
            this.formData.formItems.push({
                fieldName: '',
                fieldTitle: '',
                isDict: 0,
                dictId: null
            })
        },
        // 提交新建流程表单
        submitForm() {
            this.$refs['elForm'].validate(async (valid) => {
                if (valid) {
                    const params = {
                        ...this.formData,
                        id: this.id,
                        billType: this.formData.billType.value
                    }
                    params.formItems = JSON.stringify(params.formItems);
                    const idArr = params.useOrgId.map(item => item.split(',')[0])

                    // 处理 projectId - 确保是字符串
                    if (Array.isArray(params.projectId)) {
                        params.projectId = params.projectId.join(',');
                    }



                    params.useOrgId = idArr.join(',');
                    params.useOrgName = params.useOrgName.join(',');
                    let requestMapUrl = addCategory;
                    if (this.command === 'update') {
                        requestMapUrl = updateCategory;
                    }
                    this.editLoading = true
                    requestMapUrl(params).then(res => {
                        if (res.success) {
                            this.$modal.msgSuccess(res.message || '操作成功')
                            this.$emit('success')
                        } else {
                            this.$modal.msgError(res.message)
                        }
                    }).finally(() => {
                        this.editLoading = false
                        this.editformDataFlag = false
                    })
                }
            })
        },
        //获取所有建设项目
        searchProject(){
            let param={
                "pageSize":10000,
                "pageNum":1
            };
            getAllProject().then(({ data }) => {
                console.log(data);
                this.projects = data;
            })
        }
    }
}
</script>
<style lang="scss" scoped>
::v-deep .el-form-item__label {
    padding: 0;
}

::v-deep .el-table {
    margin: 0;
}
</style>