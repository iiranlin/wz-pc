<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" @handleQuery="handleQuery"
            :formData="formData" />
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableData="dataList" :property="property"
            :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
            @selectChange="selectChange" @emitAblFilter="emitAblFilter" @clickLink="clickLink">
        </table-index>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <Dialog :title="designerData.title" :visible.sync="designerOpen" append-to-body>
            <process-designer :key="designerOpen" style="border: 1px solid rgba(0, 0, 0, 0.1)" ref="modelDesigner"
                v-loading="designerData.loading" :bpmnXml="designerData.bpmnXml" :designerForm="designerData.form"
                @save="onSaveDesigner" />
        </Dialog>
        <div>
            <operate ref="operate" @success="getList"></operate>
        </div>
        <div>
            <!--  添加或修改流程信息对话框  -->
            <versionRecord :open-version-record.sync="openVersionRecord"
                :process-key="currentRow && currentRow.processKey" @linkClick="clickLink" />
        </div>
        <Dialog title="流程详情" :visible.sync="openModeDetail" append-to-body width="1200px" :close-on-click-modal="false">
            <!-- 流程查看 -->
            <process-viewer :key="`designer-${loadIndex}`" :style="'height:' + height" :xml="xmlData"
                :isShowCommentList="false" />
        </Dialog>
    </div>
</template>

<script>
import ProcessDesigner from '@/components/ProcessDesigner'
import ProcessViewer from '@/components/ProcessViewer'
import versionRecord from './components/versionRecord.vue'
import { saveModel } from "@/api/workflow/model";
import { listCategory, delCategory, changeStatus, categoryBpmnXmlModel, categoryBpmnXmlVersion } from "@/api/workflow/category"
import indexMixin from '@/views/mixins';
import operate from './components/operate'

