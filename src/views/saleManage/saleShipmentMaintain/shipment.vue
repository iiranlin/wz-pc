<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
          @handleQuery="handleQuery" @handleResetField="handleResetField">
          <template v-slot:unitName="{data, i18nData}">
            <FormUnitId :formData="formData" :i18nData="i18nData" :fieldData="data" />
          </template>
        </form-data>
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []" :menuId="menuId"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick">
            <template v-slot:tab>
                <orderDetailType :value="tableType" @input="handleTableTypeChange" />
            </template>
        </right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableIndexs="tableIndex" :tableData="list"
            :buttonDisable="handleButtonDisable" :property="property" :numberShow="numberShow" :menuId="menuId"
            @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @selectChange="selectChange"
            @emitAblFilter="emitAblFilter" @clickLink="clickLink">
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
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <fileList ref="fileList" />
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
        <activitiyTmpl ref="activitiyTmpl" @confirm="handleTmplConfirm"></activitiyTmpl>

        <Dialog title="上传附件" :visible.sync="openDataScope" width="1000px" :close-on-click-modal="false" append-to-body
            v-loading="fileDataLoading">
            <attachmentTable ref="attachmentTable" businessType="02" queryType="create" v-model="fileData">
            </attachmentTable>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="btnFile">确 定</el-button>
                <el-button @click="openDataScope = false">取 消</el-button>
            </div>
        </Dialog>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { deliveryList, deliveryDetailList, deliveryRemoveDetail, deliveryRemoveOrder, deliverySubmit, exportDetailList, deliverySaveFile } from '@/api/prodmgr-sa/delivery'
import fileList from '@/views/components/fileList/index'
import { menuConfig } from '@/utils'
import orderDetailType from '@/views/components/orderDetailType'
import { download } from '@/utils/request'
import attachmentTable from '@/views/components/attachmentTable'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import activitiyTmpl from '@/views/print/activitiyTmpl'
import FormUnitId from '@/views/components/form-unitId'
export default {
    name: "saleShipmentMaintain",
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
    components: { fileList, orderDetailType, attachmentTable, activitiAssignee, workFlowView, activitiyTmpl, FormUnitId },
    data() {
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
                pageSize:  30,
            },
            // 表单参数
            formData: {
                matlClassifyId: '',
            },
            formDataClick: {},
            workFlowViewVisible: false,
            selectedRow: null,
            menuId: '',
            defaultProps: {
                children: "children",
                label: "matlClassifyName",
            },
            treeCurrentKey: '',
            openDataScope: false,
            fileDataLoading: false,
            fileData: [],
            fileDataId: ''
        };

    },
    created() {
        this.menuProperty({ '1': '', '2': menuConfig.MENU_XSCHWH_BRANCH }[this.tableType])
    },
    methods: {
        menuProperty(id = '') {
            this.menuId = id || this.$route.meta.id;
            this.$store.dispatch('menuProperty', this.menuId).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
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
            if (['outbound'].includes(button.buttonCode) && (!['3'].includes(row.status) || !['2', '3'].includes(row.deliveryStatus))) {
                return true
            }
            if (['submit', 'flowSee'].includes(button.buttonCode) && this.tableType == '2') {
                return true
            }
            if (['update', 'delete', 'submit', 'Import'].includes(button.buttonCode) && !['0', '1'].includes(row.status)) {
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
            this.getList();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selection = selection
        },
        handleResetField() {
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
            } else {
                this.treeCurrentKey = data.matlClassifyId;
                this.formData.matlClassifyId = data.matlClassifyId;
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
                this.$router.push({ name: 'saleShipmentMaintainOperate', query: { type: buttonCode, id: idArr.join(','), tableType: this.tableType } })
            } else if (buttonCode === 'delete') {
                this.handleDelete(idArr);
            } else if (buttonCode === 'create') {
                this.$router.push({ name: 'saleShipmentMaintainOperate', query: { type: buttonCode } })
            } else if (buttonCode == 'submit') {
                this.ids = idArr
                this.handleSubmit(ACTIVITI_ASSUGNEE.SA_CHD)
            } else if (buttonCode === 'flowSee') {
                this.workFlowViewVisible = true;
                this.selectedRow = { businessId: idArr[0] };
            } else if (buttonCode === 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                download(`${exportDetailList}`, Object.assign({}, this.formData, this.listQuery, { exportColumns }));
                return
            } else if (buttonCode === 'Import') {
                this.fileDataId = idArr[0]
                this.fileData = rowArr[0].fileList || []
                this.openDataScope = true
                return
            } else if (buttonCode === 'outbound') {
                this.$router.push({ name: 'outboundMaintenanceOperate', query: { name: 'saleShipmentMaintain', type: 'outbound', outSource: '4', ids: idArr.join(',') } })
                return
            }  else if (buttonCode === 'withdraw') {
                this.handleWithdraw({ businessId: idArr[0], businessType: ACTIVITI_ASSUGNEE.SA_CHD, })
            }  else if (buttonCode === 'outboundSee') {
                this.$router.push({ name: 'outboundMaintenanceQuery', params: { deliveryCode: rowArr[0].deliveryCode } })
                return
            }
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            if (this.tableType == '1') {
                deliveryList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list || [];
                    this.total = data.total || 0;
                }).finally(() => {
                    this.loading = false;
                })
            } else {
                deliveryDetailList(Object.assign({}, this.listQuery, this.formData)).then(({ data }) => {
                    this.list = data.list || [];
                    this.total = data.total || 0;
                }).finally(() => {
                    this.loading = false;
                })
            }
        },
        handleDelete(ids) {
            this.$modal.confirm(this.tableType == '1' ? '是否确认删除？' : '是否删除该明细信息?').then(() => {
                return this.tableType == '1' ? deliveryRemoveOrder({ ids }) : deliveryRemoveDetail({ ids });
            }).then((data) => {
                if (data.success) {
                    this.getList();
                    this.refreshChange(this.refName)
                    this.$modal.msgSuccess("删除成功");
                } else {
                    this.$modal.msgError(data.message);
                }
            }).catch(() => { });
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            deliverySubmit({ ids: this.ids, assignee }).then(({ success, data, message }) => {
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
            const pushObj = {
                deliveryCode: { name: 'saleShipmentMaintainOperate', query: { type: "view", id: this.tableType == '1' ? row.id : row.deliveryId } },
                projectCode: { name: 'projectManagementOperate', query: { type: "view", id: row.projectId, name: 'saleShipmentMaintain' } },
                ctCode: { name: 'contractManagementOperate', query: { type: "view", id: row.ctId, name: 'saleShipmentMaintain' } },
                cuCode: { name: 'customerProfileAdd', query: { type: "view", id: row.cuId, name: 'saleShipmentMaintain' } },
                matlCode: { name: 'materialArchivesOperate', query: { type: "view", matlCode: row.matlCode, name: 'saleShipmentMaintain' } },
                saleOrderCode: { name: 'saleOrderOperate', query: { type: "view", id: row.saleOrderId, name: 'saleShipmentMaintain' } }
            }
            pushObj[fieldCode] && this.$router.push(pushObj[fieldCode]);
        },
        linkClick(scope) {
            this.$refs.fileList.init(scope.value)
        },
        btnFile() {
            this.fileDataLoading = true
            deliverySaveFile({ id: this.fileDataId, fileList: this.fileData }).then(({ message }) => {
                this.$modal.msgSuccess(message)
                this.openDataScope = false
                this.getList()
                this.refreshChange(this.refName)
            }).finally(() => {
                this.fileDataLoading = false
            })
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
