<template>
    <el-table class="container_table3" border v-loading="loading" :row-class-name="tableClassName" :data="buttonData"
        :row-key="getRowKey" :height="tableHeight()">
        <el-table-column label="" prop="id" align="center" width="50" type="index" :show-overflow-tooltip="true">
            <i class="el-icon-s-operation drag"></i>
        </el-table-column>
        <el-table-column label="序号" align="left" width="50" type="index" :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column label="常用按钮" prop="buttonType" align="left" :show-overflow-tooltip="true">
            <template slot-scope="scope">
                <el-select v-model="scope.row.usuallyButton" placeholder=""
                    @change="handleChangeUsuallyButton(scope.$index, scope.row)">
                    <el-option v-for="item in usuallyList" :key="item.code" :label="item.label" :value="item.code">
                    </el-option>
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="按钮编号" prop="buttonCode" align="left">
            <template slot-scope="{row}">
                <el-input maxlength="200" v-model="row.buttonCode" placeholder="" />
            </template>
        </el-table-column>
        <el-table-column label="按钮名称" prop="buttonName" align="left">
            <template slot-scope="{row}">
                <el-input maxlength="200" v-model="row.buttonName" placeholder="" />
            </template>
        </el-table-column>
        <el-table-column label="图标" prop="buttonIcon" align="left">
            <template slot-scope="scope">
                <el-popover placement="bottom-start" width="460" trigger="click" @show="handleIcon(scope)">
                    <IconSelect ref="iconSelect" @select="handleSelect" />
                    <el-input slot="reference" v-model="scope.row.buttonIcon" placeholder="点击选择图标" :clearable="true">
                        <i slot="prefix">
                            <svg-icon v-if="scope.row.buttonIcon" :icon-class="scope.row.buttonIcon" />
                            <svg-icon v-else icon-class="Line-Search" />
                        </i>
                    </el-input>
                </el-popover>
            </template>
        </el-table-column>
        <el-table-column label="按钮类型" prop="buttonType" align="left">
            <template slot-scope="{row}">
                <el-select v-model="row.buttonType" placeholder="" :clearable="true">
                    <el-option v-for="item in buttonTypeList" :key="item.code" :label="item.label" :value="item.code">
                        <span :style="{ color: item.color }">{{ item.label }}</span>
                    </el-option>
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="操作模式" prop="buttonMode" align="left">
            <template slot-scope="{row}">
                <el-select v-model="row.buttonMode" placeholder="" :clearable="true">
                    <el-option v-for="item in buttonModeList" :key="item.code" :label="item.label" :value="item.code">
                    </el-option>
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="绑定表单" align="left" v-if="isShowFormId">
            <template slot-scope="{row}">
                <el-select v-model="row.formId" :clearable="true">
                    <el-option v-for="item in formList" :key="item.id" :label="item.formCode"
                        :value="item.id"></el-option>
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="绑定打印模板" align="left" width="120">
            <template slot-scope="{row}">
                <el-select multiple collapse-tags  :disabled="row.buttonCode !== 'print'" v-model="row.printTemplateId" :clearable="true">
                    <el-option v-for="item in tmplList" :key="item.id" :label="item.templateName"
                        :value="item.id"></el-option>
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="启用" align="left">
            <template slot-scope="{row}">
                <el-checkbox v-model="row.status" :true-label="0" :false-label="1"></el-checkbox>
            </template>
        </el-table-column>
        <el-table-column label="按钮位置" align="left" width="150">
            <template slot-scope="{row}">
                <div>
                    <el-checkbox v-model="row.isTop" :true-label="1" :false-label="0">顶部</el-checkbox>
                </div>
                <div>
                    <el-checkbox v-model="row.isRow" :true-label="1" :false-label="0">列表</el-checkbox>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="80">
            <template slot-scope="scope">
                <el-button type="text" icon="el-icon-setting" @click="handleSetting(scope.row, scope.$index)"></el-button>
                <el-button type="text" icon="el-icon-delete" @click="handleDelete(scope.row, scope.$index)"></el-button>
            </template>
        </el-table-column>
        <buttonSetting ref="buttonSetting" @optionsSuccess="optionsSuccess"></buttonSetting>
    </el-table>
