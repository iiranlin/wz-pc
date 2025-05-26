<template>
    <div>
        <!-- <div class="attachmentTableTop" v-if="queryType !== 'view' && tableType == '1'">
            <button-top :showDropdown="false" :buttonTopData="buttonTop" :buttonShow="handleButtonShow"
                :button-disable="handleTopButtonDisabled" @newButton="handleNewButton"
                style="margin-top: 0;padding: 3px 0 0 0 !important;"></button-top>
        </div> -->
        <el-table v-loading="loading" ref="tableRef2" row-key="uid" @selection-change="(data) => selectData = data"
            :data="tableData.detailsList" highlight-current-row @current-change="handleCurrentChange" border
            class="saleOrderOperateEltable" style="width: 100%">
            <el-table-column fixed="left" align="center" key="selectable" type="selection" width="50"
                v-if="queryType == 'create' || queryType == 'update'" />
            <el-table-column align="center" label="序号" width="50px" type="index" :index="tableIndex" />
            <el-table-column align="left" label="阶层" prop="bomLevel" width="150">
                <template slot-scope="{row}">
                    <span :style="{ 'paddingLeft': `${15 * (Number(row.bomLevel) + 1)}px` }">{{ row.bomLevel }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="版本号" prop="bomVersion" show-overflow-tooltip width="170">
                <template slot-scope="scope">
                    <!-- <el-select 
                        v-model="scope.row.bomVersion" @change="handleVersion(scope)">
                        <el-option v-for="item in scope.row.bomVersionList" :label="item.bomVersion"
                            :value="item.bomVersion" :key="item.bomVersion"></el-option>
                    </el-select> -->
                    <el-input
                        v-if="['create', 'update'].includes(queryType) && !!scope.row.bomVersion.length && scope.row.bomVersionList.length > 1"
                        v-model="scope.row.bomVersion" clearable placeholder="请选择">
                        <el-button slot="append" icon="el-icon-search"
                            @click="handleBomVersion(scope.row, scope.$index)"></el-button>
                    </el-input>
                    <span v-else>{{ scope.row.bomVersion }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="BOM编码" prop="bomCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'bomAdministrationOperate' })">{{
                            row.bomCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="BOM名称" prop="bomName" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="物料编码" prop="matlCode" show-overflow-tooltip width="150">
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
            <el-table-column align="center" label="计量单位" prop="matlUnit" show-overflow-tooltip>
                <template slot-scope="{row}">
                    {{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                </template>
            </el-table-column>
            <el-table-column align="center" label="计划属性" prop="planAttribute" show-overflow-tooltip width="100">
                <template slot="header">
                    <span>计划属性</span>
                    <tooltip content="业务含义是：从计划的层面，该物料是计划自己生产，还是委外，还是采购。" />
                </template>
                <template slot-scope="scope">
                    <span
                        :style="{ color: scope && scope.row && scope.row.planAttribute == '3' ? '#9726ff' : '#1b1e22' }">{{
                            scope.row.planAttribute | orderTypeFilter(dict.type.planAttribute) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="right" label="需求数量" prop="demandNum" show-overflow-tooltip width="100">
                <template slot="header">
                    <span>需求数量</span>
                </template>
            </el-table-column>
            <el-table-column align="right" label="库存数量" prop="inventoryNum" show-overflow-tooltip width="150">
                <template slot-scope="scope">
                    <el-link type="primary" @click="detail('inventoryNum', scope.row)">{{ scope.row.inventoryNum
                    }}</el-link>
                </template>
            </el-table-column>
            <el-table-column align="right" label="采购订单未入库量" prop="purNoInNum" show-overflow-tooltip width="160">
                <template slot="header">
                    <span>采购订单未入库量</span>
                    <tooltip content="1. 取该组织、该物料已审核采购订单未入库数量；<br>
                                        2. 系统将此作为建议供应量；具体用户可调计划数量;<br>
                                        3. 如果想获取“最新采购未入库量”需要删除已展算的、然后重选该销售需求重新展算。" />
                </template>
                <template slot-scope="scope">
                    <el-link type="primary" @click="detail('purNoInNum', scope.row)">{{ scope.row.purNoInNum
                    }}</el-link>
                </template>
            </el-table-column>
            <el-table-column align="right" label="计划数量" prop="planNum" width="220">
                <template slot="header">
                    <span>计划数量</span>
                    <tooltip :imgUrl="planNumImg" />
                </template>
                <template slot-scope="scope">
                    <el-input-number style="width: calc(100% - 10px);"
                        v-if="queryType == 'create' || queryType == 'update'" v-model="scope.row.planNum" :min="0"
                        :precision="0" controls-position="right"></el-input-number>
                    <span v-else>{{ scope.row.planNum }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="计划开始日期" prop="planStartDate" show-overflow-tooltip width="250">
                <template slot-scope="scope">
                    <el-date-picker format="yyyy-MM-dd" @input="(v) => hanldeInput(scope, 'planStartDate', v)"
                        style="width: 100%;" v-if="queryType != 'view'" v-model="scope.row.planStartDate" type="date" />
                    <span v-else>{{ parseTime(scope.row.planStartDate, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="计划完成日期" prop="planEndDate" show-overflow-tooltip width="250">
                <template slot-scope="scope">
                    <el-date-picker style="width: 100%;" @input="(v) => hanldeInput(scope, 'planEndDate', v)"
                        v-if="queryType != 'view'" v-model="scope.row.planEndDate" type="date" />
                    <span v-else>{{ parseTime(scope.row.planEndDate, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>

            <el-table-column align="center" label="来源项目编码" prop="projectCode" show-overflow-tooltip width="180">
                <template slot-scope="{row, $index}">
                    <el-input style="width: 100%;"
                        v-if="(queryType == 'create' || queryType == 'update') && !row.sourceCode" placeholder="请选择项目"
                        v-model="row.projectCode" class="input-with-select">
                        <el-button slot="append" icon="el-icon-search"
                            @click="handleSelectProject(row, $index)"></el-button>
                    </el-input>
                    <el-button v-else type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                            row.projectCode }}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="来源项目名称" prop="projectName" show-overflow-tooltip width="180">
            </el-table-column>
            <el-table-column align="center" label="来源需求类型" prop="sourceType" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <span>{{ row.sourceType | orderTypeFilter(dict.type.demandPlanSourceType) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="来源需求单号" prop="sourceCode" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.sourceId, refName: getRouteByDemandPlanSourceType(row.sourceType) })">{{
                            row.sourceCode }}</el-button>
                </template>
            </el-table-column>
            <el-table-column align="center" label="来源需求行号" prop="sourceRowNum" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="客户编码" prop="cuCode" show-overflow-tooltip width="150">
                <template slot-scope="{row, $index}">
                    <el-button type="text" size="small"
                        @click.stop="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">
                        {{ row.cuCode }}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column align="left" label="客户名称" prop="cuName" show-overflow-tooltip
                width="150"></el-table-column>
            <el-table-column align="center" label="是否有产能分流" prop="isDivide" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <span>{{ row.isDivide | orderTypeFilter(dict.type.YesNo) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="是否有需求合并" prop="isMerge" show-overflow-tooltip width="150">
                <template slot-scope="{row}">
                    <span :style="{ color: row.isMerge == '1' ? 'red' : '' }">{{ row.isMerge |
                        orderTypeFilter(dict.type.YesNo) }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" fixed="right" width="160"
                v-if="queryType == 'create' || (queryType == 'update' && tableType == '1')">
                <template slot="header">
                    <span>操作</span>
                 
                </template>
                <template slot-scope="scope">
                    <el-button type="text" @click.stop="hanldeDelRow(scope.row)">删行</el-button>
                    <el-button type="text" @click.stop="handleDismantlingClick(scope)"
                        style="margin-left: 6px;">产能分流
                        <tooltip content="产能分流可更改计划属性，比如物料A自制200，可分流为采购100，自制100。" />
                    </el-button>
                   
                </template>
            </el-table-column>
        </el-table>
        <choice-demandQuoteList ref="choiceDemandQuoteList"
            @change="(data) => choiceClick(data, 'choiceDemandQuoteList')" />
        <choice-bom ref="choiceBom" @change="(data) => choiceClick(data, 'choiceBom')" />
        <choice-material :propsFormData="{ planAttributes: [] }" ref="choiceMaterial"
            @choiceMaterialClick="(data) => choiceClick(data, 'choiceMaterial')" />
        <dismantling ref="dismantling" @change="dismantlingChange" />
        <exception ref="exception" />
        <merge ref="merge" @merge="mergeSave" />
        <detail-dialog ref="detailDialogRef" />
        <selectProject ref="selectProject" singleMode @selections="projectSelections"
            :propsFormData="{ unitId: unitId }" />
        <bomHistory ref="bomRef" singleMode @confirm="handleBomConfirm" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import choiceMaterial from "@/views/components/choice-material"
import bomHistory from '@/views/components/bom-history';
import choiceBom from "@/views/components/choice-bom"
import exception from "./exception.vue"
import merge from "./merge.vue"
import choiceDemandQuoteList from "@/views/components/choice-demandQuoteList"
import { expandQuoteList, expandRemove, sparePartsRemove, demandDivide, childRefresh, demandMerge, refreshPlan, getDemandMergeItem } from '@/api/prodmgr-mm/demandPlan'
import dismantling from "./dismantling"
import { generateUUID, getRouteByDemandPlanSourceType } from '@/utils'
import selectProject from "@/views/components/selectProject"
import planNumImg from '@/assets/file/jhsl.png'
export default {
    components: {
        bomHistory,
        merge,
        exception,
        choiceMaterial,
        choiceBom,
        choiceDemandQuoteList,
        dismantling,
        selectProject,
        DetailDialog: () => import('@/views/components/DetailDialog'),
        tooltip: () => import('@/components/tooltip')
    },
    dicts: ['MeasureUnit', 'planAttribute', 'demandPlanSourceType', 'YesNo'],
    props: {
        queryType: {
            type: String,
            default: ''
        },
        buttonTop: {
            type: Array
        },
        tableType: {
            type: String,
            default: '1'
        },
        detail: {
             type: Function,
        },
        unitId: {
            type: String,
            default: ''
        }
    },
    mixins: [indexMixin],
    data() {
        return {
            planNumImg: planNumImg,
            loading: false,
            isDivideChange: false,

            tableData: {
                detailsList: [],

            },
            selectData: [],
            _purPlan: [],
            _producePlan: [],
            _purPlanDetail: [],
            _exception: [],
            _addList: []
        }
    },
    methods: {
        
        getRouteByDemandPlanSourceType: getRouteByDemandPlanSourceType,
        handleSelectProject(row, index) {
            const pId = row.projectId
            this._index = index
            this.$refs.selectProject.init(pId);
        },
        projectSelections(val) {
            const row = this.tableData.detailsList[this._index]
            this.$set(this.tableData.detailsList, this._index, { ...row, projectName: val.projectName, projectCode: val.projectCode, projectId: val.id })
            this._producePlan = [...this.tableData.detailsList]
        },
        // 备料调整更新计划
        updatePlan(list) {
            const idx = this.tableData.detailsList.findIndex(({ id }) => id == this._currentRow.id)
            const row = { ...this.tableData.detailsList[idx], sparePartsList: list }
            this.tableData.detailsList[idx] = row
            this._producePlan = [...this.tableData.detailsList]
        },
        // 刷新计划
        async refreshPlan(func) {
            try {
                const parent = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent
                const fd = await parent.$refs.vFormRef.getFormData()
                const param = {
                    exception: this._exception || [],
                    purPlan: this._purPlan || [],
                    producePlan: this._producePlan || [],
                    purPlanDetail: this._purPlanDetail || [],
                    addList: [],
                    removeIds: [],
                    isReplace: fd.isReplace,
                    unitId: this.unitId

                }
                const res = await refreshPlan(param)
                this.showException = undefined
                this.setTableData(res)
                func && func()
            } catch (err) {
                console.error(err)
            }
        },
        // 删除备料
        async removePreparation({ row, rows }) {
            try {
                const parent = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent
                const fd = await parent.$refs.vFormRef.getFormData()
                const param = {
                    exception: this._exception || [],
                    purPlan: this._purPlan || [],
                    producePlan: this._producePlan || [],
                    purPlanDetail: this._purPlanDetail || [],
                    addList: [],
                    producePlanId: row.id,
                    removeIds: rows.map(({ id }) => id),
                    isReplace: fd.isReplace,
                    unitId: this.unitId
                }
                const res = await sparePartsRemove(param)
                this.showException = undefined
                this.setTableData(res)
            } catch (err) {
                console.error(err)
            }
        },
        hanldeInput(scope, key, v) {
            const t = new Date(v).getTime()
            scope.row[key] = t
            this._producePlan = [...this.tableData.detailsList]
        },
        // 切换事件
        handleCurrentChange(row) {
            this._currentRow = row

            this.$emit('preparation', row)
        },
        // 子件刷新事件
        async handleRefresh() {
            try {
                const parent = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent
                const fd = await parent.$refs.vFormRef.getFormData()
                const param = {
                    exception: this._exception || [],
                    purPlan: this._purPlan || [],
                    purPlanDetail: this._purPlanDetail || [],
                    producePlan: this.tableData.detailsList.map(({ planNum, _planNum, bomVersion, _bomVersion, ...other }) => ({ ...other, bomVersion, planNum, isChange: (planNum !== _planNum || bomVersion !== _bomVersion) ? '1' : '0' })) || [],
                    addList: this._addList || [],
                    isReplace: fd.isReplace,
                    unitId: this.unitId
                }
                this.$set(this.buttonTop, 5, { ...this.buttonTop[5], loading: true, buttonName: '刷新中' })
                this.showException = true
                const res = await childRefresh(param)
                this.setTableData(res)
                this.$set(this.buttonTop, 5, { ...this.buttonTop[5], loading: false, buttonName: '子件刷新' })
                this.isDivideChange = false
                this.$modal.msgSuccess('子件刷新成功')
            } catch (err) {
                this.$set(this.buttonTop, 5, { ...this.buttonTop[5], loading: false, buttonName: '子件刷新' })
                console.error(err)
            }
        },
        // 生产计划单行删除事件
        async hanldeDelRow(row) {
            const flag = await this.checkPlanChange()
            if (flag) {
                return
            }
            this.delRows([row])
        },
        // 生产计划单批量删除事件
        async handleDelRows() {
            if (!!this.selectData.length) {
                const flag = await this.checkPlanChange()
                if (flag) {
                    return
                }
                this.delRows(this.selectData)
            }

        },
        // 生产计划删除逻辑处理
        async delRows(rows) {
            try {
                await this.$modal.confirm('删除后，其备料数据一并删除，是否确定？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                const ids = rows.map(({ id }) => id)
                const parent = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent
                const fd = await parent.$refs.vFormRef.getFormData()
                const param = {
                    exception: this._exception || [],
                    purPlan: this._purPlan || [],
                    producePlan: this._producePlan || [],
                    purPlanDetail: this._purPlanDetail || [],
                    addList: [],
                    removeIds: ids,
                    isReplace: fd.isReplace,
                    unitId: this.unitId
                }
                const res = await expandRemove(param)
                this.setTableData(res)
            } catch (err) {
                console.error(err)
            }
        },
        // 初始化操作
        async init({ producePlan = [], purPlan = [], exception = [], purPlanDetail = [], addList = [] }) {
            this._exception = exception
            this._purPlan = purPlan
            this._producePlan = producePlan
            this._purPlanDetail = purPlanDetail
            this._addList = addList
            const nextData = producePlan.map((item) => ({ ...item, _planNum: item.planNum, _bomVersion: item.bomVersion, uid: generateUUID(), sparePartsList: item.sparePartsList.map(({ planNum, pickingDemandNum, replaceList, ...other }) => ({ replaceList: Array.isArray(replaceList) ? replaceList.map(sss => ({ ...sss, planNum: sss.planNum || 0, _planNum: sss.planNum || 0, pickingDemandNum: sss.pickingDemandNum || 0, _pickingDemandNum: sss.pickingDemandNum || 0, })) : [], uid: generateUUID(), planNum: planNum || 0, _planNum: planNum || 0, pickingDemandNum: pickingDemandNum || 0, _pickingDemandNum: pickingDemandNum || 0, ...other })) }))
            if (nextData[0]) {
                this.$nextTick(() => {
                    this.tableData.detailsList = nextData
                    this.$nextTick(() => {
                        this.$refs.tableRef2.setCurrentRow(nextData[0]);
                        this.$refs.tableRef2.doLayout()
                    })
                })
            } else {
                this.tableData.detailsList = []
                this.$emit('preparation', null)
            }
            this.$emit('change', purPlan)
        },


        // 按钮事件处理器
        async handleNewButton(buttonCode) {
            const arr = this._purPlanDetail || []
            const rows = [...arr, ...this.tableData.detailsList]
            if (buttonCode === 'addDemand') {
                if (!this.unitId) {
                    this.$modal.msgError('请先选择所属组织')
                    return
                }
                this.$refs.choiceDemandQuoteList.init(rows, this.unitId)
            } else if (buttonCode === 'addBOM') {
                if (!this.unitId) {
                    this.$modal.msgError('请先选择所属组织')
                    return
                }
                this.$refs.choiceBom.init(null, [...this.tableData.detailsList])
            } else if (buttonCode === 'addMaterial') {
                if (!this.unitId) {
                    this.$modal.msgError('请先选择所属组织')
                    return
                }
                this.$refs.choiceMaterial.init(null, [], rows)
            } else if (buttonCode === 'delete') {
                this.handleDelRows()
            } else if (buttonCode === 'refresh') {
                this.handleRefresh()
            } else if (buttonCode === 'query') {
                this.$set(this.buttonTop, 4, { ...this.buttonTop[4], loading: true, buttonName: '查询中' })
                // const dataList = await this.matlInventory(this.tableData.detailsList)
                this.updateMatlInvByUnit(this.unitId, this.tableData.detailsList)
                // this.tableData.detailsList = dataList
                this.$set(this.buttonTop, 4, { ...this.buttonTop[4], loading: false, buttonName: '存量查询' })
                this.$modal.msgSuccess('存量查询成功')
            } else if (buttonCode === 'merge') {
                const flag = await this.checkPlanChange()
                if (flag) {
                    return
                }
                this.handleMerge()
            }
        },
        async mergeSave(list = []) {
            const parent = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent
            const fd = await parent.$refs.vFormRef.getFormData()
            const param = {
                exception: this._exception || [],
                purPlan: this._purPlan || [],
                producePlan: this._producePlan || [],
                purPlanDetail: this._purPlanDetail || [],
                mergeList: list,
                isReplace: fd.isReplace,
                unitId: this.unitId
            }
            const res = await demandMerge(param)
            this.setTableData(res)
        },
        async handleMerge() {
            try {
                const parent = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent
                const fd = await parent.$refs.vFormRef.getFormData()
                const param = {
                    exception: this._exception || [],
                    purPlan: this._purPlan || [],
                    producePlan: this._producePlan || [],
                    purPlanDetail: this._purPlanDetail || [],
                    addList: [],
                    isReplace: fd.isReplace,
                    unitId: this.unitId
                }
                this.$set(this.buttonTop, 6, { ...this.buttonTop[6], loading: true, buttonName: '合并中' })
                const { data } = await getDemandMergeItem(param)
                this.$set(this.buttonTop, 6, { ...this.buttonTop[6], loading: false, buttonName: '需求合并' })
                if (data.length) {
                    this.$refs.merge.init(data)
                } else {
                    this.$modal.msgError('未找到相同需求')
                }
            } catch (err) {
                this.$set(this.buttonTop, 6, { ...this.buttonTop[6], loading: false, buttonName: '需求合并' })
            }


        },
        async choiceClick(list = [], type = '', ids = []) {
            const parent = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent
            const fd = await parent.$refs.vFormRef.getFormData()
            const param = {
                exception: this._exception || [],
                purPlan: this._purPlan || [],
                producePlan: this._producePlan || [],
                purPlanDetail: this._purPlanDetail || [],
                addList: list.map(item => {
                    const obj = {}
                    if (type === 'choiceMaterial') {
                        obj.planAttribute = item.bizParam.planAttribute
                    }
                    const temp = {}
                    if (['choiceBom', 'choiceMaterial'].includes(type)) {
                        temp.sourceType = { choiceBom: '4', choiceMaterial: '5' }[type]
                    }
                    return { ...item, ...obj, ...temp }
                }),
                removeIds: ids,
                isReplace: fd.isReplace,
                unitId: this.unitId
            }
            this.showException = true
            const res = await expandQuoteList(param)
            this.setTableData(res)

        },
        setTableData(res) {
            const { data: { producePlan = [], purPlan = [], exception = [], addList = [], purPlanDetail = [] } } = res
            this._purPlan = purPlan
            this._producePlan = producePlan
            this._purPlanDetail = purPlanDetail
            this._exception = exception
            this._addList = addList
            this.$emit('change', purPlan)
            const nextData = producePlan.map((item) => ({
                ...item,
                _planNum: item.planNum,
                _bomVersion: item.bomVersion,
                sparePartsList: item.sparePartsList.map(({
                    planNum,
                    pickingDemandNum,
                    replaceList,
                    ...other }) => ({ replaceList: replaceList.map((s) => ({ ...s, planNum: s.planNum || 0, _planNum: s.planNum || 0, pickingDemandNum: s.pickingDemandNum || 0, _pickingDemandNum: s.pickingDemandNum || 0 })), planNum: planNum || 0, _planNum: planNum || 0, pickingDemandNum: pickingDemandNum || 0, _pickingDemandNum: pickingDemandNum || 0, ...other }))
            }))
            if (nextData[0]) {
                this.$refs.tableRef2.setCurrentRow(nextData[0]);
                this.tableData.detailsList = nextData
            } else {
                this.tableData.detailsList = []
                this.$emit('preparation', null)
            }
            if (!!exception.length && this.showException) {
                this.$refs.exception.init(exception)
                this.showException = undefined
            }

        },
        handleBomVersion(row, idx) {
            this.$refs.bomRef.init(row.bomCode);
            this._bomIdx = idx
        },
        handleBomConfirm(row) {
            const nextRow = { ...this.tableData.detailsList[this._bomIdx], bomName: row.bomName, bomCode: row.bomCode, bomId: row.bomId, bomVersion: row.bomVersion }//Object.assign(, )
            this.$set(this.tableData.detailsList, this._bomIdx, nextRow)
            this._bomIdx = undefined
        },
        handleVersion(scope) {
            const [bom] = scope.row.bomVersionList.filter(item => item.bomVersion == scope.row.bomVersion)
            scope.row.bomName = bom.bomName
            scope.row.bomCode = bom.bomCode
            scope.row.bomId = bom.bomId
        },
        checkPlanChange() {
            return new Promise(async (resolve) => {
                try {
                    const detailList = this.tableData.detailsList
                    if (detailList.some(({ _bomVersion, bomVersion, planNum, _planNum }) => planNum !== _planNum || bomVersion !== _bomVersion) || this.isDivideChange) {
                        const flag = await this.$modal.confirm('计划信息>修改了计划数量，或修改了BOM版本，或修改了计划属性，需要点击"子件刷新"才能重新计算，是否需要重新计算？', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        })
                        if (flag) {
                            await this.handleRefresh()
                        }
                        resolve(true)
                    } else {
                        resolve(false)
                    }

                } catch (err) {
                    resolve(true)
                }
            })
        },
        // 产能分流事件
        async handleDismantlingClick(scope) {
            const flag = await this.checkPlanChange()
            if (flag) {
                return
            }
            this.$refs.dismantling.init(scope.row)
        },
        async dismantlingChange({ divideNum, dividePlanAttribute, id }) {
            const parent = this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent
            const fd = await parent.$refs.vFormRef.getFormData()
            const param = {
                exception: this._exception || [],
                purPlan: this._purPlan || [],
                producePlan: this._producePlan || [],
                purPlanDetail: this._purPlanDetail || [],
                divideNum: divideNum,
                dividePlanAttribute: dividePlanAttribute,
                producePlanId: id,
                addList: [],
                removeIds: [],
                isReplace: fd.isReplace,
                unitId: this.unitId
            }
            const res = await demandDivide(param)
            this.isDivideChange = true
            this.setTableData(res)
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