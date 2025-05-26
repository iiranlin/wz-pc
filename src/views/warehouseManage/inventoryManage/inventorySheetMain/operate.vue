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
                @treeSelectInput="treeSelectInput">
                <template slot="existsInv" slot-scope="scope">
                    <el-radio-group v-if="queryType !== 'view'"  v-model="scope.formModel.existsInv" @change="handleExistsInv">
                        <el-radio :label="1">是<tooltip content="选择库存进行盘点" /></el-radio>
                        <el-radio :label="2">否<tooltip content="无库存，可以选择物料进行盘点，比如多物料上报" /></el-radio>
                    </el-radio-group>
                    <span v-else>
              {{ { 1: '是', 2: '否' }[scope.formModel.isOverPicking] }}
            </span>
                </template>
                <div slot="detail">
                    <div class="button-with-tooltip" v-if="queryType !== 'view'">
                        <el-button class="un-quilt-btn" @click="selectInventory">选择库存</el-button>
                        <el-button v-if="formData.existsInv == 2" style="margin-left: 20px;" class="un-quilt-btn" @click="selectMaterial">选择物料</el-button>
                        <el-button class="un-quilt-btn" style="margin-left: 20px;" @click="deleteRow"
                            :disabled="detailList.length <= 1">删除</el-button>
                    </div>
                    <el-table :data="detailList" height="400px" @select="selectDetail" border
                        class="container_flex_form_table saleOrderOperateEltable table-wrapper">
                        <el-table-column type="selection" width="55" align="center"></el-table-column>
                        <el-table-column prop="placeCode" label="货位编码" width="180" align="left"></el-table-column>
                        <el-table-column prop="matlCode" label="物料编码" width="180" align="left"></el-table-column>
                        <el-table-column prop="matlName" label="物料名称" width="180" align="left"></el-table-column>
                        <el-table-column prop="matlType" label="规格型号" align="left"></el-table-column>
                        <el-table-column prop="matlUnit" label="计量单位" align="left">
                            <template slot-scope="{row}">
                                <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column v-if="checkType == 1" prop="inventoryNum" label="库存数量"
                            align="left"></el-table-column>
                        <el-table-column prop="batchNo" label="批次号" align="left"></el-table-column>
                        <el-table-column prop="unitName" label="所属组织" align="left" />
                        <el-table-column prop="projectCode" label="项目编码" align="left">
                        </el-table-column>
                        <el-table-column prop="projectName" label="项目名称" align="left" />
                        <el-table-column prop="areaName" label="地区" align="left"></el-table-column>
                        <el-table-column prop="warehouseName" label="仓库" align="left"></el-table-column>
                        <el-table-column prop="storageName" label="储区" align="left"></el-table-column>
                        <el-table-column prop="address" label="操作" align="center" v-if="queryType !== 'view'">
                            <template slot-scope="scope">
                                <el-button type="text" @click="handleDeleteRow(scope.row)">删行</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </VFormRender>
        </div>
        <select-inventory ref="selectInven" @selections="selections"></select-inventory>
        <choice-material :isPurPlanQuote="true" ref="choiceMaterial"
            @choiceMaterialClick="handlerConfirmMaterial" />
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import indexMixin from '@/views/mixins';
import { getToken } from '@/utils/auth'
import { deptTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getUserInfo } from '@/utils/user-info'
import SelectInventory from './components/selectInventory'
import { saveOrder, orderView } from '@/api/warehouseManage/inventorySheet'
import VFormRender from '@/components/form-render/index'
import choiceMaterial from "@/views/components/choice-material"
import tooltip from '@/components/tooltip'
export default {
    name: "inventorySheetMainDetail",
    mixins: [indexMixin],
    dicts: ['MeasureUnit'],
    components: { choiceMaterial, SelectInventory, VFormRender, tooltip },
    data() {
        return {
            loading: false,
            queryType: '',
            queryId: '',
            invenVisible: false,
            queryName: '',
            formData: {existsInv: 1},
            managerData: [],
            userInfo: getUserInfo(),
            detailList: [],
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
                { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
            ],
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '19',
            },
            selectDetailRow: [],
            checked: false,
            checkType: 1
        }
    },
    created() {
        this.init()
    },
    methods: {
        handleExistsInv(e) {
            this.formData.existsInv = e
        },
      
        checkoutStatus(flag) {
            const widgets = ['checkDeptId', 'grid36685', 'grid38607', 'checkCode', 'checkName']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        init() {
            let { type, name, id, auditArr } = this.isDialog ? this.dialogQuery : this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'inventorySheetMaintenance';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                if (this.queryType === 'view' || this.queryType === 'update') {
                    this.getDetailInfo(this.queryId)
                    this.$refs['vFormRef'].setReadMode(this.queryType === 'view')
                }
                await this.getDeptTreeData()
                if (this.queryType === 'create') {
                    this.$refs['vFormRef'].setFieldValue('checkDeptId', this.userInfo.deptId)
                    this.setUsersByDeptId(this.userInfo.deptId, this.userInfo.deptName, this.userInfo.nickName)
                    this.$refs['vFormRef'].setFieldValue('checkUserId', this.userInfo.id)
                }

            })
        },
        getDetailInfo(id) {
            this.loading = true
            orderView(id).then(res => {
                this.$refs['vFormRef'].setFormData(res.data);
                this.detailList = res.data.detailList || [];
                this.setUsersByDeptId(res.data.checkDeptId, res.data.checkDeptName, res.data.checkUserName)
            }).finally(() => {
                this.loading = false;
            })
        },
        async setUsersByDeptId(deptId, deptName, nickName) {
            const managerData = await userListAll({ deptId: deptId })
            this.formData.checkDeptName = deptName
            this.formData.checkUserName = nickName
            if (!nickName) {
                this.$refs['vFormRef'].setFieldValue('checkUserId', '')
            }
            this.$refs['vFormRef'].enableWidgets('checkUserId')
            this.$refs['vFormRef'].getWidgetRef('checkUserId').loadOptions(managerData.data.list || [])
            this.managerData = managerData.data.list || []
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('inventoryDetail').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('checkDeptId').loadOptions(res.data || [])
        },
        buttonShow(item) {
            if (['submit', 'update'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)) {
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
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        newButton(buttonCode) {
            if (buttonCode === 'cancel') {
                this.$tab.closeOpenPage({ name: this.queryName })
            } else if (buttonCode === 'save') {
                if (this.detailList.length == 0) {
                    this.$message.warning('请添加明细')
                    return
                }
                this.$refs.vFormRef.getFormData().then(formData => {
                    this.loading = true
                    saveOrder(Object.assign(formData, this.formData, { detailList: this.detailList, id: this.queryId })).then(({ data, message, success }) => {
                        if (success) {
                            this.$message.success('保存成功')
                            setTimeout(() => {
                                this.cancel(this.queryName)
                            }, 100)
                        } else {
                            this.$message.error(message)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                }).catch(err => {
                    this.$modal.msgError('表单数据校验失败');
                })
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        selectChange(name, node) {
            if (name === 'checkUserId') {
                this.formData.checkUserName = this.managerData.find(item => item.id === node).nickName || ''
            } else if (name === 'checkType') {
                this.checkType = node
            }

        },
        handlerConfirmMaterial(detailList) {
            this.detailList = detailList
        },
        selectMaterial() {
            const detailList = this.detailList || []
            this.$refs.choiceMaterial.init(null, detailList)
        },
        selectInventory() {
            const detailList = this.detailList || []
            const existsInv = this.$refs['vFormRef'].getFieldValue('existsInv')
            this.$refs['selectInven'].open(detailList, { existsInv })
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === 'checkDeptId') {
                if (node.id) {
                    this.setUsersByDeptId(node.id, node.deptName, '')
                }
            }
        },
        treeSelectInput(name, newVal) {
            if (!newVal) {
            }
        },
        selectDetail(list) {
            this.selectDetailRow = list
        },
        deleteRow(row) {
            this.detailList = this.detailList.filter(item => {
                return this.selectDetailRow.filter(ele => ele.id === item.id).length === 0
            })
        },
        handleDeleteRow(row) {
            this.detailList = this.detailList.filter(item => row.id !== item.id)
        },
        selections(detailList = []) {
            this.detailList = detailList
            this.detailList.map(item => {
                item.inventoryId = item.id
            })
        }
    },
}
</script>
<style lang="scss" scoped>
.button-with-tooltip {
    margin: 0 0 10px 10px;
    display: flex;
    align-items: center;

    .un-quilt-btn {
        min-width: 100px;
        height: 32px;
        border: #1890ff solid 1px;
        border-radius: 50px;
        padding: 0;
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
