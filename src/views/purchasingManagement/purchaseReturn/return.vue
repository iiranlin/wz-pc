<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <template slot="matlClassifyId" slot-scope="scope">
                <el-input :disabled="true" v-model="formDataClick.matlClassifyId"></el-input>
            </template>
            <template v-slot:unitName="{ data, i18nData }">
                <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
            <template v-slot:refundDeptName="{ data, i18nData }">
                <FormDeptId :formData="formData" :i18nData="i18nData" :fieldData="data" />
            </template>
        </form-data>
        <el-row type="flex" class="container_h">
            <collapse v-if="tableType == '2'">
                <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <span class="ov_head_title">物料分类</span>
                        <el-tree class="drawer-tree" node-key="matlClassifyId" :indent="0" :data="dataOptions"
                            :props="defaultProps" :expand-on-click-node="false" ref="tree" :highlight-current="true"
                            :filter-node-method="filterNode" @node-click="handleNodeClick" />
                    </div>
                </el-col>
            </collapse>
            <el-col :span="20" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :menuId="menuId" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick">
                    <template v-slot:tab>
                        <orderDetailType :value="tableType" @input="handleTableTypeChange" />
                    </template>
                </right-toolbar>
                <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
                    :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
                    @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
                    <template slot="status" slot-scope="scope">
                        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />
                        {{ scope.value | fieldFormat(scope.fieldFormatArr) }}
                    </template>

                    <template slot="refundStatus" slot-scope="scope">
                        <span :class="'scStatus-' + scope.value">{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}</span>
                    </template>
                    <template v-if="tableType === '1'" slot="fileList" slot-scope="scope">
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
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { PuReturnList, PuReturnRawList, PuReturnSubmit, exportDetailList, PuReturnRawBatchRemove, PuReturnBatchRemove } from '@/api/purchasingManagement/return'
import fileList from '@/views/components/fileList/index'
import { download } from '@/utils/request'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import collapse from '@/components/Collapse'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import FormUnitId from '@/views/components/form-unitId'
import FormDeptId from '@/views/components/form-deptId'
export default {
    name: 'purchaseReturn',
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
    components: { FormDeptId, collapse, fileList, orderDetailType, activitiAssignee, workFlowView, FormUnitId },
    data() {
        const arg = this.tableType == '2' ? { matlClassifyId: '全部' } : {}
        return {
            dataOptions: [],
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
            filterText: "",
            treeLoading: false,
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
            // 表单参数
            formData: {
                matlClassifyId: '',
            },
            formDataClick: {
                ...arg
            },
            workFlowViewVisible: false,
            selectedRow: null,
            menuId: ''
        }

    },
    created() {
        this.menuProperty({ '1': '', '2': menuConfig.MENU_REFUND_BRANCH }[this.tableType])
        this.tableType == '2' && this.getTreeList()
    },
    methods: {
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
            this.getList()
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlClassifyName, value) || data.matlClassifyCode.indexOf(value) !== -1;
        },
        getTreeList() {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.dataOptions = data || [];
            }).finally(() => {
                this.treeLoading = false;
            })
        },
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                if (this.tableType === '2') {
                    for (let i = 0; i < data.search.length; i++) {
                        if (["matlClassifyId"].includes(data.search[i].fieldCode)) {
                            data.search[i]['clear'] = true
                            break
                        }
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
            if (['push'].includes(button.buttonCode) && (!['3'].includes(row.status) || this.tableType == '1' || row.refundNum == row.outQuoteNum)) {
                return true
            }
            if (['submit', 'flowSee'].includes(button.buttonCode) && this.tableType == '2') {
                return true
            }
            if (['update', 'delete', 'submit'].includes(button.buttonCode) && !['0', '1'].includes(row.status)) {
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
                if (this.tableType == '2') {
                    const isFefundId = rowArr.every((item, index, arr) => {
                        return item.refundId == rowArr[0].refundId
                    })
                    if (!isFefundId) {
                        this.$modal.msgError('只能选择同一个退料单号修改');
                        return
                    }
                }
                this.$router.push({
                    name: 'purchaseReturnOperate',
                    query: { type: buttonCode, id: idArr.join(','), tableType: this.tableType }
                })
            } else if (buttonCode === 'delete') {
                this.$modal.confirm(this.tableType === '1' ? '是否确认删除？' : '是否删除该明细信息?').then(() => {
                    return this.tableType === '1' ? PuReturnBatchRemove({ ids: idArr }) : PuReturnRawBatchRemove({ ids: idArr })
                }).then((data) => {
                    if (data.success) {
                        this.getList()
                        this.refreshChange(this.refName)
                        this.$modal.msgSuccess('删除成功')
                    } else {
                        this.getList()
                        this.$modal.msgError(data.message)
                    }

                }).catch(() => {
                })
            } else if (buttonCode === 'create') {
                this.$router.push({ name: 'purchaseReturnOperate', query: { type: buttonCode } })
            } else if (buttonCode === 'submit') {
                this.ids = rowArr.map(({ id }) => id)
                this.handleSubmit(ACTIVITI_ASSUGNEE.PU_REFUND)
            } else if (buttonCode === 'flowSee') {
                this.ids = rowArr.map(({ id }) => id)
                this.workFlowViewVisible = true
                this.selectedRow = { businessId: this.ids[0] }
            } else if (buttonCode === 'push') {
                this.ids = rowArr.map(({ id }) => id)
                this.$router.push({ name: 'outboundMaintenanceOperate', query: { type: 'outbound', ids: this.ids.join(','), name: 'purchaseReturn', outSource: '8' } })
            } else if (buttonCode === 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
            } else if (buttonCode === 'withdraw') {
                this.handleWithdraw({ businessId: this.ids[0], businessType: ACTIVITI_ASSUGNEE.PU_REFUND, })
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true
            if (this.tableType === '1') {
                PuReturnList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list
                    this.total = data.total
                }).finally(() => {
                    this.loading = false
                })
            } else {
                PuReturnRawList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list
                    this.total = data.total
                }).finally(() => {
                    this.loading = false
                })
            }
        },
        handleChange(val) {
            this.menuProperty()
            this.getList()
        },
        handleDelete(ids) {
            this.$modal.confirm('是否确认删除?').then(() => {
                return this.tableType == '1' ? PuReturnBatchRemove({ ids }) : PuReturnRawBatchRemove({ ids })
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
            PuReturnSubmit({ ids: this.ids, assignee: assignee }).then(({ success, data, message }) => {
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
        linkClick(scope) {
            this.$refs.fileList.init(scope.value)
        },
        clickLink(row, name) {
            if (name === 'refundCode') {
                this.$router.push({
                    name: 'purchaseReturnOperate',
                    query: {
                        type: 'view',
                        id: this.tableType == '2' ? row.refundId : row.id,
                    }
                })
            } else if (name === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'purchaseReturn', type: 'view', id: row.projectId } })
            } else if (name === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'purchaseReturn' } });
            } else if (name === 'suCode') {
                this.$router.push({ name: 'supplierOperate', query: { type: 'view', id: row.suId, name: 'purchaseReturn' } });
            } else if (name === 'batchNo') {
                this.$router.push({ name: 'batchNoDetail', query: { type: 'view', id: row.batchNo, name: 'purchaseReturn' } });
            }
        },
    }
}
</script>

<style lang="scss" scope>
.purchaseOrder_radio {
    margin-left: 20px;
    margin-top: 16px;
}
</style>
