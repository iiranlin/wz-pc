<template>
    <!-- 添加或修改对话框 -->
    <Dialog :title="`${title}单据规则`" :visible.sync="openDataScope" :close-on-click-modal="false" append-to-body
        v-loading="loading" width="700px" class="dialog_preview" >
        <el-form ref="elForm" v-loading="loading" :model="formData" :rules="rules" label-width="90px">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="单据类型:" prop="billsType">
                        <el-select v-model="formData.billsType" style="width: 100%" filterable placeholder="请选择" @change="billsTypeChange">
                            <el-option v-for="item in dict.type.docRule" :key="item.value" :label="item.label" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <!-- <el-col :span="8">
                    <el-form-item label="单据编号:" prop="billsCode">
                        <el-input v-model="formData.billsCode" maxlength="20" />
                    </el-form-item>
                </el-col> -->
                <el-col :span="12">
                    <el-form-item label="规则名称:" prop="billsName">
                        <el-input v-model="formData.billsName" maxlength="20" />
                    </el-form-item>
                </el-col>
            </el-row>
            <!-- <el-row>
                <el-col :span="8">
                    <el-form-item label="关联业务:" prop="bindBillsCode">
                        <el-select v-model="formData.bindBillsCode" clearable style="width: 100%" placeholder="请选择" @change="bindBillsCodeChange">
                            <el-option v-for="item in bindBillsCodeList" :key="item.code" :label="item.label" :value="item.code"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="业务字段:" prop="bindBillsField">
                        <el-select v-model="formData.bindBillsField" style="width: 100%" placeholder="请选择">
                            <el-option v-for="item in bindBillsFieldList" :key="item.code" :label="item.label+`【${item.code}】`" :value="item.code"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item prop="bindBillsInclude">
                        <el-checkbox v-model="formData.bindBillsInclude" :true-label="1" :false-label="0">包含业务编号</el-checkbox>
                    </el-form-item>
                </el-col>
            </el-row> -->
        </el-form>
        <div class="code-preview">
            <div class="preview-left">【{{ formData.billsName }}】预览：</div>
            <div class="preview-right">
                <div class="preview-item" v-for="item in currentList" :key="item.id">
                    <div class="code-name-content" v-if="item.codeKey === 'fixPrefix'">
                        {{item.codeName || "未编辑固定字符"}}
                    </div>
                    <div class="code-name-content" v-if="item.codeKey === 'dateFormat'">
                        {{dataListF(codeNameList, item.codeName, 'label')}}
                    </div>
                    <div class="code-name-content" v-if="item.codeKey === 'serialNum'">
                        {{item.codeName}}位流水号
                    </div>
                    <!-- <div class="code-name-content" v-if="item.codeKey === 'bindBillsField'">
                        {{dataListF(bindBillsFieldList, formData.bindBillsField, 'label')}}
                    </div> -->
                    <div class="connect-symbol">
                        {{ item.codeSuffix }}
                    </div>
                </div>
            </div>
        </div>
        <div class="code-draggable">
            <div class="code-draggable-content">
                <div class="col selected-code">
                    <div class="selected-code-title">
                        <div>字段名称</div>
                        <div class="">连接符</div>
                    </div>
                    <draggable v-model="currentList" class="draggable-class" :scroll="true" group="site" animation="100" dragClass="dragClass" ghostClass="ghostClass" chosenClass="chosenClass"
                        @start="onStart"
                        @end="onEnd">
                        <transition-group class="transition-group-class">
                            <template v-for="item in currentList">
                                <div class="item selected-item" :key="item.id" v-if="(item.codeKey == 'bindBillsField' && formData.bindBillsField) || item.codeKey != 'bindBillsField'">
                                    <div>
                                        <i class="el-icon-s-grid drag-pre-icon"></i>
                                        <template v-if="item.codeKey === 'fixPrefix'">
                                            <span style="letter-spacing: 0.35em">固定字</span><span>符：</span>
                                            <el-input v-model="item.codeName" style="width: 217px" @input="(val) => item.codeName = val.toUpperCase()"></el-input>
                                        </template>
                                        <template v-else-if="item.codeKey === 'dateFormat'">
                                            <span style="letter-spacing: 3em">日</span><span>期：</span>
                                            <el-select v-model="item.codeName" placeholder="请选择">
                                                <el-option v-for="item in codeNameList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                            </el-select>
                                        </template>
                                        <template v-else-if="item.codeKey === 'serialNum'">
                                            <span>流水号长度：</span>
                                            <el-input-number v-model="item.codeName" style="width: 217px" :min="1" :max="9"></el-input-number>
                                        </template>
                                    </div>
                                    <div :class="['connection-symbol',item.codeKey === 'fix_character'? 'fix-character-content': '']" v-if="item.codeKey == 'fixPrefix'">
                                        <el-select v-model="item.codeSuffix" placeholder="请选择">
                                            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                        </el-select>
                                    </div>
                                </div>
                            </template>
                        </transition-group>
                    </draggable>
                </div>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">保 存</el-button>
            <el-button @click="openDataScope = false">关 闭</el-button>
        </div>
    </Dialog>