</template>
<script>
import Sortable from 'sortablejs';
import IconSelect from "@/components/IconSelect";
import { list } from '@/api/form/form'
import {userPrintTemplate, tmplAllList} from '@/api/system/print'
import buttonSetting from './buttonSetting'
export default {
    components: { IconSelect, buttonSetting },
    props: {
        //表格数据
        buttonData: {
            type: Array,
            default: [],
        },
        //菜单信息配置是否展开
        isMenuShow: {
            type: Boolean,
            default: false,
        },
        isDataSourceShow: {
            type: Boolean,
            default: false,
        },
        dialogFull: {
            type: Boolean,
            default: false,
        },
        //是否显示绑定表单
        isShowFormId: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            loading: false,
            //按钮类型
            buttonTypeList: [
                { code: 'primary', label: '主要按钮', color: "#409eff" },
                { code: 'success', label: '成功按钮', color: "#71e2a3" },
                { code: 'info', label: '信息按钮', color: "#909399" },
                { code: 'warning', label: '警告按钮', color: "#e6a23c" },
                { code: 'danger', label: '危险按钮', color: "red" },
            ],
            // 操作模式
            buttonModeList: [
                { code: '1', label: '单条操作' },
                { code: '2', label: '多条操作' },
            ],
            // 常用按钮
            usuallyList: [
                { code: 'create', label: '新增' },
                { code: 'update', label: '修改' },
                { code: 'delete', label: '删除' },
                // {code: 'view',label: '查看'},
                // {code: 'save',label: '保存'},
                {code: 'submit',label: '提交'},
                {code: 'withdraw',label: '撤回'},
                // {code: 'cancel',label: '取消'},
                
                {code: 'flowSee',label: '流程查看'},
                
                {code: 'inport',label: '导入'},
                {code: 'export',label: '导出'},
                {code: 'print',label: '打印'},
            ],
            usuallyButtonList: [
                {
                    "buttonCode": "create",
                    "buttonIcon": "Blue-NewDepartment",
                    "buttonMode": "",
                    "buttonName": "新增",
                    "buttonType": "primary",
                    "groupId": "",
                    "id": "",
                    "ids": "",
                    "isHide": 0,
                    "isRow": 0,
                    "isTop": 1,
                    "menuId": "",
                    "seq": 0,
                    "status": 0,
                }, 
                {
                    "buttonCode": "update",
                    "buttonIcon": "Blue-Edit",
                    "buttonMode": "1",
                    "buttonName": "修改",
                    "buttonType": "success",
                    "groupId": "",
                    "id": "",
                    "ids": "",
                    "isHide": 0,
                    "isRow": 1,
                    "isTop": 0,
                    "menuId": "",
                    "seq": 0,
                    "status": 0,
                },
                {
                    "buttonCode": "delete",
                    "buttonIcon": "Blue-Delete",
                    "buttonMode": "1",
                    "buttonName": "删除",
                    "buttonType": "danger",
                    "groupId": "",
                    "id": "",
                    "ids": "",
                    "isHide": 0,
                    "isRow": 1,
                    "isTop": 1,
                    "menuId": "",
                    "seq": 0,
                    "status": 0,
                },
                {
                    "buttonCode": "submit",
                    "buttonIcon": "Blue-NewDepartment",
                    "buttonMode": "1",
                    "buttonName": "提交",
                    "buttonType": "success",
                    "groupId": "",
                    "id": "",
                    "ids": "",
                    "isHide": 0,
                    "isRow": 1,
                    "isTop": 1,
                    "menuId": "",
                    "seq": 0,
                    "status": 0,
                },
                {
                    "buttonCode": "withdraw",
                    "buttonIcon": "Blue-Cancel",
                    "buttonMode": "1",
                    "buttonName": "撤回",
                    "buttonType": "success",
                    "groupId": "",
                    "id": "",
                    "ids": "",
                    "isHide": 0,
                    "isRow": 0,
                    "isTop": 1,
                    "menuId": "",
                    "seq": 0,
                    "status": 0,
                },
                {
                    "buttonCode": "flowSee",
                    "buttonIcon": "Blue-Flow",
                    "buttonMode": "1",
                    "buttonName": "流程查看",
                    "buttonType": "success",
                    "groupId": "",
                    "id": "",
                    "ids": "",
                    "isHide": 0,
                    "isRow": 0,
                    "isTop": 1,
                    "menuId": "",
                    "seq": 0,
                    "status": 0,
                },
                {
                    "buttonCode": "inport",
                    "buttonIcon": "Blue-Inport",
                    "buttonMode": "1",
                    "buttonName": "导入",
                    "buttonType": "success",
                    "groupId": "",
                    "id": "",
                    "ids": "",
                    "isHide": 0,
                    "isRow": 0,
                    "isTop": 1,
                    "menuId": "",
                    "seq": 0,
                    "status": 0,
                },
                {
                    "buttonCode": "export",
                    "buttonIcon": "Blue-Export",
                    "buttonMode": "1",
                    "buttonName": "导出",
                    "buttonType": "success",
                    "groupId": "",
                    "id": "",
                    "ids": "",
                    "isHide": 0,
                    "isRow": 0,
                    "isTop": 1,
                    "menuId": "",
                    "seq": 0,
                    "status": 0,
                },
                {
                    "buttonCode": "print",
                    "buttonIcon": "Blue-Print",
                    "buttonMode": "1",
                    "buttonName": "打印",
                    "buttonType": "success",
                    "groupId": "",
                    "id": "",
                    "ids": "",
                    "isHide": 0,
                    "isRow": 1,
                    "isTop": 1,
                    "menuId": "",
                    "seq": 0,
                    "status": 0,
                },
            ],
            usuallyButton: "",
            index: "",
            icon: "",
            windowHeight: Number(),
            buttonDataIndex: '',
            formList: [],
            settingIndex: 0,
            tmplList: []
        }
    },
    watch: {
        'dialogFull': {
            handler: function (newDialogFull) {
                if (newDialogFull) {
                    this.windowHeight = this.windowHeight + 80
                } else {
                    this.windowHeight = this.windowHeight - 80
                }
            }
        }
    },
    created() {
        let windowHeight = document.body.clientHeight && document.documentElement.clientHeight;
        this.windowHeight = windowHeight - 610
        this.initFormList()
        this.initTmplList()
    },
    mounted() {
        this.rowDrop();
    },
    methods: {
       async initTmplList() {
          const {data: {list}} = await  tmplAllList()
            this.tmplList = list
        },
        initFormList() {
            list().then(res => {
                this.formList = res.data.list
            })
        },
        handleIcon(scope) {
            this.buttonDataIndex = scope.$index;
            this.$refs.iconSelect.init();
        },
        handleSelect(name) {
            this.$set(this.buttonData[this.buttonDataIndex], 'buttonIcon', name)
        },
        tableHeight() {
            let windowHeight = this.windowHeight
            windowHeight = windowHeight + (this.isMenuShow ? 0 : 180) + (this.isDataSourceShow ? 0 : 60)
            return windowHeight
        },
        tableClassName(e) {
            e.row.index = e.rowIndex;
            e.row.seq = e.rowIndex + 1;
        },
        getRowKey(row) {
            if (row.id) {
                return row.id;
            } else {
                return row.ids;
            }
        },
        selectButtonIcon(name, font_class) {
            this.buttonData[this.index].buttonIconName = name;
            this.buttonData[this.index].buttonIcon = font_class;
        },
        getTableIndex(index) {
            this.index = index
        },
        addButtonProperty() {
            let objdata = {
                "buttonCode": "",
                "buttonIcon": "",
                "buttonMode": "",
                "buttonName": "",
                "buttonType": "",
                "groupId": "",
                "id": "",
                "ids": new Date().getTime(),
                "isHide": 0,
                "isRow": 0,
                "isTop": 0,
                "menuId": "",
                "seq": 0,
                "status": 0,
                "templateCodes": [],
                "usuallyButton": ""
            };
            this.buttonData.push(objdata)
            this.$modal.msgSuccess('添加成功');
        },
        handleChangeUsuallyButton(index, row) {
            let idx = Number()
            switch (this.buttonData[index].usuallyButton) {
                case 'create':
                    idx = 0;
                    break;
                case 'update':
                    idx = 1;
                    break;
                case 'delete':
                    idx = 2;
                    break;
                case 'submit':
                    idx = 3;
                    break;
                    case 'withdraw':
                    idx = 4;
                    break;
                case 'flowSee':
                    idx = 5;
                    break;
                case 'inport':
                    idx = 6;
                    break;
                case 'export':
                    idx = 7;
                    break;
                case 'print':
                    idx = 8;
                    break;
            }
            this.buttonData[index].buttonCode = this.usuallyButtonList[idx].buttonCode;
            this.buttonData[index].buttonIcon = this.usuallyButtonList[idx].buttonIcon
            this.buttonData[index].buttonMode = this.usuallyButtonList[idx].buttonMode
            this.buttonData[index].buttonName = this.usuallyButtonList[idx].buttonName
            this.buttonData[index].buttonType = this.usuallyButtonList[idx].buttonType
            this.buttonData[index].isHide = this.usuallyButtonList[idx].isHide
            this.buttonData[index].isRow = this.usuallyButtonList[idx].isRow
            this.buttonData[index].isTop = this.usuallyButtonList[idx].isTop
            this.buttonData[index].seq = index + 1
            this.buttonData[index].status = this.usuallyButtonList[idx].status
        },
        handleDelete(row, index) {
            let that = this
            this.$modal.confirm('是否确认删除?').then(function () {
                that.buttonData.splice(index, 1)
            }).then(() => {
                this.$modal.msgSuccess("删除成功");
            }).catch(() => { });
        },
        rowDrop() { // 行拖拽
            const tbodys = document.querySelector('.container_table3 .el-table__body-wrapper tbody')
            const _this = this;
            Sortable.create(tbodys, {
                handle: '.drag',
                onEnd({ newIndex, oldIndex }) {
                    const currRow = _this.buttonData.splice(oldIndex, 1)[0];
                    _this.buttonData.splice(newIndex, 0, currRow);
                }
            });
        },
        handleSetting(row, index) {
            this.settingIndex = index;
            this.$refs.buttonSetting.init(row);
        },
        optionsSuccess (data) {
            this.$set(this.buttonData, this.settingIndex, Object.assign({}, this.buttonData[this.settingIndex], {options: data}));
        }

    }
}
</script>
<style lang="scss" scoped>
.drag {
    cursor: move;
    font-size: 20px;
}

.el-button--text {
    padding-left: 5px;
}

.svg-icon-font {
    vertical-align: -13px;
}

::v-deep .el-input__prefix .svg-icon {
    font-size: 24px;
    vertical-align: -0.5em;
}
</style>