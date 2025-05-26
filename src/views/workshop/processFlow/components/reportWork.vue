<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>

        <el-row type="flex" class="container_h">
            <!--部门数据-->
            <collapse>
                <el-col :xs="24" class="container_flex_overflow">
                    <div class="head-container ov_head">
                        <el-tree v-loading="treeLoading" class="drawer-tree" node-key="id" icon-class="drawer-icon"
                            :indent="0" :data="treeOptions" :props="defaultProps" :expand-on-click-node="false"
                            ref="tree" :highlight-current="true" @node-click="handleNodeClick"
                            :render-content="renderContent" :default-expanded-keys="defaultExpandedKeys"
                            :default-checked-keys="defaultCheckedKeys">
                        </el-tree>
                    </div>
                </el-col>
            </collapse>

            <!--用户数据-->
            <el-col :span="20" :xs="24" class="container_flex">
                <div class="container_flex_form">
                    <VFormRender ref="vFormRef" :form-data="formData" @appendButtonClick="handleAppendButtonClick"
                        :class="{ 'formRender_view': queryType === 'view' }" @buttonClick="handleButtonClick"
                        @selectChange="selectChange" @formChange="handleFormChange">
                        <template slot="design_p1">
                            <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="来源信息" />来源信息</p>
                        </template>
                        <template slot="design_p2">
                            <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="产品信息" />产品信息</p>
                        </template>
                        <template slot="design_p3">
                            <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="工艺信息" />工序信息</p>
                        </template>
                        <template slot="design_p4">
                            <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="单位部门" />部门信息</p>
                        </template>
                        <template slot="design_p5">
                            <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="数量信息" />数量信息</p>
                        </template>
                        <template slot="design_p6">
                            <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="日期信息" />工时信息</p>
                        </template>
                        <template slot="design_p7">
                            <p class="design_p"><svg-icon v-if="queryType === 'view'" icon-class="其他信息" />其他信息</p>
                        </template>
                        <template slot="fileList">
                            <div style="display: flex;flex-direction: column;">
                                <attachmentTable ref="attachmentTable" :businessType="businessType" v-model="fileList">
                                </attachmentTable>
                            </div>
                        </template>
                    </VFormRender>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { formFillInPage } from '@/api/form/form'