</template>

<script>
import { sysBillsCodeCreateModify } from '@/api/system/bills-rule'
import { getListByParentCode, getChildListByParentId } from '@/api/system/dict'
import Draggable from "vuedraggable";

export default {
    dicts: ['docRule'],
    components: { Draggable },
    data() {
        return {
            openDataScope: false,
            loading: false,
            title: '新增',
            formData: {
                billsType: '',
                billsCode: '',
                billsName: '',
                bindBillsCode: '',
                bindBillsField: '',
                bindBillsInclude: '',
                fixPrefix: '',
                dateFormat: '',
                serialNum: '',
                fixSuffix: '',
                sorts: ''
            },
            rules: {
                billsCode: [
                    { required: true, message: '请输入单据编号', trigger: 'blur' }
                ],
                billsName:[
                    { required: true, message: '请输入单据名称', trigger: 'blur' }
                ]
            },
            type: '',
            billsTypeList: [],
            bindBillsCodeList: [],
            bindBillsFieldList: [],
            codeNameList: [
                {
                    value: "yyyyMM",
                    label: "年（四位）月",
                },
                {
                    value: "yyyyMMdd",
                    label: "年（四位）月日",
                },
                {
                    value: "yy",
                    label: "年（两位）",
                },
                {
                    value: "yyMM",
                    label: "年（两位）月",
                },
                {
                    value: "yyMMdd",
                    label: "年（两位）月日",
                },
                {
                    value: "yyyy",
                    label: "年（四位）",
                },
            ],
            currentList: [
                {id: '1', codeName: '', codeKey: 'fixPrefix', codeSuffix: ''},
                {id: '2', codeName: '', codeKey: 'dateFormat', codeSuffix: ''},
                // {id: 4, codeName: '', codeKey: 'bindBillsField', codeSuffix: ''},
                {id: '3', codeName: '', codeKey: 'serialNum', codeSuffix: ''},
            ],
            // 连接符的可选项
            options: [
                {
                    value: "",
                    label: "无连接符",
                },
                {
                    value: "-",
                    label: "-",
                },
                {
                    value: "_",
                    label: "_",
                },
                {
                    value: "·",
                    label: "·",
                },
            ],
            id: ''
        }
    },
    created() {
        this.getListByParentCode();
    },
    methods: {
        init(type, data={}) {
            this.currentList = [
                {id: '1', codeName: '', codeKey: 'fixPrefix', codeSuffix: ''},
                {id: '2', codeName: '', codeKey: 'dateFormat', codeSuffix: ''},
                // {id: 4, codeName: '', codeKey: 'bindBillsField', codeSuffix: ''},
                {id: '3', codeName: '', codeKey: 'serialNum', codeSuffix: ''},
            ]
            this.bindBillsFieldList = [];
            this.id = '';
            this.type = type;
            this.openDataScope = true;
            this.$nextTick(async () => {
                this.$refs.elForm.resetFields();
                if (type === 'update') {
                    this.title = '修改';
                    this.id = data.id;
                    this.formData = {
                        billsType: {value: data.billsCode, label: data.billsName},
                        billsCode: data.billsCode,
                        billsName: data.billsName,
                        bindBillsCode: data.bindBillsCode,
                        bindBillsField: data.bindBillsField,
                        bindBillsInclude: data.bindBillsInclude,
                        fixPrefix: data.fixPrefix,
                        dateFormat: data.dateFormat,
                        serialNum: data.serialNum,
                        fixSuffix: data.fixSuffix,
                        sorts: data.sorts
                    };
                    if(data.bindBillsCode){
                        this.getChildListByParentId(this.dataListF(this.bindBillsCodeList, data.bindBillsCode, 'id'));
                    }
                    this.currentList.forEach( (item) => {
                        item.codeName = this.formData[item.codeKey]
                        if(item.codeKey === 'fixPrefix'){
                            item.codeSuffix = this.formData.fixSuffix
                        }
                    })
                    if(data.sorts){
                        let dataArr = [], sortsArr = data.sorts.split('');
                        sortsArr.forEach( (val) => {
                            this.currentList.forEach( (item) => {
                                if(val === item.id){
                                    dataArr.push(item);
                                }
                            })
                        })
                        this.currentList = dataArr;
                    }
                } else {
                    this.title = '新增';
                }
            })
        },
        getListByParentCode () {
            getListByParentCode('BILLS_TYPE').then( ({data}) => {
                this.bindBillsCodeList = data;
            })
        },
        getChildListByParentId (parentId) {
            getChildListByParentId({parentId}).then( ({data}) => {
                this.bindBillsFieldList = data;
            })
        },
        billsTypeChange (data) {
            this.formData.billsCode = data.value;
            this.formData.billsName = data.label;
        },
        bindBillsCodeChange (val) {
            if(val){
                this.formData.bindBillsField = '';
                this.getChildListByParentId(this.dataListF(this.bindBillsCodeList, val, 'id'));
            }else{
                this.formData.bindBillsField = '';
                this.bindBillsFieldList = [];
            }
        },
        dataListF (dataList, val, name) {
            let data = '';
            dataList.forEach(item => {
                if(item.value === val){
                    if(name){
                        data = item[name]
                    }else{
                        data = item
                    }
                }
            });
            return data
        },
        onStart () {

        },
        onEnd () {
            
            this.currentList.forEach( (item) => {
                this.formData.sorts += item.id;
            })
        },
        submitDataScope() {
            this.$refs["elForm"].validate((valid) => {
                if(valid){
                    this.currentList.forEach( (item) => {
                        if(item.codeKey === 'fixPrefix'){
                            this.formData[item.codeKey] = item.codeName;
                            this.formData.fixSuffix = item.codeSuffix;
                        }else if(item.codeKey !=  'bindBillsField'){
                            this.formData[item.codeKey] = item.codeName;
                        }
                    })
                    this.loading = true;
                    let type = 'create';
                    if(this.type === 'update'){
                        type = 'modify';
                        this.formData = Object.assign({}, this.formData, {id: this.id});
                    }
                    sysBillsCodeCreateModify(this.formData, type).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.openDataScope = false;
                        this.$emit('operateSuccess')
                    }).finally(() => {
                        this.loading = false;
                    });
                }
            })
        }
    }
};
</script>
<style lang="scss" scoped>
@import "~@/assets/styles/primaryScss.scss";
@import "~@/assets/styles/variables.scss";
.el-input-number--medium{
    width: 100%;
}
.dialog_preview{
    ::v-deep .el-dialog{
        max-height: 90%;
        display: flex;
        flex-direction: column;
    }
    ::v-deep .el-dialog__body{
        overflow: auto;
        flex: 1;
    }
}

