<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow"
            @newButton="newButton"></button-top>
        <div class="container_flex_form">
            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
                active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :class="{ 'formRender_view': queryType === 'view' }"
                @appendButtonClick="handleAppendButtonClick" @buttonClick="handleButtonClick"
                @formChange="handleFormChange" @selectChange="selectChange" @treeSelectInput="treeSelectInput"
                @treeSelectSelect="treeSelectSelect">
                <template slot="isReplace" slot-scope="scope">
                    <div style="display: flex;flex-direction: column;">
                        <el-radio-group v-model="scope.formModel.isReplace" v-if="queryType !== 'view'">
                            <el-radio label="0">否
                                <tooltip content="替代料有库存时，系统不自动计算使用，但用户可手动添加替代料；适用经验充足的用户。" />
                            </el-radio>
                            <el-radio label="1">是
                                <tooltip content="替代料有库存时，系统自动计算适用，计算结果数据用户可手动修改。" />
                            </el-radio>
                        </el-radio-group>
                        <span v-else>
                            {{ { 0: '否', 1: '是' }[scope.formModel.isReplace] }}
                        </span>
                    </div>
                </template>
                <template v-slot:planTabs>
                    <div class="attachmentTableTop" v-if="queryType !== 'view' && tableType == '1'">
                        <button-top :showDropdown="false" :buttonTopData="tableButtonTop" :buttonShow="handleButtonShow"
                            :button-disable="handleTopButtonDisabled" @newButton="handleNewButton"
                            style="margin-top: 0;padding: 3px 0 0 0 !important;"></button-top>
                    </div>
                    <el-tabs v-model="activeTabName">
                        <el-tab-pane label="生产计划" name="detailedList">
                            <detailedList :detail="handleDetail" :buttonTop="tableButtonTop" ref="detailedList"
                                @change="handleDateChange" @preparation="handlePreparation" :queryType="queryType"
                                :tableType="tableType" :unitId="unitId" />
                        </el-tab-pane>
                        <el-tab-pane name="purchasePlanList">
                            <span slot="label">采购计划
                                <tooltip content="数据来源生产计划下备料的计划属性=采购的数据汇总；即系统展算后，把需要采购的物料进行汇总。" />
                            </span>
                            <purchasePlanList ref="purchasePlanList" :queryType="queryType" :tableType="tableType" />
                        </el-tab-pane>
                    </el-tabs>
                </template>
                <!-- 备料信息 -->
                <template v-slot:preparation>
                    <preparationList :detail="handleDetail" ref="preparationList" :unitId="unitId"
                        @update="handleUpdate" @refresh="handleRefresh" @remove="handleRemove" :queryType="queryType"
                        :tableType="tableType" />
                </template>
            </VFormRender>

        </div>
        <toBeReviewed ref="toBereview" />
        <orderDetail ref="orderDetailRef" />
    </div>
</template>

