<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <div class="attachmentTableTop" v-if="queryType !== 'view' && tableType == '1'">
            <button-top :showDropdown="false" :buttonTopData="buttonTop" :buttonShow="handleButtonShow"
                @newButton="handleNewButton" style="margin-top: 0;padding: 3px 0 0 0 !important;"></button-top>
        </div>
        <el-table class="saleOrderOperateEltable table-sortable" v-loading="loading" ref="tableRef" @selection-change="(data) => selectData = data"
            :data="tableData.detailsList" border row-key="processCode" max-height="300px" style="width: 100%">
            <el-table-column fixed="left" align="center" key="selectable" type="selection" width="50" v-if="queryType == 'create' || queryType == 'update'" />
            <!-- <el-table-column align="center" label="序号" key="index" type="index" width="50" /> -->
            <el-table-column align="center" label="工序排序" prop="processSort" show-overflow-tooltip min-width="150">
                <template slot-scope="scope">
                    <span class="sortHandle">{{ scope.row.processSort = scope.$index + 1 }}
                        <i class="el-icon-rank"></i>
                    </span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="工序编码" prop="processCode" show-overflow-tooltip min-width="220"></el-table-column>
            <el-table-column align="left" label="工序名称" prop="processName" show-overflow-tooltip min-width="220"></el-table-column>
            <el-table-column align="left" label="工序描述" prop="processDesc" show-overflow-tooltip min-width="220"></el-table-column>
            <el-table-column align="left" label="技术要求" prop="techRequire" show-overflow-tooltip min-width="220"></el-table-column>
            <el-table-column align="center" label="工序类型" prop="processType" show-overflow-tooltip min-width="150">
                <template slot="header">
                    <span><span class="slotIcon-color-content">*</span>工序类型</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.processType'" :rules="tableData.rules.processType">
                        <el-select v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.processType">
                            <el-option v-for="item in dict.type.processType" :label="item.label" :value="item.value" :key="item.value"></el-option>
                        </el-select>
                        <span v-else>{{ scope.row.processType | orderTypeFilter(dict.type.processType) }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="right" label="计划加工数量" prop="machiningNum" show-overflow-tooltip min-width="150">
                <template slot="header">
                    <span><span class="slotIcon-color-content">*</span>计划加工数量</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.machiningNum'" :rules="tableData.rules.machiningNum">
                        <el-input-number v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.machiningNum" :min="1"  controls-position="right" style="width: 100px"></el-input-number>
                        <span v-else>{{ scope.row.machiningNum }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="工序开工时间" prop="processStartDate" show-overflow-tooltip min-width="180">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.processStartDate'" :rules="tableData.rules.processStartDate">
                        <el-date-picker v-if="queryType == 'create' || queryType == 'update'" style="width: 140px" v-model="scope.row.processStartDate" type="date" format="yyyy-MM-dd" value-format="timestamp" :picker-options="startPicker(scope.$index)"></el-date-picker>
                        <span v-else>{{ parseTime(scope.row.processStartDate, '{y}-{m}-{d}') }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="工序完工时间" prop="processEndDate" show-overflow-tooltip min-width="180">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.processEndDate'" :rules="tableData.rules.processEndDate">
                        <el-date-picker v-if="queryType == 'create' || queryType == 'update'" style="width: 140px" v-model="scope.row.processEndDate" type="date" format="yyyy-MM-dd" value-format="timestamp" :picker-options="endPicker(scope.$index)"></el-date-picker>
                        <span v-else>{{ parseTime(scope.row.processEndDate, '{y}-{m}-{d}') }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="left" label="班组" prop="teamsGroupsName" show-overflow-tooltip min-width="150">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.teamsGroupsName'" :rules="tableData.rules.teamsGroupsName">
                        <!-- <el-select v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.teamsGroupsId">
                            <el-option v-for="item in dict.type.teamsGroupsId" :label="item.label" :value="item.value" :key="item.value"></el-option>
                        </el-select> -->
                        <el-input v-if="queryType == 'create' || queryType == 'update'" clearable v-model="scope.row.teamsGroupsName"></el-input>
                        <span v-else>{{ scope.row.teamsGroupsName }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="left" label="人员" prop="userId" show-overflow-tooltip min-width="150">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.userId'" :rules="tableData.rules.userId">
                        <el-select v-if="queryType == 'create' || queryType == 'update'" filterable clearable v-model="scope.row.userId" @change="userChange(scope)">
                            <el-option v-for="item in scope.row.userData" :label="item.nickName" :value="item.id" :key="item.id"></el-option>
                        </el-select>
                        <span v-else>{{ scope.row.userName }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="right" label="标准工时（小时）" prop="processStdTime" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="center" label="工序二维码" show-overflow-tooltip min-width="150">
                <template slot-scope="scope">
                    <QrCodeComponent :text="scope.row.processCode" width="30" height="30"></QrCodeComponent>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="100" v-if="queryType == 'create' || (queryType == 'update' && tableType == '1')">
                <template slot-scope="scope">
                    <el-button type="text" @click="removeData(scope.row, scope.$index)">删行</el-button>
                </template>
            </el-table-column>
        </el-table>
        <choice-procedure ref="choiceProcedure" @change="handleConfirmProcedure" />
    </el-form>
</template>

<script>
import indexMixin from '@/views/mixins'
import { userListAll } from '@/api/system/user'
import choiceProcedure from '@/views/components/choice-procedure'
import Sortable from 'sortablejs';
import QrCodeComponent from '@/components/qrCodeComponent'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
    mixins: [indexMixin],
    dicts: ['processType'],
    components: { choiceProcedure, QrCodeComponent, Treeselect },
    props: {
        queryType: {
            type: String,
            default: ''
        },
        tableType: {
            type: String,
            default: '1'
        },
        deptData: {
            type: Array,
            default: []
        },
    },
    mixins: [indexMixin],
    data() {
        return {
            loading: false,
            buttonTop: [
                { buttonName: '选择工序', buttonCode: 'addProcess' },
                { buttonName: '删除', buttonCode: 'delete' },
            ],
            tableData:{
                detailsList: [],
                rules: {
                    processType: [{ required: true, message: '请选择工序类型', trigger: ['blur', 'change'] }],
                    machiningNum: [{ required: true, message: '请输入计划加工数量', trigger: ['blur', 'change'] }],
                }
            },
            selectData: [],
            workshopId: '',
        }
    },
    computed: {
        startPicker () {
            return function(index){
                let endTimestamp = new Date(this.tableData.detailsList[index].processEndDate)
                if(this.tableData.detailsList[index].processEndDate) {
                    return {
                        disabledDate (time) {
                            const timestamp = time.getTime()
                            // 结束时间不小于开始时间
                            if (timestamp <= endTimestamp) {
                                return false
                            } else {
                                return timestamp > endTimestamp
                            }
                        }
                    }
                } else {
                    return {
                        disabledDate (time) {
                            return false
                        },
                    }
                }
            }
        },
        endPicker () {
            return function(index){
                let startTimestamp = new Date(this.tableData.detailsList[index].processStartDate)
                if(this.tableData.detailsList[index].processStartDate) {
                    return {
                        disabledDate:(time) => {
                            const timestamp = time.getTime()
                            // 结束时间不大于开始时间
                            if (timestamp >= startTimestamp) {
                                return false
                            } else {
                                return timestamp < startTimestamp
                            }
                        },
                    }
                }else {
                    return {
                        disabledDate (time) {
                            return false
                        },
                    }
                }
            }

        }
    },
    mounted () {
        this.$nextTick( () => {
            this.rowDrop()
        })
    },
    methods: {
        async init (data) {
            data.map(item => {
                if (this.workshopId) {
                    item.workshopId = this.workshopId
                }
            })
            this.tableData.detailsList.push(...data)
            this.tableData.detailsList.forEach((item, index) => {
                this.getUserListAll(item, index)
            })
        },
        async parentDeptChange(deptId) {
            this.workshopId = deptId
            this.tableData.detailsList.map(item => {
                item.workshopId = deptId
            })
            this.tableData.detailsList.forEach((item, index) => {
                this.getUserListAll(item, index)
            })
        },
        // 明细按钮权限
        handleButtonShow() {
            return true
        },
        selectTreeselect(val, scope) {
            scope.row.userId = ''
            scope.row.userName = ''
            scope.row.machiningDeptName = val.deptName
            this.getUserListAll(val.id, scope)
        },
        userChange (scope) {
            const data = scope.row.userData.filter(item => scope.row.userId === item.id)
            if(data.length > 0){
                scope.row.userName = data[0].nickName
            }else{
                scope.row.userName = ''
            }
        },
        // 加载人员数据
        async getUserListAll(item, index) {
            if (['create', 'update'].includes(this.queryType)) {
                if (item.workshopId) {
                    userListAll({ deptId: item.workshopId }).then(res => {
                        this.$set(this.tableData.detailsList, index, Object.assign({}, item, { userData: res.data.list }))
                    })
                } else {
                    this.$set(this.tableData.detailsList, index, Object.assign({}, item, { userData: [] }))
                }
                
            }
        },
        // 按钮事件处理器
        async handleNewButton(buttonCode) {
            if(buttonCode === 'addProcess'){
                this.$refs.choiceProcedure.init(null, this.tableData.detailsList);
                return
            }
            if (buttonCode === 'delete') {
                this.removeData()
                return
            }
        },
        handleConfirmProcedure(data = []) {
            const oldLen = this.tableData.detailsList.length
            const list = data.map( (item, i) => {
                return Object.assign({}, item, {
                    machiningNum: 1,
                    workshopId: this.workshopId
                })
            })
            this.tableData.detailsList.push(...list)
            const newLen = this.tableData.detailsList.length
            for (let i = oldLen; i < newLen; i++) {
                this.getUserListAll(this.tableData.detailsList[i], i)
            }
        },
        removeData (row, i) {
            if(row){
                this.tableData.detailsList.splice(i, 1)
            }else{
                if(this.selectData.length > 0) {
                    this.$modal.confirm('您确定要删除吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let newData = this.tableData.detailsList.filter((a) => !this.selectData.some((b) => a.processCode === b.processCode))
                        this.tableData.detailsList = newData
                    })
                }else{
                    this.$modal.msgError('请选择数据')
                }
            }
        },
        /** 转换用户数据结构 */
        normalizer(node) {
            if (node.children && !node.children.length) {
                delete node.children
            }
            return {
                id: node.id,
                label: node.deptName,
                children: node.children
            }
        },
        rowDrop () {
            const tbody = document.querySelector('.table-sortable tbody');
            const _this = this;
            Sortable.create(tbody, {
                animation: 1000,
                handle: '.sortHandle',
                onEnd ({newIndex, oldIndex}) {
                    const currRow = _this.tableData.detailsList.splice(oldIndex, 1)[0];
                    _this.tableData.detailsList.splice(newIndex, 0, currRow);
                }
            })
        }
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
    font-size: 16px;
    margin-left: 2px;
}
.slotIcon-color-content {
    color: red;
}
.sortHandle {
    cursor: move;
    display: inline-block;
    width: 100%;
}
</style>