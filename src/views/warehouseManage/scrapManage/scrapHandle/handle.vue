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
            <collapse v-if="tableType == '2'">
                <el-col :xs="24" class="container_flex_overflow" v-loading="treeLoading">
                    <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                    </el-input>
                    <div class="head-container ov_head">
                        <el-tree class="drawer-tree" node-key="id" :indent="0" :data="deptOptions" :props="defaultProps"
                            :expand-on-click-node="false" ref="tree" :highlight-current="true"
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
                    @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
                    @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
                    <template slot="handleStatus" slot-scope="scope">
                        <span :class="'scStatus-' + scope.value">{{ scope.value | fieldFormat(scope.fieldFormatArr)
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
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { handleList, handleDetailList, handleRemoveDetail, handleRemovehandle, handleSubmit, exportDetailList, handleView } from '@/api/prodmgr-inv/scrapHandle'
import fileList from '@/views/components/fileList/index'
import { classTree } from '@/api/prodmgr-mm/matlClass';
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import collapse from '@/components/Collapse'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import FormUnitId from '@/views/components/form-unitId'
import FormWarehouseCode from '@/views/components/FormWarehouseCode'
export default {
    name: "scrapHandle",
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
    components: { fileList, orderDetailType, activitiAssignee, collapse, workFlowView, FormUnitId, FormWarehouseCode },
    data() {
        const arg = this.tableType == '2' ? { matlClassifyId: '全部' } : {}
        return {
            // 遮罩层
            loading: false,
            treeLoading: false,
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
            numberShow: false,
            // 页面属性
            property: {},
            total: 0,
            // 查询参数
            listQuery: {
                pageNum: 1,
                pageSize: 30,
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
            menuId: '',
            filterText: '',
            deptOptions: undefined,
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
            treeCurrentKey: ''
        };

    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
        // tableType: {
        //     handler(val) {
        //         this.menuProperty({ '1': '', '2': menuConfig.MENU_BFCZ_BRANCH }[val])
        //         this.getList()
        //     },
        //     immediate: true,
        // }
    },
    created() {
        this.classTree();
        this.menuProperty({ '1': '', '2': menuConfig.MENU_BFCZ_BRANCH }[this.tableType])
    },
    methods: {
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                for (let i = 0; i < data.search.length; i++) {
                    if (["matlClassifyId"].includes(data.search[i].fieldCode)) {
                        data.search[i]['clear'] = true
                        break
                    }
                }
                this.property = data;
            });
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(row.status)
            }
            if (['removeFromStock'].includes(button.buttonCode) && (this.tableType == '1' || !['3'].includes(row.status) || !['2'].includes(row.handleStatus))) {
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
            this.numberShow = val;
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns);
        },
        clickReset() {
            this.handleQuery();
        },
        //选择框回调
        selectChange(row) {
            let { formData, isWatch } = row;
            if (!isWatch) {
                this.handleQuery(formData);
            } else {
                this.formData = Object.assign({}, this.formData, formData);
            }
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
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
            this.getList();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, row) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = row
        },
        handleResetField() {
            this.formData.matlClassifyId = null;
            this.$refs.tree.setCurrentKey(null);
            this.treeCurrentKey = "";
            this.formDataClick.matlClassifyId = '全部';
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.name, value);
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
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            if (buttonCode === 'update') {
                if (this.tableType == '1' && idArr.length > 1) {
                    this.$modal.msgError('只能选择同一个主单修改');
                    return
                }
                this.$router.push({ name: 'scrapHandleOperate', query: { type: buttonCode, id: idArr.join(','), tableType: this.tableType } })
            } else if (buttonCode === 'delete') {
                this.handleDelete(idArr)
            } else if (buttonCode === 'create') {
                this.$router.push({ name: 'scrapHandleOperate', query: { type: buttonCode } })
            } else if (buttonCode == 'submit') {
                this.ids = idArr
                this.handleSubmit(ACTIVITI_ASSUGNEE.INV_BFCZ);
            } else if (buttonCode === 'flowSee') {
                this.workFlowViewVisible = true;
                this.selectedRow = { businessId: idArr[0] };
            } else if (buttonCode === 'removeFromStock') {
                this.$router.push({ name: 'outboundMaintenanceOperate', query: { name: 'scrapHandle', type: 'outbound', outSource: '3', ids: idArr.join(',') } })
            } else if (buttonCode === 'export') {
                this.handleExport();
            } else if (buttonCode === 'withdraw') {
                this.handleWithdraw({ businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.INV_BFCZ, })
            }
        },
        classTree() {
            this.treeLoading = true;
            classTree().then(({ data }) => {
                this.deptOptions = data || [];
            }).finally(() => {
                this.treeLoading = false;
            })
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            if (this.tableType == '1') {
                handleList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list || [];
                    this.total = data.total || 0;
                }).finally(() => {
                    this.loading = false;
                })
            } else {
                if (this.formData.matlClassifyId == '全部') {
                    delete this.formData.matlClassifyId
                }
                handleDetailList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list || [];
                    this.total = data.total || 0;
                }).finally(() => {
                    this.loading = false;
                })
            }
        },
        handleDelete(ids) {
            this.$modal.confirm("是否确认删除?").then(() => {
                return this.tableType == '1' ? handleRemovehandle({ ids }) : handleRemoveDetail({ ids });
            }).then(() => {
                if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                    this.listQuery.pageNum -= 1
                }
                this.getList();
                this.refreshChange(this.refName)
                this.$modal.msgSuccess("删除成功");
            })
        },
        async handleExport() {
            try {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                await exportDetailList(Object.assign({}, this.listQuery, this.formData, { exportColumns }))
            } catch (err) {
                console.error(err)
            }
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            handleSubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
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
        clickLink(row, fieldCode) {
            if (fieldCode === 'handleCode') {
                this.$router.push({ name: 'scrapHandleOperate', query: { type: "view", id: this.tableType == '1' ? row.id : row.handleId } });
            } else if (fieldCode === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'scrapHandle' } });
            } else if (fieldCode === 'projectCode') {
                this.$router.push({ name: 'projectManagementOperate', query: { name: 'scrapHandle', type: 'view', id: row.projectId } })
            } else if (fieldCode === 'batchNo') {
                this.$router.push({ name: 'batchNoDetail', query: { id: row.batchNo, type: 'view', name: 'scrapHandle' } })
            } else if (fieldCode === 'scrapCode') {
                this.$router.push({ name: 'scrapApplyOperate', query: { id: row.applyId, type: 'view', name: 'scrapHandle' } })
            }
        },
        async linkClick(scope) {
            let data = [];
            if (this.tableType == '1') {
                const res = await handleView(scope.data.id)
                data = res.data.fileList
                this.$refs.fileList.init(data)
            }
        }
    }
};
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
