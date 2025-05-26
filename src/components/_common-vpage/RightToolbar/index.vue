<template>
    <div class="container">
        <div class="container-tab">
            <slot name="tab"></slot>
        </div>
        <div class="container-tools">
            <div class="title-left">
                <div class="title-left-a" v-if="!isEmpty()">
                    <span class="search-item" style="background: none;max-width: 56px;padding: 6px 0px;">搜索条件：</span>
                </div>
                <div class="title-left-b" v-if="searchArr && searchArr.length > 0">
                    <template v-for="item in searchArr">
                        <span v-if="item.fieldType && item.fieldType.indexOf('date') != -1" :key="item.fieldCode"
                            class="search-item-warp">
                            <span v-if="formData[item.fieldCode + 'Start'] && formData[item.fieldCode + 'End']"
                                class="search-item-warp">
                                <el-tooltip
                                    :content="`${formData[item.fieldCode + 'Start']}~${formData[item.fieldCode + 'End']}`"
                                    placement="top">
                                    <span class="search-item">{{ item.fieldName }}：{{ formData[item.fieldCode + 'Start']
                                        }}
                                        ~ {{ formData[item.fieldCode + 'End'] }}
                                        <span class="el-icon-close" v-if="!item.clear"
                                            @click="cleanClick([item.fieldCode + 'Start', item.fieldCode + 'End'])"></span>
                                    </span>
                                </el-tooltip>
                            </span>
                        </span>
                        <template v-if="item.fieldType == 'dict'">
                            <span v-if="item.isMutiple == '1'" :key="item.fieldCode" class="search-item-warp">
                                <el-tooltip :content="filterMutliDict(item.fieldFormatArr, formData[item.fieldCode])"
                                    placement="top" v-if="formData[item.fieldCode]">
                                    <span class="search-item">
                                        {{ item.fieldName
                                        }}：{{ filterMutliDict(item.fieldFormatArr, formData[item.fieldCode]) }}
                                        <span v-if="!item.clear" class="el-icon-close"
                                            @click="cleanClick([item.fieldCode])"></span>
                                    </span>
                                </el-tooltip>
                            </span>
                            <span v-else :key="item.fieldCode" class="search-item-warp">
                                <span v-if="formData[item.fieldCode] + ''" class="search-item-warp">
                                    <template v-for="selectItem in item.fieldFormatArr">
                                        <span :key="selectItem.id"
                                            v-if="formData[item.fieldCode] + '' == selectItem.code + ''"
                                            class="search-item-warp">
                                            <el-tooltip :content="selectItem.name" placement="top">
                                                <span class="search-item">{{ item.fieldName }}：{{ selectItem.name }}
                                                    <span class="el-icon-close" v-if="!item.clear"
                                                        @click="cleanClick([item.fieldCode])"></span>
                                                </span>
                                            </el-tooltip>
                                        </span>
                                    </template>
                                </span>
                            </span>
                        </template>
                        <span v-else-if="item.fieldType == 'tree'" :key="item.fieldCode" class="search-item-warp">
                            <span v-if="formData[item.fieldCode] && formData[item.fieldCode + 'Str']"
                                class="search-item-warp">
                                <el-tooltip :content="formData[item.fieldCode + 'Str']" placement="top">
                                    <span class="search-item">{{ item.fieldName }}：{{ formData[item.fieldCode + 'Str']
                                        }}
                                        <span class="el-icon-close" v-if="!item.clear"
                                            @click="cleanClick([item.fieldCode + 'Str'])"></span>
                                    </span>
                                </el-tooltip>
                            </span>
                        </span>
                        <span v-else-if="formData[item.fieldCode]" :key="item.fieldCode" class="search-item-warp">
                            <el-tooltip :content="formData[item.fieldCode]" placement="top">
                                <span class="search-item">{{ item.fieldName }}：{{ formData[item.fieldCode] }}
                                    <span class="el-icon-close" v-if="!item.clear"
                                        @click="cleanClick([item.fieldCode])"></span>
                                </span>
                            </el-tooltip>
                        </span>
                        <span v-else-if="item.slot" :key="item.fieldCode" class="search-item-warp">
                            <span v-for="(val, i) in valObjRightToolbar" :key="i">
                                <el-tooltip :content="val.code" placement="top">
                                    <span class="search-item">{{ val.name }}：{{ val.code }}
                                        <span class="el-icon-close" v-if="!item.clear"
                                            @click="cleanClick([val.type])"></span></span>
                                </el-tooltip>
                            </span>
                        </span>
                    </template>
                </div>
            </div>
            <div class="button-right">
                <el-tooltip class="item" effect="dark" content="刷新" placement="top">
                    <el-button class="svg-icon-button" size="mini" circle @click="refresh()">
                        <icon-svg icon-class="Line-Refresh" />
                    </el-button>
                </el-tooltip>
                <el-tooltip style="margin-left: 7px" class="item" effect="dark" content="列设置" placement="top">
                    <el-button class="svg-icon-button svg-icon-setting" size="mini" circle @click="listClick">
                        <i class="el-icon-setting" style="font-size: 16px;"></i>
                    </el-button>
                </el-tooltip>
                <to-configure ref="toConfigure" :tabConfig="columnsArr" :menuId="menuId"
                    @tabConfigSuccess="tabConfigSuccess" />
            </div>
        </div>

    </div>
