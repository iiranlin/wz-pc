<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
            
            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" v-if="tableType != '2'" :class="{'formRender_view': queryType === 'view'}"
                @appendButtonClick="handleAppendButtonClick" @buttonClick="handleButtonClick" @formChange="handleFormChange"
                @selectChange="selectChange" @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect">
                <template slot="design_p1">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="主资产" />基本信息</p>
                </template>
                <template slot="design_p2">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="项目信息" />项目信息</p>
                </template>
                <template slot="design_p3">
                  <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="客户信息" />客户信息</p>
                </template>
                <template slot="fileList">
                    <div style="display: flex;flex-direction: column;">
                        <attachmentTable ref="attachmentTable" businessType="28" :queryType="queryType" v-model="fileList"></attachmentTable>
                    </div>
                </template>
                <div slot="detailedData">
                    <detailedList :unitId="unitId" ref="detailedList" :dict="dict.type" :queryType="queryType" :tableType="tableType"></detailedList>
                </div>
            </VFormRender>
            <detailedList v-else :unitId="unitId" ref="detailedList" :dict="dict.type" :queryType="queryType" :tableType="tableType"></detailedList>
        </div>
        <selectProject ref="selectProject" :singleMode="true" @selections="selections" :propsFormData="{unitId: unitId}"/>
        <selectCustomer ref="selectCustomer" singleMode  @selectCustom="selectCustom" />
        <toBeReviewed ref="toBereview"/>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import attachmentTable from '@/views/components/attachmentTable'
