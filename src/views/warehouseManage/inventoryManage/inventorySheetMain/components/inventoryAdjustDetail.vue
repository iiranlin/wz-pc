<template>
    <div class="app-container container_flex">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" :class="{'formRender_view': queryType === 'view'}"
                @appendButtonClick="handleAppendButtonClick" @selectChange="selectChange"
                @buttonClick="handleButtonClick" @treeSelectSelect="treeSelectSelect"
                @treeSelectInput="treeSelectInput">
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="17" :queryType="queryType"
                            v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <div slot="detail">
                    <el-table :data="detailList" border style="width: 100%" @select="selectDetail" height="400px" class="container_flex_form_table saleOrderOperateEltable table-wrapper">
                        <el-table-column type="selection" width="55" align="center"></el-table-column>
                        <el-table-column prop="checkCode" label="盘点单号" width="180" align="left"></el-table-column>
                        <el-table-column prop="checkType" label="盘点方式" width="180" align="left">
                            <template slot-scope="scope">
                                <span>{{handleStatus(scope.row.checkType, dict.type.checkType)}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="placeCode" label="货位编码" align="left"></el-table-column>
                        <el-table-column prop="matlCode" label="物料编码" align="left" width="200"></el-table-column>
                        <el-table-column prop="matlName" label="物料名称" align="left"></el-table-column>
                        <el-table-column prop="matlType" label="规格型号" align="left"></el-table-column>
                        <el-table-column prop="matlUnit" label="计量单位" align="left">
                            <template slot-scope="{row}">
                                <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="batchNo" label="批次号" align="left" width="200"></el-table-column>
                        <el-table-column prop="invNum" label="库存数量" align="left"></el-table-column>
                        <el-table-column prop="checkNum" label="盘点数量" align="left"></el-table-column>
                        <el-table-column prop="diffNum" label="差异数量" align="left"></el-table-column>
                        <el-table-column prop="checkResult" label="盘点结果" align="left">
                            <template class="cell" slot-scope="scope">
                                <span>{{handleStatus(scope.row.checkResult, dict.type.checkResult)}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="address" label="操作" align="center" v-if="queryType !== 'view'">
                            <template slot-scope="scope">
                                <el-button type="text" @click="handleDeleteRow(scope.row)" :disabled="detailList.length <= 1">删行</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </VFormRender>
        </div>
        
        <toBeReviewed ref="toBereview" />
        <activiti-assignee ref="activitiAssignee" :multiple="false" @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import indexMixin from '@/views/mixins';
import { getToken } from '@/utils/auth'
import { deptTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getUserInfo } from '@/utils/user-info'
import { createAdjustOrder, adjustOrderView, adjustSubmit } from '@/api/warehouseManage/inventorySheet'
import cache from '@/plugins/cache'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import VFormRender from '@/components/form-render/index'
import attachmentTable from '@/views/components/attachmentTable'
import { generateUUID } from '@/utils'
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
export default {
    name: "inventoryAdjustDetail",
    mixins: [indexMixin],
    dicts: ['checkType', 'checkResult', 'MeasureUnit'],
    components: { toBeReviewed, activitiAssignee, VFormRender, attachmentTable },
    data(){
        return {
            loading: false,
            queryType: '',
            queryId: '',
            invenVisible: false,
            queryName: '',
            formData: {},
            managerData: [],
            userInfo: getUserInfo(),
            detailList: [],
            fileList: [],
            buttonTop: [
            { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
            { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
            { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
            { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
            { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
            { buttonName: '提交', buttonCode: 'submit', buttonIcon: 'Blue-Submit', type: 'create, update, view' },
        ],
        globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '20',
            },
            selectDetailRow: [],
            status: ''
        }
    },
    created(){
        this.init()
    },
    methods: {
            init(){
                let { type, name, id, auditArr } = this.isDialog ? this.dialogQuery : this.$route.query;
                this.queryType = type || 'create';
                this.queryId = id || '';
                this.detailList = cache.session.getJSON('adjustOrder')
                this.queryName = name || 'inventorySheetMaintenance';
                this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
                this.$nextTick(async () => {
                    this.$refs['vFormRef'].resetForm();
                    await this.formFillInPage();
                    if(this.queryType === 'view') {
                        this.$refs['vFormRef'].setReadMode(true)
                        this.getDetailInfo()
                    }
                    await this.getDeptTreeData()
                    if(this.queryType === 'create') {
                        this.$refs['vFormRef'].setFieldValue('adjustDeptId', this.userInfo.deptId)
                        this.setUsersByDeptId(this.userInfo.deptId, this.userInfo.deptName, this.userInfo.nickName)
                        this.$refs['vFormRef'].setFieldValue('adjustUserId', this.userInfo.id)
                    }
                })
        },
        getDetailInfo(){
            adjustOrderView(this.queryId).then(({success, data, message}) => {
                if(success) {
                  this.status = data.status
                    this.$refs['vFormRef'].setFormData(data);
                    this.detailList = data.detailList;
                    this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                    this.detailList.map(item => {
                        item.invNum = item.inventoryNum
                    })
                    this.setUsersByDeptId(data.adjustDeptId, data.adjustDeptName, data.adjustUserName)
                } else {
                    this.$messages.error(message);
                }
            })
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('adjustOrder').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        handleStatus(val, code){
            for (let key of code) {
                if (key.value == val) {
                    return key.label
                }
            }
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('adjustDeptId').loadOptions(res.data || [])
        },
        buttonShow(item) {
            if (['submit', 'update'].includes(item.buttonCode) && !['0', '1'].includes(this.status)) {
                return false
            }
            if (['submit', 'update'].includes(item.buttonCode) && this.queryName == 'toBeDeal') {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        newButton(buttonCode){
            if (buttonCode === 'cancel') {
                this.$tab.closeOpenPage({ name: this.queryName })
            } else if (buttonCode === 'save') {
                this.$refs['vFormRef'].getFormData().then(formData => {
                    this.loading = true
                    createAdjustOrder(Object.assign(formData, this.formData, {detailList: this.detailList,fileList: this.fileList })).then((success, data, message) => {
                        if(success) {
                            this.$message.success('保存成功')
                            this.$tab.closeOpenPage({ name: this.queryName })
                        } else {
                            this.$message.error(message)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                })
                
            }else if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);
                return
            }else if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);
                return
            }else if(buttonCode === 'submit') {
              this.handleSubmit(ACTIVITI_ASSUGNEE.INV_TZD)
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        selectChange(name, node) {
            if(name === 'adjustUserId') {
                this.formData.adjustUserName = this.managerData.find(item=>item.id=node).nickName
            }
        },
        selectInventory(){
            this.$refs['selectInven'].open()
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if(name === 'adjustDeptId') {
                if (node.id) {
                    this.setUsersByDeptId(node.id, node.deptName, '')
                }
            }
        },
        async setUsersByDeptId(deptId, deptName, nickName){
            const managerData = await userListAll({ deptId: deptId })
                    this.formData.adjustDeptName = deptName
                    this.formData.adjustUserName = nickName
                    if(!nickName) {
                        this.$refs['vFormRef'].setFieldValue('adjustUserId', '')
                    }
                    this.$refs['vFormRef'].enableWidgets('adjustUserId')
                    this.$refs['vFormRef'].getWidgetRef('adjustUserId').loadOptions(managerData.data.list || [])
                    this.managerData = managerData.data.list || []
        },
        treeSelectInput(name, newVal) {},
        selectDetail(list){
            this.selectDetailRow = list
        },
        deleteRow(row){
            this.detailList = this.detailList.filter(item => {
                return this.selectDetailRow.filter(ele => ele.id === item.id).length === 0
            })
        },
        handleDeleteRow(row){
            this.detailList = this.detailList.filter(item => row.id !== item.id)
        },
        selections(detailList){
            this.detailList = detailList
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            adjustSubmit({ids: [this.queryId], assignee}).then(({ success, data, message }) => {
                if (success) {
                    this.$modal.msgSuccess('提交成功')
                    this.$tab.closeOpenPage({ name: this.queryName })
                } else {
                    this.$modal.msgError(message)
                }
            }).finally( () => {
                this.loading = false;
            })
        },
    },
}
</script>
<style lang="scss" scoped>
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
.table-wrapper {
    margin: 10px 0 0 0;
}
.system-icon-content {
    height: calc(100% - 30px);
    overflow: auto;
}
::v-deep .el-dialog {
height: 78vh;
overflow: auto;
}
</style>
