<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top v-if="!isDialog" :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
            
            <el-switch v-if="tableType == '1'" v-model="checked" @change="checkoutStatus" class="checkbox_required" active-text="隐藏非必填项">
            </el-switch>
            <VFormRender ref="vFormRef" :form-data="formData" @appendButtonClick="handleAppendButtonClick" :class="{'formRender_view': queryType === 'view'}"
                @selectChange="selectChange" @treeSelectInput="treeSelectInput" @treeSelectSelect="treeSelectSelect">
                <div slot="details">
                    <qualityTestingList ref="qualityTestingList" :qiSource="qiSource" :queryType="queryType" @remove="handleRemove" @sonInput="sonInput">
                    </qualityTestingList>
                </div>
            </VFormRender>
        </div>
        <choice-purchase ref="choicePurchase" :propsFormData="propsFormData"
            @selections="selectionsPurchase"></choice-purchase>
        <choice-quoteList ref="choiceQuoteList" @selections="selectionsPurchase"></choice-quoteList>
        <choice-return ref="choiceReturn" @selections="selectionsPurchase"></choice-return>
        <toBeReviewed ref="toBereview" />
        <choice-returnQuoteList ref="choiceReturnQuoteList" @selections="selectionsPurchase"></choice-returnQuoteList>
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { qiSaveOrder, qiOrderView, getQiSource, qiSaveSubmit } from '@/api/prodmgr-inv/qi';
import { deptTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import qualityTestingList from './components/qualityTestingList'
import choicePurchase from '@/views/components/choice-purchase'
import choiceQuoteList from '@/views/components/choice-quoteList'
import choiceReturn from '@/views/components/choice-return'
import choiceReturnQuoteList from '@/views/components/choice-returnQuoteList'
import { getUserInfo } from '@/utils/user-info'
import toBeReviewed from '@/views/audit/components/toBeReviewed'
import VFormRender from '@/components/form-render/index'
import indexMixin from '@/views/mixins'
import { qiQuoteList } from '@/api/prodmgr-pu/arrived'
export default {
    name: "qualityTestingOperate",
    dicts: ['qiSource'],
    mixins: [indexMixin],
    components: { VFormRender, qualityTestingList, choicePurchase, choiceQuoteList, choiceReturn, toBeReviewed, choiceReturnQuoteList },
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
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update, push' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update, push' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
                { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
                { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
            ],
            queryAuditArr: null,
            status: '',
            qiStatus: '',
            userInfo: getUserInfo(),
            propsFormData: {
                bizStatus: 0
            },
            tableType: '1',
            checked: false,
            qiSource: ''
        }
    },
    computed: {
        ...mapGetters(['infoData']),
    },
    created() {
        this.init();
    },
    methods: {
        checkoutStatus(flag) {
            const widgets = ['qiDeptId', 'qiUserId', 'comments', 'qiCode']
            if (flag) {
                this.$refs.vFormRef.hideWidgets(widgets)
            } else {
                this.$refs.vFormRef.showWidgets(widgets)
            }
        },
        buttonShow(item) {
            if(this.qiStatus == '3' && item.buttonCode == 'edit') {
                return false
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && this.tableType == '2') {
                return false
            }
            if (['saveSubmit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.status) || ['saveSubmit'].includes(item.buttonCode) && this.qiStatus != '3') {
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
        init() {
            let { type, name, id, auditArr, tableType, isQuery = '', qiSource = '', ids = ''} = this.isDialog ? this.dialogQuery :  this.$route.query;
            this.queryType = type || 'create';
            this.queryId = id || '';
            this.queryName = name || 'qualityTesting';
            this.queryAuditArr = (auditArr && JSON.parse(auditArr)) || null;
            this.tableType = tableType || '1';
            this.isQuery = isQuery
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                await this.getDeptTreeData();
                const qiSourceData = await getQiSource();
                if (this.queryType == 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                }
                if (this.queryType != 'create' && this.queryType != 'push') {
                    this.qiOrderView(qiSourceData.data || []);
                } else {
                    const { deptId, deptName, nickName, id: nickId } = this.userInfo;
                    this.$refs['vFormRef'].getWidgetRef('qiSource').loadOptions(qiSourceData.data || []);
                    this.getUserListAll(deptId);
                    this.$refs['vFormRef'].setFieldValue("qiDeptId", deptId);
                    this.$refs['vFormRef'].setFieldValue("qiDeptName", deptName);
                    this.$refs['vFormRef'].setFieldValue("qiUserId", nickId);
                    this.$refs['vFormRef'].setFieldValue("qiUserName", nickName);
                    if(this.queryType == 'push'){
                      this.$refs['vFormRef'].setFieldValue("qiSource", qiSource)
                      this.$refs['vFormRef'].disableWidgets('sourceCode')
                      if(qiSource === '1'){
                        this.qiQuoteList(ids)
                      }
                    }
                }
            })
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' });
            this.$refs['vFormRef'].getWidgetRef('qiDeptId').loadOptions(res.data || []);
        },
        async getUserListAll(deptId) {
            const res = await userListAll({ deptId });
            this.$refs['vFormRef'].getWidgetRef('qiUserId').loadOptions(res.data.list || []);
        },
        qiQuoteList(ids) {
          qiQuoteList({bizStatus: '0', ids}).then(({ data }) => {
            this.selectionsPurchase(data?.list.map(item => ({ ...item, uid: `${item.batchNo}-${item.sourceDetailId}` })) || [])
          })
        },
        qiOrderView(qiSourceData) {
            this.loading = true;
            qiOrderView(this.queryId).then(({ data }) => {
                this.status = data.status;
                this.qiStatus = data.qiStatus
                this.qiSource = data.qiSource
                this.$refs.qualityTestingList.init(data.detailList);
                if (data.qiDeptId) {
                    this.getUserListAll(data.qiDeptId);
                } else {
                    data.qiDeptId = undefined;
                }
                this.dict.type.qiSource.forEach(item => {
                    if (item.value == data.qiSource) {
                        qiSourceData.push(item.raw)
                    }
                });
                const uniqueArray = Array.from(qiSourceData.reduce((map, item) => {
                    map.set(item.code, item);
                    return map;
                }, new Map()).values());
                this.$refs['vFormRef'].getWidgetRef('qiSource').loadOptions(uniqueArray);
                this.$refs["vFormRef"].setFormData(data);
            }).finally(() => {
                this.loading = false;
            });
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('qualityTestingOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        selectChange(fieldName, newValue) {
            if (fieldName === 'qiUserId') {
                if (newValue) {
                    const optionLabel = this.$refs['vFormRef'].getWidgetRef('qiUserId').optionLabel;
                    this.$refs['vFormRef'].setFieldValue("qiUserName", optionLabel);
                } else {
                    this.$refs['vFormRef'].setFieldValue("qiUserName", "");
                }
                return
            }
            if (fieldName === 'qiSource') {
                this.qiSource = newValue
                this.$refs.qualityTestingList.tableData.detailsList = []
                this.$refs.vFormRef.setFieldValue("sourceCode", '');
            }
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } }, formModel: { qiSource } } = vm || {};
            if (name === 'sourceCode') {
              const codes = this.$refs.qualityTestingList.tableData.detailsList
                if (qiSource) {
                    if (qiSource == '1') {

                        this.$refs.choicePurchase.open(codes);
                    }
                    if (qiSource == '2' || qiSource == '4') {
                        this.$refs.choiceReturn.open(codes, qiSource);
                    }
                    if (qiSource == '3') {
                        this.$refs.choiceQuoteList.open(codes);
                    }
                    if (qiSource == '7') {
                        this.$refs.choiceReturnQuoteList.open(codes);
                    }
                } else {
                    this.$modal.msgError('请先选择质检来源！');
                }

            }
        },
        // 部门树选择
        async treeSelectSelect(vm, node) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "qiDeptId") {
                this.$refs['vFormRef'].setFieldValue("qiUserId", "");
                this.$refs['vFormRef'].setFieldValue("qiUserName", "");
                this.$refs.vFormRef.setFieldValue("qiDeptName", node.deptName);
                this.getUserListAll(node.id);
            }
        },
        treeSelectInput(vm, newVal) {
            let {
                field: {
                    options: { name },
                },
            } = vm || {};
            if (name === "qiDeptId") {
                if (!newVal) {
                    this.$refs['vFormRef'].setFieldValue("qiUserId", "");
                    this.$refs['vFormRef'].setFieldValue("qiUserName", "");
                    this.$refs['vFormRef'].getWidgetRef('qiUserId').loadOptions([]);
                }
            }
        },
        selectionsPurchase(data) {
            const sourceCode = data.map((item) => item.sourceCode);
            const sourceCodeArr = sourceCode.filter((item, index) => sourceCode.indexOf(item) === index);
            this.$refs.vFormRef.setFieldValue("sourceCode", sourceCodeArr.join(','));
            this.$refs.qualityTestingList.init(data);
        },
        handleRemove(arr) {
            const sourceCode = arr.map((item) => item.sourceCode);
            const sourceCodeArr = sourceCode.filter((item, index) => sourceCode.indexOf(item) === index);
            this.$refs.vFormRef.setFieldValue("sourceCode", sourceCodeArr.join(','));
        },
        sonInput(row, type) {
        },
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        newButton(buttonCode) {
            if (buttonCode === 'edit') {
                this.queryType = 'update';
                this.$refs['vFormRef'].setReadMode(false);
            } else if (buttonCode === 'cancel') {
                this.cancel(this.queryName);
            } else if (buttonCode === 'save') {
                this.handleSave(buttonCode)
            } else if (buttonCode === 'pass') {
                this.$refs.toBereview.init('pass', this.queryAuditArr, this.queryName);

            } else if (buttonCode === 'reject') {
                this.$refs.toBereview.init('reject', this.queryAuditArr, this.queryName);

            }
        },
        async handleSave(buttonCode) {
            try {
                const vFormRefData = new Promise((resolve, reject) => {
                    return this.$refs.vFormRef.getFormData().then(formData => {
                        resolve(formData)
                    }).catch(error => {
                        reject()
                    })
                })

                const qualityTestingList = this.$refs['qualityTestingList'];
                const pList = new Promise((resolve, reject) => {
                    return qualityTestingList.$refs.elForm.validate(valid => {
                        if (valid) {
                            resolve(qualityTestingList.tableData.detailsList)
                        } else {
                            reject()
                        }
                    })
                })
                const data = await Promise.all([vFormRefData, pList])
                const param = { ...data[0], detailList: data[1] }
                if (this.queryId) {
                    param.id = this.queryId
                }
                this.saveOrder(qiSaveOrder, param)
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
<style lang="scss" scoped></style>
