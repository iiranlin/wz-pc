<template>
    <el-table class="container_table2" border v-loading="loading" :data="tableData" :row-key="getRowKey"
        :height="tableHeight()" :row-class-name="tableRowClassName">
        <el-table-column label="" prop="id" align="center" width="50" type="index">
            <i class="el-icon-s-operation drag"></i>
        </el-table-column>
        <el-table-column label="序号" prop="id" align="left" width="50" type="index">
        </el-table-column>
        <el-table-column label="父字段名称" prop="parentFieldCode" align="left" width="150">
            <template slot-scope="scope">
                <el-select v-model="scope.row.parentFieldCode" clearable  placeholder="请选择">
                    <el-option v-for="field in tableData" :key="field.fieldCode" :label="field.fieldName" :value="field.fieldCode" />
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="字段编码" prop="fieldCode" align="left" width="150">
            <template slot-scope="{row}">
                <el-input maxlength="200" v-model="row.fieldCode" placeholder="" />
            </template>
        </el-table-column>
        <el-table-column label="字段名称" prop="fieldName" align="left" width="150">
            <template slot-scope="{row}">
                <el-input maxlength="200" v-model="row.fieldName" placeholder="" />
            </template>
        </el-table-column>
        <el-table-column label="字段背景色" prop="bgColor" align="left" width="150">
            <template slot-scope="{row}">
                <el-input maxlength="7" v-model="row.bgColor" placeholder="" />
            </template>
        </el-table-column>
        <el-table-column label="字段颜色" prop="fontColor" align="left" width="150">
            <template slot-scope="{row}">
                <el-input maxlength="7" v-model="row.fontColor" placeholder="" />
            </template>
        </el-table-column>
        <el-table-column label="字段类型" prop="fieldType" align="left" width="150">
            <template slot-scope="scope">
                <el-select v-model="scope.row.fieldType" placeholder="请选择" value-key="label"
                    @change="changeFieldType($event, scope.$index)">
                    <el-option v-for="dict in fieldTypeList" :key="dict.label" :label="dict.label" :value="dict.code" />
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="组件扩展" prop="componentType" align="left" width="150">
            <template slot-scope="scope">
                <el-select v-model="scope.row.componentType" placeholder="请选择" value-key="range">
                    <el-option :disabled="dict.disabled" v-for="dict in [{label: '展开', code: 'unfold', disabled: !['dict'].includes(scope.row.fieldType)}, {label: '区间', code: 'range', disabled: !['Number'].includes(scope.row.fieldType)}, {label: '弹窗', code: 'dialog', disabled: !['String'].includes(scope.row.fieldType)}]" :key="dict.label" :label="dict.label" :value="dict.code" />
                </el-select>
            </template>
        </el-table-column>
        <el-table-column width="150" label="字段扩展" prop="fieldFormat" align="left">
            <template slot-scope="scope">
                <treeselect v-if="scope.row.fieldType == 'dict'" :appendToBody="true" z-index="9999"
                    @select="selectDictselect($event, scope.$index)" :value="scope.row.fieldFormat"
                    :options="commonTreeList" :normalizer="normalizera" placeholder="请选择字典" />
                <el-select v-if="scope.row.fieldType == 'tree'" :value="scope.row.fieldFormat" placeholder="请选择树形"
                    @change="changeSelectTree($event, scope.$index)" clearable style="width:100%" size="small">
                    <el-option v-for="(item, key)  in treeSelectArr" :key="key" :label="item.name" :value="item.code" />
                </el-select>
                <el-select v-if="scope.row.fieldType && scope.row.fieldType.indexOf('date') > -1" :value="scope.row.fieldFormat"
                    placeholder="请选择日期格式" clearable style="width:100%" size="small"
                    @change="changeDateType($event, scope.$index)">
                    <el-option v-for="(item, key)  in dateSelectArr" :key="key" :label="item.label" :value="item.code" />
                </el-select>
                <el-select v-if="scope.row.fieldType == 'Number'" v-model="scope.row.fieldFormat" placeholder="数据格式"
                    clearable style="width:100%" size="small">
                    <el-option v-for="(item, key)  in numberSelectArr" :key="key" :label="item.name"
                        :value="item.code" />
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="搜索分组" prop="groupName" align="left" width="150">
            <template slot-scope="{row}">
                <el-input maxlength="7" v-model="row.groupName" placeholder="" />
            </template>
        </el-table-column>
        <el-table-column label="启用" prop="status" align="left" width="80">
            <template slot-scope="{row}">
                <el-checkbox v-model="row.status" :true-label="0" :false-label="1"></el-checkbox>
            </template>
        </el-table-column>
        <el-table-column label="列头排序" prop="isOrder" align="left" width="80">
            <template slot-scope="{row}">
                <el-checkbox v-model="row.isOrder" :true-label="1" :false-label="0"></el-checkbox>
            </template>
        </el-table-column>
        <el-table-column label="启用搜索" align="left" width="150">
            <template slot-scope="{row}">
                <div>
                    <el-checkbox v-model="row.isSearchArea" :true-label="1" :false-label="0">查询区域</el-checkbox>
                </div>
                <div>
                    <el-checkbox v-model="row.isSearchHeader" :true-label="1" :false-label="0">列表表头</el-checkbox>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="默认搜索" prop="defaultSearch" align="left" width="80">
            <template slot-scope="{row}">
                <el-checkbox v-model="row.defaultSearch" :true-label="1" :false-label="0"></el-checkbox>
            </template>
        </el-table-column>
        <el-table-column label="查询排列" prop="searchSort" align="left" width="200">
            <template slot-scope="{row}">
                <el-input-number v-model="row.searchSort" controls-position="right" :min="1" :max="99"></el-input-number>
            </template>
        </el-table-column>
        <el-table-column label="默认固定列" prop="fixedColumn" align="left" width="92">
            <template slot-scope="{row}">
                <el-checkbox v-model="row.fixedColumn" true-label="left" :false-label="''"></el-checkbox>
            </template>
        </el-table-column>
        <el-table-column label="列表隐藏" prop="isHide" align="left" width="80">
            <template slot-scope="{row}">
                <el-checkbox v-model="row.isHide" :true-label="1" :false-label="0"></el-checkbox>
            </template>
        </el-table-column>
        <!-- <el-table-column label="新增" align="center" width="150">
      <template slot-scope="{row}">
        <div>
          <el-checkbox v-model="row.isAdd" :true-label="1" :false-label="0"></el-checkbox>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="修改" align="center" width="150">
      <template slot-scope="{row}">
        <div>
          <el-checkbox v-model="row.isEdit" :true-label="1" :false-label="0"></el-checkbox>
        </div>
      </template>
    </el-table-column> -->
        <el-table-column label="字典多选" align="left" width="150">
            <template slot-scope="{row}">
                <div>
                    <el-checkbox v-model="row.isMutiple"
                        :disabled="!(row.fieldType == 'dict' || row.fieldType == 'tree')" :true-label="1"
                        :false-label="0"></el-checkbox>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="启动Slot" align="left" width="120">
            <template slot-scope="{row}">
                <div>
                    <el-checkbox v-model="row.formSlot" :true-label="1" :false-label="0">查询</el-checkbox>
                </div>
                <div>
                    <el-checkbox v-model="row.listSlot" :true-label="1" :false-label="0">列表</el-checkbox>
                </div>
            </template>
        </el-table-column>
        <!-- <el-table-column label="统计" align="center" width="150">
            <template slot-scope="{row}">
                <div v-show="row.fieldType == 'Number'">
                    <el-checkbox v-model="row.isSum" :true-label="1" :false-label="0">是否小计</el-checkbox>
                </div>
                <div v-show="row.fieldType == 'Number'">
                    <el-checkbox v-model="row.isTotal" :true-label="1" :false-label="0">是否合计</el-checkbox>
                </div>
            </template>
        </el-table-column> -->
        <el-table-column label="对齐方式" align="left" min-width="120">
            <template slot-scope="{row}">
                <el-select v-model="row.align" placeholder="">
                    <el-option v-for="item in alignList" :key="item.code" :label="item.name" :value="item.code">
                    </el-option>
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="宽度" align="left" min-width="120">
            <template slot-scope="{row}">
                <el-input maxlength="200" v-model="row.fieldWidth" placeholder="" />
            </template>
        </el-table-column>
        <el-table-column label="链接页面" align="left" min-width="180">
            <template slot-scope="{row}">
                <el-input maxlength="200" v-model="row.link" placeholder="" />
            </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" align="center" width="80">
            <template slot-scope="scope">
                <el-button type="text" icon="el-icon-setting" @click="handleSetting(scope.row, scope.$index)">
                </el-button>
                <el-button type="text" icon="el-icon-delete" @click="handleDelete(scope.row, scope.$index)">
                </el-button>
            </template>
        </el-table-column>
        <fieldSetting ref="fieldSetting" @optionsSuccess="optionsSuccess"></fieldSetting>
    </el-table>