export default {
    name: "processDesign",
    mixins: [indexMixin],
    components: {
        ProcessDesigner,
        ProcessViewer,
        versionRecord,
        operate
    },
    data() {
        return {
            editLoading: false,
            //是否展示序号
            numberShow: false,
            // 遮罩层
            loading: false,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 表格数据
            dataList: [],
            //列表显示字段
            property: {},
            // 查询参数
            formData: {},
            formDataClick: {},
            total: 0,
            metaId: this.$route.meta.id,
            listQuery: {
                pageNum: 1,
                pageSize: 30,
            },
            // 指令
            command: '',
            // 勾选的数据
            selected: [],
            currentRow: {},
            deptOptions: [],
            // 选择的适用单位数据
            selectedTreeData: [],
            designerOpen: false,
            designerData: {
                loading: false,
                bpmnXml: '',
                modelId: null,
                form: {
                    processName: null,
                    processKey: null,
                },
            },
            openVersionRecord: false,
            // 查看流程模型
            openModeDetail: false,
            height: 500 + 'px;',
            // 模型xml数据
            loadIndex: 0,
            xmlData: undefined,
            finishedInfo: {
                finishedSequenceFlowSet: [],
                finishedTaskSet: [],
                unfinishedTaskSet: [],
                rejectedTaskSet: []
            },
        }
    },
    created() {
        this.menuProperty();
    },
    methods: {
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                this.property = data;
            }).finally(() => {
            });
        },
        handleTopButtonDisabled(button) {
            return this.selected.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (button.buttonCode == 'delete') {
                return this.selected.length != 1
            }
            if (button.buttonCode == 'enable') {
                return row.enableStatus != '1'
            }
            if (button.buttonCode == 'disable') {
                return row.enableStatus != '0'
            }
            if (button.buttonCode == 'copy') {
                return row.enableStatus != '0'
            }

            return true
        },
        // -------------组件自带函数start-------------
        numberChange(val) {
            this.numberShow = val;
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns);
        },
        //选择框回调
        selectChange(row) {
            let { formData, isWatch } = row;
            if (!isWatch) {
                this.handleQuery(formData);
            } else {
                this.formData = Object.assign({}, this.formData, formData);
            }
        },
        // TODO  是否去掉这个函数 节点单击事件
        handleNodeClick(data) {
            this.handleQuery()
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf("Start") != -1 || key.indexOf("End") != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        /** 搜索按钮操作 */
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
            this.formDataClick = Object.assign({}, this.formData, row)
            this.getList();
        },
        handleSelectionChange(ids, single, multiple, selected) {
            this.ids = ids
            this.single = single
            this.multiple = multiple
            this.selected = selected
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            this.command = buttonCode
            this.currentRow = rowArr[0]
            switch (buttonCode) {
                // 新建流程基本信息
                case 'create':
                    this.handleAdd()
                    break
                // 编辑流程基本信息
                case 'update':
                    this.handleUpdate(this.currentRow, buttonCode);
                    break;
                // 删除 只能删除停用的
                case 'delete':
                    this.handleDelete(idArr)
                    break
                // 复制流程  只复制基本信息
                case 'copy':
                    this.handleUpdate(this.currentRow, buttonCode);
                    break;
                //   break;
                // 设计流程按钮
                case 'design':
                    this.handleDesigner(this.currentRow)
                    break
                // 设计流程按钮
                case 'enable':
                    this.handleChangeStatus('0')
                    break
                // 设计流程按钮
                case 'disable':
                    this.handleChangeStatus('1')
                    break
                // 设计流程按钮
                case 'versionRecord':
                    this.openVersionRecord = true;
                    break
            }
        },
        clickReset() {
            this.menuProperty();
            this.handleQuery();
        },
        // 详情页
        clickLink(r, code) {
            this.xmlData = ''
            if (!r?.version) {
                return this.$message.error('当前流程无流程模型')
            }
            this.openModeDetail = true;
            if (code === 'processName') {
                this.getWorkFlowProcessViewer(r.modelId)
                return
            }
            if (!code) {
                this.categoryBpmnXmlVersion(r.deploymentId)
                return
            }
        },
        handleAdd() {
            this.$refs.operate.init();
        },
        // 删除
        async handleDelete(ids) {
            try {
                await this.$modal.confirm('确定删除所选流程吗?')

                const params = {
                    ids,
                }
                delCategory(params).then(res => {
                    const { success } = res
                    if (success) {
                        this.handleQuery()
                    } else {
                        this.$modal.msgError(res.message)
                    }
                })
            } catch (e) {
                console.log(e.message || e)
            }
        },
        // 停用启用
        async handleChangeStatus(status = '') {
            let loading = null
            try {
                await this.$modal.confirm(`${status === '0' ? '确定启用所选流程吗?' : '停用后，相关单据将不触发审核，确定停用该审核流程？'}`);
                loading = this.$loading({ lock: true, text: '加载中...', });
                const ids = this.ids
                const params = {
                    ids,
                    enableStatus: status,
                }
                changeStatus(params).then(({ success }) => {
                    if (success) {
                        this.handleQuery()
                    } else {
                        this.$modal.msgError(res.message)
                    }
                })
            } catch (e) {
                console.log(e.message || e)
            } finally {
                loading?.close()
            }
        },
        /** 修改按钮操作 */
        async handleUpdate(row, buttonCode) {
            if (!row.billType) {
                return;
            }
            this.$refs.operate.init(row, buttonCode);
        },
        // 查看流程详情
        async getWorkFlowProcessViewer(modelId = '') {
            try {
                categoryBpmnXmlModel(modelId).then(res => {
                    if (res?.success) {
                        let data = res?.data || ''
                        if (data) {
                            this.xmlData = data;
                        }
                    } else {
                        this.loadIndex = 0
                        this.$modal.msgError(res.message);
                    }
                })
            } catch (e) {
                console.error('e', e);
            }
        },
        // 查看流程详情
        async categoryBpmnXmlVersion(deploymentId = '') {
            try {
                categoryBpmnXmlVersion(deploymentId).then(res => {
                    if (res?.success) {
                        let data = res?.data || ''
                        if (data) {
                            this.xmlData = data;
                        }
                    } else {
                        this.loadIndex = 0
                        this.$modal.msgError(res.message);
                    }
                })
            } catch (e) {
                console.error('e', e);
            }
        },
        // 获取流程列表数据
        getList() {

            listCategory({
                ...this.listQuery,
                ...this.formData,
            }).then(res => {
                if (res.success && Array.isArray(res.data.list)) {
                    let { list, total } = res.data
                    this.dataList = list
                    this.total = total
                } else {
                    this.dataList = []
                    this.total = 0
                }
            })

        },
        // 点击设计操作按钮
        async handleDesigner(row) {
            this.$router.push({
                name: 'WorkDesign',
                query: {
                    code: row.modelId,
                    modelName: row.processName,
                    modelKey: row.processKey,
                    billType: row.billType,
                    isUpdate: row.version,
                    id: row.id
                }
            })
        },
        // 流程相关
        async onSaveDesigner(bpmnXml) {
            this.bpmnXml = bpmnXml
            let dataBody = {
                modelId: this.designerData.modelId,
                bpmnXml: this.bpmnXml,
            }
            const loading = this.$loading({ lock: true, text: '加载中...', })
            try {
                const res = await this.$ajax.post(`${VUE_APP_WORK_FLOW_SERVER}/model/save`, dataBody)
                if (res.success) {
                    this.$modal.msgSuccess(res?.message || '保存成功')
                    this.designerOpen = false
                    this.getList()
                } else {
                    this.$modal.msgError(res?.message || '保存失败')
                }
            } catch (e) {
                console.error('onSaveDesigner', e)
            } finally {
                loading?.close()
            }
        },
        // 确认提交
        confirmSave(body, newVersion) {
            this.designerData.loading = true
            saveModel(
                Object.assign(body, {
                    newVersion: newVersion,
                })
            )
                .then((res) => {
                    this.$modal.msgSuccess(res.msg)
                    this.designerOpen = false
                    this.getList()
                })
                .catch((res) => {
                    this.$modal.msgError(res.msg)
                    this.designerData.loading = false
                })
        },
    }
};
</script>
