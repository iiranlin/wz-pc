<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
           
            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" @selectChange="selectChange" :class="{'formRender_view': queryType === 'view'}"
                @appendButtonClick="handleAppendButtonClick" @buttonClick="handleButtonClick"
                @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect">
                <template slot="design_p1">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
                </template>
                <template slot="design_p2">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="24" :queryType="queryType" v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <template slot="slotIcon">
                    <div class="detailed" v-if="tableType == '1'">
                        <button-top v-if="queryType !== 'view'" :buttonTopData="handleDetailedButtonTop"
                            :buttonShow="handleDetailedButtonShow" @newButton="HandleDetailedNewButton"></button-top>
                    </div>
                    <div>
                        <el-form :model="validateForm" ref="ruleForm">
                            <el-table border :data="validateForm.detailedForm" max-height="300px" @selection-change="(data) => selectData = data"
                                class="mt-20 saleOrderOperateEltable">
                                <el-table-column fixed="left" align="center" key="selectable" type="selection" width="50" v-if="queryType == 'create' || queryType == 'update'" />
                                <el-table-column type="index" width="50" align="left" label="序号" />
                                <el-table-column label="地区" align="left" prop="areaName"
                                    min-width="120"></el-table-column>
                                <el-table-column label="仓库" align="left" prop="warehouseName"
                                    min-width="120"></el-table-column>
                                <el-table-column label="货位" align="left" prop="placeName"
                                    min-width="120"></el-table-column>
                                <el-table-column label="批次号" align="left" prop="batchNo"
                                    min-width="120"></el-table-column>
                                <el-table-column label="物料编码" align="left" prop="matlCode"
                                    min-width="120"></el-table-column>
                                <el-table-column label="物料名称" align="left" prop="matlName"
                                    min-width="120"></el-table-column>
                                <el-table-column label="规格型号" align="left" prop="matlType"
                                    min-width="120"></el-table-column>
                                <el-table-column label="计量单位" prop="matlUnit" key="matlUnit" align="left"
                                    :show-overflow-tooltip="true" min-width="150">
                                    <template slot-scope="{row}">
                                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="合格状态" prop="type" key="type" align="center"
                                    :show-overflow-tooltip="true" min-width="150">
                                    <template slot-scope="{row}">
                                        <span>{{ row.type | orderTypeFilter(dict.type.inventoryType) }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="效期状态" prop="expireStatus" key="expireStatus" align="center"
                                    :show-overflow-tooltip="true" min-width="150">
                                    <template slot-scope="{row}">
                                        <span>{{ row.expireStatus | orderTypeFilter(dict.type.expireStatus) }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="库存数量" align="left" prop="inventoryNum"
                                    min-width="120"></el-table-column>
                                <el-table-column align="center" prop="scrapNum" min-width="220">
                                    <template slot="header">
                                        <span style="color: red">*</span>
                                        <span>报废数量</span>
                                    </template>
                                    <template slot-scope="scope">
                                        <el-form-item :prop="'detailedForm.' + scope.$index + '.scrapNum'" :rules="[{ required: true, message: '请输入报废数量', trigger: ['change', 'blur'] }]">
                                            <span v-if="queryType == 'view'">{{ scope.row.scrapNum }}</span>
                                            <el-input-number v-else controls-position="right" :min="1" :max="scope.row.inventoryNum" v-model.trim="scope.row.scrapNum"></el-input-number>
                                        </el-form-item>
                                    </template>
                                </el-table-column>
                                <el-table-column v-if="queryType !== 'view' && tableType == '1'" label="操作" align="center" fixed="right">
                                    <template slot-scope="scope">
                                        <el-button type="text" @click="removeData(scope.$index)">删行</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form>
                    </div>
                </template>
            </VFormRender>
        </div>
        <choice-project ref="projectRef" singleMode  @selections="selections" :propsFormData="propsFormDataProject"></choice-project>
        <choice-inventory ref="inventoryRef" @selections="selectionsInventory" :propsFormData="propsFormDataInventory"></choice-inventory>
        <toBeReviewed ref="toBereview"/>
    </div>
</template>

<script>
import attachmentTable from '@/views/components/attachmentTable'
import indexMixin from '@/views/mixins'
import { formFillInPage } from '@/api/form/form'
import { getToken } from '@/utils/auth'
import { deptTree,getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import ChoiceProject from '@/views/components/selectProject/index.vue'
import { applySave, applyView, applyDetailView, applyDetailSave, applySaveSubmit } from '@/api/prodmgr-inv/scrapApply'
import ChoiceInventory from '@/views/components/choice-inventory.vue'
import { getUserInfo } from '@/utils/user-info'
import { generateUUID } from '@/utils'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
export default {
    name: 'scrapApplyOperate',
    mixins: [indexMixin],
    dicts: ['MeasureUnit', 'inventoryType', 'expireStatus'],
    components: {
        ChoiceInventory,
        ChoiceProject,
        attachmentTable,
        toBeReviewed,
        VFormRender
    },
    data() {
        return {
            loading: false,
            type: '',
            queryId: '',
            queryName: '',
            queryType: '',
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
                { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'create, update, view' }
            ],
            queryAuditArr: null,
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '24'
            },
            userInfo: getUserInfo(),
            /*合同信息*/
            checked: false,
            validateForm: {
                detailedForm: []
            },
            handleDetailedButtonTop: [
                { buttonName: '选择库存', buttonCode: 'selectInventory' },
                { buttonName: '删除', buttonCode: 'delete' }
            ],
            purchaseOrderRadio: '1',
            fileList: [],
            status: '1',
            isQuery: '',
            propsFormDataProject: {
                unitId: ''
            },
            propsFormDataInventory: {
                unitId: '',
                projectId: '',
            },
        }
    },
    created() {
        this.init()
    },
    methods: {
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
        async init() {
            let { type, name, id, auditArr, tableType, isQuery = '' } = this.$route.query
            this.queryType = type || 'create'
            this.queryId = id || ''
            this.queryName = name || 'scrapApply'
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.tableType = tableType || '1'
            this.isQuery = isQuery
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm()
                await this.formFillInPage()
                await this.getDeptTreeData()
                await this.getUnitTree()
                if (this.queryType !== 'create') {
                    this.saleOrderOperateDetail()
                }else{
                    const {deptId, deptName, nickName, id: nickId} = this.userInfo;
                    this.getUserListAll(deptId);
                    this.$refs['vFormRef'].setFieldValue("applyDeptId", deptId);
                    this.$refs['vFormRef'].setFieldValue("applyDeptName", deptName);
                    this.$refs['vFormRef'].setFieldValue("applyUserId", nickId);
                    this.$refs['vFormRef'].setFieldValue("applyUserName", nickName);
                    this.initUnitInfo()
                }
                if (this.queryType === 'view') {
                    this.$refs['vFormRef'].setReadMode(true)
                }
            })
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('scrapApplyOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data)
                    resolve(true)
                })
            })
        },
        async getUnitTree() {
            const res = await getUnitTree({ status: 0 })
            this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' })
            this.$refs['vFormRef'].getWidgetRef('applyDeptId').loadOptions(res.data || [])
        },
        async getUserListAll(deptId){
            const res = await userListAll({deptId});
            this.$refs['vFormRef'].getWidgetRef('applyUserId').loadOptions(res.data.list || []);
        },
        saleOrderOperateDetail() {
            this.loading = true
            const widgets = ['card1']
            if (this.tableType == '1') {
                applyView(this.queryId).then(({ data }) => {
                    this.$refs['vFormRef'].setFormData(data)
                    this.status = data.status
                    if(data.applyDeptId){
                        this.getUserListAll(data.applyDeptId);
                    }else{
                        data.applyDeptId = undefined;
                    }
                    this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                    this.validateForm.detailedForm = data.detailList
                }).finally(() => {
                    this.loading = false
                })
            } else {
                const ids = this.queryId.split(',')
                this.$refs.vFormRef.hideWidgets(widgets)
                applyDetailView({ids}).then(({ data }) => {
                    this.validateForm.detailedForm = data
                }).finally(() => {
                    this.loading = false
                })
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}

            const unitId = this.$refs.vFormRef.getFieldValue("unitId");
            if(!unitId){
                this.$modal.msgError('请先选择所属组织')
                return
            }
            this.propsFormDataProject.unitId = unitId;

            if (name === 'projectCode') {
               const pId = this.$refs['vFormRef'].getFieldValue("projectId");
                this.$refs.projectRef.init(pId)
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {}
        },
        newButton(buttonCode) {
          if(buttonCode === 'edit'){
            this.queryType = 'update';
            this.$refs['vFormRef'].setReadMode(false);
            return
          }
            if (buttonCode === 'cancel') {
                this.cancel(this.queryName)
            } else if (buttonCode === 'save' || buttonCode === 'saveSubmit') {
                if (this.tableType === '2') {
                    this.$refs.ruleForm.validate(valid => {
                        if (valid) {
                            applyDetailSave(this.validateForm.detailedForm).then(({ message }) => {
                                this.$modal.msgSuccess(message)
                                this.cancel(this.queryName)
                            }).finally(() => {
                                this.loading = false
                            })
                        }
                    })
                    return
                }

                const vFormRefData = new Promise( (resolve, reject) => {
                    return this.$refs.vFormRef.getFormData().then(formData => {
                        resolve(formData)
                    }).catch(error => {
                        reject()
                    })
                })
                const pList = new Promise( (resolve, reject) => {
                    return this.$refs.ruleForm.validate( valid => {
                        if(valid){
                            resolve(this.validateForm.detailedForm)
                        }else{
                            reject()
                        }
                    })
                })
                Promise.all([vFormRefData, pList]).then( (data) => {
                    const formData = {...data[0], detailList: data[1], fileList: this.fileList}
                    this.loading = true;
                    if(formData.detailList.length){
                      const saveObj = {
                        'save': () => { this.applySave(applySave, formData) },
                        'saveSubmit': () => { 
                          this.$reviewerDialog({
                            type: ACTIVITI_ASSUGNEE.INV_BFSQ,
                            multiple: false,
                            success: (assignee) => {
                              this.applySave(applySaveSubmit, formData, assignee)
                            }
                          })
                        }
                      }
                      saveObj[buttonCode] && saveObj[buttonCode]()
                    }else{
                        this.$modal.msgError('请选择库存');
                    }
                }).catch( (error) => {
                    this.$modal.msgError('表单数据校验失败');
                })

            }
            if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName)
                return
            }
            if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName)
                return
            }
        },
        applySave (url, formData, assignee) {
          url({ ...formData, id: this.queryId, assignee }).then(({ message }) => {
            this.$modal.msgSuccess(message);
            this.cancel(this.queryName);
          }).finally(() => {
            this.loading = false;
          });
        },
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name })
        },
        selectChange (fieldName, newValue) {
            if (fieldName === 'applyUserId') {
                if(newValue){
                    const optionLabel = this.$refs['vFormRef'].getWidgetRef('applyUserId').optionLabel;
                    this.$refs['vFormRef'].setFieldValue("applyUserName", optionLabel);
                }else{
                    this.$refs['vFormRef'].setFieldValue("applyUserName","");
                }
                return
            }
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name }
                }
            } = vm || {}
            if (name === 'applyDeptId') {
                this.$refs['vFormRef'].setFieldValue("applyUserId","");
                this.$refs['vFormRef'].setFieldValue("applyUserName","");
                this.$refs.vFormRef.setFieldValue("applyDeptName", node.deptName);
                this.getUserListAll(node.id);
            }
            if (name === 'unitId') {
                this.$refs.vFormRef.setFieldValue('unitName', node.deptName);

                this.$refs['vFormRef'].setFieldValue('projectId', '')
                this.$refs['vFormRef'].setFieldValue('projectCode', '')
                this.$refs['vFormRef'].setFieldValue('projectName', '')
                this.validateForm.detailedForm = [];
            }
        },
        treeSelectInput(vm, newVal) {
            let {
                field: {
                    options: { name }
                }
            } = vm || {}
            if(name === "applyDeptId"){
                if(!newVal){
                    this.$refs['vFormRef'].setFieldValue("applyUserId","");
                    this.$refs['vFormRef'].setFieldValue("applyUserName","");
                    this.$refs['vFormRef'].getWidgetRef('applyUserId').loadOptions([]);
                }
            }
        },
        checkoutStatus(flag) {
            const widgets = ['scrapName', 'sugHandMethod', 'applyDeptId', 'applyUserId', 'comments', 'fileList', 'design_p2', 'projectCode', 'projectName', 'scrapCode', 'grid96921', 'grid45899', 'grid80913']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        handleDetailedButtonShow() {
            return true
        },
        HandleDetailedNewButton(buttonCode) {
            const unitId = this.$refs.vFormRef.getFieldValue("unitId");
            
            if(!unitId){
                this.$modal.msgError('请先选择所属组织')
                return
            }
            this.propsFormDataInventory.unitId = unitId;

            if (buttonCode === 'selectInventory') {
                const data = this.validateForm.detailedForm.map( item => { return {id: item.inventoryId}})
                this.$refs.inventoryRef.init('', data, [], {})
                return
            }
            if(buttonCode === 'delete'){
                if(this.selectData.length > 0) {
                    this.$modal.confirm('您确定要删除吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let newData = this.validateForm.detailedForm.filter((a) => !this.selectData.some((b) => a.inventoryId === b.inventoryId));
                        this.validateForm.detailedForm = newData;
                    })
                }else{
                    this.$modal.msgError('请选择数据')
                }
                return
            }
        },
        selections(row) {  /*选择项目*/
            this.$refs.vFormRef.setFormData({
                projectCode: row.projectCode,
                projectName: row.projectName,
                projectId: row.id
            })
            this.validateForm.detailedForm = [];
        },
        selectionsInventory (data) {
            const arrData = data.map( item => {return {...item, inventoryId: item.id}})
            this.validateForm.detailedForm = this.validateForm.detailedForm.concat(arrData) ;
        },
        removeData(i) {
            this.validateForm.detailedForm.splice(i, 1);
        }
    }
}
</script>
<style lang="scss" scoped>
.slotIcon-color-content {
    color: red
}

.slotIcon-color {
    color: #1890ff;
}

.ml-20 {
    margin-left: 20px !important;
}

.mt-20 {
    margin-top: 20px !important;
}
</style>
