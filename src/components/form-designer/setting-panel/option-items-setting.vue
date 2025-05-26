<template>
    <div class="option-items-pane">
        <el-radio-group
            v-if="(selectedWidget.type === 'radio') || ((selectedWidget.type === 'select') && !selectedWidget.options.multiple)"
            v-model="optionModel.defaultValue" @change="emitDefaultValueChange">
            <draggable tag="ul" :list="optionModel.optionItems"
                v-bind="{ group: 'optionsGroup', ghostClass: 'ghost', handle: '.drag-option' }">
                <li v-for="(option, idx) in optionModel.optionItems" :key="idx">
                    <el-radio :label="option.value">
                        <el-input v-model="option.value" size="mini" style="width: 100px"></el-input>
                        <el-input v-model="option.label" size="mini" style="width: 100px"></el-input>
                        <i class="iconfont icon-drag drag-option"></i>
                        <el-button circle plain size="mini" type="danger" @click="deleteOption(option, idx)"
                            icon="el-icon-minus" class="col-delete-button"></el-button>
                    </el-radio>
                </li>
            </draggable>
        </el-radio-group>
        <el-checkbox-group
            v-else-if="(selectedWidget.type === 'checkbox') || ((selectedWidget.type === 'select') && selectedWidget.options.multiple)"
            v-model="optionModel.defaultValue" @change="emitDefaultValueChange">
            <draggable tag="ul" :list="optionModel.optionItems"
                v-bind="{ group: 'optionsGroup', ghostClass: 'ghost', handle: '.drag-option' }">
                <li v-for="(option, idx) in optionModel.optionItems" :key="idx">
                    <el-checkbox :label="option.value">
                        <el-input v-model="option.value" size="mini" style="width: 100px"></el-input>
                        <el-input v-model="option.label" size="mini" style="width: 100px"></el-input>
                        <i class="iconfont icon-drag drag-option"></i>
                        <el-button circle plain size="mini" type="danger" @click="deleteOption(option, idx)"
                            icon="el-icon-minus" class="col-delete-button"></el-button>
                    </el-checkbox>
                </li>
            </draggable>
        </el-checkbox-group>
        <el-cascader v-else-if="(selectedWidget.type === 'cascader')" v-model="optionModel.defaultValue"
            :options="optionModel.optionItems" @change="emitDefaultValueChange"
            :placeholder="i18nt('render.hint.selectPlaceholder')" style="width: 100%">
        </el-cascader>
        <div v-if="(selectedWidget.type === 'cascader')">
            <el-button type="text" @click="importCascaderOptions">{{ i18nt('designer.setting.importOptions')
                }}</el-button>
            <el-button type="text" @click="resetDefault">{{ i18nt('designer.setting.resetDefault') }}</el-button>
        </div>

        <div
            v-if="(selectedWidget.type === 'radio') || (selectedWidget.type === 'checkbox') || (selectedWidget.type === 'select')">
            <el-button type="text" @click="addOption">{{ i18nt('designer.setting.addOption') }}</el-button>
            <el-button type="text" @click="importOptions">{{ i18nt('designer.setting.importOptions') }}</el-button>
            <el-button type="text" @click="resetDefault">{{ i18nt('designer.setting.resetDefault') }}</el-button>
        </div>
        <div v-if="selectedWidget.type === 'tree-select'">
            <el-button type="text" @click="importNormalizer">{{
                i18nt('designer.setting.importNormalizer')
            }}</el-button>
            <el-button type="text" @click="importTreeOptions">{{
                i18nt('designer.setting.importOptions')
            }}</el-button>
        </div>
        <!-- TODO 字段扩展 -->
        <div
            v-if="(selectedWidget.type === 'radio') || (selectedWidget.type === 'checkbox') || (selectedWidget.type === 'select')">
            <el-form-item label="字典中获取">
                <treeselect :appendToBody="true" z-index="9999" v-model="optionModel.dictOptionsVal"
                    :options="dictOptions" :normalizer="normalizera" @select="selectTreeselect" placeholder="请选择字典" />
            </el-form-item>
        </div>

        <Dialog :title="i18nt('designer.setting.importOptions')" :visible.sync="showImportDialogFlag"
            v-if="showImportDialogFlag" :show-close="true" class="small-padding-dialog" append-to-body 
            :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
            <el-form-item>
                <el-input type="textarea" rows="10" v-model="optionLines"></el-input>
            </el-form-item>
            <div slot="footer" class="dialog-footer">
                <el-button size="large" type="primary" @click="saveOptions">{{ i18nt('designer.hint.confirm')
                    }}</el-button>
                <el-button size="large" type="" @click="showImportDialogFlag = false">{{ i18nt('designer.hint.cancel')
                    }}
                </el-button>
            </div>
        </Dialog>

        <Dialog :title="i18nt('designer.setting.importOptions')" :visible.sync="showImportCascaderDialogFlag"
            v-if="showImportCascaderDialogFlag" :show-close="true" class="small-padding-dialog" append-to-body 
            :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
            <code-editor v-model="cascaderOptions" mode="json" :readonly="false"></code-editor>
            <div slot="footer" class="dialog-footer">
                <el-button size="large" type="primary" @click="saveCascaderOptions">{{ i18nt('designer.hint.confirm') }}
                </el-button>
                <el-button size="large" type="" @click="showImportCascaderDialogFlag = false">
                    {{ i18nt('designer.hint.cancel') }}</el-button>
            </div>
        </Dialog>

        <Dialog :title="i18nt('designer.setting.importOptions')" :visible.sync="showImportTreeOpsDialogFlag"
            append-to-body v-if="showImportTreeOpsDialogFlag" :show-close="true" class="small-padding-dialog"
            :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true" >
            <code-editor v-model="TreeOpsOptions" mode="json" :readonly="false"></code-editor>
            <div slot="footer" class="dialog-footer">
                <el-button size="large" type="primary" @click="saveTreeOpsOptions">{{ i18nt('designer.hint.confirm')
                    }}</el-button>
                <el-button size="large" type="" @click="showImportTreeOpsDialogFlag = false">{{
                i18nt('designer.hint.cancel')
            }}</el-button>
            </div>
        </Dialog>

        <Dialog :title="i18nt('designer.setting.importNormalizer')" :visible.sync="showImportTreePropsDialogFlag"
            append-to-body v-if="showImportTreePropsDialogFlag" :show-close="true" class="small-padding-dialog"
            :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true" >
            <code-editor v-model="TreeNormalizer" mode="json" :readonly="false"></code-editor>
            <div slot="footer" class="dialog-footer">
                <el-button size="large" type="primary" @click="saveTreeOpsProps">{{
                    i18nt('designer.hint.confirm')
                    }}</el-button>
                <el-button size="large" type="" @click="showImportTreePropsDialogFlag = false">{{
                    i18nt('designer.hint.cancel')
                    }}</el-button>
            </div>
        </Dialog>
    </div>
