<template>
    <Dialog class="dialog" destroy-on-close :close-on-click-modal="false" :visible.sync="isShow"  :append-to-body="true" width="800px">
        <div slot="title">
            <span><svg-icon class="menu-icon" icon-class="Icon-table" /> 列表配置</span>
        </div>
        <div class="dialog-p">
            <p>点击<svg-icon class="menu-icon-12" icon-class="Icon-drag1" />可进行排序，点击<svg-icon class="menu-icon-12" icon-class="Icon-pin" />固定位置</p>
            <p><span @click="showClick" class="cursor_pointer"><svg-icon class="menu-icon-12" icon-class="Icon-show" />全部显示</span><span @click="hideClick" class="cursor_pointer"><svg-icon class="menu-icon-12" icon-class="Icon-hide" />全部隐藏</span></p>
        </div>
        <div class="sso-front-table-container" v-if="isShow">
            <el-table class="table-wrapper table-sortable" ref="elTable" height="100%" :data="tabConfigArr" border fit :show-header="false"
                @selection-change="handleSelectionChange" :highlight-current-row="false" row-key="fieldCode">
                <!-- <el-table-column type="selection" width="55" align="center"></el-table-column> -->
                <el-table-column label="列名称" prop="fieldName" :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <svg-icon class="menu-icon cursor_grab" icon-class="Icon-drag1" />
                        <svg-icon style="margin-left: 5px;" class="menu-icon cursor_pointer" :icon-class="scope.row.fixedColumn?'Icon-pin-a':'Icon-pin'" @click="fixedClick(scope)" />
                        <span style="margin-left: 10px;">{{ scope.row.fieldName }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="260">
                    <template slot-scope="scope">
                        <el-button type="text" @click="fileterClick(scope.row, scope.$index)"><svg-icon :class="['menu-icon', !scope.row.isSearchHeader ? 'disabled-menu' : '']" icon-class="icon-filter-default" /></el-button>
                        <el-button type="text" @click="sortClick(scope.row, scope.$index)"><i :class="['menu-icon el-icon-d-caret', !scope.row.isOrder ? 'disabled-menu' : 'menu-icon-colors']"  style="font-size: 20px;position: relative;top: -2px" /></el-button>

                        <el-button type="text" @click="downClick(scope.row, scope.$index)" :disabled="getFormLength(scope.$index)"><svg-icon class="menu-icon" icon-class="Icon-arrow-down" /></el-button>
                        <el-button type="text" @click="upwardClick(scope.row, scope.$index)" :disabled="scope.$index === 0"><svg-icon class="menu-icon" icon-class="Icon-arrow-up" /></el-button>
                        <el-button type="text" style="margin: 0 24px; font-size: 12px">
                            <el-switch class="switch-12" v-model="scope.row.isHides" :active-value="false" :inactive-value="true" active-color="#4998ff" inactive-color="#c5d1d8" :active-text="!scope.row.isHides?'显示':'隐藏'"></el-switch>
                        </el-button>
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
    import { IDB } from '@/utils'
	export default {
		name: 'toConfigure',
        props: {
			tabConfig: {
				type: Array,
				default: null
			},
			menuId: {
				type: String,
			}
        },
        data () {
            return {
                isShow: false,
                selectionData: null,
                tabConfigArr: []
            }
        },
        mounted () {
            const _this = this;
            document.body.ondrop = function (e) {
                const event = e || window.event;
                _this.stopEvent(event);
            }
        },
		methods: {
            async init () {
                this.isShow = true;
                const getJSONData = await IDB.getObjectStore('tableConfig',this.menuId);
                this.tabConfigArr = getJSONData?getJSONData.arr:JSON.parse(JSON.stringify(this.tabConfig.filter((item) => item.isHide == 0 && Object.assign(item, {isHides: false}))));
                this.$nextTick(() => {
                    this.tabConfigArr.forEach( row => {
                        if(!row.isHides){
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
            handleSelectionChange (val) {
                this.selectionData = val;
            },
            rowDrop () {
                const tbody = document.querySelector('.table-sortable tbody');
                const _this = this;
                Sortable.create(tbody, {
                    onEnd ({newIndex, oldIndex}) {
                        const currRow = _this.tabConfigArr.splice(oldIndex, 1)[0];
                        _this.tabConfigArr.splice(newIndex, 0, currRow);
                    }
                })
            },
            getFormLength (index) {
                if (index === this.tabConfigArr.length - 1) return true;
                else return false;
            },
            upwardClick (row, index) {
                this.tabConfigArr.splice(index - 1, 0, row);
                this.tabConfigArr.splice(index + 1, 1);
            },
            downClick (row, index) {
                this.tabConfigArr.splice(index + 2, 0, row);
                this.tabConfigArr.splice(index, 1);
            },
            fileterClick (row, index) {
                this.$set(this.tabConfigArr, index, {...row, isSearchHeader: row.isSearchHeader^1})
            },
            sortClick (row, index) {
                this.$set(this.tabConfigArr, index, {...row, isOrder: row.isOrder^1})
            },
            fixedClick (scope) {
                this.$set(this.tabConfigArr, scope.$index, Object.assign({}, scope.row, {fixedColumn:  scope.row.fixedColumn?null:'left'}));
            },
            showClick () {
                this.tabConfigArr.forEach( item => {
                    item.isHides = false;
                })
            },
            hideClick () {
                this.tabConfigArr.forEach( item => {
                    item.isHides = true;
                })
            },
            async determineClick () {
                // this.$cache.local.setJSON('columns_' + this.menuId, this.tabConfigArr);
                this.isShow = false;
                this.$emit('tabConfigSuccess', this.tabConfigArr);
                await IDB.setObjectStore('tableConfig',this.menuId, {arr: this.tabConfigArr})
            },
            handleResetColumn(){
                this.$store.dispatch('menuProperty', this.menuId).then(async (data) => {
                    this.tabConfigArr = JSON.parse(JSON.stringify(data.fields.filter((item) => item.isHide == 0 && Object.assign(item, {isHides: false}))));
                    this.$nextTick(() => {
                        this.tabConfigArr.forEach( row => {
                            if(!row.isHides){
                                this.$refs.elTable && this.$refs.elTable.toggleRowSelection(row, true);
                            }
                        })
                    })
                    this.$emit('tabConfigSuccess', this.tabConfigArr);
                    await IDB.setObjectStore('tableConfig',this.menuId, {arr: this.tabConfigArr})
                    // this.$cache.local.remove('columns_' + this.menuId);
                });
            },
		}
	}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body{
    padding: 5px 10px;
}
::v-deep .el-dialog__header{
    padding: 14px;
}
::v-deep .el-dialog{
    border-radius: 10px;
}
.disabled-menu {
    color: #c0c4cc !important;
}
.menu-icon-colors {
    color: #777 !important;
}
.dialog{
    .el-dialog{
        .dialog-p{
            padding: 0 26px;
            display: flex;
            justify-content: space-between;
            p{
                font-size: 12px;
                margin: 0;
                span:nth-child(2){
                    padding: 0 25px;
                }
            }
        }
        .menu-icon{
            font-size: 24px;
            vertical-align: -0.25em;
        }
        .menu-icon-12{
            font-size: 24px;
            vertical-align: -0.3em;
        }
        .switch-12{
            ::v-deep .el-switch__label.is-active{
                color: #2a2e33 !important;
            }
            ::v-deep .el-switch__label *{
                font-size: 12px !important;
            }
        }
        .cursor_grab{
            cursor: grab;
        }
        .cursor_pointer{
            cursor: pointer;
        }
        .menu-icon-color{
            color: #0e87ff !important;
        }
        .sso-front-table-container{
            height: 350px !important;
            border: none;
            margin: 0;
            margin-top: 10px;
            display: flex;
            flex-direction: column;
        }
        .dialog-button{
            .el-button{
                padding: 9px 45px;
                border-radius: 20px;
                &:nth-child(1){
                    float: left;
                    color: #2a2e33;
                    border-color: #dcdfe6;
                }
                &:nth-child(3){
                    color: #2a2e33;
                    border-color: #dcdfe6;
                }
            }
        }
        .table-wrapper{
            border-left: 0px;
            border-right: 0px;
            .el-button{
                line-height: 20px;
                color: #606266;
                padding: 0;
            }
        }
    }
}
</style>