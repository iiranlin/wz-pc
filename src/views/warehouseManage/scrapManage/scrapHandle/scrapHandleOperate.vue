<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
            
            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv" :class="{'formRender_view': queryType === 'view'}"
                @appendButtonClick="handleAppendButtonClick" @buttonClick="handleButtonClick"
                @selectChange="selectChange" @treeSelectSelect="treeSelectSelect">
                <template slot="design_p1">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
                </template>
                <template slot="design_p2">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="25" :queryType="queryType" v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <div slot="detailedData">
                    <detailedList @change="handleDetailChange" ref="detailedList" :dict="dict" :queryType="queryType" @numInput="numInput"></detailedList>
                </div>
            </VFormRender>
            <!-- <detailedList v-else style="margin-top: 50px;" @change="handleDetailChange" ref="detailedList" :dict="dict"
                :queryType="queryType" @numInput="numInput"></detailedList> -->
        </div>
        <selectProject ref="selectProject" singleMode @selections="selections" />
        <selectScrapApply ref="selectScrapApply" @selections="handleConfirmScrap" />
        <toBeReviewed ref="toBereview"/>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import attachmentTable from '@/views/components/attachmentTable'
import { formFillInPage } from '@/api/form/form'
import { handleSave, handleView, handleDetailView, detailSave, handleSaveSubmit } from '@/api/prodmgr-inv/scrapHandle'
import { deptTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { getToken } from '@/utils/auth'
import detailedList from './components/detailedList'
import selectProject from "@/views/components/selectProject"
import selectScrapApply from "@/views/components/selectScrapApply"
import { getUserInfo } from '@/utils/user-info'
import { uniqueArrByField } from '@/utils'
import { getQuoteList } from '@/api/prodmgr-inv/scrapApply'
import { generateUUID } from '@/utils'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
export default {
    name: "scrapHandleOperate",
    components: { VFormRender, detailedList, selectProject, selectScrapApply, attachmentTable, toBeReviewed },
    dicts: ['MeasureUnit', 'payment'],
    mixins: [indexMixin],
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
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update, pushDown' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update, pushDown' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
                { buttonName: '退回上一步', buttonCode: 'rollbackToPrevious', buttonIcon: 'Blue-Cancel', type: '' },
                { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
                { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
                { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'create, update, view' },
            ],
            queryAuditArr: null,
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '25',
            },
            userInfo: getUserInfo(),
            status: '1',
            tableType: '1',
            checked: false,
            ids: '',
            fileList: [],
        }
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
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && (!['0', '1'].includes(this.status) || this.tableType == '2' || this.queryName == 'toBeDeal')) {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        init() {
            let { type, name, id, ids, auditArr, tableType, nextSug = '' } = this.isDialog ? this.dialogQuery : this.$route.query
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.ids = ids || '';
            this.queryName = name || 'scrapHandle';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.tableType = tableType || '1';
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                await this.getDeptTreeData();
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                    this.$refs['vFormRef'].hideWidgets(['deleteButton']);
                }
                if (this.queryType != 'create' && this.queryType != 'pushDown') {
                    this.handleView();
                } else {
                    const { deptId, deptName, nickName, id: nickId } = this.userInfo;
                    this.getUserListAll(deptId);
                    this.$refs['vFormRef'].setFieldValue("handleDeptId", deptId);
                    this.$refs['vFormRef'].setFieldValue("handleDeptName", deptName);
                    this.$refs['vFormRef'].setFieldValue("handleUserId", nickId);
                    this.$refs['vFormRef'].setFieldValue("handleUserName", nickName);
                    if (this.queryType === 'pushDown') {
                        this.getQuoteList(this.ids.split(','));
                        this.$refs['vFormRef'].disableWidgets('scrapCode');
                        this.$refs.vFormRef.getWidgetRef('scrapCode').setAppendButtonVisible(false);
                        if(!!nextSug) {
                            this.$refs['vFormRef'].setFieldValue("handleMethod", nextSug);
                        }
                        return
                    }
                }
            })
        },
        async getQuoteList(ids = []) {
            try {
                this.loading = true;
                const { data: { list } } = await getQuoteList({ ids });
                const arrCode = uniqueArrByField(list, 'scrapCode')
                this.$refs['vFormRef'].setFieldValue('scrapCode', arrCode.join(','));
                this.$refs['vFormRef'].setFieldValue('unitName', list[0].unitName);
                this.$refs['vFormRef'].setFieldValue('unitCode', list[0].unitCode);
                this.$refs['vFormRef'].setFieldValue('projectName', list[0].projectName);
                this.$refs['vFormRef'].setFieldValue('projectId', list[0].projectId);
                this.$refs['vFormRef'].setFieldValue('projectCode', list[0].projectCode);
                this.$refs.detailedList.update(list || []);
            } finally {
                this.loading = false;
            }
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('handleDeptId').loadOptions(res.data || []);
        },
        async getUserListAll(deptId) {
            const res = await userListAll({ deptId });
            this.$refs['vFormRef'].getWidgetRef('handleUserId').loadOptions(res.data.list || []);
        },
        handleView() {
            this.loading = true;
            if (this.tableType == '1') {
                handleView(this.queryId).then(({ data }) => {
                    this.status = data.status;
                    if (data.handleDeptId) {
                        this.getUserListAll(data.handleDeptId);
                    } else {
                        data.handleDeptId = undefined;
                    }
                    this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                    this.$refs.detailedList.init(data.detailList);
                    delete data.detailList;
                    this.$refs["vFormRef"].setFormData(data);
                    this.numInput();
                }).finally(() => {
                    this.loading = false;
                });
            } else {
                const widgets = ['card112021', 'grid104630']
                const ids = this.queryId.split(',');
                this.$refs.vFormRef.hideWidgets(widgets)
                handleDetailView({ ids }).then(({ data }) => {
                    this.$refs.detailedList.init(data);
                    this.numInput();
                }).finally(() => {
                    this.loading = false;
                });
            }
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('scrapHandleOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        checkoutStatus(flag) {
            const widgets = ['grid96921', 'grid78398', 'design_p2', 'grid18700', 'handleCode']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        selectChange(fieldName, newValue) {
            if (fieldName === 'handleUserId') {
                if (newValue) {
                    const optionLabel = this.$refs['vFormRef'].getWidgetRef('handleUserId').optionLabel;
                    this.$refs['vFormRef'].setFieldValue("handleUserName", optionLabel);
                } else {
                    this.$refs['vFormRef'].setFieldValue("handleUserName", "");
                }
                return
            }
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "handleDeptId") {
                this.$refs['vFormRef'].setFieldValue("handleUserId", "");
                this.$refs['vFormRef'].setFieldValue("handleUserName", "");
                this.$refs.vFormRef.setFieldValue("handleDeptName", node.deptName);
                this.getUserListAll(node.id);
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};

            if (name === 'projectCode') {
               const pId = this.$refs['vFormRef'].getFieldValue("projectId");
                this.$refs.selectProject.init(pId);
            } else if (name === 'scrapCode') {
                const detailsList = this.$refs.detailedList.tableData.detailsList;
                this.$refs.selectScrapApply.open(detailsList)
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            if (name === 'deleteButton') {
                this.$refs.detailedList.removeData();
            }
        },
        handleConfirmScrap(rows) {
            this.$refs.vFormRef.setFieldValue('unitId', rows[0].unitId);
            this.$refs.vFormRef.setFieldValue('unitName', rows[0].unitName);
            this.$refs.vFormRef.setFieldValue('projectId', rows[0].projectId);
            this.$refs.vFormRef.setFieldValue('projectCode', rows[0].projectCode);
            this.$refs.vFormRef.setFieldValue('projectName', rows[0].projectName);

            this.handleDetailChange(rows)
            this.$refs.detailedList.update(rows);
            this.numInput();
        },
        handleDetailChange(rows) {
            const arrCode = uniqueArrByField(rows, 'scrapCode')
            this.$refs['vFormRef'].setFieldValue('scrapCode', arrCode.join(','));
            this.numInput();
        },
        /*选择项目信息*/
        selections(row) {
            this.$refs['vFormRef'].setFormData({ ...row, projectId: row.id });
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
                return
            }
            if (buttonCode === 'cancel') {
                this.cancel(this.queryName);
            } else if (buttonCode === 'save' || buttonCode === 'saveSubmit') {
                this.save(buttonCode)
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
        async save(buttonCode) {
            try {
                const detailedList = this.$refs['detailedList'];
                if (this.tableType == '2') {
                    detailedList.$refs.elForm.validate(valid => {
                        if (valid) {
                            this.loading = true;
                            detailSave(detailedList.tableData.detailsList).then(({ message }) => {
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
                  const saveObj = {
                    'save': () => { this.handleSave(handleSave, data) },
                    'saveSubmit': () => { 
                      this.$reviewerDialog({
                        type: ACTIVITI_ASSUGNEE.INV_BFCZ,
                        multiple: false,
                        success: (assignee) => {
                          this.handleSave(handleSaveSubmit, data, assignee)
                        }
                      })
                    }
                  }
                  saveObj[buttonCode] && saveObj[buttonCode]()
                }).catch((error) => {
                    this.$modal.msgError('表单数据校验失败');
                })


            } catch (err) {
                console.errorr(err)
            } finally {

            }
        },
        handleSave (url, data, assignee) {
          const formData = { ...data[0], detailList: data[1], fileList: this.fileList }
          this.loading = true;
          url({ ...formData, id: this.queryId, assignee }).then(({ message }) => {
            this.$modal.msgSuccess(message);
            this.cancel(this.queryName);
          }).finally(() => {
            this.loading = false;
          });
        },
       
        numInput() {
            const detailedList = this.$refs['detailedList'];
            const total = detailedList.tableData.detailsList.reduce((accumulator, currentItem) => {
                return {
                    totalNum: accumulator.totalNum + currentItem.handleNum,
                    totalAmount: accumulator.totalAmount + currentItem.handleAmount
                };
            }, { totalNum: 0, totalAmount: 0 });
            this.$refs['vFormRef'].setFieldValue("totalNum", total.totalNum);
            this.$refs['vFormRef'].setFieldValue("totalAmount", total.totalAmount);
        }
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