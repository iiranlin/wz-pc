<template>
    <Dialog class="dialog" destroy-on-close :close-on-click-modal="false" :visible.sync="isShow" :append-to-body="true"
        width="800px">
        <div slot="title">
            <span><span style="font-size: 20px;"><svg-icon class="menu-icon" icon-class="Icon-table" /></span>
                列表配置</span>
        </div>
        <div class="dialog-p">
            <p>点击<span style="font-size: 20px;"><svg-icon class="menu-icon-12"
                        icon-class="Icon-drag1" /></span>可进行排序，点击<span style="font-size: 20px;"><svg-icon
                        class="menu-icon-12" icon-class="Icon-pin" /></span>固定位置</p>
            <p>
                <span @click="showClick" class="cursor_pointer">
                    <span style="font-size: 20px;">
                        <svg-icon class="menu-icon-12" icon-class="Icon-show" /></span>
                    全部显示</span><span @click="hideClick" class="cursor_pointer"><span style="font-size: 20px;"><svg-icon
                            class="menu-icon-12" icon-class="Icon-hide" /></span>全部隐藏</span>
            </p>
        </div>
        <div class="sso-front-table-container" v-if="isShow">
            <el-table :indent="0" class="table-wrapper table-sortable" ref="elTable" height="100%" :data="tabConfigArr"
                border fit :show-header="false" @selection-change="handleSelectionChange" :highlight-current-row="false"
                row-key="id" :tree-props="{ children: 'children' }">
                <el-table-column label="列名称" prop="fieldName" :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <div v-if="!scope.row.children.length" style="display: inline-block;width: 20px;"></div>
                        <span v-if="!scope.row.parentFieldCode" style="font-size: 20px;">
                            <svg-icon class="menu-icon cursor_grab" icon-class="Icon-drag1" />
                        </span>
                        <span style="font-size: 20px;">
                            <svg-icon v-if="!scope.row.parentFieldCode" style="margin-left: 5px;"
                                class="menu-icon cursor_pointer"
                                :icon-class="scope.row.fixedColumn ? 'Icon-pin-a' : 'Icon-pin'"
                                @click="fixedClick(scope)" />
                        </span>
                        <span style="margin-left: 10px;">{{ scope.row.fieldName }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="260">
                    <template slot-scope="scope">
                        <div class="frac">
                            <el-button v-if="!scope.row.children.length" type="text"
                                @click="fileterClick(scope.row, scope.$index)"
                                :style="{ fontSize: '20px', color: scope.row.isSearchHeader ? '#1890ff' : '#777' }">
                                <svg-icon
                                    :class="['menu-icon', !scope.row.isSearchHeader ? 'disabled-menu' : 'menu-icon-colors']"
                                    icon-class="icon-filter-default" />
                            </el-button>
                            <el-button v-if="!scope.row.children.length" type="text"
                                @click="sortClick(scope.row, scope.$index)">
                                <i :class="['menu-icon el-icon-d-caret', !scope.row.isOrder ? 'disabled-menu' : 'menu-icon-colors']"
                                    style="font-size: 20px;position: relative;top: -3px" />
                            </el-button>
                            <el-button type="text" @click="downClick(scope.row, scope.$index)"
                                :disabled="getFormDownLength(scope.row)" style="font-size: 20px;">
                                <svg-icon class="menu-icon" icon-class="Icon-arrow-down" />
                            </el-button>
                            <el-button type="text" @click="upwardClick(scope.row, scope.$index)"
                                :disabled="getFormUpLength(scope.row)" style="font-size: 20px;">
                                <svg-icon class="menu-icon" icon-class="Icon-arrow-up" />
                            </el-button>
                            <el-button type="text" style="margin: 0 24px; font-size: 12px">
                                <el-switch class="switch-12" v-model="scope.row.isHides" :active-value="false"
                                    :inactive-value="true" active-color="#4998ff" inactive-color="#c5d1d8"
                                    :active-text="!scope.row.isHides ? '显示' : '隐藏'"></el-switch>
                            </el-button>
                        </div>

                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div slot="footer" class="dialog-button">
            <el-button @click="handleResetColumn">重置</el-button>
            <el-button type="primary" @click="determineClick">确定</el-button>
            <el-button @click="isShow = false">取消</el-button>
        </div>
    </Dialog>
</template>

<script>
import Sortable from 'sortablejs';
export default {
    name: 'toConfigure',
    components: {
        IconSvg: () => import('../../iconComponent')
    },
    props: {
        tabConfig: {
            type: Array,
            default: null
        },
        menuId: {
            type: String,
        }
    },
    data() {
        return {
            isShow: false,
            selectionData: null,
            tabConfigArr: []
        }
    },
    mounted() {
        const _this = this;
        document.body.ondrop = function (e) {
            const event = e || window.event;
            _this.stopEvent(event);
        }
    },
    methods: {
        async init() {
            this.isShow = true;
            const getJSONData = await this.$IDB.getObjectStore('tableConfig', this.menuId);
            this.tabConfigArr = getJSONData ? getJSONData.arr : JSON.parse(JSON.stringify(this.tabConfig.filter((item) => item.isHide == 0 && Object.assign(item, { isHides: false }))));
            this.$nextTick(() => {
                this.tabConfigArr.forEach(row => {
                    if (!row.isHides) {
                        this.$refs.elTable && this.$refs.elTable.toggleRowSelection(row, true);
                    }
                })
                this.rowDrop();
            })
        },
        // 阻止默认事件
        stopEvent(event) {
            if (event.stopPropagation) {
                // 标准浏览器
                event.stopPropagation(); // 阻止事件冒泡
                event.preventDefault(); // 阻止默认事件
            } else {
                // IE浏览器
                event.cancelBubble = true;
                event.returnValue = false;
            }
        },
        handleSelectionChange(val) {
            this.selectionData = val;
        },
        isChildRow(row) {
            // 遍历 tableData，检查当前行是否属于某个父节点的 children
            const findParent = (data) => {
                for (const item of data) {
                    if (item.children && item.children.includes(row)) {
                        return true; // 是 children 中的行
                    }
                    if (item.children && findParent(item.children)) {
                        return true;
                    }
                }
                return false;
            };

            return findParent(this.tabConfigArr);
        },



        rowDrop() {
            const tbody = document.querySelector('.table-sortable tbody');
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                const rowData = this.flattenTableData(this.tabConfigArr)[index]; // 获取扁平化后的行数据
                row.setAttribute('data-key', rowData.id); // 绑定 data-key
            });
            const _this = this;
            Sortable.create(tbody, {
                onEnd(evt) {
                    const { newIndex, oldIndex, item } = evt
                    const draggedRowKey = item.getAttribute('data-key');
                    const draggedRowData = _this.findRowDataByKey(_this.tabConfigArr, draggedRowKey);
                    const currentLevelData = _this.getCurrentLevelData(_this.tabConfigArr, draggedRowKey)
                    const draggedRowIndex = currentLevelData.findIndex(row => row.id === draggedRowKey);
                    if (!draggedRowData.parentFieldCode && currentLevelData) {
                        const arr = _this.tabConfigArr.splice(draggedRowIndex, 1)
                        const currRow = arr[0];
                        currRow && _this.tabConfigArr.splice(newIndex, 0, currRow);
                    }

                },
                onMove(evt) {
                    const { newIndex, oldIndex, dragged } = evt
                    const draggedRowKey = dragged.getAttribute('data-key');
                    const draggedRowData = _this.findRowDataByKey(_this.tabConfigArr, draggedRowKey);
                    return !draggedRowData.parentFieldCode
                }
            })
        },
        getCurrentLevelData(data, key) {
            for (const row of data) {
                if (row.id === key) {
                    return data; // 如果当前行匹配，返回当前层级数据
                }
                if (row.children && row.children.length > 0) {
                    const result = this.getCurrentLevelData(row.children, key);
                    if (result) {
                        return result; // 如果找到匹配的子层级，返回子层级数据
                    }
                }
            }
            return null; // 如果没有找到，返回 null
        },
        findRowDataByKey(data, key) {
            for (const row of data) {
                if (row.id === key) { // 假设 data-key 是 id
                    return row;
                }
                if (row.children && row.children.length > 0) {
                    const result = this.findRowDataByKey(row.children, key);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        },
        flattenTableData(data) {
            const result = [];
            const flatten = (arr) => {
                arr.forEach((item) => {
                    result.push(item);
                    if (item.children && item.children.length > 0) {
                        flatten(item.children);
                    }
                });
            };
            flatten(data);
            return result;
        },
        getFormDownLength(row) {
            const rowKey = row.id
            const currentLevelData = this.getCurrentLevelData(this.tabConfigArr, rowKey);
            const index = currentLevelData.findIndex(item => item.id == rowKey)
            if (index === currentLevelData.length - 1) {
                return true;
            } else {
                return false
            }   
        },
        getFormUpLength(row) {
            const rowKey = row.id
            const currentLevelData = this.getCurrentLevelData(this.tabConfigArr, rowKey);
            const index = currentLevelData.findIndex(item => item.id == rowKey)
            if (index === 0) {
                return true;
            } else {
                return false
            }   
        },
        upwardClick(row, index) {
            if (!!row.parentFieldCode) {
                const indx = this.tabConfigArr.findIndex(item => item.fieldCode == row.parentFieldCode)
                const idx = this.tabConfigArr[indx].children.findIndex(item => item.id == row.id)
                this.tabConfigArr[indx].children.splice(idx - 1, 0, row)
                this.tabConfigArr[indx].children.splice(idx + 1, 1);
            } else {
                const idx = this.tabConfigArr.findIndex(item => item.id == row.id)
                this.tabConfigArr.splice(idx - 1, 0, row);
                this.tabConfigArr.splice(idx + 1, 1);
            }

        },
        downClick(row, index) {
            if (!!row.parentFieldCode) {
                const indx = this.tabConfigArr.findIndex(item => item.fieldCode == row.parentFieldCode)
                const idx = this.tabConfigArr[indx].children.findIndex(item => item.id == row.id)
                this.tabConfigArr[indx].children.splice(idx + 2, 0, row)
                this.tabConfigArr[indx].children.splice(idx, 1);
            } else {
                const idx = this.tabConfigArr.findIndex(item => item.id == row.id)
                this.tabConfigArr.splice(idx + 2, 0, row);
                this.tabConfigArr.splice(idx, 1);
            }

        },
        fileterClick(row, index) {
            if (!!row.parentFieldCode) {
                const indx = this.tabConfigArr.findIndex(item => item.fieldCode == row.parentFieldCode)
                const rowObj = this.tabConfigArr[indx]
                for (let i = 0; i < rowObj.children.length; i++) {
                    if (rowObj.children[i]['id'] == row.id) {
                        rowObj.children[i]['isSearchHeader'] = rowObj.children[i]['isSearchHeader'] ^ 1
                        break
                    }
                }
                this.$set(this.tabConfigArr, indx, { ...rowObj })
            } else {
                this.$set(this.tabConfigArr, index, { ...row, isSearchHeader: row.isSearchHeader ^ 1 })
            }
        },
        sortClick(row, index) {
            if (!!row.parentFieldCode) {
                const indx = this.tabConfigArr.findIndex(item => item.fieldCode == row.parentFieldCode)
                const rowObj = this.tabConfigArr[indx]
                for (let i = 0; i < rowObj.children.length; i++) {
                    if (rowObj.children[i]['id'] == row.id) {
                        rowObj.children[i]['isOrder'] = rowObj.children[i]['isOrder'] ^ 1
                        break
                    }
                }
                this.$set(this.tabConfigArr, indx, { ...rowObj })
            } else {
                this.$set(this.tabConfigArr, index, { ...row, isOrder: row.isOrder ^ 1 })
            }
        },
        fixedClick(scope) {
            this.$set(this.tabConfigArr, scope.$index, Object.assign({}, scope.row, { fixedColumn: scope.row.fixedColumn ? null : 'left' }));
        },
        showClick() {
            this.tabConfigArr.forEach(item => {
                item.isHides = false;
            })
        },
        hideClick() {
            this.tabConfigArr.forEach(item => {
                item.isHides = true;
            })
        },
        async determineClick() {
            // this.$cache.local.setJSON('columns_' + this.menuId, this.tabConfigArr);
            this.isShow = false;
            this.$emit('tabConfigSuccess', this.tabConfigArr);
            await this.$IDB.setObjectStore('tableConfig', this.menuId, { arr: this.tabConfigArr })
        },
        handleResetColumn() {
            this.$store.dispatch('menuProperty', this.menuId).then(async (data) => {
                this.tabConfigArr = JSON.parse(JSON.stringify(data.fields.filter((item) => item.isHide == 0 && Object.assign(item, { isHides: false }))));
                this.$nextTick(() => {
                    this.tabConfigArr.forEach(row => {
                        if (!row.isHides) {
                            this.$refs.elTable && this.$refs.elTable.toggleRowSelection(row, true);
                        }
                    })
                })
                this.$emit('tabConfigSuccess', this.tabConfigArr);
                // this.$cache.local.remove('columns_' + this.menuId);
                await this.$IDB.setObjectStore('tableConfig', this.menuId, { arr: this.tabConfigArr })
            });
        },
    }
}
</script>
<style lang="scss" scoped>
.frac {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

::v-deep .el-dialog__body {
    padding: 5px 10px;
}

::v-deep .el-dialog__header {
    padding: 14px;
}

::v-deep .el-dialog {
    border-radius: 10px;
}

.disabled-menu {
    color: #777 !important;
}

.menu-icon-colors {
    color: #1890ff !important;
}

.dialog {
    .el-dialog {
        .dialog-p {
            padding: 0 26px;
            display: flex;
            justify-content: space-between;

            p {
                font-size: 12px;
                margin: 0;

                span:nth-child(2) {
                    padding: 0 25px;
                }
            }
        }

        .menu-icon {
            font-size: 24px;
            vertical-align: -0.25em;
        }

        .menu-icon-12 {
            font-size: 24px;
            vertical-align: -0.3em;
        }

        .switch-12 {
            ::v-deep .el-switch__label.is-active {
                color: #2a2e33 !important;
            }

            ::v-deep .el-switch__label * {
                font-size: 12px !important;
            }
        }

        .cursor_grab {
            cursor: grab;
        }

        .cursor_pointer {
            cursor: pointer;
        }

        .menu-icon-color {
            color: #0e87ff !important;
        }

        .sso-front-table-container {
            height: 350px !important;
            border: none;
            margin: 0;
            margin-top: 10px;
            display: flex;
            flex-direction: column;
        }

        .dialog-button {
            .el-button {
                padding: 9px 45px;
                border-radius: 20px;

                &:nth-child(1) {
                    float: left;
                    color: #2a2e33;
                    border-color: #dcdfe6;
                }

                &:nth-child(3) {
                    color: #2a2e33;
                    border-color: #dcdfe6;
                }
            }
        }

        .table-wrapper {
            border-left: 0px;
            border-right: 0px;

            .el-button {
                line-height: 20px;
                color: #606266;
                padding: 0;
            }
        }
    }
}
</style>