import { flowReportWork, flowReportView } from '@/api/prodmgr-mm/processFlow';
import attachmentTable from '@/views/components/attachmentTable'
import collapse from '@/components/Collapse'
import VFormRender from '@/components/form-render/index'
export default {
    name: "reportWork",
    components: { attachmentTable, collapse, VFormRender },
    data() {
        return {
            loading: false,
            treeLoading: false,
            queryId: '',
            queryName: '',
            formJson: {},
            formData: {},
            // 菜单按钮、字段等数据
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'reportWork,view' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'reportWork' },
            ],
            treeOptions: [],
            defaultProps: {
                children: "detailList",
                label: "flowCode",
                disabled: function (data, node) {
                    if (data.detailList && data.detailList.lenght > 0) {
                        return true
                    } else {
                        return false
                    }
                }
            },
            fileList: [],
            businessType: '31',
            defaultExpandedKeys: [],
            defaultCheckedKeys: [],
            formDataList: [],
            queryType: ''
        }
    },
    watch: {
        fileList: {
            handler: function (val) {
                const flowCode = this.$refs.vFormRef && this.$refs.vFormRef.getFieldValue('flowCode')
                this.formDataList.forEach((item, i) => {
                    if (flowCode === item.flowCode) {
                        this.formDataList[i] = Object.assign({}, item, { fileList: val })
                    }
                })
            },
            deep: true
        },
    },
    created() {
        this.init();
    },
    methods: {
        handleFormChange(fieldName, newValue, oldValue, formModel) {
            if (fieldName == 'finishNum') {
                this.$refs['vFormRef'].getWidgetRef('qualifiedNum').field.options.max = newValue
                let qualifiedNum = this.$refs.vFormRef.getFieldValue("qualifiedNum")
                if (qualifiedNum) {
                    this.$refs.vFormRef.setFieldValue("unqualifiedNum", newValue - qualifiedNum)
                }
            }
            if (fieldName == 'qualifiedNum') {
                let finishNum = this.$refs.vFormRef.getFieldValue("finishNum")
                if (finishNum) {
                    this.$refs.vFormRef.setFieldValue("unqualifiedNum", finishNum - newValue)
                    let key = this.$refs.tree.getCurrentKey()
                    let index = this.formDataList.findIndex(item => item.id == key)
                    if (index >= 0) {
                        this.formDataList[index] = Object.assign({}, this.formDataList[index], { unqualifiedNum: finishNum - newValue })
                    }
                }
            }
        },
        buttonShow(item) {
            if (['save'].includes(item.buttonCode) && item.type.indexOf(this.queryType) == -1) {
                return false
            }
            return true
        },
        init() {
            let { ids, name, type } = this.$route.query;
            this.queryId = ids || '';
            this.queryType = type
            this.queryName = name || 'processFlow';
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm();
                await this.formFillInPage();
                if (this.queryType === 'view') {
                    this.$refs['vFormRef'].setReadMode(true);
                }
                this.flowReportView(ids.split(','));
            })
        },
        flowReportView(ids) {
            flowReportView({ ids }).then(({ data }) => {
                this.treeOptions = data
                this.defaultExpandedKeys = [data[0].id]
                this.treeOptions.forEach(option => {
                    this.formDataList.push(...option.detailList)
                })
                this.formDataList = this.formDataList.map(item => {
                    return Object.assign({}, item, {
                        finishNum: !!item.reportCode ? item.finishNum : item.machiningNum,
                        qualifiedNum: !!item.reportCode ? item.qualifiedNum : item.machiningNum,
                        actualTime: !!item.reportCode ? item.actualTime : item.processStdTime
                    })
                })
                this.$nextTick(() => {
                    this.$refs.tree.setCurrentKey(this.formDataList[0].id);
                })
                this.$refs.vFormRef.setFormData(this.formDataList[0])
                this.fileList = this.formDataList[0].fileList
            })
        },
        renderContent(h, { node, data, store }) {
            if (node.level == '1') {
                const label = `流转卡号 ${node.label}`
                return (<span title={label} class="nodeLabel">{label}</span>);
            } else {
                const label  = `工序序号 ${data.processSort}，编码 ${data.processCode}`
                return (<span title={label} class="nodeLabel">{label}</span>);
            }
        },
        // 节点单击事件
        handleNodeClick(data) {
            if (!(data.detailList && data.detailList.length > 0)) {
                this.$refs.vFormRef.setFormData(data)
            }
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('reportWork').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data);
                    resolve(true);
                })
            })
        },
        selectChange(fieldName, newValue, oldValue, subFormName, subFormRowId) {
            const flowCode = this.$refs.vFormRef.getFieldValue('flowCode')
            this.formDataList.forEach((item, i) => {
                if (flowCode === item.flowCode) {
                    this.formDataList[i] = Object.assign({}, item, { [fieldName]: newValue })
                }
            })
        },
        handleAppendButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        handleButtonClick(vm) {
            let { field: { options: { name } } } = vm || {};
        },
        cancel(name) {
            // 关闭当前tabs
            this.$tab.closeOpenPage({ name });
        },
        newButton(buttonCode) {
            if (buttonCode === 'cancel') {
                this.cancel(this.queryName);
            } else if (buttonCode === 'save') {
                this.$refs.vFormRef.getFormData().then(formData => {
                    this.loading = true;
                    flowReportWork(this.formDataList).then(({ message }) => {
                        this.$modal.msgSuccess(message);
                        this.cancel(this.queryName);
                    }).finally(() => {
                        this.loading = false;
                    });
                }).catch(() => {
                    this.$modal.msgError('表单数据校验失败');
                })
                return
            }
        },
    }
};
</script>
<style>
.nodeLabel {
    display: inline-block;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>
<style lang="scss" scoped>

.container_h {
    overflow: hidden;

    .container_flex_form {
        overflow-x: hidden;
    }
}
</style>