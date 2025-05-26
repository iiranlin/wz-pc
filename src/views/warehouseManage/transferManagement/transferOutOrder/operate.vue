<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
            @newButton="newButton"></button-top>
        <div class="container_flex_form">

            <el-switch v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv"
                :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
                @selectChange="selectChange" @buttonClick="handleButtonClick" @treeSelectSelect="treeSelectSelect"
                @treeSelectInput="treeSelectInput" @operationButtonClick="operationButtonClick">
                <template slot="dividerOut">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />调出信息</p>
                </template>
                <template slot="dividerIn">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="调入信息" />调入信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="15" :queryType="queryType"
                            v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <div slot="detail">
                    <div v-if="queryType !== 'view'">
                        <el-button class="confirm" @click="selectInventory">选择库存</el-button>
                    </div>
                    <el-form :model="validateForm" ref="ruleForm">
                        <el-table :data="validateForm.detailList" border height="400px">
                            <el-table-column label="序号" align="left" type="index" width="60" />
                            <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip
                                min-width="150" />
                            <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip
                                min-width="150" />
                            <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip
                                min-width="130" />
                            <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip
                                min-width="130">
                                <template slot-scope="{row}">
                                    <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="inventoryNum" label="库存数量" align="left" show-overflow-tooltip
                                min-width="150" />
                            <el-table-column prop="allocateNum" label="调出数量" align="left" show-overflow-tooltip
                                min-width="230">
                                <template slot="header">
                                    <span style="color:red">*</span>
                                    <span>调出数量</span>
                                </template>
                                <template slot-scope="scope">
                                    <el-form-item :prop="'detailList.' + scope.$index + '.allocateNum'"
                                        :rules="[{ required: true, message: '请输入调出数量', trigger: ['change', 'blur'] }]">
                                        <span v-if="queryType == 'view'">{{ scope.row.allocateNum }}</span>
                                        <el-input-number v-else type="number" :min="0"
                                            :max="Number(scope.row.inventoryNum)" v-model="scope.row.allocateNum"
                                            placeholder="请输入调出数量" @input="rowNumChange(scope.row, scope.$index)" />
                                    </el-form-item>
                                </template>
                            </el-table-column>
                            <el-table-column prop="price" label="单价" align="left" min-width="230">
                                <template slot="header">
                                    <span>单价(不含税，单位：元)</span>
                                    <tooltip content="自动带出单价=依据算法计算出来的存货单价，用户可改" />
                                </template>
                                <template slot-scope="scope">
                                    <el-form-item :prop="'detailList.' + scope.$index + '.price'">
                                        <span v-if="queryType == 'view'">{{ $textMethod.money(scope.row.price) }}</span>
                                        <money-input v-else v-model="scope.row.price"
                                            @change="rowPriceChange(scope.row, scope.$index)"></money-input>
                                    </el-form-item>
                                </template>
                            </el-table-column>
                            <el-table-column prop="allocateAmount" label="调拨金额(不含税，单位：元)" align="left"
                                show-overflow-tooltip min-width="150">
                                <template slot-scope="scope">
                                    <span>{{ $textMethod.money(scope.row.allocateAmount) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="storageName" v-if="queryType !== 'view'" label="操作" align="center"
                                show-overflow-tooltip min-width="150">
                                <template slot-scope="scope">
                                    <el-button type="text" @click="deleteInventory(scope.row)">删行</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-form>
                </div>
            </VFormRender>
        </div>
        <selectProject ref="outselectProject" :propsFormData="{ unitId: outUnitId }" @selections="selectionsout"
            singleMode />
        <selectProject ref="inselectProject" :propsFormData="{ unitId: inUnitId }" @selections="selectionsin"
            singleMode />
        <SelectInventory ref="selectInventory" :propsFormData="propsFormData" @selections="selectOrder" />
        <toBeReviewed ref="toBereview" />
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import attachmentTable from '@/views/components/attachmentTable'
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { deptTree, getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { saveInventory, getAllocateDetail, allocateSaveSubmit } from '@/api/warehouseManage/transferOrder'
import { getWarehouseTree } from '@/api/warehouseManage/inventoryMaintenance'
import selectProject from "@/views/components/selectProject"
import SelectInventory from './components/selectInventory'
import { getUserInfo } from '@/utils/user-info'
import { generateUUID } from '@/utils'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
export default {
    name: "createTransferOutOrder",
    dicts: ['MeasureUnit'],
    mixins: [indexMixin],
    components: { VFormRender, selectProject, SelectInventory, attachmentTable, toBeReviewed, tooltip: () => import('@/components/tooltip') },
    data() {
        return {
            validateForm: {
                detailList: [],
            },
            loading: false,
            userInfo: getUserInfo(),
            queryType: '',
            displayFormat: 'yyyy-MM-DD',
            modelFormat: 'yyyy-MM-DD',
            queryId: '',
            operateType: '',
            queryName: '',
            formJson: {},
            formData: {},
            // 菜单按钮、字段等数据
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
                { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
                { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
                { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'create, update, view' },
            ],
            queryAuditArr: null,
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '01',
            },
            openDataScope: false,
            detailData: [],
            managerData: [],
            dataOptions: [],
            warehouseId: '',
            quAreaCode: null,
            selectRowList: [],
            optionsProps: {
                children: "children",
                label: "name",
                value: "code",
                checkStrictly: true
            },
            fileList: [],
            checked: false,
            status: '1',
            isQuery: '',
            outUnitId: '',
            inUnitId: '',
            propsFormData: {
                unitId: '',
                projectId: '',
            }
        }
    },
    computed: {
        ...mapGetters(['infoData']),
    },
    created() {
        this.init();
    },
    methods: {
        checkoutStatus(flag) {
            const widgets = ['allocateCode', 'makeDate', 'outProjectName', 'inProjectName', 'fileList', 'comments']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },

        selectInventory() {
            const outUnitId = this.$refs['vFormRef'].getFieldValue('outUnitId')
            if (!outUnitId) {
                this.$message.warning('请先选择调出所属组织')
                return
            }
            const outProjectId = this.$refs['vFormRef'].getFieldValue('outProjectId')
            // if (!outProjectId) {
            //     this.$message.warning('请先选择调出项目')
            //     return
            // }
            if (!this.formData.outWarehouseId) {
                this.$message.warning('请先选择调出仓库')
                return
            }
            this.propsFormData = {
                unitId: outUnitId,
                projectId: outProjectId
            }
            this.$refs.selectInventory.open(this.formData.outWarehouseId, this.validateForm.detailList);
        },
        deleteInventory(row) {
            this.validateForm.detailList = this.validateForm.detailList.filter(item => item.matlCode !== row.matlCode)
        },
        rowNumChange(row, index) {
            if (row.allocateNum && row.price) {
                this.validateForm.detailList[index].allocateAmount = Number(row.allocateNum) * Number(row.price)
            }
        },
        rowPriceChange(row, index) {
            if (row.allocateNum && row.price) {
                this.validateForm.detailList[index].allocateAmount = Number(row.allocateNum) * Number(row.price)
            }
        },
        selectOrder(list) {
            this.validateForm.detailList = this.validateForm.detailList.concat(list);
        },
        selectionsout(row) {
            this.$refs['vFormRef'].setFieldValue('outProjectName', row.projectName)
            this.$refs['vFormRef'].setFieldValue('outProjectCode', row.projectCode)
            this.$refs['vFormRef'].setFieldValue('outProjectId', row.id)
            // this.formData.outProjectCode = row.projectCode
            // this.formData.outProjectId = row.id
            
            this.cleanDetail();
        },
        selectionsin(row) {
            this.$refs['vFormRef'].setFieldValue('inProjectName', row.projectName)
            this.$refs['vFormRef'].setFieldValue('inProjectCode', row.projectCode)
            this.$refs['vFormRef'].setFieldValue('inProjectId', row.id)
            // this.formData.inProjectCode = row.projectCode
            // this.formData.inProjectId = row.id
        },
        handleSelectionChange(rowList) {
            this.selectRowList = rowList
        },
        deleteRow() {
            if (this.selectRowList.length === 0) return;
            const selectRowMap = new Map(this.selectRowList.map(row => [row.matlCode, true]));
            this.detailData = this.detailData.filter(item => !selectRowMap.has(item.matlCode));
        },
        unQuiltExclude() {
            if (this.selectRowList.length === 0) return;
            this.selectRowList.map(item => {
                this.detailData.map(row => {
                    if (row.matlCode === item.matlCode) {
                        item.unqualifiedInNum = 0
                    }
                })
            })
        },
        handleQualifiedInput(row, event) {
            this.detailData.map(item => {
                if (item.matlCode == row.matlCode) {
                    if (parseFloat(item.qualifiedInNum) < 0) {
                        item.qualifiedInNum = 0;
                    }
                }
            })
        },
        handleUnQualifiedInput(row, event) {
            this.detailData.map(item => {
                if (item.matlCode == row.matlCode) {
                    if (parseFloat(item.qualifiedInNum) < 0) {
                        item.unqualifiedInNum = 0;
                    }
                }
            })
        },
        handleDeleteRow(row) {
            this.detailData = this.detailData.filter(item => item.id !== row.id)
        },
        getUnQuAreaCodeValue(node, index, valueId) {
            this.detailData[index].unquWarehouseCode = valueId
            this.detailData[index].unquWarehouseId = node.id
            this.detailData[index].unquWarehouseName = node.name
        },
        getQuAreaCodeValue(node, index, valueId) {
            this.detailData[index].quWarehouseCode = valueId
            this.detailData[index].quWarehouseId = node.id
            this.detailData[index].quWarehouseName = node.name
        },
        buttonShow(item) {
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.status)) {
                return false
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && (this.queryName == 'toBeDeal' || this.isQuery == 'query')) {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        init() {
            let { type, name, id, auditArr, operateType, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.operateType = operateType || 'out',
                this.queryId = id || '';
            this.queryName = name || 'transferOutOrder';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.isQuery = isQuery
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                await this.getUnitTree()

                if (this.queryType === 'update' || this.queryType === 'view') {
                    this.$refs['vFormRef'].setReadMode(this.queryType === 'view');
                    this.getInDetail()
                } else {
                    this.$refs['vFormRef'].setReadMode(false);
                    if (this.queryType === 'create') {
                        this.$refs['vFormRef'].setFieldValue('makeDeptId', this.userInfo.deptId)
                        this.setUsersByDeptId(this.userInfo.deptId, this.userInfo.deptName, this.userInfo.nickName, false)
                        this.$refs['vFormRef'].setFieldValue('makeUserId', this.userInfo.id)
                        this.$refs['vFormRef'].setFieldValue('makeDate', new Date())
                        this.initUnitInfo(['outUnit', 'inUnit'])
                    }
                }
                await this.getDeptTreeData()
                this.getWarehouseTreeOut();
                this.getWarehouseTreeIn();
            })
        },
        async getUnitTree() {
            const res = await getUnitTree({ status: 0 })
            this.$refs['vFormRef'].getWidgetRef('outUnitId').loadOptions(res.data || [])
            this.$refs['vFormRef'].getWidgetRef('inUnitId').loadOptions(res.data || [])
        },
        async setUsersByDeptId(deptId, deptName, nickName, isClearUser) {
            const managerData = await userListAll({ deptId: deptId })
            this.formData.makeDeptName = deptName
            this.formData.makeUserName = nickName
            // 负责人清空
            if (isClearUser) {
                this.$refs['vFormRef'].setFieldValue('makeUserId', '')
            }
            this.$refs['vFormRef'].enableWidgets('makeUserId')
            this.$refs['vFormRef'].getWidgetRef('makeUserId').loadOptions(managerData.data.list || [])
            this.managerData = managerData.data.list || []
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('transferOutOrder').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        getInDetail() {
            this.loading = true;
            getAllocateDetail(this.queryId).then(({ data }) => {
                let showData = { ...data }
                this.getMeakUserList(showData)
                this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                showData.makeDate = new Date(showData.makeDate)
                this.formData.outWarehouseId = showData.outWarehouseId
                this.status = showData.status
                this.$refs['vFormRef'].setFormData(Object.assign(showData));
                this.validateForm.detailList = showData.detailList

                this.getWarehouseTreeOut()
                this.getWarehouseTreeIn()
            }).finally(() => {
                this.loading = false;
            });
        },
        getMeakUserList(showData) {
            userListAll({ deptId: showData.makeDeptId }).then(({ success, data, message }) => {
                if (success) {
                    this.$refs['vFormRef'].getWidgetRef('makeUserId').loadOptions(data.list || [])
                }
            })
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('makeDeptId').loadOptions(res.data || [])
        },
        handleWarehouseOptions(arr) {
            arr.map(item => {
                if (item.level != 1) {
                    item.disabled = true
                } else {
                    item.disabled = false
                }
                if (item.children && item.children.length) this.handleWarehouseOptions(item.children)
            })
        },
        getWarehouseTreeOut() {
            this.loading = true;
            let unitId = this.$refs['vFormRef'].getFieldValue('outUnitId')

            let params = {
                ofOrgan: unitId,
            }
            getWarehouseTree(params).then(({ data }) => {
                this.dataOptions = data || [];
                this.handleWarehouseOptions(this.dataOptions)
                this.$refs['vFormRef'].getWidgetRef('outWarehouseId').loadOptions(this.dataOptions || [])
            }).finally(() => {
                this.loading = false;
            })
        },
        getWarehouseTreeIn() {
            this.loading = true;
            let unitId = this.$refs['vFormRef'].getFieldValue('inUnitId')

            let params = {
                ofOrgan: unitId,
            }
            getWarehouseTree(params).then(({ data }) => {
                this.dataOptions = data || [];
                this.handleWarehouseOptions(this.dataOptions)
                this.$refs['vFormRef'].getWidgetRef('inWarehouseId').loadOptions(this.dataOptions || [])
            }).finally(() => {
                this.loading = false;
            })
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            if (name === 'outProjectName') {
                this.outUnitId = this.$refs['vFormRef'].getFieldValue('outUnitId')
                if (!this.outUnitId) {
                    this.$modal.msgError('请先选择所属组织')
                    return
                }
                const opId = this.$refs['vFormRef'].getFieldValue('outProjectId')
                this.$refs.outselectProject.init(opId); // out
            }
            if (name === 'inProjectName') {
                this.inUnitId = this.$refs['vFormRef'].getFieldValue('inUnitId')
                if (!this.inUnitId) {
                    this.$modal.msgError('请先选择所属组织')
                    return
                }
                const ipId = this.$refs['vFormRef'].getFieldValue('inProjectId')
                this.$refs.inselectProject.init(ipId);
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        cleanUp(name) {  /*清空表单里的数据*/
            let getContainerWidgets = this.$refs['vFormRef'].getContainerWidgets();
            getContainerWidgets.forEach((item) => {
                if (name.includes(item.name)) {
                    item.container.widgetList[0].cols.forEach((val) => {
                        this.$refs['vFormRef'].setFieldValue(val.widgetList[0].options.name, '');
                    })
                }
            })
        },
        newButton(buttonCode) {
            if (buttonCode === 'edit') {
                this.queryType = 'update';
                this.$refs['vFormRef'].setReadMode(false);
                return
            }
            if (buttonCode === 'cancel') {
                this.cancel(this.queryName)
            } else if (buttonCode === 'save' || buttonCode === 'saveSubmit') {
                this.saveFun(buttonCode)
                return
            } else if (buttonCode === 'update') {
                this.queryType = 'update';
                this.$refs['vFormRef'].setReadMode(false);
                this.$refs['vFormRef'].getWidgetRef('saleOrderDetails').setWidgetOption('showButtonsColumn', true);
            }
            if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
                return
            }
            if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
                return
            }
        },
        saveFun(buttonCode) {
            this.$refs.vFormRef.getFormData().then(formData => {
                if (this.validateForm.detailList.length === 0) {
                    this.$message.warning('请添加明细');
                    return
                }
                for (let i = 0; i < this.validateForm.detailList.length; i++) {
                    let item = this.validateForm.detailList[i];
                    if (!item.allocateNum || item.allocateNum === 0) {
                        this.$message.warning('请填写调出数量');
                        return
                    }
                    if (!item.price) {
                        this.$message.warning('请填写调出单价');
                        return
                    }
                }

                if (buttonCode === 'save') {
                    this.saveInterface(saveInventory, formData)
                } else {
                    this.$reviewerDialog({
                        type: ACTIVITI_ASSUGNEE.INV_DBD,
                        multiple: false,
                        success: (assignee) => {
                            this.saveInterface(allocateSaveSubmit, formData, assignee)
                        }
                    })
                }
            }).catch(err => {
                this.$modal.msgError('表单数据验证失败')
            })
        },
        saveInterface(url, formData, assignee) {
            this.loading = true;
            url({ ...formData, ...this.formData, id: this.queryId, detailList: this.validateForm.detailList, fileList: this.fileList, assignee }).then(({ success, message }) => {
                if (success) {
                    this.$modal.msgSuccess(message);
                    this.cancel(this.queryName)
                } else {
                    this.$modal.msgError(message);
                }
            }).finally(() => {
                this.loading = false;
            });
        },
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        operationButtonClick(dataTable, buttonName, rowIndex, row) {
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};

            if (name === "makeDeptId") {
                if (node.id) {
                    this.setUsersByDeptId(node.id, node.deptName, '', true)
                }
            }
            if (name === 'outWarehouseId') {
                this.formData.outWarehouseCode = node.code
                this.formData.outWarehouseName = node.name
                this.formData.outWarehouseId = node.id

                this.cleanDetail();
            }
            if (name === 'inWarehouseId') {
                this.formData.inWarehouseCode = node.code
                this.formData.inWarehouseName = node.name
                this.formData.inWarehouseId = node.id
            }
            if (name === 'outUnitId') {
                this.$refs.vFormRef.setFieldValue('outUnitName', node.deptName)

                this.$nextTick(() => {
                    this.cleanOutProject();
                    this.cleanOutWarehouse();
                    this.cleanDetail();
                    this.getWarehouseTreeOut();
                })
            }
            if (name === 'inUnitId') {
                this.$refs.vFormRef.setFieldValue('inUnitName', node.deptName)

                this.$nextTick(() => {
                    this.cleanInProject();
                    this.cleanInWarehouse();
                    this.getWarehouseTreeIn();
                })
            }
        },
        cleanOutProject(){
            this.$refs['vFormRef'].setFieldValue('outProjectName', '')
            this.$refs['vFormRef'].setFieldValue('outProjectCode', '')
            this.$refs['vFormRef'].setFieldValue('outProjectId', '')
        },
        cleanOutWarehouse(){
            this.$refs['vFormRef'].setFieldValue('outWarehouseId', '')
            this.$refs['vFormRef'].getWidgetRef('outWarehouseId').loadOptions([])

            this.formData.outWarehouseCode = '';
            this.formData.outWarehouseName = '';
            this.formData.outWarehouseId = '';
        },
        cleanInProject(){
            this.$refs['vFormRef'].setFieldValue('inProjectName', '')
            this.$refs['vFormRef'].setFieldValue('inProjectCode', '')
            this.$refs['vFormRef'].setFieldValue('inProjectId', '')
        },
        cleanInWarehouse(){
            this.$refs['vFormRef'].setFieldValue('inWarehouseId', '')
            this.$refs['vFormRef'].getWidgetRef('inWarehouseId').loadOptions([])

            this.formData.inWarehouseCode = '';
            this.formData.inWarehouseName = '';
            this.formData.inWarehouseId = '';
        },
        cleanDetail(){
            this.validateForm.detailList = [];
        },
        treeSelectInput(name, newVal) {
            if (!newVal) {
                this.$refs['vFormRef'].setFieldValue("saleId", "")
                this.$refs['vFormRef'].disableWidgets('saleId')
            }
        },
        selectChange(name, node) {
            if (name === 'makeUserId') {
                if (node !== '') {
                    this.formData.makeUserName = this.managerData.find(item => item.id === node).username || ''
                }
            }
        },
    }
};
</script>
<style lang="scss" scoped>
.confirm {
    height: 34px;
    border-radius: 50px;
    border: 1px solid #227aff;
    min-width: 100px;
    margin: 0 0 10px 15px;
    padding: 0;
}

.slotIcon-color {
    color: #1890ff;
}

.slotIcon-color-content {
    color: red;
}

.order-details {
    margin-top: 10px;
}

.button-with-tooltip {
    margin-left: 10px;
    display: flex;
    align-items: center;

    .un-quilt-btn {
        min-width: 100px;
        height: 32px;
        border: #1890ff solid 1px;
        border-radius: 50px;
    }
}

.button-with-tooltip i {
    margin-left: 5px;
}
</style>
