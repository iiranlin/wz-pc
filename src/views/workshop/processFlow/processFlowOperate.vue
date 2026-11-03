<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
            <el-switch v-if="tableType != '2'" v-model="checked" @change="checkoutStatus" class="checkbox_required"
                active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" v-if="tableType != '2'"
                :class="{ 'formRender_view': queryType === 'view' }" @appendButtonClick="handleAppendButtonClick"
                @buttonClick="handleButtonClick" @selectChange="selectChange" @treeSelectInput="treeSelectInput"
                @treeSelectSelect="treeSelectSelect" @formChange="handleFormChange">
                <template slot="design_p1">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />来源信息</p>
                </template>
                <template slot="design_p2">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="产品信息" />产品信息</p>
                </template>
                <template slot="design_p3">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="生产信息" />车间信息</p>
                </template>
                <template slot="design_p4">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="工艺信息" />工艺信息</p>
                </template>
                <template slot="design_p5">
                    <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="二维码" />流转卡二维码</p>
                </template>
                <div slot="detailedData">
                    <detailedList ref="detailedList" :queryType="queryType" :tableType="tableType" :deptData="deptData">
                    </detailedList>
                </div>
                <div slot="QRCode" v-if="flowCode">
                    <QrCodeComponent :text="flowCode"></QrCodeComponent>
                </div>
            </VFormRender>
            <detailedList v-else ref="detailedList" :queryType="queryType" :tableType="tableType" :deptData="deptData">
            </detailedList>
        </div>
        <choice-material ref="choiceMaterial" :propsFormData="propsFormData" :singleMode="true"
            @choiceMaterialClick="choiceMaterialClick" />
        <choice-production ref="choiceProduction" :propsFormData="propsFormData" @change="productionChange" />
        <choice-workmanship ref="choiceWorkmanship" :propsFormData="choiceWorkmanshipFormData"
            @change="choiceWorkmanshipChange"></choice-workmanship>
        <toBeReviewed ref="toBereview" />
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { flowSaveOrder, flowSaveDetail, flowOrderView, flowDetailView, flowSaveSubmit } from '@/api/prodmgr-mm/processFlow';
import { deptTree, getUnitTree } from '@/api/system/dept'
import choiceMaterial from "@/views/components/choice-material"
import choiceProduction from "./components/choice-production"
import choiceWorkmanship from "@/views/components/choice-workmanship"
import detailedList from "./components/detailedList"
import QrCodeComponent from '@/components/qrCodeComponent'
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
import { detailByBomOrMatl } from '@/api/prodmgr-mm/processRoute'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import { getUserInfo } from '@/utils/user-info'
import indexMixin from '@/views/mixins'
export default {
    name: "processFlowOperate",
    mixins: [indexMixin],
    components: { VFormRender, choiceMaterial, detailedList, choiceProduction, QrCodeComponent, choiceWorkmanship, toBeReviewed },
    data() {
        const userInfo = getUserInfo()
        return {
            loading: false,
            userInfo: userInfo,
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
                { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'create, update, view' },
            ],
            queryAuditArr: null,
            status: '1',
            tableType: '1',
            openDataScope: false,
            propsFormData: {
                onProcess: 0,
                hasPath: 1,
                unitId: userInfo.unitId
            },
            checked: false,
            deptData: [],
            flowCode: '1',
            choiceWorkmanshipFormData: {
                bomCode: '',
                pathId: '',
                matlCode: '',
                bomOrMatl: true,
            },
        }
    },
    created() {
        this.init();
    },
    methods: {
        async handleFormChange(fieldName, newValue, oldValue, formModel) {
            if (fieldName === 'workshopId') {
                this.$refs.detailedList.parentDeptChange(newValue)
            } else if(fieldName === 'unitId') {
                this.propsFormData.unitId = newValue
            }
        },
        buttonShow(item) {
          if (item.buttonCode === 'rollbackToPrevious') {
            const query = this.isDialog ? this.dialogQuery : this.$route.query
            return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
              && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
              && this.buttonShow({ ...item, buttonCode: 'reject' })
          }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && (!['0', '1'].includes(this.status) || this.tableType == '2' || this.queryName == 'toBeDeal')) {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        async getUnitTree() {
            const res = await getUnitTree({ status: 0 })
            this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
        },
        init() {
            let { type, name, id, auditArr, tableType } = this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'processFlow';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.tableType = tableType || '1';
            this.$nextTick(async () => {
                if (this.queryType === 'update' && tableType === '2') {
                    await this.getDeptTreeData();
                    this.getDetail();
                    return
                }
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                await this.getUnitTree()
                await this.getDeptTreeData();
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                }
                if (this.queryType != 'create') {
                    this.getDetail();
                } else {
                    this.initUnitInfo()
                }
            })
        },
        checkoutStatus(flag) {
            const widgets = ['flowCode', 'design_p1', 'produceCode', 'produceDeptId', 'grid96921', 'matlType', 'totalProduceNum', 'planStartDate', 'planEndDate', 'design_p5', 'grid79401', 'design_p4', 'grid78943']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        getDetail() {
            const apiUrl = this.tableType == '1' ? flowOrderView : flowDetailView
            this.loading = true;
            apiUrl(this.tableType == '1' ? this.queryId : { ids: this.queryId.split(',') }).then(({ data }) => {
                if (this.tableType == '1') {
                    this.status = data.status;
                    this.flowCode = data.flowCode;
                    this.$refs.detailedList.init(data.detailList);
                    delete data.detailList;
                    this.$refs["vFormRef"].setFormData(data);
                } else {
                    this.$refs.detailedList.init(data);
                }
            }).finally(() => {
                this.loading = false;
            });
        },
        async getDeptTreeData() {
            const res = await deptTree();
            this.deptData = res.data || []
            this.$refs['vFormRef'] && this.$refs['vFormRef'].getWidgetRef('produceDeptId').loadOptions(res.data || []);
            this.$refs['vFormRef'] && this.$refs['vFormRef'].getWidgetRef('workshopId').loadOptions(res.data || []);
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('processFlowOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
            if (fieldName === 'produceCode' && newValue == '') {
                this.$refs.vFormRef.setFormData({
                    produceCode: '',
                    produceId: '',
                    produceDetailId: '',
                    produceDeptId: undefined,
                    produceDeptName: '',
                    matlCode: '',
                    matlName: '',
                    matlType: '',
                    matlUnit: '',
                    totalProduceNum: '',
                    workshopId: undefined,
                    workshopName: '',
                    produceNum: '',
                    planStartDate: '',
                    planEndDate: '',
                    pathCode: '',
                    pathVersion: '',
                    pathName: '',
                    pathId: '',
                });
                this.choiceWorkmanshipFormData = {
                    matlCode: '',
                    bomCode: '',
                    pathId: '',
                    bomOrMatl: true
                }
                this.$refs['vFormRef'].enableWidgets(['produceDeptId', 'matlCode', 'produceNum']);
                this.$refs['detailedList'].tableData.detailsList = []
                this.$refs['vFormRef'].getWidgetRef('produceNum').field.options.max = 9999999999
                return
            }
            if (fieldName === 'pathCode' && newValue == '') {
                this.$refs['detailedList'].tableData.detailsList = []
                this.$refs.vFormRef.setFormData({
                    pathCode: '',
                    pathName: '',
                    pathId: '',
                    pathVersion:''
                });
            }
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "produceDeptId") {
                this.$refs.vFormRef.setFieldValue("produceDeptName", node.deptName);
            } else if (name === "workshopId") {
                this.$refs.vFormRef.setFieldValue("workshopName", node.deptName);
            } else if(name === 'unitId') {
                this.$refs.vFormRef.setFieldValue('unitName', node.deptName)
            }
        },
        treeSelectInput(vm, newVal) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "produceDeptId") {
                if (!newVal) {
                    this.$refs.vFormRef.setFieldValue("produceDeptName", '');
                }
            }else if (name === "workshopId") {
                if (!newVal) {
                    this.$refs.vFormRef.setFieldValue("workshopName", '');
                }
            }else if(name === 'unitId') {
                if (!newVal) {
                    this.$refs.vFormRef.setFieldValue('unitName', '')
                    this.$refs.vFormRef.setFieldValue('produceCode', '')
                    this.$refs.vFormRef.setFieldValue('produceId', '')
                }
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            if (name === 'produceCode') {
                const produceDetailId = this.$refs.vFormRef.getFieldValue('produceDetailId');
                this.$refs.choiceProduction.init(produceDetailId);
                return
            }
            if (name === 'matlCode') {
                const matlCode = this.$refs.vFormRef.getFieldValue('matlCode');
                this.$refs.choiceMaterial.init(matlCode);
                return
            }
            if (name === 'pathCode') {
                const matlCode = this.$refs.vFormRef.getFieldValue('matlCode');
                const pathCode = this.$refs.vFormRef.getFieldValue('pathCode');
                if (matlCode) {
                    this.$refs.choiceWorkmanship.init(pathCode);
                    return
                }
                this.$modal.msgError('请先选择物料');
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        productionChange(data) {
            this.$refs['detailedList'].tableData.detailsList = []
            this.$refs.vFormRef.setFormData(data);
            if (data.deptId) {
                this.$refs['vFormRef'].disableWidgets('produceDeptId');
            } else {
                this.$refs['vFormRef'].enableWidgets('produceDeptId');
            }
            if (data.matlCode) {
                this.$refs['vFormRef'].disableWidgets('matlCode');
            } else {
                this.$refs['vFormRef'].enableWidgets('matlCode');
            }
            if (data.maxProduceNum) {
                this.$refs['vFormRef'].getWidgetRef('produceNum').field.options.max = data.maxProduceNum
            } else {
                this.$refs['vFormRef'].getWidgetRef('produceNum').field.options.max = 999999
            }
            this.choiceWorkmanshipFormData = {
                matlCode: data.matlCode || '',
                bomCode: data.bomCode || '',
                pathId: data.pathId || '',
                bomOrMatl: true
            }
            this.getList()
        },
        choiceMaterialClick(data) {
            const { matlCode, matlName, matlType, matlUnit } = data
            this.$refs.vFormRef.setFormData({
                matlCode,
                matlName,
                matlType,
                matlUnit,
                pathCode: '',
                pathName: '',
                pathVersion: '',
                pathId: '',

            });
            this.$refs['detailedList'].tableData.detailsList = []
            this.choiceWorkmanshipFormData = {
                matlCode: data.matlCode || '',
                bomCode: data.bomCode || '',
                pathId: data.pathId || '',
                bomOrMatl: true
            }
            this.getList()
        },
        choiceWorkmanshipChange(data) {
            this.$refs.vFormRef.setFormData({
                pathCode: data.pathCode,
                pathName: data.pathName,
                pathId: data.pathId,
                pathVersion: data.version
            });
            const produceNum = this.$refs.vFormRef.getFieldValue('produceNum');

            if (this._one) {
                this.getOperateDetail(data.rawList, produceNum || 1)
            } else {
                this.choiceWorkmanshipFormData = {
                    matlCode: data.matlCode || '',
                    bomCode: data.bomCode || '',
                    pathId: data.pathId || '',
                    bomOrMatl: true
                }
                detailByBomOrMatl(Object.assign({}, this.choiceWorkmanshipFormData)).then(({ data }) => {
                    this.getOperateDetail(data[0].rawList, produceNum || 1)
                })
            }
        },
        // 查询
        getList() {
            detailByBomOrMatl(Object.assign({}, this.choiceWorkmanshipFormData)).then(({ data }) => {
                    this.choiceWorkmanshipChange(data[0])
                
            })
        },
        // 加载工序数据
        async getOperateDetail(rawList, produceNum) {
            try {
                this.loading = true;
                // const { data: { rawList = [] } } = await detail(id)
                const rawLists = !!rawList.length ? rawList : []
                const dataList = rawLists.map((item, i) => {
                    return Object.assign({}, item, {
                        processSort: i + 1,
                        machiningNum: produceNum
                    })
                })
                this.$refs['detailedList'].tableData.detailsList = dataList
                this.loading = false;
            } catch (err) {
                console.error(err)
            }
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
                return
            }
            if (buttonCode === 'cancel') {
                this.cancel(this.queryName);
            } else if (buttonCode === 'save' || buttonCode === 'saveSubmit') {
                const detailedList = this.$refs['detailedList'];
                if (this.tableType == '2') {
                    detailedList.$refs.elForm.validate(valid => {
                        if (valid) {
                            this.loading = true;
                            flowSaveDetail(detailedList.tableData.detailsList).then(({ message }) => {
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
                Promise.all([vFormRefData, pList]).then((data) => {
                    if (!data[1].length) {
                        this.$modal.msgError('请选择工序');
                        return
                    }
                    const formData = { ...data[0], detailList: data[1] }
                    const saveObj = {
                        'save': () => { this.saveOrder(flowSaveOrder, formData) },
                        'saveSubmit': () => {
                            this.$reviewerDialog({
                                type: ACTIVITI_ASSUGNEE.MM_GXLZ,
                                multiple: false,
                                success: (assignee) => {
                                    this.saveOrder(flowSaveSubmit, formData, assignee)
                                }
                            })
                        }
                    }
                    saveObj[buttonCode] && saveObj[buttonCode]()
                }).catch((error) => {
                    this.$modal.msgError('表单数据校验失败');
                })
                return
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