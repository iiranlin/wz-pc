<template>
    <Dialog :title="title" :visible.sync="showPreviewDialogFlag" v-if="showPreviewDialogFlag" :show-close="true"
        :close-on-click-modal="false" :close-on-press-escape="false"  append-to-body :destroy-on-close="true"
        class="dialog-route" width="60%" >
        <div class="form-render-wrapper" :class="[layoutType === 'H5' ? 'h5-layout' : (layoutType === 'Pad' ? 'pad-layout' : '')]">
            <VFormRender ref="preForm" :form-json="formJson" :form-data="testFormData" :preview-state="true"
                :option-data="testOptionData" @selectChange="selectChange" @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect"
                @appendButtonClick="testOnAppendButtonClick" @buttonClick="testOnButtonClick"
                @formChange="handleFormChange">
            </VFormRender>
        </div>
        <code-editor v-model="testFunc" style="display: none"></code-editor>
        <div slot="footer" class="dialog-footer" v-if="type !== 'view'">
            <el-button round type="primary" @click="getFormData">确认</el-button>
            <el-button round @click="showPreviewDialogFlag = false">取消</el-button>
        </div>
    </Dialog>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { formDataDetail } from '@/api/form/form-data'
import VFormRender from '@/components/form-render/index'
import CodeEditor from '@/components/code-editor/index'
import { createDesigner } from '@/components/form-designer/designer'
import { WarehouseSave, WareDetail } from '@/api/warehouseManage/warehouse'
import { getUnitTree, deptTreeAll, getUserListAll } from '@/api/system/dept'
import { BaseAreaList } from '@/api/warehouseManage/area'
import { getUserInfo } from '@/utils/user-info'

