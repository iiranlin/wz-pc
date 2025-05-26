<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template slot="matlClassifyId">
                <el-input :disabled="true" v-model="formDataClick.matlClassifyId"></el-input>
            </template>
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
            <template v-slot:warehouseId="{ data, i18nData }">
                <FormWarehouseCode :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <collapse v-show="tableType === '2'">
                <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <el-tree class="drawer-tree" node-key="matlClassifyId" :indent="0" :data="dataOptions"
                            :props="defaultProps" :expand-on-click-node="false" ref="tree" :highlight-current="true"
                            :filter-node-method="filterNode" @node-click="handleNodeClick" />
                    </div>
                </el-col>
            </collapse>
            <!--用户数据-->
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :menuId="menuId" :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick">
                    <template v-slot:tab>
                        <orderDetailType :value="tableType" @input="handleTableTypeChange" />
                    </template>
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
                    @handleSelectionChange="handleSelectionChange" @clickLink="clickLink" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                    <template slot="applyStatus" slot-scope="scope">
                        <span :class="'saleStatus-' + scope.value">{{ scope.value | fieldFormat(scope.fieldFormatArr)
                        }}</span>
                    </template>
                    <template slot="status" slot-scope="scope">
                        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}
                    </template>
                    <template slot="fileList" slot-scope="scope">
                        <el-link :type="!scope.data.fileList || !scope.data.fileList.length ? 'info' : 'primary'"
                            :disabled="!scope.data.fileList || !scope.data.fileList.length"
                            @click.stop="linkClick(scope)">查看</el-link>
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <fileList ref="fileList" />
        <identify-operate ref="identifyOperate" @operateSuccess="getList"></identify-operate>
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import { applyList, applyDetailList, applyRemoveApply, applyRemoveDetail, applySubmit, exportDetailList, applyView, applyDetailView, } from '@/api/prodmgr-inv/scrapApply'
import fileList from '@/views/components/fileList/index'
import identifyOperate from './components/identifyOperate'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import collapse from '@/components/Collapse'
import workFlowView from '@/components/workFlowView'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
export default {
    name: 'scrapApply',
    mixins: [indexMixin],
    props: {
        tableType: {
            type: String,
            default: '1'
        },
        tabChange: {
            type: Function,
            default: null
        }
    },
    components: { workFlowView, fileList, identifyOperate, orderDetailType, activitiAssignee, collapse, FormUnitId, FormWarehouseCode },
    data() {
        const arg = this.tableType == '2' ? { matlClassifyId: '全部' } : {}
        return {
            // 遮罩层
            loading: false,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 表格数据
            list: [],
            //列表选中数据
            selection: [],
            // 表格序号是否展示
            numberShow: true,
            // 页面属性
            property: {},
            total: 0,
            // 查询参数
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            filterText: "",
            dataOptions: undefined,
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
            treeCurrentKey: '',
            // 表单参数
            formData: {},
            formDataClick: {
                ...arg
            },
            workFlowViewVisible: false,
            selectedRow: null,
            treeLoading: false,
            menuId: ''
        }

    },
    watch: {
        // tableType: {
        //     handler(val) {
        //         this.menuProperty({ '1': '', '2': menuConfig.MENU_BFSQ_BRANCH }[val])
        //         this.getList()
        //     },
        //     immediate: true,
        // }
    },
    created() {
        this.menuProperty({ '1': '', '2': menuConfig.MENU_BFSQ_BRANCH }[this.tableType])
        this.classTree();
    },
    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
        },
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                for (let i = 0; i < data.search.length; i++) {
                    if (["matlClassifyId"].includes(data.search[i].fieldCode)) {
                        data.search[i]['clear'] = true
                        break
                    }
                }
                this.property = data
            })
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(row.status)
            }
            if (['update', 'delete', 'submit'].includes(button.buttonCode) && !['0', '1'].includes(row.status)) {
                return true
            }
            if (['submit', 'flowSee'].includes(button.buttonCode) && this.tableType == '2') {
                return true
            }
            if (['identify'].includes(button.buttonCode) && (this.tableType == '1' || !['3'].includes(row.status) || !['2'].includes(row.applyStatus))) {
                return true
            }
            if (['updateIdentify'].includes(button.buttonCode) && (this.tableType == '1' || !['3'].includes(row.status) || !['3'].includes(row.applyStatus))) {
                return true
            }
            if (['pushDown'].includes(button.buttonCode) && (this.tableType == '1' || !['3'].includes(row.status) || !['3', '4'].includes(row.applyStatus) || ['2'].includes(row.identifyResult))) {
                return true
            }
            return false
        },
        numberChange(val) {
            this.numberShow = val
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns)
        },
        clickReset() {
            this.handleQuery()
        },
        //选择框回调
        selectChange(row) {
            let { formData, isWatch } = row
            if (!isWatch) {
                this.handleQuery(formData)
            } else {
                this.formData = Object.assign({}, this.formData, formData)
            }
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key)
                }
                this.formData[key] = null
            }
            this.handleQuery()
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
            this.formDataClick = Object.assign({}, this.formData, row)
            if (this.tableType == '2') {
                if (!this.formDataClick.matlClassifyId) {
                    this.formDataClick.matlClassifyId = '全部'
                } else {
                    const node = this.$refs.tree.getCurrentNode()
                    if (node && node.matlClassifyName) {
                        this.formDataClick.matlClassifyId = node.matlClassifyName
                    }

                }
            }
            this.getList()
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery()
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = selection
        },
        handleResetField() {
            this.formData.matlClassifyId = null;
            this.$refs.tree.setCurrentKey(null);
            this.treeCurrentKey = "";
            this.formDataClick.matlClassifyId = '全部';
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode === 'update') {
                if (this.tableType == '1' && idArr.length > 1) {
                    this.$modal.msgError('只能选择同一个主单修改');
                    return
                }
                this.$router.push({ name: 'scrapApplyOperate', query: { type: buttonCode, id: idArr.join(','), tableType: this.tableType } })
            } else if (buttonCode === 'delete') {
                this.handleDelete(idArr)
            } else if (buttonCode === 'create') {
                this.$router.push({ name: 'scrapApplyOperate', query: { type: buttonCode } })
            } else if (buttonCode == 'submit') {
                this.ids = idArr
                this.handleSubmit(ACTIVITI_ASSUGNEE.INV_BFSQ);
            } else if (buttonCode === 'flowSee') {
                this.workFlowViewVisible = true
                this.selectedRow = { businessId: idArr[0] }
            } else if (buttonCode === 'matchContract') {
                this.$refs.ContractRef.init()
            } else if (buttonCode === 'contract') {
                this.$router.push({ name: 'pullDownPurchaseOrder', query: { type: buttonCode, id: idArr[0] } })
            } else if (buttonCode === 'identify' || buttonCode === 'updateIdentify') {
                this.$refs.identifyOperate.init(idArr, buttonCode);
            } else if (buttonCode === 'pushDown') {
                const sug = new Set(rowArr.map(({ sugHandMethod }) => `${sugHandMethod}`))
                const nextSug = Array.from(sug).filter(s => !!s)
                if (nextSug.length > 1) {
                    this.$modal.msgError('建议处置方式必须相同');
                    return
                }
                this.$router.push({ name: 'scrapHandleOperate', query: { type: buttonCode, nextSug: nextSug[0], ids: idArr.join(','), name: 'scrapApply' } });
            } else if (buttonCode === 'export') {
                this.handleExport();
            } else if (buttonCode === 'withdraw') {
                this.handleWithdraw({ businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.INV_BFSQ, })
            }
        },
        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                await exportDetailList(Object.assign({}, this.listQuery, this.formData, { exportColumns }))
            } catch (err) {
                console.error(err)
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true
            if (this.tableType === '1') {
                applyList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list
                    this.total = data.total
                }).finally(() => {
                    this.loading = false
                })
            } else {
                if (this.formData.matlClassifyId == '全部') {
                    delete this.formData.matlClassifyId
                }
                applyDetailList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list
                    this.total = data.total
                }).finally(() => {
                    this.loading = false
                })
            }
        },
        classTree() {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.dataOptions = data || [];
                this.treeLoading = false;
            }).finally(() => {
                this.treeLoading = false;
            })
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (data.matlClassifyId === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.formData.matlClassifyId = null;
                this.$refs.tree.setCurrentKey(null);
                this.treeCurrentKey = "";
                this.formDataClick.matlClassifyId = '全部';
            } else {
                this.treeCurrentKey = data.matlClassifyId;
                this.formData.matlClassifyId = data.matlClassifyId;
                this.formDataClick.matlClassifyId = data.matlClassifyName;
            }
            this.getList();
        },
        handleDelete(ids) {
            this.$modal.confirm(this.tableType == '1' ? '是否确认删除？' : '是否删除该明细信息？').then(() => {
                return this.tableType == '1' ? applyRemoveApply({ ids }) : applyRemoveDetail({ ids })
            }).then(() => {
                if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                    this.listQuery.pageNum -= 1
                }
                this.getList()
                this.refreshChange(this.refName)
                this.$modal.msgSuccess('删除成功')
            })
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            applySubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
                if (success) {
                    this.$modal.msgSuccess('提交成功')
                    this.getList()
                    this.refreshChange(this.refName)
                } else {
                    this.$modal.msgError(message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        async linkClick(scope) {
            // let data = [];
            // if (this.tableType == '1') {
            //     const res = await applyView(scope.data.id)
            //     data = res.data.fileList
            // } else {
            //     const res = await applyDetailView({ ids: [scope.data.id] })
            //     data = res.data[0].fileList
            // }
            this.$refs.fileList.init(scope.value)
        },
        clickLink(row, code) {
            const objPush = {
                scrapCode: () => {
                    this.$router.push({
                        name: 'scrapApplyOperate',
                        query: { type: 'view', id: this.tableType == '1' ? row.id : row.applyId, name: 'scrapApplyQuery' }
                    })
                },
                batchNo: () => {
                    this.$router.push({ name: 'batchNoDetail', query: { type: "view", id: row.batchNo, name: 'scrapApplyQuery' } })
                },
                matlCode: () => {
                    this.$router.push({ name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'scrapApplyQuery' } })
                },
                projectCode: () => {
                    this.$router.push({ name: 'projectManagementOperate', query: { name: 'scrapApplyQuery', type: 'view', id: row.projectId } })
                }
            }
            objPush[code] && objPush[code]()
        }
    }
}
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
    margin-left: 20px;
    margin-top: 16px;
}

.ov_head {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
}
</style>
