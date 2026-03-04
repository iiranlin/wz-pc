<template>
    <el-form v-if="searchArr.length != 0" class="container form-data-search" ref="queryForm" :model="formData"
        :inline="true" @submit.native.prevent v-show="showSearch" :label-width="labelWidth">
        <div class="form-content-box" :class="{ 'form-content-box-defaultSearch': defaultSearch && showDefaultSearch }"
            v-show="!showDefaultSearch || defaultSearch">
            <template v-for="item in searchObjArr.defaultSearchArr">
                <el-form-item v-if="!item.formSlot" class="custom-form-item" :label="item.fieldName"
                    :prop="item.fieldType == 'date' || item.componentType == 'range' ? '' : item.fieldCode"
                    :key="item.id">
                    <template slot="label">
                        <el-tooltip :content="i18nData(item, 'field', 'fieldCode', 'fieldName')" placement="top"
                            :disabled="isShowTooltip">
                            <span @mouseenter="visibleTooltip">{{ i18nData(item, 'field', 'fieldCode',
                                'fieldName') }}</span>
                        </el-tooltip>
                    </template>
                    <el-select class="select-box" v-if="item.fieldType == 'dict'" v-model="formData[item.fieldCode]"
                        :multiple="item.isMutiple == '1'" collapse-tags
                        :placeholder="($t(`please_select`) || '请选择') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                        clearable filterable style="width:100%" size="small">
                        <el-option v-for="(item, key) in item.fieldFormatArr" :key="key" :label="item.name"
                            :value="item.code" />
                    </el-select>
                    <el-date-picker v-else-if="item.fieldType && item.fieldType.indexOf('date') != -1"
                        v-model="dateRange[item.fieldCode]" size="small" :format="dateFormat[item.fieldFormat]"
                        :value-format="dateFormat[item.fieldFormat]" :type="dateType[item.fieldFormat]"
                        style="width:100%" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" @blur="handleDatePicker">
                    </el-date-picker>
                    <treeselect v-else-if="item.fieldType == 'tree'" v-model="formData[item.fieldFormat]"
                        :options="treeList[item.fieldFormat]"
                        :placeholder="($t(`please_select`) || '请选择') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                        :normalizer="normalizera" @select="selectTreeselect"></treeselect>
                    <el-input v-else-if="item.fieldType == 'String'" v-model="formData[item.fieldCode]"
                        :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                        clearable size="small" maxlength="50" @keyup.enter.native="handleQuery">
                        <el-button size="small" v-if="item.componentType == 'dialog'" slot="append"
                            icon="el-icon-search" @click="hanldeFieldClick(item)" />
                    </el-input>
                    <InputNumberRange :key="clearKey"
                        v-else-if="item.fieldType == 'Number' && item.componentType == 'range'"
                        v-model="rangeFields[item.fieldCode]">
                    </InputNumberRange>
                    <el-input v-else v-model="formData[item.fieldCode]"
                        :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                        clearable size="small" @keyup.enter.native="handleQuery" />
                    <el-tooltip effect="light" class="form-question-position slotIcon-color"
                        v-if="iconShow(item.options)" placement="top">
                        <div slot="content" class="slotIcon-color-content" v-html="iconShow(item.options)"></div>
                        <i class="el-icon-question"></i>
                    </el-tooltip>
                </el-form-item>
                <el-form-item v-else class="custom-form-item" :label="item.fieldName" :prop="item.fieldCode">
                    <template slot="label">
                        <el-tooltip :content="i18nData(item, 'field', 'fieldCode', 'fieldName')" placement="top"
                            :disabled="isShowTooltip">
                            <span @mouseenter="visibleTooltip">{{ i18nData(item, 'field', 'fieldCode',
                                'fieldName') }}</span>
                        </el-tooltip>
                    </template>
                    <slot :name="item.fieldCode" :data="item" :i18nData="i18nData"></slot>
                    <el-tooltip effect="light" class="form-question-position slotIcon-color"
                        v-if="iconShow(item.options)" placement="top">
                        <div slot="content" class="slotIcon-color-content" v-html="iconShow(item.options)"></div>
                        <i class="el-icon-question"></i>
                    </el-tooltip>
                </el-form-item>
            </template>
            <template v-if="!showDefaultSearch">
                <template v-for="item in searchObjArr.searchArr">
                    <el-form-item v-if="!item.formSlot"
                        :class="['custom-form-item', item.fieldType == 'dict' && item.componentType == 'unfold' ? 'custom-form-row-item' : '']"
                        :label="item.fieldName"
                        :prop="item.fieldType == 'date' || item.componentType == 'range' ? '' : item.fieldCode"
                        :key="item.id">
                        <template slot="label">
                            <el-tooltip :content="i18nData(item, 'field', 'fieldCode', 'fieldName')" placement="top"
                                :disabled="isShowTooltip">
                                <span @mouseenter="visibleTooltip">{{ i18nData(item, 'field', 'fieldCode',
                                    'fieldName') }}</span>
                            </el-tooltip>
                        </template>
                        <el-select class="select-box" v-if="item.fieldType == 'dict' && !item.componentType"
                            v-model="formData[item.fieldCode]" :multiple="item.isMutiple == '1'" collapse-tags
                            :placeholder="($t(`please_select`) || '请选择') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                            clearable filterable style="width:100%" size="small">
                            <el-option v-for="(item, key) in item.fieldFormatArr" :key="key" :label="item.name"
                                :value="item.code"><span v-html="item.name"></span></el-option>
                        </el-select>
                        <el-checkbox-group v-else-if="item.fieldType == 'dict' && item.componentType == 'unfold'"
                            v-model="dictCheckboxFields[item.fieldCode]" style="width:100%" size="small">
                            <el-checkbox v-for="(item) in item.fieldFormatArr" :key="item.code" :label="item.code"><span
                                    v-html="item.name"></span></el-checkbox>
                        </el-checkbox-group>
                        <el-date-picker v-else-if="item.fieldType && item.fieldType.indexOf('date') != -1"
                            v-model="dateRange[item.fieldCode]" size="small" :format="dateFormat[item.fieldFormat]"
                            :value-format="dateFormat[item.fieldFormat]" :type="dateType[item.fieldFormat]"
                            style="width:100%" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" @blur="handleDatePicker">
                        </el-date-picker>
                        <treeselect v-else-if="item.fieldType == 'tree'" v-model="formData[item.fieldFormat]"
                            :options="treeList[item.fieldFormat]"
                            :placeholder="($t(`please_select`) || '请选择') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                            :normalizer="normalizera" @select="selectTreeselect"></treeselect>
                        <el-input v-else-if="item.fieldType == 'String'" v-model="formData[item.fieldCode]"
                            :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                            clearable size="small" maxlength="50" @keyup.enter.native="handleQuery">
                            <el-button size="small" v-if="item.componentType == 'dialog'" slot="append"
                                icon="el-icon-search" @click="hanldeFieldClick(item)" />
                        </el-input>
                        <InputNumberRange :key="clearKey"
                            v-else-if="item.fieldType == 'Number' && item.componentType == 'range'"
                            v-model="rangeFields[item.fieldCode]">
                        </InputNumberRange>
                        <el-input v-else v-model="formData[item.fieldCode]"
                            :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                            clearable size="small" @keyup.enter.native="handleQuery" />
                        <el-tooltip effect="light" class="form-question-position slotIcon-color"
                            v-if="iconShow(item.options)" placement="top">
                            <div slot="content" class="slotIcon-color-content" v-html="iconShow(item.options)">
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                    </el-form-item>
                    <el-form-item v-else class="custom-form-item" :label="item.fieldName" :prop="item.fieldCode">
                        <template slot="label">
                            <el-tooltip :content="i18nData(item, 'field', 'fieldCode', 'fieldName')" placement="top"
                                :disabled="isShowTooltip">
                                <span @mouseenter="visibleTooltip">{{ i18nData(item, 'field', 'fieldCode',
                                    'fieldName') }}</span>
                            </el-tooltip>
                        </template>
                        <slot :name="item.fieldCode" :data="item" :i18nData="i18nData" :showDrawer="showDrawer"></slot>
                        <el-tooltip effect="light" class="form-question-position slotIcon-color"
                            v-if="iconShow(item.options)" placement="top">
                            <div slot="content" class="slotIcon-color-content" v-html="iconShow(item.options)">
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                    </el-form-item>
                </template>
            </template>
            <slot></slot>
        </div>
        <el-form-item class="search-control">
            <el-button class="search" size="mini" @click="handleQuery" v-show="defaultSearch || !showDefaultSearch">
                <icon-svg icon-class="Line-Search" />搜索
            </el-button>
            <el-button class="reset" size="mini" @click="resetQuery" v-show="defaultSearch || !showDefaultSearch">
                <icon-svg icon-class="Line-Refresh" class="icon-svg-blue" />重置
            </el-button>
            <el-button v-if="!!moreList.length" class="toggleClose" size="mini" @click="handleDrawerToggle">
                <icon-svg icon-class="Left-home" class="icon-svg-blue" />
                {{ '高级搜索' }}
            </el-button>
            <el-button v-else class="toggleClose" size="mini" @click="handleToggle">
                <icon-svg icon-class="Left-list" class="icon-svg-blue" />
                {{ showDefaultSearch ? '展开搜索' : '收起搜索' }}
                <i class="el-icon--right" :class="showDefaultSearch ? 'el-icon-caret-bottom' : 'el-icon-caret-top'"></i>
            </el-button>
        </el-form-item>
        <el-drawer custom-class="form-custom-drawer" append-to-body title="高级搜索" :visible.sync="showDrawer"
            direction="rtl" size="calc(70%)">
            <div class="form-drawer__content" v-if="showDrawer">
                <div class="container form-data-search form-data-drawer" v-for="group in moreList" :key="group.title">
                    <div class="form-drawer-title">{{ group.title }}</div>
                    <div class="form-drawer-item" :style="{ width: group.title == '其它条件' ? '100%' : '' }">
                        <template v-for="item in group.list">
                            <el-form-item v-if="!item.formSlot"
                                :class="['custom-form-item', item.fieldType == 'dict' && item.componentType == 'unfold' ? 'custom-form-row-item' : '']"
                                :label="hideDrawerLabel.includes(item.fieldCode) ? '' : item.fieldName"
                                :prop="item.fieldType == 'date' || item.componentType == 'range' ? '' : item.fieldCode"
                                :key="item.id">
                                <template slot="label">
                                    <el-tooltip v-if="!hideDrawerLabel.includes(item.fieldCode)"
                                        :content="i18nData(item, 'field', 'fieldCode', 'fieldName')" placement="top"
                                        :disabled="isShowTooltip">
                                        <span @mouseenter="visibleTooltip">{{ i18nData(item, 'field', 'fieldCode',
                                            'fieldName') }}</span>
                                    </el-tooltip>
                                </template>
                                <el-select class="select-box" v-if="item.fieldType == 'dict' && !item.componentType"
                                    v-model="formData[item.fieldCode]" :multiple="item.isMutiple == '1'" collapse-tags
                                    :placeholder="($t(`please_select`) || '请选择') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                                    clearable filterable style="width:100%" size="small">
                                    <el-option v-for="(item, key) in item.fieldFormatArr" :key="key" :label="item.name"
                                        :value="item.code"><span v-html="item.name"></span></el-option>
                                </el-select>
                                <el-checkbox-group
                                    v-else-if="item.fieldType == 'dict' && item.componentType == 'unfold'"
                                    v-model="dictCheckboxFields[item.fieldCode]" style="width:100%" size="small">
                                    <el-checkbox v-for="(item) in item.fieldFormatArr" :key="item.code"
                                        :label="item.code"><span v-html="item.name"></span></el-checkbox>
                                </el-checkbox-group>

                                <el-date-picker v-else-if="item.fieldType && item.fieldType.indexOf('date') != -1"
                                    v-model="dateRange[item.fieldCode]" size="small"
                                    :format="dateFormat[item.fieldFormat]" :value-format="dateFormat[item.fieldFormat]"
                                    :type="dateType[item.fieldFormat]" style="width:100%" range-separator="-"
                                    start-placeholder="开始日期" end-placeholder="结束日期" @blur="handleDatePicker">
                                </el-date-picker>
                                <treeselect v-else-if="item.fieldType == 'tree'" v-model="formData[item.fieldFormat]"
                                    :options="treeList[item.fieldFormat]"
                                    :placeholder="($t(`please_select`) || '请选择') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                                    :normalizer="normalizera" @select="selectTreeselect"></treeselect>
                                <el-input v-else-if="item.fieldType == 'String'" v-model="formData[item.fieldCode]"
                                    :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                                    clearable size="small" maxlength="50" @keyup.enter.native="handleQuery">
                                    <el-button size="small" v-if="item.componentType == 'dialog'" slot="append"
                                        icon="el-icon-search" @click="hanldeFieldClick(item)" />
                                </el-input>
                                <InputNumberRange :key="clearKey"
                                    v-else-if="item.fieldType == 'Number' && item.componentType == 'range'"
                                    v-model="rangeFields[item.fieldCode]">
                                </InputNumberRange>
                                <el-input v-else v-model="formData[item.fieldCode]"
                                    :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                                    clearable size="small" @keyup.enter.native="handleQuery" />
                                <el-tooltip effect="light" class="form-question-position slotIcon-color"
                                    v-if="iconShow(item.options)" placement="top">
                                    <div slot="content" class="slotIcon-color-content" v-html="iconShow(item.options)">
                                    </div>
                                    <i class="el-icon-question"></i>
                                </el-tooltip>
                            </el-form-item>
                            <el-form-item v-else class="custom-form-item"
                                :label="hideDrawerLabel.includes(item.fieldCode) ? '' : item.fieldName"
                                :prop="item.fieldCode">
                                <template slot="label">
                                    <el-tooltip v-if="!hideDrawerLabel.includes(item.fieldCode)"
                                        :content="i18nData(item, 'field', 'fieldCode', 'fieldName')" placement="top"
                                        :disabled="isShowTooltip">
                                        <span @mouseenter="visibleTooltip">{{ i18nData(item, 'field', 'fieldCode',
                                            'fieldName') }}</span>
                                    </el-tooltip>
                                </template>
                                <slot :name="item.fieldCode" :data="item" :i18nData="i18nData" :showDrawer="showDrawer">
                                </slot>
                                <el-tooltip effect="light" class="form-question-position slotIcon-color"
                                    v-if="iconShow(item.options)" placement="top">
                                    <div slot="content" class="slotIcon-color-content" v-html="iconShow(item.options)">
                                    </div>
                                    <i class="el-icon-question"></i>
                                </el-tooltip>
                            </el-form-item>
                        </template>
                    </div>
                </div>
            </div>
            <div class="form-drawer__footer">
                <el-button size="small" @click="resetQuery">重 置</el-button>
                <el-button type="primary" size="small" style="margin-left: 30px;" @click="handleQuery">搜 索</el-button>
            </div>
        </el-drawer>
    </el-form>