export default {
    name: 'warehouseOperate',
    components: {
        VFormRender,
        CodeEditor,
    },
    data() {
        return {
            showPreviewDialogFlag: false,
            testFunc: '',
            testFormData: {},
            testOptionData: {},
            designer: createDesigner(this),
            formCode: null,
            id: null,
            type: '',
            title: '新增仓库',
            unitList: [],
            deptList: [],
            userList: [],
            areaList: [],
            userInfo: getUserInfo(),
        }
    },
    computed: {
        formJson() {
            return {
                widgetList: this.designer.widgetList,
                formConfig: this.designer.formConfig
            }
        },
        layoutType() {
            return this.designer.getLayoutType()
        }
    },
    created() {
    },
    methods: {
        async init(type, formCode, id) {
            await this.getBaseArea()
            await this.getUserListAll()
            // 根据业务编号获得样式
            const data = await this.formFillInPage(formCode)
            this.setFormJson(data)
            this.formCode = formCode
            this.id = id || ''
            this.type = type
            if (type === 'update' || type === 'view') {
                const { data, message, success } = await WareDetail(this.id)
                if (success) {
                    data.status = data.status === '0'
                    //处理负责人id数据
                    data.warehouseManagementId = data.warehouseManagementId.split(',');

                    this.testFormData = data
                } else {
                    this.$modal.msgError(message)
                }
                this.title = '修改仓库'
            } else if (type === 'create') {
                this.testFormData = {}
                this.title = '新增仓库'
            }
            this.showPreviewDialogFlag = true
            this.loadAllData()
            if (type === 'view') {
                this.title = '查看仓库'
                this.$nextTick(() => {
                    this.$refs['preForm'].setReadMode(true);
                })
            }
        },
        //获取负责人数据，取当前用户部门下的所有人，与所属单位/部门不联动
        getUserListAll(){
            let params = {
                status: 0,
                unitId: this.userInfo.unitId,
            }
            getUserListAll(params).then(({data}) => {
                this.userList = data.list
            }).catch((err) => {
                
            })
        },
        formFillInPage(formCode) {
            return new Promise((resolve, reject) => {
                formFillInPage(formCode).then(({ data }) => {
                    resolve(data)
                })
            })
        },
        formDataDetail() {
            return new Promise((resolve, reject) => {
                formDataDetail(this.id, this.formCode).then(({ data }) => {
                    resolve(data)
                })
            })
        },
        setFormJson(formJson) {
            let modifiedFlag = false
            if (!!formJson) {
                if (typeof formJson === 'string') {
                    modifiedFlag = this.designer.loadFormJson(JSON.parse(formJson))
                } else if (formJson.constructor === Object) {
                    modifiedFlag = this.designer.loadFormJson(formJson)
                }

                if (modifiedFlag) {
                    this.designer.emitHistoryChange()
                }
            }
        },
        getFormData() {
            this.$refs['preForm'].getFormData().then(formData => {
                formData.status = formData.status ? '0' : '1'
                //处理负责人参数
                formData = this.initWarehouseManagementParams(formData);

                if (this.type == 'update') {
                    this.formDataModify(Object.assign({}, this.testFormData, formData, { id: this.id }))
                } else if (this.type === 'create') {
                    this.formDataCreate({ ...this.testFormData, ...formData })
                }
            }).catch(error => {
                this.$message.error(error)
            })
        },
        initWarehouseManagementParams(formData){
            //负责人name处理
            let arr = [];

            formData.warehouseManagementId.forEach((item) => {
                let findResult = this.userList.find((findItem) => {
                    return findItem.id == item;
                })
                arr.push(findResult.nickName);
            })
            formData.warehouseManagementName = arr.toString();
            //负责人id处理
            formData.warehouseManagementId = formData.warehouseManagementId.toString();
            return formData;
        },
        formDataCreate(formData) {
            WarehouseSave(formData).then(({ success, message }) => {
                if (success) {
                    this.$modal.msgSuccess('新增成功')
                    this.showPreviewDialogFlag = false
                    this.$emit('operateSuccess')
                } else {
                    this.$modal.msgError(message)
                }
            })
        },
        formDataModify(formData) {
            WarehouseSave(formData).then(({ success, message }) => {
                if (success) {
                    this.$modal.msgSuccess('修改成功')
                    this.showPreviewDialogFlag = false
                    this.$emit('operateSuccess')
                } else {
                    this.$modal.msgError(message)
                }
            })
        },
        testOnButtonClick(button) {
        },
        testOnAppendButtonClick(clickedWidget) {
        },
        handleFormChange(fieldName, newValue, oldValue, formModel) {
        },
        async selectChange(name, node, type) {
            if (name === 'areaId') {
                if (node !== '') {
                    const areaObj = this.areaList.find(item => item.id === node)
                    this.testFormData.areaName = areaObj.areaName
                }
            } else if (name === 'ofDeptName') {
                if(node){
                    const deptObj = this.deptList.find(item => item.deptName === node)
                    this.testFormData.ofDept = deptObj && deptObj.id;
                }
            } else if (name === 'warehouseManagementId') {
                const userObj = this.userList.find(item => item.id === node)
                this.testFormData.warehouseManagementName = userObj && userObj.nickName
            }
        },
        async loadAllData() {
            const { success, data, message } = await getUnitTree({ status: 0 })
            if (success) {
                await this.$nextTick()
                this.$refs['preForm'].getWidgetRef('areaId').loadOptions(this.areaList)
                this.$refs['preForm'].getWidgetRef('ofOrgan').loadOptions(data || [])
                this.$refs['preForm'].getWidgetRef('warehouseManagementId').loadOptions(this.userList || [])
            } else {
                this.$modal.msgError(message)
            }
            if (this.type === 'update' || this.type === 'view') {
                this.treeSelectSelect(this.$refs['preForm'].getWidgetRef('ofOrgan'), {deptId: this.testFormData.ofDept,unitId: this.testFormData.ofOrgan})
            }
        },
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: {name},
                },
            } = vm || {};
            if (name === "ofOrgan") {
                if(node.id){
                    this.testFormData.ofDept = "";
                    this.$refs['preForm'].setFieldValue("ofDeptName", "");
                    this.$refs['preForm'].getWidgetRef('ofDeptName').loadOptions([])
                }
                this.testFormData.ofDept = node.deptId || '';

                const { success, data, message } = await deptTreeAll({ status: 0, unitId: node.unitId })
                if (success) {
                    this.deptList = data[0].children
                    this.$refs['preForm'].getWidgetRef('ofDeptName').loadOptions(data[0].children || [])
                    if (this.type === 'update' || this.type === 'view') {
                        this.selectChange('ofDeptName', this.testFormData.ofDeptName, 'true')
                    }
                } else {
                    this.$modal.msgError(message)
                }
            }
        },
        // 部门树选择
        async treeSelectInput(vm, node) {
            let {
                field: {
                    options: { name }
                }
            } = vm || {}
            if(!node){
                if(name === 'ofOrgan'){
                    this.testFormData.ofDept = "";
                    this.$refs['preForm'].setFieldValue("ofDeptName", "");
                    this.$refs['preForm'].getWidgetRef('ofDeptName').loadOptions([])
                    return
                }
            }
            // if (name === 'ofOrgan') {  /*添加部门人员*/
            //     const { success, data, message } = await deptTreeAll({ status: 0, unitId: node })
            //     if (success) {
            //         const deptObj = this.unitList.find(item => item.id === node)
            //         this.testFormData.ofOrganName = deptObj.deptName
            //         this.deptList = data[0].children
            //         this.$refs['preForm'].getWidgetRef('ofDept').loadOptions(data[0].children || [])
            //         if (this.type === 'update' || this.type === 'view') {
            //             this.selectChange('ofDept', this.testFormData.ofDept)
            //         }
            //     } else {
            //         this.$modal.msgError(message)
            //     }
            // }
        },
        getBaseArea() {  /*0是启用,1是禁用*/
            BaseAreaList({ status: '0' }).then(({ data, success, message }) => {
                if (success) {
                    this.areaList = data.list
                } else {
                    this.$modal.msgError(message)
                }
            }).finally(() => {
            })
        },
    }
}
</script>
