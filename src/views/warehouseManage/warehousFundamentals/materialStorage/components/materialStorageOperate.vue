<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
        <el-switch v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项"/>
        <VFormRender ref="vFormRef" :form-data="formData" :class="{'formRender_view': queryType === 'view'}"
            @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange" @buttonClick="handleButtonClick"
            @treeSelectSelect="treeSelectSelect" @treeSelectInput="treeSelectInput"
            @operationButtonClick="operationButtonClick">
            <template slot="design_p1">
                <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
            </template>
            <template slot="fileList">
                <div style="display: flex;flex-direction: column;">
                    <attachmentTable ref="attachmentTable" businessType="40" :queryType="queryType" v-model="fileList"/>
                </div>
            </template>
            <template slot="materialStorageDetail">
                <div class="detailed">
                    <button-top ref="buttonTopRef" :buttonTopData="detailedButtonTop" @newButton="detailNewButton"></button-top>
                    <el-upload
                        ref="uploadRef"
                        :action="uploadUrl"
                        accept=".xlsx, .xls"
                        :show-file-list="false"
                        :auto-upload="true"
                        :headers="uploadHeaders"
                        :on-success="uploadSuccess"
                        :on-error="uploadOnError"
                        :before-upload="beforeUpload">
                    </el-upload>
                </div>
                <div>
                    <el-form :model="validateForm" ref="ruleForm">
                        <el-table border :data="validateForm.detailedForm" max-height="400px"
                            @selection-change="(data) => selectData = data" class="mt-20 saleOrderOperateEltable">
                            <el-table-column align="center" key="selectable" type="selection" width="50"
                                fixed="left" v-if="queryType == 'create' || queryType == 'update'" />
                            <el-table-column type="index" width="50" align="left" label="序号" />
                            <el-table-column label="地区" align="left" prop="areaName" min-width="150"/>
                            <el-table-column label="仓库" align="left" prop="warehouseName" min-width="150"/>
                            <el-table-column label="货架" align="left" prop="frameName" min-width="150"/>
                            <el-table-column label="货位" align="left" prop="placeName" min-width="150"/>
                            <el-table-column label="物料编码" align="left" prop="matlCode" min-width="150"/>
                            <el-table-column label="物料名称" align="left" prop="matlName" min-width="150"/>
                            <el-table-column label="规格型号" align="left" prop="matlType" min-width="150"/>
                            <el-table-column label="计量单位" align="left" prop="matlUnit" min-width="150">
                                <template slot-scope="scope">
                                    {{ scope.row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}
                                </template>
                            </el-table-column>
                            <el-table-column v-if="queryType !== 'view'" label="操作" align="center" fixed="right">
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
        <choicePlaceFrame ref="choicePlaceFrame" singleMode @confirm="choicePlaceFrameConfirm" :isMaterialStorage="true"/>
        <choicePlace ref="choicePlace" singleMode @selections="choicePlaceConfirm" :propsFormData="placePropsFormData"/>
        <choice-material ref="choiceMaterial" @choiceMaterialClick="choiceMaterial"/>
    </div>
</template>
<script>
import { formFillInPage } from '@/api/form/form'
import indexMixin from '@/views/mixins'
import VFormRender from '@/components/form-render/index'
import attachmentTable from '@/views/components/attachmentTable'
import choicePlaceFrame from "@/views/components/choice-placeFrame"
import choicePlace from "@/views/components/choice-place"
import choiceMaterial from '@/views/components/choice-material/index.vue'
import { deptTree,getUnitTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { generateUUID } from '@/utils'
import {invMatlStorageRelDetail,
invMatlStorageRelSave,
materialStorageImportUrl,
materialStorageDownTemplate,
invMatlStorageRelSaveCheck} from '@/api/warehouseManage/materialStorage'
import { uploadHeaders } from '@/utils/auth'
import { getUserInfo } from '@/utils/user-info'

export default {
    name: 'materialStorageOperate',
    mixins: [indexMixin],
    components: {
        VFormRender,
        choicePlaceFrame,
        choicePlace,
        attachmentTable,
        choiceMaterial,
    },
    dicts: ['MeasureUnit'],

    data() {
        return {
            loading: false,
            queryType: '',
            queryId: '',
            queryName: '',
            queryAuditArr: null,
            tableType: '1',
            isQuery: '',
            fileList: [],
            checked: false,

            formData:{

            },
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
            ],
            detailedButtonTop: [
                { buttonName: '选择物料', buttonCode: 'selectMaterial'},
                { buttonName: '导入', buttonCode: 'dropdown', children: [
                    {
                        buttonCode: 'download',
                        buttonName: '下载模板',
                        buttonMode: ''
                      },
                      {
                        buttonCode: 'import',
                        buttonName: '导入物料',
                        buttonMode: '',
                      },
                    ]
                },
                { buttonName: '删除', buttonCode: 'delete'},
            ],
            validateForm: {
                detailedForm: []
            },
            userListOptions:[],

            uploadUrl: materialStorageImportUrl,
            uploadHeaders: uploadHeaders(),
            userInfo: getUserInfo(),

            placePropsFormData:{
                frameId:'',
            },
            detialedOptions:{
                areaCode:'',
                areaName:'',
                areaId:'',
                warehouseCode:'',
                warehouseId:'',
                warehouseName:'',
            }
        }
    },
    created() {
            this.init()
    },
    methods: {
        init(){
            let { type, name, id, auditArr, tableType = '1', isQuery = '' } = this.isDialog ? this.dialogQuery : this.$route.query
            this.queryType = type || 'create'
            this.queryId = id || ''
            this.queryName = name || 'materialStorage'
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null
            this.tableType = tableType
            this.isQuery = isQuery

            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                await this.getDeptTreeData();
                await this.getUnitTree()

                if (this.queryType === 'update' || this.queryType == 'view') {

                    this.queryType == 'view' && this.$refs['vFormRef'].setReadMode(true);
                    this.invMatlStorageRelDetail();
                }else {
                    const {deptId,deptName} = this.userInfo;
                    this.$refs['vFormRef'].setFieldValue("applicationDeptId", deptId);
                    this.$refs['vFormRef'].setFieldValue("applicationDeptName", deptName);

                    let res = await userListAll({ deptId })
                    this.userListOptions = res.data.list || [];
                    this.$refs['vFormRef'].getWidgetRef('applicationUserId').loadOptions(this.userListOptions)

                    this.initUnitInfo()
                }
            })
        },
        formFillInPage(){
            return new Promise((resolve) => {
                formFillInPage('materialStorageOperate').then(res => {
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
            this.$refs['vFormRef'].getWidgetRef('applicationDeptId').loadOptions(res.data || [])
        },
        invMatlStorageRelDetail(){
            this.loading = true;

            this.validateForm.detailedForm = [];

            invMatlStorageRelDetail(this.queryId).then(({data}) => {
                
            }).catch((err) => {
                
            }).finally(() => {
                this.loading = false;
            })
        },
        checkoutStatus(){
            const arrId = ['placeName','applicationDeptId', 'applicationUserId', 'comments', 'fileList']

            if (this.checked) {
                this.$refs['vFormRef'].hideWidgets(arrId);
            } else {
                this.$refs['vFormRef'].showWidgets(arrId);
            } 
        },
        buttonShow(item) {
            if(['saveSubmit'].includes(item.buttonCode) && this.queryType == 'create') {
                return true
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)) {
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
        newButton(buttonCode){
            if(buttonCode == 'cancel'){
                this.cancel(this.queryName)
            }else if(buttonCode == 'save'){
                this.$refs.vFormRef.validateForm((valid) => {
                    if(valid){
                        if (!this.validateForm.detailedForm.length) {
                            this.$modal.msgError('明细信息不能为空')
                            return
                        }
                        this.checkSaveTip();
                    }
                })
            }
        },
        detailNewButton(buttonCode){
            if(buttonCode == 'selectMaterial'){
                this.$refs.choiceMaterial.init(null, [], this.validateForm.detailedForm)
            }else if(buttonCode == 'import'){
                this.$refs.uploadRef.$refs["upload-inner"].handleClick();
            }else if(buttonCode == 'download'){
                this.$download.fileUrl(materialStorageDownTemplate, null, 'get');
            }else if(buttonCode == 'delete'){
                let tempArr = [];

                this.validateForm.detailedForm.forEach((item) => {
                    
                    let result =  this.selectData.some((selectItem) => {
                        return item.matlCode == selectItem.matlCode
                    })
                    if(!result){
                        tempArr.push(item)
                    }
                })
                this.validateForm.detailedForm = tempArr;
            }
        },
        handleAppendButtonClick(vm){
            let { field: { options: { name } } } = vm || {}

            if(name == 'frameCode'){

                const frameCode = this.$refs.vFormRef.getFieldValue("frameCode");
                this.$refs.choicePlaceFrame.init(frameCode)
            }
            if(name == 'placeCode'){
                const frameId = this.$refs.vFormRef.getFieldValue("frameId");

                if(!frameId){
                    this.$modal.msgWarning('请先选择货架!')
                    return
                }
                let placeId = this.$refs.vFormRef.getFieldValue("placeId");
                this.$refs.choicePlace.init(placeId);
            }
        },
        selectChange(name, node){
            if(name == 'applicationUserId'){
                if (node !== '') {
                    let applicationUserName = this.userListOptions.find(item => item.id == node).nickName;
                    this.$refs.vFormRef.setFieldValue("applicationUserName",applicationUserName);
                }
            }else if(name == 'frameCode'){
                if(!node){
                    this.$refs['vFormRef'].setFieldValue('frameName','');
                    this.$refs['vFormRef'].setFieldValue('frameId', '');
                    this.$refs['vFormRef'].setFieldValue('frameCode','');
                    this.$refs['vFormRef'].setFieldValue('placeName','');
                    this.$refs['vFormRef'].setFieldValue('placeId','');
                    this.$refs['vFormRef'].setFieldValue('placeCode','');

                    this.detialedOptions = this.$options.data().detialedOptions
                    this.initDetailOptions();
                }
            }else if(name  == 'placeCode'){
                if(!node){
                    this.$refs['vFormRef'].setFieldValue('placeName','');
                    this.$refs['vFormRef'].setFieldValue('placeId','');
                    this.$refs['vFormRef'].setFieldValue('placeCode','');

                    this.detialedOptions = this.$options.data().detialedOptions
                    this.initDetailOptions();
                }
            }
        },
        handleButtonClick(vm){
            let { field: { options: { name } } } = vm || {}
        },
        async treeSelectSelect(vm, node){
            let { field: { options: { name } } } = vm || {}

             if (name === 'unitId') {
                this.$refs.vFormRef.setFieldValue('unitName', node.deptName);
            }
            if (name === 'applicationDeptId') {
                if (node.id) {
                    this.$refs.vFormRef.setFieldValue("applicationDeptName",node.deptName);

                    let res = await userListAll({ deptId: node.id })
                    this.userListOptions = res.data.list || [];
                    this.$refs['vFormRef'].getWidgetRef('applicationUserId').loadOptions(this.userListOptions)
                }
            }
        },
        treeSelectInput(name, newVal){
         
        },
        operationButtonClick(dataTable, buttonName, rowIndex, row){

        },
        choicePlaceFrameConfirm(data){
            this.placePropsFormData.frameId = data.id;

            this.$refs['vFormRef'].setFieldValue('frameName', data.frameName);
            this.$refs['vFormRef'].setFieldValue('frameId', data.id);
            this.$refs['vFormRef'].setFieldValue('frameCode', data.frameCode);

            this.$refs['vFormRef'].setFieldValue('placeName','');
            this.$refs['vFormRef'].setFieldValue('placeId','');
            this.$refs['vFormRef'].setFieldValue('placeCode','');

            this.detialedOptions = this.$options.data().detialedOptions
            this.initDetailOptions();
        },
        choicePlaceConfirm(data){
            this.detialedOptions.areaCode = data.areaCode;
            this.detialedOptions.areaId = data.areaId;
            this.detialedOptions.areaName = data.areaName;
            this.detialedOptions.warehouseCode = data.warehouseCode;
            this.detialedOptions.warehouseId = data.warehouseId;
            this.detialedOptions.warehouseName = data.warehouseName;

            this.$refs['vFormRef'].setFieldValue('placeName', data.placeName);
            this.$refs['vFormRef'].setFieldValue('placeId', data.id);
            this.$refs['vFormRef'].setFieldValue('placeCode', data.placeCode);

            this.initDetailOptions();
        },
        choiceMaterial(matlList){
            let frameName =this.$refs['vFormRef'].getFieldValue('frameName');
            let frameId = this.$refs['vFormRef'].getFieldValue('frameId');
            let frameCode = this.$refs['vFormRef'].getFieldValue('frameCode');
            let placeName = this.$refs['vFormRef'].getFieldValue('placeName');
            let placeId = this.$refs['vFormRef'].getFieldValue('placeId');
            let placeCode = this.$refs['vFormRef'].getFieldValue('placeCode');

            const data = matlList.map(item => {
                return { 
                    ...item, 
                    ...this.detialedOptions ,
                    uid: generateUUID(),
                    frameName,
                    frameId,
                    frameCode,
                    placeName,
                    placeId,
                    placeCode,
                }
            })
            this.validateForm.detailedForm.push(...data)
        },
        initDetailOptions(){
            let frameName =this.$refs['vFormRef'].getFieldValue('frameName');
            let frameId = this.$refs['vFormRef'].getFieldValue('frameId');
            let frameCode = this.$refs['vFormRef'].getFieldValue('frameCode');
            let placeName = this.$refs['vFormRef'].getFieldValue('placeName');
            let placeId = this.$refs['vFormRef'].getFieldValue('placeId');
            let placeCode = this.$refs['vFormRef'].getFieldValue('placeCode');

            this.validateForm.detailedForm.forEach((item) => {
                item.frameName = frameName;
                item.frameId = frameId;
                item.frameCode = frameCode;
                item.placeName = placeName;
                item.placeId = placeId;
                item.placeCode = placeCode;
                item.areaCode = this.detialedOptions.areaCode;
                item.areaId = this.detialedOptions.areaId;
                item.areaName = this.detialedOptions.areaName;
                item.warehouseCode = this.detialedOptions.warehouseCode;
                item.warehouseId = this.detialedOptions.warehouseId;
                item.warehouseName = this.detialedOptions.warehouseName;
            })
        },
        uploadSuccess({data, message,success}) {
            if (success) {
                this.$modal.msgSuccess('上传成功！')
                this.validateForm.detailedForm = data;
                this.initDetailOptions();
            } else {
                this.$modal.msgError(message)
            }
        },
        uploadOnError(err, file, fileList) {
            this.$modal.msgError('上传失败')
        },
        beforeUpload(file) {
            
        },
        removeData(index){
            this.validateForm.detailedForm.splice(index, 1);
        },
        async checkSaveTip(){
            const formData = await this.$refs.vFormRef.getFormData()
            const param = {
                ...formData,
                fileList: this.fileList,
                detailList: this.validateForm.detailedForm
            }
            invMatlStorageRelSaveCheck(param).then(({data}) => {
                if(data){
                    this.$modal.confirm('新加物料存在已维护了存储关系，如果不够使用，可以继续维护，是否继续维护?', '提示', {
                        confirmButtonText: '确 定',
                        cancelButtonText: '取 消',
                        type: 'warning'
                    }).then(() => {
                        this.handleSave(param);
                    })
                }else{
                    this.handleSave(param);
                }
            }).catch((err) => {
               
            })
        },
        handleSave(param){
        
            invMatlStorageRelSave(param).then(({message}) => {
                this.$modal.msgSuccess(message);
                this.cancel(this.queryName);
            }).catch((err) => {
                
            })
        
        },
        cancel(name) {
            this.$tab.closeOpenPage({ name })
        },
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
