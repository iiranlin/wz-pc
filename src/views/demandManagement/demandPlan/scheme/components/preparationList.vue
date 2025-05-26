<template>
    <div>
        <div class="attachmentTableTop" v-if="queryType !== 'view' && tableType == '1'">
            <button-top :showDropdown="false" :buttonTopData="buttonTop" :buttonShow="handleButtonShow"
                @newButton="handleNewButton" :button-disable="handleTopButtonDisabled"
                style="margin-top: 0;padding: 3px 0 0 0 !important;"></button-top>
        </div>
        <el-table v-loading="loading" ref="tableRef2" row-key="uid" default-expand-all
            @selection-change="(data) => selectData = data" :data="tableData.detailsList" border
            class="saleOrderOperateEltable" height="300px" style="width: 100%" :tree-props="{ children: 'replaceList' }">
            <el-table-column fixed="left" :selectable="isSelectable" align="center" key="selectable" type="selection"
                width="50" v-if="queryType == 'create' || queryType == 'update'" />
            <el-table-column align="left" label="序号" width="50px" type="index" :index="tableIndex" />
            <el-table-column align="left" label="物料编码" prop="matlCode" 
                width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip
                width="240"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="left" label="计量单位" prop="matlUnit" show-overflow-tooltip>
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="left" label="计划属性" prop="planAttribute" show-overflow-tooltip width="100">
                <template slot-scope="scope">
                    <span
                        :class="[scope.row.planAttribute !== '1' ? `planAttribute-${scope.row.planAttribute}` : '']">{{
                            scope.row.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="需求数量" prop="demandNum" show-overflow-tooltip width="100">
            </el-table-column>
            <el-table-column align="left" label="库存数量" prop="inventoryNum" show-overflow-tooltip width="150">
            </el-table-column>
            <el-table-column align="left" label="计划数量" prop="planNum" width="220">
                <template slot="header">
                    <span>计划数量</span>
                    <tooltip content="默认=需求数量-库存数量。如果手动调整以调整为准。" />
                </template>
                <template slot-scope="scope">
                    <el-input-number style="width: calc(100% - 10px);"
                        v-if="['create', 'update'].includes(queryType) && scope.row.planAttribute == '2' && scope.row.replaceList.length == 0 &&  scope.row.subOrReplace == '1'"
                        @change="inputChange" v-model="scope.row.planNum" :min="0" :precision="4"
                        controls-position="right"></el-input-number>
                    <span v-else>{{ scope.row.planNum }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="领料需求数量" prop="pickingDemandNum" width="220">
                <template slot="header">
                    <span>领料需求数量</span>
                    <tooltip content=" 1.库存数量>=需求数量时，默认=需求数量。2.库存数量<=需求数量时，默认=计划数量+库存数量。如果手动调整以调整为准。" />
                </template>
                <template slot-scope="scope">
                    <el-input-number style="width: calc(100% - 10px);"
                        v-if="['create', 'update'].includes(queryType) && scope.row.planAttribute == '2' && !scope.row.subOrReplace"
                        @change="inputChange" v-model="scope.row.pickingDemandNum" :min="0" :precision="4"
                        controls-position="right"></el-input-number>
                    <span v-else>{{ scope.row.pickingDemandNum }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="subOrReplace" label="子件/替代件" width="100">
                <template slot-scope="scope">
                    <span :class="[scope.row.subOrReplace == '2' ? `planAttribute-2` : '']">{{ {
                        1: '子件', 2:
                            '替代件'
                    }[scope.row.subOrReplace] || '--'
                        }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="replaceMethod" label="替代方式" width="100">
                <template slot-scope="scope">
                    <span>{{ (scope.row.replaceMethod || '--') | orderTypeFilter(dict.type.replaceMethod) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="replaceOrder" label="替代次序" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.replaceOrder || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="childNum" label="替代用量" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.childNum || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="baseNum" label="子件底数" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.baseNum || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="unitNum" label="单位用量" width="100">
                <template slot-scope="scope">
                    <span>{{ scope.row.unitNum || '--' }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" prop="isMainMatl" label="是否主料" width="100">
                <template slot-scope="{row}">
                    <span :style="{ color: row.isMainMatl == '1' ? '#B8741a' : '' }">{{ row.isMainMatl || '0' |
                        orderTypeFilter(dict.type.YesNo) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="left" label="创建方式" prop="createType" show-overflow-tooltip width="120">
                <template slot="header">
                    <span>创建方式</span>
                    <tooltip content="BOM展算或手动新增或产能分流" />
                </template>
                <template slot-scope="{row}">
                    <span :style="{ color: row.createType == '1' ? '#B8741a' : '' }">{{row.createType || '2' | orderTypeFilter(dict.type.createType) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="100"
                v-if="queryType == 'create' || (queryType == 'update' && tableType == '1')">
                <template slot-scope="scope">
                    <el-button v-if="!!scope.row.replaceList.length" type="text"
                        @click.stop="handleClick(scope)">替代调整</el-button>
                </template>
            </el-table-column>
        </el-table>
        <replaceAdjust ref="replaceAdjust" @change="replaceClick"></replaceAdjust>
        <choice-material ref="choiceMaterial" :propsFormData="{ planAttributes: [2] }"
            @choiceMaterialClick="choiceClick" />
        <detail-dialog ref="detailDialogRef" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import choiceMaterial from "@/views/components/choice-material"
import replaceAdjust from "./replaceAdjust.vue"
import { generateUUID } from '@/utils'
export default {
    components: { 
        choiceMaterial,
        replaceAdjust, 
        DetailDialog: () => import('@/views/components/DetailDialog'),
        tooltip: () => import('@/components/tooltip') 
    },
    dicts: ['MeasureUnit', 'planAttribute', 'demandPlanSourceType', 'YesNo', 'createType', 'replaceMethod'],
    props: {
        queryType: {
            type: String,
            default: ''
        },
        tableType: {
            type: String,
            default: '1'
        },
    },
    mixins: [indexMixin],
    data() {
        return {
            loading: false,
            buttonTop: [
                { buttonName: '新增物料', buttonCode: 'addMaterial' },
                { buttonName: '删除', buttonCode: 'delete' },
                { buttonName: '存量查询', buttonCode: 'query' },
                { buttonName: '刷新计划', buttonCode: 'refresh', options: "{\"prompt\":\"当修改了的备料，比如修改数量/删除备料/新增备料，需要点击刷新计划；无须勾选数据。\"}" },
            ],
            tableData: {
                detailsList: [],
            },
            selectData: [],
            scopeData: null
        }
    },
    methods: {
        inputChange() {
            this.$emit('update', [...this.tableData.detailsList])
        },
        isSelectable(row) {
            return row.planAttribute != '1'
        },
        async init(row) {
            if (row) {
                const { sparePartsList = [] } = row
                this._row = row
                let list = sparePartsList.map(item => {
                    return { ...item, planEndDate: item.planEndDate || '', planStartDate: item.planStartDate || '', uid: generateUUID(), replaceList: item.replaceList.map(item => ({ ...item, uid: generateUUID() })) }
                })
                // const dataList = await this.matlInventory(list)
                this.tableData.detailsList = list
            } else {
                this._row = null
                this.tableData.detailsList = []
            }

        },
        handleTopButtonDisabled({ buttonCode }) {
            if (buttonCode == 'delete' && !this.selectData.length) {
                return true
            }
            if (!this.tableData.detailsList.length) {
                return true
            }
            return false
        },
        // 明细按钮权限
        handleButtonShow() {
            return true
        },
        // 按钮事件处理器
        async handleNewButton(buttonCode) {
            if (buttonCode === 'addMaterial') {
                this.$refs.choiceMaterial.init(null, [], [...this.tableData.detailsList])
            } else if (buttonCode === 'delete') {
                this.removeData()
            } else if (buttonCode === 'query') {
                this.$set(this.buttonTop, 2, { ...this.buttonTop[2], loading: true, buttonName: '查询中' })
                this.updateMatlInvByUnit(this.unitId, this.tableData.detailsList)
                // const dataList = await this.matlInventory(this.tableData.detailsList)
                // this.tableData.detailsList = dataList
                this.$set(this.buttonTop, 2, { ...this.buttonTop[2], loading: false, buttonName: '存量查询' })
                this.$modal.msgSuccess('存量查询成功')
            } else if (buttonCode === 'refresh') {
                this.handleRefresh()
            }
        },
        handleRefresh() {
            this.$set(this.buttonTop, 3, { ...this.buttonTop[3], loading: true, buttonName: '刷新中' })
            this.$emit('refresh', this.callBack)
        },
        callBack() {
            this.$set(this.buttonTop, 3, { ...this.buttonTop[3], loading: false, buttonName: '刷新计划' })
            this.$modal.msgSuccess('刷新计划成功')
            const parent = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent
            parent._data.activeTabName = 'purchasePlanList'
        },
        async removeData() {
            try {
                await this.$modal.confirm('您确定要删除吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                this.$emit('remove', { row: this._row, rows: this.selectData })
            } catch (err) {
                console.error(err)
            }

        },

        replaceClick(list = []) {
            this.$set(this.tableData.detailsList, this.$index, list[0])
            this.inputChange()
        },
        async choiceClick(data, type) {
            let dataArr = data
            this.updateMatlInvByUnit(this.unitId, dataArr)
            // dataArr = await this.matlInventory(dataArr)
            const getTime = new Date().getTime()
            const dataList = dataArr.map(item => {
                const demandNum = item.demandNum || 1
                const planNum = item.planNum || 1
                const pickingDemandNum = item.pickingDemandNum || 1
                const planAttribute = item.bizParam ? item.bizParam.planAttribute : item.planAttribute
               
                return Object.assign({}, item, {
                    baseNum: 0,
                    childNum: 0,
                    createType: '1',
                    parentId: this._row.id,
                    demandNum,
                    isMainMatl: '',
                    pickingDemandNum,
                    planStartDate: getTime,
                    planEndDate: item.demandDate || '',
                    uid: generateUUID(),
                    planNum: planNum,
                    planAttribute,
                    planId: '',
                    replaceList: [],
                    replaceMethod: '',
                    replaceOrder: 0,
                    subItemId: '',
                    subOrReplace: '1',
                    unitNum: 0,
                })
            })
            this.tableData.detailsList.push(...dataList)
            this.$emit('update', [...this.tableData.detailsList])
        },
        handleClick(scope) {
            this.$index = scope.$index
            // this.scopeData = scope;
            const arr = JSON.parse(JSON.stringify([scope.row]))
            this.$refs.replaceAdjust.init(arr)
        },
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
    font-size: 16px;
    margin-left: 2px;
}
</style>