<template>
    <el-form ref="elForm" :model="tableData" :rules="tableData.rules">
        <div class="attachmentTableTop" v-if="queryType !== 'view' && tableType == '1'">
            <button-top :showDropdown="false" :buttonTopData="buttonTop" :buttonShow="handleButtonShow"
                @newButton="handleNewButton" style="margin-top: 0;padding: 3px 0 0 0 !important;"></button-top>
        </div>
        <el-table v-loading="loading" ref="tableRef" @row-click="rowClick" @selection-change="(data) => selectData = data" :data="tableData.detailsList" border class="saleOrderOperateEltable" max-height="300px" style="width: 100%">
            <el-table-column fixed="left" align="center" key="selectable" type="selection" width="50" v-if="queryType == 'create' || queryType == 'update'" />
            <el-table-column align="center" label="物料编码" prop="matlCode" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="left" label="物料名称" prop="matlName" show-overflow-tooltip min-width="240"></el-table-column>
            <el-table-column align="left" label="规格型号" prop="matlType" show-overflow-tooltip min-width="150"></el-table-column>
            <el-table-column align="center" label="计量单位" prop="matlUnit" show-overflow-tooltip width="90">
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="right" label="需求数量" prop="demandNum" show-overflow-tooltip width="220">
                <template slot="header">
                    <span><span style="color: red;">*</span>需求数量</span>
                </template>
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.demandNum'" :rules="tableData.rules.demandNum">
                        <el-input-number v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.demandNum" :min="1" :max="10000" controls-position="right"></el-input-number>
                        <span v-else>{{ scope.row.demandNum }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="right" label="库存数量" prop="inventoryNum" show-overflow-tooltip width="150">
                <template slot="header">
                    <span>库存数量</span>
                    <tooltip content="默认按库存合格数量累计" />
                </template>
            </el-table-column>
            <el-table-column align="center" label="需求日期" prop="demandDate" show-overflow-tooltip width="250">
                <template slot-scope="scope">
                    <el-form-item :prop="'detailsList.' + scope.$index + '.demandDate'" :rules="tableData.rules.demandDate">
                        <el-date-picker v-if="queryType == 'create' || queryType == 'update'"
                        v-columnFormat="{
                            index: scope.$index, 
                            prop: 'demandDate', 
                            list: tableData.detailsList
                        }"
                        v-model="scope.row.demandDate" type="date" format="yyyy-MM-dd" value-format="timestamp"></el-date-picker>
                        <span v-else>{{ parseTime(scope.row.demandDate, '{y}-{m}-{d}') }}</span>
                    </el-form-item>
                </template>
            </el-table-column>
            <el-table-column align="center" label="行号" prop="rowNum" show-overflow-tooltip width="80">
                <template slot-scope="scope">
                    {{ scope.row.rowNum = scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="100" v-if="queryType == 'create' || (queryType == 'update' && tableType == '1')">
                <template slot-scope="scope">
                    <el-button type="text" @click="removeData(scope.row, scope.$index)">删行</el-button>
                </template>
            </el-table-column>
        </el-table>
        <choice-material ref="choiceMaterial" @choiceMaterialClick="choiceClick"  :propsFormData="{planAttributes: ['1', '3']}"/>
        <choice-bom ref="choiceBom" @change="choiceClick" />
    </el-form>
</template>

<script>
import indexMixin from '@/views/mixins';
import choiceMaterial from "@/views/components/choice-material"
import choiceBom from "@/views/components/choice-bom"
import { generateUUID } from '@/utils'

export default {
    components: { choiceMaterial, choiceBom, tooltip: () => import('@/components/tooltip') },
    props: {
        dict: {
            type: Object,
            default: null
        },
        unitId: {
            type: String,
            default: ''
        },
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
                { buttonName: '选择BOM', buttonCode: 'addBOM' },
                { buttonName: '选择物料', buttonCode: 'addMaterial' },
                { buttonName: '删除', buttonCode: 'delete' },
                { buttonName: '存量查询', buttonCode: 'query', options: "{\"prompt\":\"查询和刷新以下列表物料库存量，无须勾选\"}" },
            ],
            tableData:{
                detailsList: [],
                rules: {
                    demandNum: [{ required: true, message: '请输入需求数量', trigger: ['blur', 'change'] }],
                }
            },
            selectData: []
        }
    },
    methods: {
        async init (data) {
            // const dataList = await this.matlInventory(data)
            this.updateMatlInvByUnit(this.unitId, data)
            const list = data.map( item => {
                return {...item, demandDate: item.demandDate || '', uId: generateUUID()}
            })
            this.tableData.detailsList.push(...list)
        },
        // 明细按钮权限
        handleButtonShow() {
            return true
        },
        rowClick(row) {
            const selected = this.selectData.some(item => item.uId === row.uId)
                if (!selected) {
                    this.selectData.push(row)
                    this.$refs.tableRef.toggleRowSelection(row, true)
                } else {
                    var finalArr = this.selectData.filter((item) => {
                        return item.uId !== row.uId
                    })
                    this.selectData = finalArr
                    this.$refs.tableRef.toggleRowSelection(row, false)
                }
        },
        // 按钮事件处理器
        async handleNewButton(buttonCode) {
            if (buttonCode === 'addBOM') {
                const detailsList = this.tableData.detailsList;
                this.$refs.choiceBom.init(null, detailsList);
                return
            }
            if (buttonCode === 'addMaterial') {
                const detailsList = this.tableData.detailsList;
                this.$refs.choiceMaterial.init(null, [], detailsList);
                return
            }
            if (buttonCode === 'delete') {
                this.removeData()
                return
            }
            if (buttonCode === 'query') {
                if(this.tableData.detailsList.length){
                    // const dataList = await this.matlInventory(this.tableData.detailsList)
                    this.updateMatlInvByUnit(this.unitId, this.tableData.detailsList)
                    // this.tableData.detailsList = dataList
                    this.$modal.msgSuccess('存量查询成功')
                }else{
                    this.$modal.msgError('请先选择BOM或物料')
                }
                return
            }
        },
        removeData (row, i) {
            if(row){
                this.tableData.detailsList.splice(i, 1);
            }else{
                if(this.selectData.length > 0) {
                    let newData = this.tableData.detailsList.filter((a) => !this.selectData.some((b) => a.uId === b.uId));
                    this.tableData.detailsList = newData;
                }else{
                    this.$modal.msgError('请选择数据')
                }
            }
        },
        async choiceClick(data = []) {
            const getTime = new Date().getTime();
            const list = data.map(item => {
                return {...item, inventoryNum: 0,uId: generateUUID(), demandDate: getTime, planAttribute: item.bizParam?item.bizParam.planAttribute:item.planAttribute || '1'}
            })
            // const dataList = await this.matlInventory(list)
            this.updateMatlInvByUnit(this.unitId, list)
            this.tableData.detailsList.push(...list)
        },
     
    }
};
</script>
<style lang="scss" scoped>
.slotIcon-color {
    color: #1890ff;
    font-size: 16px;
    margin-right: 2px;
}
.slotIcon-color-content {
    color: red;
}
</style>