</template>
<script>
import draggable from 'vuedraggable'
import toConfigure from './components/toConfigure'
import { IDB } from '@/utils'
export default {
    name: "RightToolbar",
    components: {
        draggable,
        toConfigure
    },
    data() {
        return {
            // 显隐数据
            // value: [],
            // 弹出层标题
            title: "显示/隐藏",
            // 是否显示弹出层
            open: false,
            checkAll: false,
            checkedCities: [],
            isIndeterminate: true,
            columnsArr: [],
            number: false,
            toolTitle: this.$route.meta.title
        };
    },
    props: {
        showSearch: {
            type: Boolean,
            default: true,
        },
        columns: {
            type: Array,
        },
        formData: {
            type: Object
        },
        searchArr: {
            type: Array,
        },
        valObjRightToolbar: {
            type: Object,
        },
        menuId: {
            type: String,
            default: function () {
                return this.$route.meta.id
            }
        },
    },
    watch: {
        'columns': {
            handler: async function (newColumns) {
                const config = await IDB.getObjectStore('tableConfig', this.menuId);
                if (config) {
                    newColumns = config.arr
                }
                this.columnsArr = newColumns;
                let columnsArr = [];
                newColumns.forEach(item => {
                    if (!item.isHides) {
                        columnsArr.push(item.id)
                    }
                });
                this.tabConfigSuccess(newColumns)
                this.checkedCities = columnsArr;
                let checkedCount = columnsArr.length;
                this.checkAll = checkedCount === newColumns.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < newColumns.length;
            }
        },
    },
    created() {
        if (localStorage.getItem('columns_' + this.menuId + '_numberShow')) {
            this.number = JSON.parse(localStorage.getItem('columns_' + this.menuId + '_numberShow'))
            this.$emit('numberChange', this.number);
        }
        // 显隐列初始默认隐藏列
        // for (let item in this.columnsArr) {
        //   if (this.columnsArr[item].visible === false) {
        //     this.value.push(parseInt(item));
        //   }
        // }
    },
    methods: {
        filterMutliDict(fieldArr, fieldCode) {
            let filterRes = []
            fieldArr.map(item => {
                if (fieldCode.indexOf(item.code) != -1) {
                    filterRes.push(item.name)
                }
            })
            return filterRes.join(',')
        },
        handleResetColumn() {
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.columnsArr = data.fields;
                this.number = false;
                this.checkAll = true
                this.checkedCities = data.fields.map((v) => {
                    return v.id
                }) || [];
                this.$emit('handleCheckAllChange', this.columnsArr)
                localStorage.removeItem('columns_' + this.menuId)
                localStorage.removeItem('columns_' + this.menuId + '_numberShow')
            });
        },
        isEmpty() {
            let result = false
            if (Object.keys(this.formData).length != 0) {
                let valuearr = []
                for (let key in this.formData) {
                    valuearr.push(this.formData[key])
                }
                result = valuearr.every(item => {
                    if (!item) {
                        return true
                    }
                })
            } else {
                result = true
            }
            return result
        },
        init(propertyFieldsArr) {
            this.columnsArr = JSON.parse(JSON.stringify(propertyFieldsArr));
        },
        // 搜索
        toggleSearch() {
            this.$emit("update:showSearch", !this.showSearch);
        },
        // 刷新
        refresh() {
            this.$emit("queryTable");
        },
        // 右侧列表元素变化
        // dataChange(data) {
        //   for (let item in this.columnsArr) {
        //     const key = this.columnsArr[item].key;
        //     this.columnsArr[item].visible = !data.includes(key);
        //   }
        // },
        // 打开显隐列dialog
        showColumn() {
            this.open = true;
        },
        async onEnd() {
            // localStorage.setItem('columns_' + this.menuId, JSON.stringify(this.columnsArr));
            this.checkAllChange()
        },
        numberChange(val) {
            localStorage.setItem('columns_' + this.menuId + '_numberShow', JSON.stringify(val));
            this.$emit('numberChange', val);
        },
        handleCheckAllChange(val) {
            this.checkedCities = val ? this.columnsArr.map((v) => {
                return v.id
            }) : [];
            this.isIndeterminate = false;
            this.columnsArr.forEach(item => {
                if (val) {
                    item.isHides = false
                } else {
                    item.isHides = true
                }
            });
            this.$emit('handleCheckAllChange', this.columnsArr);
        },
        async handleCheckedCitiesChange(value) {
            let checkedCount = value.length;
            this.checkAll = checkedCount === this.columnsArr.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.columnsArr.length;
            this.columnsArr.forEach((item) => {
                item.isHides = true
                value.forEach((valueItem) => {
                    if (valueItem == item.id) {
                        item.isHides = false
                    }
                })
            })
            // localStorage.setItem('columns_' + this.menuId, JSON.stringify(this.columnsArr));
            this.checkAllChange()
        },
        async leftFixed(row, index) {
            row.fixed = row.fixed === 'left' ? null : 'left'
            this.$set(this.columnsArr, index, row)
            // const oldItem = this.columnsArr[index];
            // this.columnsArr.splice(index, 1);
            // this.columnsArr.splice(0, 0, oldItem);
            // localStorage.setItem('columns_' + this.menuId, JSON.stringify(this.columnsArr));
            this.checkAllChange()
        },
        async rightFixed(row, index) {
            row.fixed = row.fixed === 'right' ? null : 'right'
            this.$set(this.columnsArr, index, row)
            // const oldItem = this.columnsArr[index];
            // this.columnsArr.splice(index, 1);
            // this.columnsArr.splice(this.columnsArr.length, 0, oldItem);
            // localStorage.setItem('columns_' + this.menuId, JSON.stringify(this.columnsArr));
            this.checkAllChange()
        },
        cleanClick(name) {
            this.$emit('cleanClick', name);
            // for (const key of name) {
            //     this.formData[key] = null;
            // }
            // this.$emit('queryTable', this.formData, name)
        },
        listClick() {
            this.$refs.toConfigure.init();
        },
        async checkAllChange() {
            this.$emit('handleCheckAllChange', this.columnsArr)
            await IDB.setObjectStore('tableConfig', this.menuId, { arr: this.columnsArr })
        },
        tabConfigSuccess(arr) {
            this.columnsArr = [];
            this.$nextTick(() => {
                this.columnsArr = arr;
                this.$emit('handleCheckAllChange', this.columnsArr)
            })
        }
    },
};
</script>
<style lang="scss" scoped>
.container {
    display: flex;
    flex-flow: row nowrap;
    height: auto;
    justify-content: space-between;
    width: 100%;
}