</template>
<script>
import { commonTree } from '@/api/system/dict'
import { alignList } from '@/utils/constant'
import Sortable from 'sortablejs'
import { generateUUID } from '@/utils/index'
import { camelCase } from '@/utils/index'
import fieldSetting from './fieldSetting'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    components: { fieldSetting, Treeselect },
    props: {
        //表格数据
        tableData: {
            type: Array,
            default: []
        },
        loading: {
            type: Boolean,
            default: false
        },
        //菜单信息配置是否展开
        isMenuShow: {
            type: Boolean,
            default: false
        },
        isDataSourceShow: {
            type: Boolean,
            default: false
        },
        dialogFull: {
            type: Boolean,
            default: false
        }

    },
    data() {
        return {
            windowHeight: Number(),
            alignList,
            commonTreeList: [],
            fieldTypeList: [
                { code: 'String', label: '字符串' },
                { code: 'Number', label: '数字' },
                { code: 'date', label: '日期' },
                { code: 'dict', label: '字典' },
                { code: 'icon', label: '图标' },
                { code: 'tree', label: '树形' }
            ],
            index: '',
            treeSelectArr: [
                { name: '部门树', code: 'deptId' },
                { name: '菜单树', code: 'menuId' }
            ],
            dateSelectArr: [
                { code: '{y}', label: '年' },
                { code: '{y}-{m}', label: '年-月' },
                { code: '{y}-{m}-{d}', label: '年-月-日' },
                { code: '{y}-{m}-{d} {h}:{i}', label: '年-月-日 时-分' },
                { code: '{y}-{m}-{d} {h}:{i}:{s}', label: '年-月-日 时-分-秒' },
            ],
            numberSelectArr: [
                { name: '整数', code: '0' },
                { name: '两位小数', code: '2' },
                { name: '四位小数', code: '4' },
                { name: '千分位', code: '-1' },
            ],
            settingIndex: 0
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
        let windowHeight = document.body.clientHeight && document.documentElement.clientHeight
        this.windowHeight = windowHeight - 610
    },
    mounted() {
        this.rowDropPage()
    },
    methods: {
        tableHeight() {
            let windowHeight = this.windowHeight
            windowHeight = windowHeight + (this.isMenuShow ? 0 : 180) + (this.isDataSourceShow ? 0 : 60)
            return windowHeight
        },
        tableRowClassName(e) {
            e.row.index = e.rowIndex
            e.row.seq = e.rowIndex + 1
            return 'rowPadding'
        },
        getRowKey(row) {
            if (row.id) {
                return row.id
            } else {
                return row.ids
            }
        },
        commonTree() {
            commonTree().then(({ data }) => {
                this.commonTreeList = data
            })
        },
        changeFieldType(row, index) {
            this.tableData[index].fieldFormat = ''
            this.tableData[index].componentType = ''
            if (row === 'dict' && this.commonTreeList.length === 0) {
                this.commonTree()
            }
            if (row === 'Number') {
                this.tableData[index].align = 'right'
                this.tableData[index].fieldFormat = '2'
            }
            if (row === 'date') {
                this.tableData[index].align = 'center'
                this.tableData[index].fieldFormat = '{y}-{m}-{d} {h}:{i}'
            }
        },
        selectDictselect(row, index) {
            this.tableData[index].fieldFormat = row.id
        },
        changeSelectTree(row, index) {
            this.tableData[index].fieldFormat = row
        },
        changeDateType(row, index) {
            if (this.tableData[index].fieldType && this.tableData[index].fieldType.indexOf('date') > -1) {
                this.tableData[index].fieldFormat = row
            }
        },
        /** 转换字段数据结构 */
        normalizera(node) {
            if (node.children && !node.children.length) {
                delete node.children
            }
            return {
                id: node.id,
                label: node.name,
                children: node.children
            }
        },
        addPageProperty(e) { // 添加行
            if (e) {
                for (let index = 0; index < e.length; index++) {
                    let objdata = {
                        'align': 'center',
                        'fieldType': 'String',
                        'fieldFormat': '',
                        'fieldWidth': '',
                        'id': '',
                        'ids': '',
                        'isHide': 0,
                        'isOrder': 0,
                        'isSearchArea': 0,
                        'isSearchHeader': 0,
                        'link': '',
                        'menuId': '',
                        'menuName': '',
                        'seq': 0,
                        'status': 0,
                        // 'isSum': 0,
                        // 'isTotal': 0,
                        'options': null
                    }
                    objdata.ids = generateUUID()
                    objdata.fieldCode = camelCase(e[index].columnName)
                    objdata.fieldName = e[index].columnComment
                    switch (e[index].dataType) {
                        case "VARCHAR2":
                            objdata.fieldType = 'String'
                            objdata.align = 'center'
                            break;
                        case "NUMBER":
                            objdata.fieldType = 'Number'
                            if (e[index].numBit >= 4) {
                                objdata.fieldFormat = '4'
                            } else if ((e[index].numBit >= 2)) {
                                objdata.fieldFormat = '2'
                            } else {
                                objdata.fieldFormat = '0'
                            }
                            objdata.align = 'right'
                            break;
                        case "DATE":
                            objdata.fieldType = 'date'
                            objdata.fieldFormat = '{y}-{m}-{d} {h}:{i}'
                            break;
                        default:
                            break;
                    }

                    this.tableData.push(objdata)
                }
            } else {
                let objdata = {
                    'align': 'center',
                    'fieldCode': '',
                    'fieldFormat': '',
                    'fieldName': '',
                    'bgColor': '',
                    'fontColor': '',
                    'componentType': undefined,
                    'fieldType': 'String',
                    'fieldWidth': '',
                    'id': '',
                    'ids': '',
                    'isHide': 0,
                    'isOrder': 0,
                    'isSearchArea': 0,
                    'isSearchHeader': 0,
                    'link': '',
                    'menuId': '',
                    'menuName': '',
                    'seq': 0,
                    'status': 0,
                    // 'isSum': 0,
                    // 'isTotal': 0,
                    'options': null
                }
                objdata.ids = generateUUID()
                this.tableData.push(objdata)
            }
            this.$modal.msgSuccess('添加成功')
        },
        handleDelete(row, index) {
            let that = this
            this.$modal.confirm('是否确认删除?').then(function () {
                that.tableData.splice(index, 1)
            }).then(() => {
                this.$modal.msgSuccess('删除成功')
            }).catch(() => {
            })
        },
        rowDropPage() { // 行拖拽
            const tbodys = document.querySelector('.container_table2 .el-table__body-wrapper tbody')
            const _this = this
            Sortable.create(tbodys, {
                handle: '.drag',
                onEnd({ newIndex, oldIndex }) {
                    const currRow = _this.tableData.splice(oldIndex, 1)[0]
                    _this.tableData.splice(newIndex, 0, currRow)
                }
            })
        },
        //校验
        validTable() {
            return new Promise((resolve, reject) => {
                for (let index = 0; index < this.tableData.length; index++) {
                    const item = this.tableData[index]
                    if (item.fieldCode == '') {
                        this.$modal.msgError('字段编码不能为空')
                        resolve(false)
                        break
                    }
                    if (item.fieldName == '') {
                        this.$modal.msgError('字段名称不能为空')
                        resolve(false)
                        break
                    }
                    if (item.fieldType == '') {
                        this.$modal.msgError('字段类型不能为空')
                        resolve(false)
                        break
                    }
                }
                resolve(true)
            })
        },
        handleSetting(row, index) {
            this.settingIndex = index;
            this.$refs.fieldSetting.init(row);
        },
        optionsSuccess (data) {
            this.$set(this.tableData, this.settingIndex, Object.assign({}, this.tableData[this.settingIndex], {options: data}));
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
</style>