<script>
import attachmentTable from '@/views/components/attachmentTable'
import { formFillInPage } from '@/api/form/form'
import { planSaveOrder, planSaveDetail, planOrderView, planDetailView, planSaveSubmit } from '@/api/prodmgr-mm/demandPlan';
import { deptTree, getUnitTree } from '@/api/system/dept'
import { getUserInfo } from '@/utils/user-info'
import detailedList from "./components/detailedList"
import orderDetail from '@/views/components/orderDetail'
import purchasePlanList from "./components/purchasePlanList"
import preparationList from "./components/preparationList"
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import indexMixin from '@/views/mixins';
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
export default {
    mixins: [indexMixin],
    name: "demandPlanWorkbenchOperate",
    components: {
        orderDetail,
        VFormRender,
        attachmentTable,
        detailedList,
        toBeReviewed,
        purchasePlanList,
        preparationList,
        tooltip: () => import('@/components/tooltip')
    },
    dicts: ['MeasureUnit', 'planAttribute', 'demandPlanSourceType'],
    data() {
        return {
            activeTabName: 'detailedList',
            loading: false,
            queryType: '',
            queryId: '',
            queryName: '',
            formJson: {},
            formData: {},
            tableButtonTop: [
                { buttonName: '选择需求', buttonCode: 'addDemand' },
                { buttonName: '选择BOM', buttonCode: 'addBOM' },
                { buttonName: '选择物料', buttonCode: 'addMaterial' },
                { buttonName: '删除', buttonCode: 'delete' },
                { buttonName: '存量查询', buttonCode: 'query', options: "{\"prompt\":\"查询和刷新以下列表物料库存量，无须勾选\"}" },
                { buttonName: '子件刷新', buttonCode: 'refresh', options: "{\"prompt\":\"当修改了计划数量、修改了BOM版本，修改了计划属性，都需要点击子件刷新才能重新展算；无须勾选数据\"}" },
                { buttonName: '计划合并', buttonCode: 'merge', options: "{\"prompt\":\"需求合并的维度：同物料、同计划属性、同项目。无须勾选数据。<br>比如“销售订单001”和“销售订单002”其BOM中都包含物料 A，展算001时，A需要100； 展002时A需要200； 如果合并需求，只产生一条数据即A需求300；如果需求不合并，依然是两条数据；优点：需求合并利于统一计划；缺点：合单后追溯不便。\"}" },
            ],
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
            userInfo: getUserInfo(),
            status: '1',
            tableType: '1',
            openDataScope: false,
            checked: false,
            isQuery: '',
            unitId: ''
        }
    },
    created() {
        this.init();
    },
    methods: {
        handleDetail(code, row) {
            const query = {
                unitId: this.unitId,
                matlCode: row.matlCode
            }
            this.$refs.orderDetailRef.init(query, {
                inventoryNum: 'invNum',
                purNoInNum: 'purNoInNum'
            }[code])
        },
        handleNewButton(buttonCode) {
            this.$refs.detailedList.handleNewButton(buttonCode)
        },
        handleTopButtonDisabled({ buttonCode }) {
            if (buttonCode == 'delete') {
                return !this.$refs.detailedList.selectData.length
            }
            if (['query', 'refresh', 'merge'].includes(buttonCode)) {
                return !this.$refs.detailedList.tableData.detailsList.length
            }
            return false
        },
        // 明细按钮权限
        handleButtonShow() {
            return true
        },
        handleUpdate(list = []) {
            this.$refs.detailedList.updatePlan(list)
        },
        handleRefresh(func) {

            this.$refs.detailedList.refreshPlan(func)
        },
        handleRemove(row, rows) {
            this.$refs.detailedList.removePreparation(row, rows)
        },
        handleDateChange(list = []) {
            this.$refs.purchasePlanList.init(list)
        },

        handlePreparation(row) {
            this.$refs.preparationList.init(row)
        },
        handleFormChange(fieldName, newValue, oldValue) {
            if (fieldName == 'unitId' && newValue != oldValue) {
                this.unitId = newValue
                this.$refs.detailedList.init({})
            }
        },
        checkoutStatus(flag) {
            const widgets = ['planName', 'makeDeptId', 'grid96921', 'card112021']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        buttonShow(item) {
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && (!['0', '1'].includes(this.status) || this.tableType == '2' || this.queryName == 'toBeDeal' || this.isQuery == 'query')) {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        init() {
            let { type, name, id, auditArr, tableType, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'demandPlanWorkbench';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.tableType = tableType || '1';
            this.isQuery = isQuery
            this.$nextTick(async () => {
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();
                await this.getDeptTreeData();
                await this.getUnitTree()
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                }
                if (this.tableType != '1') {
                    this.$refs["vFormRef"].hideWidgets(['baseInfo'])
                }
                if (['update', 'view'].includes(this.queryType) && tableType === '2') {
                    this.getDetail();
                    return
                }

                if (this.queryType != 'create') {
                    this.getDetail();
                } else {
                    const { deptId, deptName, unitId, unitName } = this.userInfo;
                    this.$refs['vFormRef'].setFieldValue("makeDeptId", deptId);
                    this.$refs['vFormRef'].setFieldValue("makeDeptName", deptName);
                    this.initUnitInfo()
                }
            })
        },
        getDetail() {
            const apiUrl = this.tableType == '1' ? planOrderView : planDetailView
            this.loading = true;
            apiUrl(this.tableType == '1' ? this.queryId : { ids: this.queryId.split(',') }).then(({ data }) => {
                if (this.tableType == '1') {
                    this.status = data.status;
                    this.isReplace = data.isReplace
                    this.$refs["vFormRef"].setFormData(data);
                    this.$nextTick(() => {
                        this.$refs.detailedList.init(data.demandPlanExpandDTO);
                    })
                    delete data.detailList;
                } else {
                    if (this.queryType == 'view') {
                        this.status = ''
                    }
                    this.$nextTick(() => {
                        this.$refs.detailedList.init(data);
                    })
                }
            }).finally(() => {
                this.loading = false;
            });
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('makeDeptId').loadOptions(res.data || []);
        },
        async getUnitTree() {
            const res = await getUnitTree({ status: 0 })
            this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('demandPlanWorkbenchOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);

                    resolve(true);
                })
            })
        },
        selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "makeDeptId") {
                this.$refs.vFormRef.setFieldValue("makeDeptName", node.deptName);
            }
            if (name === 'unitId') {
                this.$refs.vFormRef.setFieldValue('unitName', node.deptName)
            }
        },
        treeSelectInput(vm, newVal) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "makeDeptId") {
                if (!newVal) {
                    this.$refs.vFormRef.setFieldValue("makeDeptName", '');
                }
            }
            if (name === 'unitId') {
                if (!newVal) {
                    this.$refs.vFormRef.setFieldValue('unitName', '')
                }
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        async newButton(buttonCode) {
            if (buttonCode === 'edit') {
                this.queryType = 'update';
                this.$refs['vFormRef'] && this.$refs['vFormRef'].setReadMode(false);
                this.$nextTick(() => {
                    this.getDetail();
                })
            } else if (buttonCode === 'cancel') {
                this.cancel(this.queryName);
            } else if (buttonCode === 'save' || buttonCode === 'saveSubmit') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
                return
            } else if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
            }
        },
        // 检测生产计划是否发生改变
        async checkPlanChange() {
            return new Promise(async (resolve) => {
                try {
                    const detailList = this.$refs.detailedList.tableData.detailsList
                    const isDivideChange = this.$refs.detailedList.isDivideChange
                    if (detailList.some(({ _bomVersion, bomVersion, planNum, _planNum }) => planNum !== _planNum || bomVersion !== _bomVersion) || isDivideChange) {
                        const flag = await this.$modal.confirm('计划信息>修改了计划数量，或修改了BOM版本，或修改了计划属性，需要点击"子件刷新"才能重新计算，是否需要重新计算？', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        })
                        if (flag) {
                            this.$refs.detailedList.handleRefresh()
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
        // 检测备料信息是否发生改变
        async checkBackupChange() {

            return new Promise(async (resolve) => {
                try {
                    const detailList = this.$refs.detailedList.tableData.detailsList
                    const arr = detailList.map(({ sparePartsList }) => sparePartsList).reduce((a, b) => a.concat(b), [])
                    if (arr.some(({ _pickingDemandNum, pickingDemandNum, planNum, _planNum, replaceList }) => planNum !== _planNum || pickingDemandNum !== _pickingDemandNum || Array.isArray(replaceList) && !!replaceList.length && replaceList.some(s => s.planNum != s._planNum || s.pickingDemandNum != s._pickingDemandNum))) {
                        const flag = await this.$modal.confirm('备料信息>修改了的备料，比如修改了备料数量，或删除备料，或新增备料，需要点击“刷新计划”按钮，是否需要刷新计划数据？', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        })
                        if (flag) {
                            this.$refs.preparationList.handleRefresh()
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
        async handleSave(buttonCode = 'save') {
            try {
                const formData = await this.$refs.vFormRef.getFormData()
                const detailListRef = this.$refs.detailedList
                const param = {
                    ...formData,
                    demandPlanExpandDTO: {
                        exception: detailListRef._exception || [],
                        purPlan: detailListRef._purPlan || [],
                        producePlan: detailListRef._producePlan || [],
                        purPlanDetail: detailListRef._purPlanDetail || [],
                        isReplace: formData.isReplace,
                        addList: [],
                        removeIds: [],
                    }
                }
                if (await this.checkPlanChange() || await this.checkBackupChange()) {
                    return
                }
                const saveObj = {
                    'save': () => { this.saveOrder(planSaveOrder, param) },
                    'saveSubmit': () => {
                        this.$reviewerDialog({
                            type: ACTIVITI_ASSUGNEE.MM_XQJH,
                            multiple: false,
                            success: (assignee) => {
                                this.saveOrder(planSaveSubmit, param, assignee)
                            }
                        })
                    }
                }
                saveObj[buttonCode] && saveObj[buttonCode]()
            } catch (err) {
                this.$modal.msgError('表单数据校验失败');
            }

        },
        saveOrder(url, formData, assignee) {
            this.loading = true;
            url({ ...formData, id: this.queryId, assignee }).then(({ message }) => {
                this.$modal.msgSuccess(message);
                this.cancel(this.queryName);
            }).finally(() => {
                this.loading = false;
            });
        }
    }
};
</script>
<style lang="scss" scoped></style>