// 预览区域
.code-preview {
    margin-top: 10px;
    padding: 12px;
    background-color: #f1f3f8;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding-left: 16px;
    color: #000000;
    font-size: 14px;
    .preview-right {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .preview-item {
            display: flex;
        }
        .code-name-content {
            height: 38px;
            background-color: #ffffff;
            border-radius: 3px;
            margin: 0 4px;
            line-height: 38px;
            text-align: center;
            padding: 0 10px;
            margin-top: 5px;
        }
        .connect-symbol {
            display: flex;
            height: 38px;
            background-color: #ffffff;
            border-radius: 3px;
            margin: 0 4px;
            line-height: 38px;
            text-align: center;
            padding: 0 10px;
            margin-top: 5px;
            padding: 0;
            background-color: transparent;
        }
        .serial-no-unit {
            margin-left: 5px;
        }
    }
}

// 拖拽区域
.code-draggable {
    margin: 12px 0;
    display: flex;
    padding-bottom: 10px;
    margin-bottom: 10px;
    .draggable-title {
        width: 70px;
        height: 20px;
        font-family: Microsoft YaHei;
        color: #000000;
        font-size: 14px;
        margin-bottom: 8px;
    }
    .draggable-class {
        height: 100%;
        height: 225px;
        font-size: 14px;
        .transition-group-class {
            display: inline-block;
            height: 225px;
            width: 100%;
            overflow-y: auto;
        }
    }
    
    .selected-code {
        min-width: 650px;
        min-height: 225px;
        .selected-code-title {
            padding: 6px 30px 6px 12px;
            margin-bottom: 10px;
            height: 30px;
            background-color: #eaf2ff;
            border-radius: 3px 3px 0px 0px;
            display: flex;
            justify-content: space-between;
            & > div {
                font-family: PingFang SC;
                color: #1b1e22;
                font-size: 12px;
            }
        }
    }
    .ghostClass {
        background-color: #fff !important;
    }

    .chosenClass {
        border-color: $--color-primary !important;
    }

    .dragClass {
        background-color: #ccc !important
    }
    .title {
        padding: 6px 12px;
        margin-bottom: 10px;
        font-family: PingFang SC;
        color: #1b1e22;
        font-size: 12px;
        background-color: #eaf2ff;
        border-radius: 3px 3px 0px 0px;
    }

    .col {
        border: solid 1px #eee;
        border-radius: 5px;
        float: left;
    }
    .selected-code {
        min-width: 650px;
        min-height: 266px;
        .selected-code-title {
            padding: 6px 30px 6px 12px;
            margin-bottom: 10px;
            height: 30px;
            background-color: #eaf2ff;
            border-radius: 3px 3px 0px 0px;
            display: flex;
            justify-content: space-between;
            & > div {
                font-family: PingFang SC;
                color: #1b1e22;
                font-size: 12px;
            }
        }
    }
    .col + .col {
        margin-left: 10px;
    }
    .item {
        display: flex;
        align-items: center;
        color: #1b1e22;
        height: 40px;
        padding: 6px 12px;
        margin: 0px 10px 0px 10px;
        border: solid 1px #e3e3e3;
        background-color: #ffffff;
        border-radius: 3px;
        .drag-pre-icon {
            font-size: 14px;
            margin-right: 12px;
            color: #5b6677;
        }
    }
        .selected-item {
        display: flex;
        justify-content: space-between;
        // 连接符
        .connection-symbol {
            width: 120px;
            ::v-deep .el-input__inner {
                border: none;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                border-left: 1px solid #d3d7e0;
            }
        }
        .connection-symbol.fix-character-content {
            width: 120px;
            display: flex;
            .edit-fix-character {
                width: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: $--color-primary;
                cursor: pointer;
            }
            ::v-deep .el-input__inner {
                width: 119px;
                border: none;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                border-left: 1px solid #d3d7e0;
            }
        }
    }
    .item:hover {
        background-color: #fdfdfd;
        cursor: move;
    }
    .item + .item {
        margin-top: 6px;
    }
    .item.forbid:hover {
        background-color: #ccc;
        cursor: not-allowed !important;
    }
}
</style>