.container-tab {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
}

.container-tools {
    flex: 1;
    display: flex;
    flex-flow: row nowrap;
    height: auto;
    justify-content: space-between;
}

.title-left {
    font-size: 12px;
    color: #161d27;
    padding-left: 14px;
    flex: 1;
    overflow: hidden;
    height: auto;
    display: flex;

    .title-left-a {
        display: inline-flex;
        align-items: center;
    }

    .title-left-b {
        flex: 1;
        width: 0;
        max-height: 48px;
        overflow-y: auto;
        margin-right: 10px;
        padding-top: 6px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }
}

.blue-text {
    color: rgba(61, 138, 255, 1);
}

.search-item {
    position: relative;
    padding: 1px 16px;
    border-radius: 50px;
    background-color: #f7f7f7;
    margin-right: 6px;
    cursor: pointer;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 147px;
    font-size: 11px;

    .el-icon-close {
        position: absolute;
        top: 4px;
        right: 4px;
    }

}

.button-right {
    margin-right: 16px;
}

.svg-icon-font {
    transform: translate(-2px, -3px);
    fill: rgba(24, 31, 65, 1)
}

.svg-icon-button-color {
    .svg-icon-font {
        fill: #3d8aff;
    }
}

.svg-icon-setting {
    display: inline-flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: relative;
    top: -4px;
}

.svg-icon-button {
    margin-top: 13px;
    width: 30px;
    height: 30px;
    margin-bottom: 4px;

    .svg-icon-font {
        font-size: 19px;
    }

    &:hover {
        background-color: #ffffff;
        color: #3d8aff;
    }
}

.dropdown_button_default {
    color: #606266;
}

.dropdown_button {
    ::v-deep i {
        font-weight: 700 !important;
    }
}

::v-deep .el-transfer__button {
    border-radius: 50%;
    padding: 12px;
    display: block;
    margin-left: 0px;
}

::v-deep .el-transfer__button:first-child {
    margin-bottom: 10px;
}

::v-deep .el-divider--horizontal {
    margin: 5px 0;
}
</style>