</template>

<script>
import indexMixin from '../mixins';
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { eventBus } from '../store'
import InputNumberRange from './input-number-range'
import dayjs from 'dayjs';
export default {
    name: "FormData",
    mixins: [indexMixin],
    props: {
        showSearch: {
            type: Boolean,
            default: true
        },
        searchArr: {
            type: Array,
            default: []
        },
        treeList: {
            type: Object,
            default: function () {
                return {}
            }
        },
        formData: {
            type: Object,
            default: function (val) {
                return {}
            }
        },
        hideDrawerLabel: {
            type: Array,
            default: () => {
                return []
            }
        },
        labelWidth: {
            type: String,
            default: '85px'
        }
    },
    components: {
        Treeselect,
        InputNumberRange,
        IconSvg: () => import('../iconComponent')
    },
    data() {
        return {
            showDrawer: false,
            clearKey: '1',
            rangeFields: {},
            dictCheckboxFields: {},
            // 日期范围
            dateRange: {},
            // formData: {},
            showDefaultSearch: false,
            deptIdStr: '',
            menuIdStr: '',
            isShowTooltip: true,
            moreList: [],
            dateFieldFormat: {

            },
            dateType: {
                '{y}-{m}-{d} {h}:{i}:{s}': 'datetimerange',
                '{y}-{m}-{d} {h}:{i}': 'datetimerange',
                '{y}-{m}-{d}': 'daterange',
                '{y}-{m}': 'month',
                '{y}': 'year',
            },
            dateFormat: {
                '{y}-{m}-{d} {h}:{i}:{s}': 'yyyy-MM-dd HH:mm:ss',
                '{y}-{m}-{d} {h}:{i}': 'yyyy-MM-dd HH:mm',
                '{y}-{m}-{d}': 'yyyy-MM-dd',
                '{y}-{m}': 'yyyy-MM',
                '{y}': 'yyyy',
            }
        };
    },
    watch: {
        formData: {
            handler: function (val, oldVal) {
                let page = undefined
                if (val == oldVal) {
                    page = 1
                }
                const keys = Object.keys(this.dateRange)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    if (val[key]) {
                        this.dateRange[key] = val[key]
                    }
                }
                eventBus.$emit('formDataChange', page)
            },
            immediate: true,
            deep: true
        },
    },
    computed: {
        defaultSearch() {
            return this.searchArr.some(item => item.defaultSearch === 1)
        },

        searchObjArr() {
            let defaultSearchArr = [], searchArr = [], lastArr = [];
            this.searchArr.forEach((item) => {
                if (item.fieldType == 'date') {
                    if (!(item.fieldCode in this.dateRange)) {
                        this.dateRange[item.fieldCode] = null
                        this.dateFieldFormat[item.fieldCode] = item.fieldFormat
                    }

                }
                if (item.fieldType == 'Number' && item.componentType == 'range') {
                    this.$set(this.rangeFields, item.fieldCode, null)
                }
                if (item.fieldType == 'dict' && item.componentType == 'unfold') {
                    this.$set(this.dictCheckboxFields, item.fieldCode, [])
                    lastArr.push(item)
                } else {
                    if (item.defaultSearch === 1) {
                        defaultSearchArr.push(item)
                    } else {
                        searchArr.push(item)
                    }
                }

            })
            const sArr = [...defaultSearchArr, ...searchArr, ...lastArr]

            const groupArr = sArr.reduce((acc, item) => {
                const key = item.groupName;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(item);
                return acc;
            }, {})
            const moreList = Object.keys(groupArr).filter(key => !!key).map(key => ({ title: key, list: groupArr[key] }))
            this.moreList = moreList

            //默认搜索根据'查询排列'字段排序
            defaultSearchArr.sort(function(a, b) {
                return a.searchSort - b.searchSort
            })
            return { searchArr: [...searchArr, ...lastArr], defaultSearchArr }
        }
    },
    methods: {
        handleDatePicker(e) {
            this.$nextTick(() => {
                this.dateRange = JSON.parse(JSON.stringify(this.dateRange))
            })
        },
        handleDrawerToggle() {
            this.showDrawer = !this.showDrawer
        },
        handleToggle() {
            this.showDefaultSearch = !this.showDefaultSearch
        },
        hanldeFieldClick(field) {
            this.$emit('fieldClick', field.fieldCode, this.formData[field.fieldCode]);
        },
        iconShow(options) {
            if (options) {
                const text = JSON.parse(options);
                if (!text.placement) {
                    text.placement = []
                }


                if (!text.placement.includes('search')) {
                    return false
                }
                return text.prompt;
            } else {
                return false;
            }
        },
        /** 转换字段数据结构 */
        normalizera(node) {
            if (node.children && !node.children.length) {
                delete node.children
            }
            return {
                id: node.id,
                label: node.deptName || node.menuName,
                children: node.children
            }
        },
        selectTreeselect(val) {
            // if(val.deptName){
            //   this.deptIdStr = val.deptName
            // }
            // if(val.menuName){
            //   this.menuIdStr = val.menuName
            // }
        },
        handleQuery(type) {
            this.showDrawer = false
            let dateRange = this.dateRange;
            for (let key in dateRange) {
                if (dateRange[key]) {
                    const format = this.dateFormat[this.dateFieldFormat[key]].replace(/y/g, 'Y').replace(/d/g, 'D')
                    this.formData[key + 'Start'] = dayjs(dateRange[key][0]).format(format);
                    this.formData[key + 'End'] = dayjs(dateRange[key][1]).format(format);
                } else {
                    this.formData[key + 'Start'] = null;
                    this.formData[key + 'End'] = null;
                }
                delete this.formData[key]
            }
            this.searchArr.forEach(item => {
                if (item.fieldType == 'tree' && this.formData[item.fieldCode]) {
                    if (item.fieldCode == 'deptId') {
                        this.formData[item.fieldCode + 'Str'] = this.deptIdStr
                    } else if (item.fieldCode == 'menuId') {
                        this.formData[item.fieldCode + 'Str'] = this.menuIdStr
                    }
                }
            })
            for (let key in this.rangeFields) {
                if (this.rangeFields[key]) {
                    this.formData[key + 'Start'] = this.rangeFields[key][0];
                    this.formData[key + 'End'] = this.rangeFields[key][1];
                }
            }
            for (let key in this.dictCheckboxFields) {
                if (this.dictCheckboxFields[key].length) {
                    this.formData[key] = this.dictCheckboxFields[key];
                }
            }
            // this.listQuery.pageNum = 1

            this.$emit('handleQuery', this.formData, type);
        },
        resetQueryDateRange(key) {
            let reg2 = new RegExp("Start");
            let a2 = key.replace(reg2, "");
            delete this.dateRange[a2];
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.showDrawer = false
            this.$nextTick(() => {
                for (let key in this.dateRange) {
                    this.dateRange[key] = null;
                    delete this.formData[key]
                }
                for (let key in this.rangeFields) {
                    this.$set(this.rangeFields, key, null)
                    delete this.formData[key + 'Start']
                    delete this.formData[key + 'End']
                }
                for (let key in this.dictCheckboxFields) {
                    this.$set(this.dictCheckboxFields, key, [])
                    delete this.formData[key]
                }
                for (let key in this.formData) {
                    if (!!this.formData[key]) {
                        delete this.formData[key]
                    }
                }
                this.clearKey = `${Date.now()}`
                this.deptIdStr = ''
                this.menuIdStr = ''
                this.$refs['queryForm'].resetFields();
                this.$emit('handleResetField');
                this.handleQuery('queryForm');
            })
        },
        visibleTooltip(e) {
            const event = e || window.event;
            const eventDiv = event.target || event.srcElement;
            this.isShowTooltip = eventDiv.offsetWidth + 18 - eventDiv.parentNode.clientWidth > 0 ? false : true;
        }
    }
};
</script>
<style>
.topFormPopover {
    display: block !important;
    border-radius: 0 0 4px 4px !important;
    left: 0 !important;
    border: none !important;
    top: 115px !important;
    padding: 0 0 0 10px !important;
    box-shadow: 0px 12px 8px -12px rgba(0, 0, 0, 0.12) !important;
    width: 100%;
    z-index: 1000 !important;
    max-height: 40% !important;
    overflow-y: auto !important;

}

