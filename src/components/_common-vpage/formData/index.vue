<template>
    <el-form v-if="searchArr.length != 0" class="container form-data-search" ref="queryForm" :model="formData"
        :inline="true" @submit.native.prevent v-show="showSearch" label-width="85px">
        <div class="form-content-box" :class="{ 'form-content-box-defaultSearch': defaultSearch && showDefaultSearch }"
            v-show="!showDefaultSearch || defaultSearch">
            <template v-for="item in searchObjArr.defaultSearchArr">
                <el-form-item v-if="!item.formSlot" class="custom-form-item" :label="item.fieldName"
                    :prop="item.fieldType == 'date' ? '' : item.fieldCode" :key="item.id">
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
                        clearable style="width:100%" size="small">
                        <el-option v-for="(item, key)  in item.fieldFormatArr" :key="key" :label="item.name"
                            :value="item.code" />
                    </el-select>
                    <el-date-picker v-else-if="item.fieldType && item.fieldType.indexOf('date') != -1"
                        v-model="dateRange[item.fieldCode]" size="small" value-format="yyyy-MM-dd" type="daterange"
                        style="width:100%" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
                    </el-date-picker>
                    <treeselect v-else-if="item.fieldType == 'tree'" v-model="formData[item.fieldFormat]"
                        :options="treeList[item.fieldFormat]"
                        :placeholder="($t(`please_select`) || '请选择') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                        :normalizer="normalizera" @select="selectTreeselect"></treeselect>
                    <el-input v-else-if="item.fieldType == 'String'" v-model="formData[item.fieldCode]"
                        :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                        clearable size="small" maxlength="50" @keyup.enter.native="handleQuery" />
                    <el-input v-else v-model="formData[item.fieldCode]"
                        :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                        clearable size="small" @keyup.enter.native="handleQuery" />
                    <el-tooltip effect="light" class="form-question-position slotIcon-color"
                        v-if="iconShow(item.options)" placement="top">
                        <div slot="content" class="slotIcon-color-content">
                            {{ iconShow(item.options) }}
                        </div>
                        <i class="el-icon-question"></i>
                    </el-tooltip>
                </el-form-item>
                <slot v-else :name="item.fieldCode" :data="item"></slot>
            </template>
            <template v-if="!showDefaultSearch">
                <template v-for="item in searchObjArr.searchArr">
                    <el-form-item v-if="!item.formSlot" class="custom-form-item" :label="item.fieldName"
                        :prop="item.fieldType == 'date' ? '' : item.fieldCode" :key="item.id">
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
                            clearable style="width:100%" size="small">
                            <el-option v-for="(item, key)  in item.fieldFormatArr" :key="key" :label="item.name"
                                :value="item.code" />
                        </el-select>
                        <el-date-picker v-else-if="item.fieldType && item.fieldType.indexOf('date') != -1"
                            v-model="dateRange[item.fieldCode]" size="small" value-format="yyyy-MM-dd" type="daterange"
                            style="width:100%" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
                        </el-date-picker>
                        <treeselect v-else-if="item.fieldType == 'tree'" v-model="formData[item.fieldFormat]"
                            :options="treeList[item.fieldFormat]"
                            :placeholder="($t(`please_select`) || '请选择') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                            :normalizer="normalizera" @select="selectTreeselect"></treeselect>
                        <el-input v-else-if="item.fieldType == 'String'" v-model="formData[item.fieldCode]"
                            :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                            clearable size="small" maxlength="50" @keyup.enter.native="handleQuery" />
                        <el-input v-else v-model="formData[item.fieldCode]"
                            :placeholder="($t(`please_enter`) || '请输入') + i18nData(item, 'field', 'fieldCode', 'fieldName')"
                            clearable size="small" @keyup.enter.native="handleQuery" />
                        <el-tooltip effect="light" class="form-question-position slotIcon-color"
                            v-if="iconShow(item.options)" placement="top">
                            <div slot="content" class="slotIcon-color-content">
                                {{ iconShow(item.options) }}
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                    </el-form-item>
                    <slot v-else :name="item.fieldCode" :data="item"></slot>
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
            <el-button class="toggleClose" size="mini" @click="showDefaultSearch = !showDefaultSearch">
                <icon-svg icon-class="Left-list" class="icon-svg-blue" />
                {{ showDefaultSearch ? '展开搜索' : '收起搜索' }}
                <i class="el-icon--right" :class="showDefaultSearch ? 'el-icon-caret-bottom' : 'el-icon-caret-top'"></i>
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script>
import indexMixin from '@/views/mixins';
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { eventBus } from '@/store'
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
        }
    },
    components: { Treeselect },
    data() {
        return {
            // 日期范围
            dateRange: {},
            // formData: {},
            showDefaultSearch: true,
            deptIdStr: '',
            menuIdStr: '',
            isShowTooltip: true
        };
    },
    watch: {
        formData: {
            handler: function (val, oldVal) {
                let page = undefined
                if (val == oldVal) {
                    page = 1
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
            let defaultSearchArr = [], searchArr = [];
            this.searchArr.forEach((item) => {
                if (item.defaultSearch === 1) {
                    defaultSearchArr.push(item)
                } else {
                    searchArr.push(item)
                }
            })
            return { searchArr, defaultSearchArr }
        }
    },
    methods: {
        iconShow(options) {
            if (options) {
                const text = JSON.parse(options);
                if(!text.placement) {
                    text.placement = []
                }

                
                if(!text.placement.includes('search')) {
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
            let dateRange = this.dateRange;
            for (let key in dateRange) {
                if (dateRange[key]) {
                    this.formData[key + 'Start'] = dateRange[key][0];
                    this.formData[key + 'End'] = dateRange[key][1];
                } else {
                    this.formData[key + 'Start'] = null;
                    this.formData[key + 'End'] = null;
                }
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
            this.$nextTick(() => {
                for (let key in this.dateRange) {
                    this.dateRange[key] = null;
                }
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
</style>
<style>
.custom-form-item {
    position: relative;
}

.form-question-position {
    position: absolute;
    right: -18px;
    top: 12px;
    color: #52A2FF;
    font-size: 16px;
}
</style>