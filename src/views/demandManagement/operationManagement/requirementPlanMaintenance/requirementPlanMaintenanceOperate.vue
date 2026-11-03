<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
           
            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" v-if="tableType == '1'" :class="{'formRender_view': queryType === 'view'}"
                @appendButtonClick="handleAppendButtonClick" @buttonClick="handleButtonClick"
                @selectChange="selectChange" @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect">
                <template slot="design_p1">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
                </template>
                <template slot="design_p2">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="17" :queryType="queryType"
                            v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <div slot="detailedData">
                    <detailedList ref="detailedList" :dict="dict.type" :queryType="queryType" :tableType="tableType">
                    </detailedList>
                </div>
            </VFormRender>
            <detailedList v-else style="margin-top: 50px;" ref="detailedList" :dict="dict.type" :queryType="queryType"
                :tableType="tableType"></detailedList>
        </div>
        <selectProject ref="selectProject" singleMode @selections="selections" :propsFormData="propsFormDataProject"/>
        <choice-material ref="choiceMaterial" @choiceMaterialClick="choiceMaterialClick"></choice-material>
        <toBeReviewed ref="toBereview" />
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import indexMixin from '@/views/mixins'
import { NeedPlanCreateCreate, NeedPlanDetailCreateCreate, NeedPlanSaveSubmit, NeedPlanDetail, NeedPlanRawBatchListById } from '@/api/prodmgr-pu/NeedPlan';
import { deptTree,getUnitTree } from '@/api/system/dept'
import { getToken } from '@/utils/auth'
import detailedList from './components/detailedList'
import selectProject from "@/views/components/selectProject"
import choiceMaterial from '@/views/components/choice-material'
import attachmentTable from '@/views/components/attachmentTable'
import { generateUUID } from '@/utils'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
export default {
    name: "requirementPlanMaintenanceOperate",
    mixins: [indexMixin],
    components: { VFormRender, toBeReviewed, detailedList, selectProject, choiceMaterial, attachmentTable },
    dicts: ['MeasureUnit'],
    data() {
        return {
            loading: false,
            queryType: '',
            queryId: '',
            queryName: '',
            formJson: {},
            formData: {},
            // 菜单按钮、字段等数据
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
                { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
                { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
                { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
                { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'view, update' }
            ],
            queryAuditArr: null,
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '17',
            },
            status: '',
            tableType: '1',
            checked: false,
            fileList: [],
            isQuery: '',
            propsFormDataProject: {
                unitId: ''
            },
        }
    },
    computed: {
        ...mapGetters(['infoData']),
    },
    created() {
        this.init();
    },
    methods: {
        buttonShow(item) {
          if (item.buttonCode === 'rollbackToPrevious') {
            const query = this.isDialog ? this.dialogQuery : this.$route.query
            return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
              && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
              && this.buttonShow({ ...item, buttonCode: 'reject' })
          }
            if (['saveSubmit'].includes(item.buttonCode) && this.queryType == 'create') {
                return true
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.status)) {
                return false
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && (this.queryName == 'toBeDeal' || this.isQuery == 'query')) {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            }else {
                return false
            }

        },
        init() {
            let { type, name, id, auditArr, tableType, isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'requirementPlanMaintenance';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.tableType = tableType || '1';
            this.isQuery = isQuery
            this.$nextTick(async () => {
                if (this.queryType != 'create' && tableType === '2') {
                    this.getNeedPlanDetail();
                    return
                }
                await this.formFillInPage();
                this.$refs['vFormRef'].resetForm();
                await this.getDeptTreeData();
                await this.getUnitTree()
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                    this.$refs['vFormRef'].hideWidgets(['addButton', 'deleteButton']);
                }
                if (this.queryType != 'create') {
                    this.getNeedPlanDetail();
                }
                this.queryType == 'create' && this.initUnitInfo()
            })
        },
        async getUnitTree() {
            const res = await getUnitTree({ status: 0 })
            this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('makeDeptId').loadOptions(res.data || []);
        },
        getNeedPlanDetail() {
            this.loading = true;
            if (this.tableType == '1') {
                NeedPlanDetail(this.queryId).then(({ data }) => {
                    this.status = data.status;
                    this.$refs.detailedList.init(data.detailList);
                    delete data.detailList;
                    if(!data.makeDeptId) {
                        data.makeDeptId = undefined
                    }
                    this.$refs["vFormRef"].setFormData(data);
                    this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                }).finally(() => {
                    this.loading = false;
                });
            } else {
                const ids = this.queryId.split(',');
                NeedPlanRawBatchListById({ids}).then(({ data }) => {
                    this.$refs.detailedList.init(data);
                }).finally(() => {
                    this.loading = false;
                });
            }
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('requirementPlanMaintenanceOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        checkoutStatus() {
            const fields = ['demandCode', 'demandSource', 'demandPurpose', 'makeDeptId', 'remarks', 'fileList', 'design_p2', 'grid18700', 'grid96921', 'grid79506']
            if (this.checked) {
                this.$refs['vFormRef'].hideWidgets(fields);
            } else {
                this.$refs['vFormRef'].showWidgets(fields);
            }
        },
        selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
            if(fieldName == 'projectCode') {
                this.$refs.vFormRef.setFieldValue("projectCode",'');
                this.$refs.vFormRef.setFieldValue("projectId",'');
                this.$refs.vFormRef.setFieldValue("projectName", '');
            }
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
                this.$refs.vFormRef.setFieldValue('unitName', node.deptName);

                this.$refs['vFormRef'].setFieldValue('projectId', '')
                this.$refs['vFormRef'].setFieldValue('projectCode', '')
                this.$refs['vFormRef'].setFieldValue('projectName', '')
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
                    this.$refs['vFormRef'].setFieldValue("makeDeptName", "");
                }
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};

            const unitId = this.$refs.vFormRef.getFieldValue("unitId");
            if(!unitId){
                this.$modal.msgError('请先选择所属组织')
                return
            }
            this.propsFormDataProject.unitId = unitId;

            if (name === 'projectCode') {
                const pId = this.$refs['vFormRef'].getFieldValue('projectId');
                this.$refs.selectProject.init(pId);
                return
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            if (name === 'addButton') {
                const detailsList = this.$refs.detailedList.tableData.detailsList;
                this.$refs.choiceMaterial.init(null, [], detailsList);
            }
            if (name === 'deleteButton') {
                this.$refs.detailedList.removeData();
            }
        },
        /*选择项目信息*/
        selections(row) {
            const projectId = row.id
            delete row.id
            this.$refs['vFormRef'].setFormData({ ...row, projectId: projectId });
        },
        choiceMaterialClick(data) {
            const arrData = data.map((item) => {
                return Object.assign({}, item, { isMainMatl: '1', lossRate: 0, childNum: 1, baseNum: 1, unitNum: 1 })
            })
            this.$refs.detailedList.init(arrData, true);
        },
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        newButton(buttonCode) {
          if (buttonCode === 'rollbackToPrevious') {
            this.$refs.toBereview.init('rollbackToPrevious', this.queryAuditArr, this.queryName || this.name)
            return
          }
            if (buttonCode === 'edit') {
                this.queryType = 'update';
                this.$refs['vFormRef'].setReadMode(false);
                this.$refs['vFormRef'].showWidgets('addButton');
                this.$refs['vFormRef'].showWidgets('deleteButton');

            } else if (buttonCode === 'cancel') {
                this.cancel(this.queryName);
            } else if (buttonCode === 'save') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'saveSubmit') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
            } else if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
            }
        },
        async handleSave(buttonCode) {
            try {
                const detailedList = this.$refs['detailedList'];
                if (this.tableType == '2') {
                    detailedList.$refs.elForm.validate(valid => {
                        if (valid) {
                            NeedPlanDetailCreateCreate(detailedList.tableData.detailsList).then(({ message }) => {
                                this.$modal.msgSuccess(message);
                                this.cancel(this.queryName);
                            }).finally(() => {
                                this.loading = false;
                            });
                        }
                    })
                    return
                }
                const vFormRefData = new Promise((resolve, reject) => {
                    return this.$refs.vFormRef.getFormData().then(formData => {
                        resolve(formData)
                    }).catch(error => {
                        reject()
                    })
                })
                const pList = new Promise((resolve, reject) => {
                    return detailedList.$refs.elForm.validate(valid => {
                        if (valid) {
                            resolve(detailedList.tableData.detailsList)
                        } else {
                            reject()
                        }
                    })
                })
                const data = await Promise.all([vFormRefData, pList])
                let api = NeedPlanCreateCreate
                let param = { ...data[0], detailList: data[1], fileList: this.fileList }
                const saveObj = {
                    'save': () => { this.saveOrder(api, param) },
                    'saveSubmit': () => {
                        this.$reviewerDialog({
                            type: ACTIVITI_ASSUGNEE.PU_NP,
                            multiple: false,
                            success: (assignee) => {
                                this.saveOrder(NeedPlanSaveSubmit, param, assignee)
                            }
                        })
                    }
                }
                saveObj[buttonCode] && saveObj[buttonCode]()
            } catch (err) {
                this.$modal.msgError('表单数据校验失败');
                console.error(err)
            }
        },
        async saveOrder(url, param, assignee) {
            if(!this.resOk) {
            const res = await url({ ...param, assignee })
            res.success && this.$modal.msgSuccess(`${res.message}`)
            this.resOk = true
            this.cancel(this.queryName)
            }
        },
    }
};
</script>
<style lang="scss" scoped>
::v-deep .custom_button {
    .el-button {
        transform: translateY(-1px);
        background: #ffffff !important;
        border-radius: 50px;
        font-size: 12px;
        text-align: center;
        height: 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 5px 30px 5px 30px;
        position: relative;
        min-width: 100px;
        margin-right: 6px;
        border: 1px solid #1890ff;
        box-sizing: border-box;
        line-height: 22px;
    }
}
</style>