.form-data-search .custom-form-item .el-form-item__label {
    white-space: normal !important;
    display: inline-flex;
    align-items: center;
    justify-content: right;
    line-height: 18px !important;
}
</style>
<style lang="scss" scoped>
.form-content-box {
    max-height: 162px;
    overflow-y: auto;
}

.form-content-box-defaultSearch {
    max-height: 108px;
    overflow: hidden;
}

.search,
.reset,
.toggleClose {
    border: 1px solid #1890ff;
}

::v-deep .el-form-item__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

::v-deep .el-form-item__content {
    line-height: 0 !important;
}
</style>
<style>
.custom-form-item {
    position: relative;
}

.custom-form-row-item {
    width: 100% !important;
}

.custom-form-row-item .el-checkbox {
    display: block !important;
    padding: 5px 0;
}

.form-question-position {
    position: absolute;
    right: -18px;
    top: 12px;
    color: #52A2FF;
    font-size: 16px;
}
</style>
<style>
.input-number-range .el-form-item__content {
    line-height: 0 !important;
}

.form-data-drawer {
    padding: 5px 10px;
    box-sizing: border-box;
    box-shadow: none !important;
}

.form-drawer-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 20px;
    padding: 5px 10px;
    box-sizing: border-box;
    color: #999;
}

.form-drawer-item {
    display: inline-block;
    margin-bottom: 10px;
    border-bottom: 1px solid #dcdcdc;
    padding-bottom: 20px;
    width: 100%;
}

.form-custom-drawer .el-drawer__body {
    height: calc(100vh - 50px);
    overflow: hidden;
}

.form-custom-drawer .el-drawer__header {
    height: 50px;
    margin-bottom: 0;
    padding: 10px 20px;
    box-sizing: border-box;
    color: #000;
    font-weight: 600;
}

.form-drawer__content {
    position: relative;
    height: calc(100vh - 100px);
    overflow-y: auto;
}

.form-drawer__footer {
    position: absolute;
    bottom: 0;
    height: 50px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.form-drawer-item .custom-form-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 20px !important;
    width: 100%;
}
</style>