</template>

<script>
import Draggable from 'vuedraggable'
import CodeEditor from '@/components/code-editor/index'
import i18n from "@/utils/i18n";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

import { commonTree } from '@/api/system/dict'

export default {
    name: "OptionItemsSetting",
    mixins: [i18n],
    components: {
        Draggable,
        //CodeEditor: () => import('@/components/code-editor/index'),
        CodeEditor,
        Treeselect
    },
    props: {
        designer: Object,
        selectedWidget: Object,
    },
    data() {
        return {
            showImportDialogFlag: false,
            optionLines: '',

            cascaderOptions: '',
            showImportCascaderDialogFlag: false,

            showImportTreeOpsDialogFlag: false,
            showImportTreePropsDialogFlag: false,

            //separator: '||',
            separator: ',',
            dictOptions: [],
            dictOptionsVal: undefined
        }
    },
    computed: {
        optionModel() {
            return this.selectedWidget.options
        },

    },
    watch: {
        'selectedWidget.options': {
            deep: true,
            handler(val) {
                //console.log('888888', 'Options change!')
            }
        },
    },
    created() {
        commonTree({ status: '0' }).then(res => {
            this.dictOptions = res.data

            let selectDict
            this.dictOptions.forEach(item => {
                if (this.optionModel.dictOptionsVal == item.id) {
                    selectDict = item
                }
            })
            if (selectDict && selectDict.children) {
                let optionItemsArr = [];
                selectDict.children.forEach((item) => {
                    optionItemsArr.push({
                        value: item.code,
                        label: item.name
                    })
                })
                this.optionModel.optionItems = optionItemsArr
            }
        })
    },
    methods: {
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
        emitDefaultValueChange() {
            if (!!this.designer && !!this.designer.formWidget) {
                let fieldWidget = this.designer.formWidget.getWidgetRef(this.selectedWidget.options.name)
                if (!!fieldWidget && !!fieldWidget.refreshDefaultValue) {
                    fieldWidget.refreshDefaultValue()
                }
            }
        },

        deleteOption(option, index) {
            this.optionModel.optionItems.splice(index, 1)
        },

        addOption() {
            let newValue = this.optionModel.optionItems.length + 1
            this.optionModel.optionItems.push({
                value: newValue,
                label: 'new option'
            })
        },

        importOptions() {
            this.optionLines = ''
            if (this.optionModel.optionItems.length > 0) {
                this.optionModel.optionItems.forEach((opt) => {
                    if (opt.value === opt.label) {
                        this.optionLines += opt.value + '\n'
                    } else {
                        this.optionLines += opt.value + this.separator + opt.label + '\n'
                    }
                })
            }

            this.showImportDialogFlag = true
        },

        selectTreeselect(val) {
            if (val.children) {
                let optionItemsArr = [];
                val.children.forEach((item) => {
                    optionItemsArr.push({
                        value: item.code,
                        label: item.name
                    })
                })
                this.optionModel.optionItems = optionItemsArr
            }
            this.optionModel.dictOptionsVal = val.id
        },

        saveOptions() {
            let lineArray = this.optionLines.split('\n')
            //console.log('test', lineArray)
            if (lineArray.length > 0) {
                this.optionModel.optionItems = []
                lineArray.forEach((optLine) => {
                    if (!!optLine && !!optLine.trim()) {
                        if (optLine.indexOf(this.separator) !== -1) {
                            this.optionModel.optionItems.push({
                                value: optLine.split(this.separator)[0],
                                label: optLine.split(this.separator)[1]
                            })
                        } else {
                            this.optionModel.optionItems.push({
                                value: optLine,
                                label: optLine
                            })
                        }
                    }
                })
            } else {
                this.optionModel.optionItems = []
            }

            this.showImportDialogFlag = false
        },

        resetDefault() {
            if ((this.selectedWidget.type === 'checkbox') ||
                ((this.selectedWidget.type === 'select') && this.selectedWidget.options.multiple)) {
                this.optionModel.defaultValue = []
            } else {
                this.optionModel.defaultValue = ''
            }

            this.emitDefaultValueChange()
        },

        importCascaderOptions() {
            this.cascaderOptions = JSON.stringify(this.optionModel.optionItems, null, '  ')
            this.showImportCascaderDialogFlag = true
        },

        saveCascaderOptions() {
            try {
                let newOptions = JSON.parse(this.cascaderOptions)
                this.optionModel.optionItems = newOptions
                //TODO: 是否需要重置选项默认值？？

                this.showImportCascaderDialogFlag = false
            } catch (ex) {
                this.$message.error(this.i18nt('designer.hint.invalidOptionsData') + ex.message)
            }
        },
        importDict() {
            commonTree().then(res => {
                this.dictOptions = res.data
            })
        },
        importNormalizer() {
            this.TreeNormalizer = JSON.stringify(this.optionModel.normalizer)
            this.showImportTreePropsDialogFlag = true
        },
        importTreeOptions() {
            this.TreeOpsOptions = JSON.stringify(this.optionModel.optionItems)
            this.showImportTreeOpsDialogFlag = true
        },
        saveTreeOpsProps() {
            try {
                let normalizer = JSON.parse(this.TreeNormalizer)
                this.optionModel.normalizer = normalizer
                //TODO: 是否需要重置选项默认值？？

                this.showImportTreePropsDialogFlag = false
            } catch (ex) {
                this.$message.error(
                    this.i18nt('designer.hint.invalidOptionsData') + ex.message
                )
            }
        },
        saveTreeOpsOptions() {
            try {
                let newOptions = JSON.parse(this.TreeOpsOptions)
                this.optionModel.optionItems = newOptions
                //TODO: 是否需要重置选项默认值？？

                this.showImportTreeOpsDialogFlag = false
            } catch (ex) {
                this.$message.error(
                    this.i18nt('designer.hint.invalidOptionsData') + ex.message
                )
            }
        },
    }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/primaryScss.scss"; //* static-content-wrapper已引入，还需要重复引入吗？ *//

.option-items-pane ul {
    padding-inline-start: 6px;
    padding-left: 6px;
    /* 重置IE11默认样式 */
}

li.ghost {
    background: #fff;
    border: 2px dotted $--color-primary;
}

.drag-option {
    cursor: move;
}

.small-padding-dialog ::v-deep .el-dialog__body {
    padding: 10px 15px;
}

.dialog-footer .el-button {
    width: 100px;
}
</style>