import { formFillInPage } from '@/api/form/form'
import { demandSaveOrder, demandSaveDetail, demandOrderView, demandDetailView, demandSaveSubmit } from '@/api/prodmgr-mm/researchDemand';
import { deptTree, getUnitTree } from '@/api/system/dept'
import selectProject from "@/views/components/selectProject"
import selectCustomer from "@/views/components/selectCustomer"
import { getUserInfo } from '@/utils/user-info'
import detailedList from "./components/detailedList"
import { generateUUID } from '@/utils'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import {ACTIVITI_ASSUGNEE} from '@/utils/constant'
export default {
    name: "selfResearchDemandOperate",
    mixins: [indexMixin],
    components: { VFormRender, selectProject, attachmentTable, detailedList, selectCustomer, toBeReviewed },
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
                { buttonName: '提交', buttonCode: 'saveSubmit', buttonIcon: 'Blue-Submit', type: 'create, update, view' },
            ],
            queryAuditArr: null,
            userInfo: getUserInfo(),
            status: '1',
            tableType: '1',
            fileList: [],
            checked: false,
            isQuery: '',
            unitId: ''
        }
    },
    created() {
        this.init();
    },
    methods: {
        checkoutStatus(flag) {
            const widgets = ['demandName', 'demandDeptId', 'comments', 'fileList', 'design_p2', 'grid18700', 'design_p3', 'grid70839']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        buttonShow(item) {
          if (item.buttonCode === 'rollbackToPrevious') {
            const query = this.isDialog ? this.dialogQuery : this.$route.query
            return query.name === 'audit' && query.type === 'view' && Array.isArray(this.queryAuditArr)
              && this.queryAuditArr.length === 1 && !!this.queryAuditArr[0]?.taskId
              && this.buttonShow({ ...item, buttonCode: 'reject' })
          }
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
            this.queryName = name || 'selfResearchDemand';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.tableType = tableType || '1';
            this.isQuery = isQuery
            this.$nextTick(async () => {
                if (this.queryType === 'update' && tableType === '2') {
                    this.getDetail();
                    return
                }
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                await this.getDeptTreeData();
                await this.getUnitTree()
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                }
                if (this.queryType != 'create') {
                    this.$refs['vFormRef'].disableWidgets('contractCode');
                    this.getDetail();
                } else {
                    const { deptId, deptName, unitId, unitName } = this.userInfo;
                    this.$refs['vFormRef'].setFieldValue("demandDeptId", deptId);
                    this.$refs['vFormRef'].setFieldValue("demandDeptName", deptName);
                    this.$refs['vFormRef'].setFieldValue("unitId", unitId);
                    this.$refs['vFormRef'].setFieldValue("unitName", unitName);
                    this.initUnitInfo()
                }
            })
        },
        getDetail () {
            const apiUrl = this.tableType == '1'?demandOrderView : demandDetailView
            this.loading = true;
            apiUrl(this.tableType == '1'?this.queryId:{ids: this.queryId.split(',')}).then(({ data }) => {
                if(this.tableType == '1'){
                    this.status = data.status;
                    this.$refs.detailedList.init(data.detailList);
                    delete data.detailList;
                    this.$refs["vFormRef"].setFormData(data);
                    this.fileList = !!data.fileList.length ? data.fileList.map(f => ({ ...f, uid: generateUUID() })) : []
                }else{
                    this.$refs.detailedList.init(data);
                }
            }).finally(() => {
                this.loading = false;
            });
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('demandDeptId').loadOptions(res.data || []);
        },
        async getUnitTree() {
            const res = await getUnitTree({ status: 0 })
            this.$refs['vFormRef'].getWidgetRef('unitId').loadOptions(res.data || [])
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('selfResearchDemandOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
        },
        handleFormChange(fieldName, newValue, oldValue) {
            if (fieldName == 'unitId' && newValue != oldValue) {
                this.unitId = newValue
                // 所属组织发生改变，更新库存数量
                !!this.$refs.detailedList.tableData.detailsList.length && this.updateMatlInvByUnit(newValue, this.$refs.detailedList.tableData.detailsList, '1')
            }
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "demandDeptId") {
                this.$refs.vFormRef.setFieldValue("demandDeptName", node.deptName);
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
            if (name === "demandDeptId") {
                if (!newVal) {
                    this.$refs.vFormRef.setFieldValue("demandDeptName", '');
                }
            }
            if (name === 'unitId') {
                if (!newVal) {
                    this.$refs.vFormRef.setFieldValue('unitName', '')
                    this.$refs['vFormRef'].setFieldValue("projectId", '')
                    this.$refs['vFormRef'].setFieldValue("projectCode", '')
                    this.$refs['vFormRef'].setFieldValue("projectName", '')
                }
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
            if (name === 'projectCode') {
                const unitId = this.$refs.vFormRef.getFieldValue("unitId");
                if(!unitId){
                  this.$modal.msgError('请先选择所属组织')
                  return
                }
                const pId= this.$refs.vFormRef.getFieldValue("projectId");
                this.$refs.selectProject.init(pId);
                return
            }
            if (name === 'cuCode') {
                const cId= this.$refs.vFormRef.getFieldValue("cuId");
                this.$refs.selectCustomer.init(cId);
                return
            }
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        /*选择项目信息*/
        selections(row) {
            this.$refs['vFormRef'].setFormData({ projectId: row.id, projectCode: row.projectCode, projectName: row.projectName });
        },
        /*选择客户信息*/
        selectCustom(row) {
            this.$refs['vFormRef'].setFormData({ cuId: row.id, cuCode: row.cuCode, cuName: row.cuName });
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
                            demandSaveDetail(detailedList.tableData.detailsList).then(({ message }) => {
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
                        this.$modal.msgError('表单数据校验失败');
                        reject('表单数据校验失败')
                    })
                })
                const pList = new Promise((resolve, reject) => {
                    return detailedList.$refs.elForm.validate(valid => {
                        if (valid) {
                            resolve(detailedList.tableData.detailsList)
                        } else {
                             this.$modal.msgError('表单数据校验失败');
                            reject('表单数据校验失败')
                        }
                    })
                })
                if(!detailedList.tableData.detailsList || !detailedList.tableData.detailsList.length) {
                    
                    return this.$modal.msgError('明细不能为空');
                }
                Promise.all([vFormRefData, pList]).then((data) => {
                    const formData = { ...data[0], detailList: data[1], fileList: this.fileList }
                    const saveObj = {
                      'save': () => { this.saveOrder(demandSaveOrder, formData) },
                      'saveSubmit': () => { 
                        this.$reviewerDialog({
                          type: ACTIVITI_ASSUGNEE.MM_ZYXQ,
                          multiple: false,
                          success: (assignee) => {
                            this.saveOrder(demandSaveSubmit, formData, assignee)
                          }
                        })
                      }
                    }
                    saveObj[buttonCode] && saveObj[buttonCode]()
                }).catch((error) => {
                    this.$modal.msgError(error);
                }).finally(() => {
                    this.loading = false;
                });


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
        saveOrder (url, formData, assignee) {
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
