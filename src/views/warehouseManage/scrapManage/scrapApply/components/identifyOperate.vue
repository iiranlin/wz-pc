<template>
    <Dialog class="dialog-route" :title="title" :destroy-on-close="true" :visible.sync="openDataScope"  tabindex='1' :close-on-click-modal="false" width="900px" append-to-body v-loading="loading" >
        <VFormRender ref="vFormRef"
            :global-dsv="globalDsv"
            @selectChange="selectChange"
            @treeSelectSelect="treeSelectSelect"
            @treeSelectInput="treeSelectInput">
            <template slot="fileList">
                <div style="display: flex;flex-direction: column;">
                    <attachmentTable ref="attachmentTable" businessType="24" queryType="create" v-model="fileList"></attachmentTable>
                </div>
            </template>
        </VFormRender>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDataScope">确 定</el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
    </Dialog>
</template>

<script>
import attachmentTable from '@/views/components/attachmentTable'
import { applyIdentifySave, applyDetailView } from '@/api/prodmgr-inv/scrapApply'
import { deptTree } from '@/api/system/dept'
import { userListAll } from '@/api/system/user'
import { formFillInPage } from '@/api/form/form'
import { getUserInfo } from '@/utils/user-info'
import { getToken } from '@/utils/auth'
import VFormRender from '@/components/form-render/index'
export default {
    components: {
        attachmentTable,
        VFormRender
    },
    data() {
        return {
            loading: false,
            openDataScope: false,
            title: "鉴定维护",
            userInfo: getUserInfo(),
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '24'
            },
            openDataImg: false,
            id: null,
            typeCode: '',
            nameId: ['identifyUserId', 'identifyUserName', 'identifyDeptName', 'identifyTwoUserId', 'identifyTwoUserName', 'identifyThreeUserId', 'identifyThreeUserName'],
            nameArr: ['identifyUserId', 'identifyTwoUserId', 'identifyThreeUserId'],
            fileList: []
        };
    },
    created() { },
    methods: {
        init(ids = [], typeCode = '') {
            this.ids = ids;
            this.typeCode = typeCode;
            this.openDataScope = true;
            this.$nextTick(async () => {
                await this.formFillInPage();
                await this.getDeptTreeData();
                this.$refs['vFormRef'].resetForm();
                if(this.typeCode === 'updateIdentify'){
                    this.applyDetailView(ids);
                    return
                }
                const {deptId: identifyDeptId, deptName: identifyDeptName, nickName: identifyUserName, id: identifyUserId} = this.userInfo;
                this.getUserListAll(identifyDeptId);
                this.$refs['vFormRef'].setFormData({
                    identifyDeptId,
                    identifyDeptName,
                    identifyUserId,
                    identifyUserName
                })
                this.fileList = []
            });
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('identifyOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        selectChange (fieldName, newValue) {
            if (this.nameArr.includes(fieldName)) {
                const fieldId = fieldName.slice(0, -2);
                if(newValue){
                    const optionLabel = this.$refs['vFormRef'].getWidgetRef(fieldName).optionLabel;
                    this.$refs['vFormRef'].setFieldValue(`${fieldId}Name`, optionLabel);
                }else{
                    this.$refs['vFormRef'].setFieldValue(`${fieldId}Name`,"");
                }
            }
        },
        treeSelectInput (vm, node) {
            let {
                field: {
                    options: {name},
                },
            } = vm || {};
            if(!node){
                if (name === "identifyDeptId") {
                    this.setVFormRefValue(this.nameId, this.nameArr)
                }
            }
        },
        // 部门树选择
        treeSelectSelect(vm, node) {
            let {
                field: {
                    options: {name},
                },
            } = vm || {};
            if (name === "identifyDeptId") {
                this.setVFormRefValue(this.nameId, this.nameArr)
                this.$refs.vFormRef.setFieldValue("identifyDeptName", node.name);
                this.getUserListAll(node.id);
            }
        },
        setVFormRefValue (nameId = [], nameArr = []) {
            nameId.forEach( item => {
                this.$refs['vFormRef'].setFieldValue(item,"");
            })
            nameArr.forEach( item => {
                this.$refs['vFormRef'].getWidgetRef(item).loadOptions([]);
            })
        },
        async getDeptTreeData() {
            const res = await deptTree({ bizStatus: '1' })
            this.$refs['vFormRef'].getWidgetRef('identifyDeptId').loadOptions(res.data || [])
        },
        async getUserListAll(deptId){
            const res = await userListAll({deptId});
            this.nameArr.forEach( item => {
                this.$refs['vFormRef'].getWidgetRef(item).loadOptions(res.data.list || []);
            })
        },
        async applyDetailView (ids) {
            try {
                this.loading = true;
                const { data } = await applyDetailView({ ids });
                if(data[0].identifyDeptId){
                    this.getUserListAll(data[0].identifyDeptId);
                }else{
                    data[0].identifyDeptId = undefined;
                }
                this.$refs['vFormRef'].setFormData(data[0]);
                this.fileList = data[0] && data[0].fileList
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        submitDataScope () {
            this.$refs.vFormRef.getFormData().then(formData => {
                this.loading = true;
                applyIdentifySave({...formData, ids: this.ids, fileList: this.fileList}).then(({ message }) => {
                    this.$modal.msgSuccess(message);
                    this.openDataScope = false;
                    this.$emit('operateSuccess');
                }).finally(() => {
                    this.loading = false;
                });
            }).catch(err => {
                this.$modal.msgError('表单数据校验失败');
            })
        }
    },
};
</script>
