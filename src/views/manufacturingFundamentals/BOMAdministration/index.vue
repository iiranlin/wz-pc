<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"
            @uploadOnSuccess="uploadOnSuccess" @uploadOnError="uploadOnError" @customUpload="customUpload"
            :button-disable="handleTopButtonDisabled"></button-top>
        <form-data ref="formData" :showSearch="showSearch" :searchArr="property.search || []" :formData="formData"
            @handleQuery="handleQuery" @handleResetField="handleResetField">
            <!-- <el-form-item label="折叠/展开" prop="defaultExpandAll" class="custom-form-item">
                <el-radio-group v-model="defaultExpandAll">
                    <el-radio :label="false">全折叠</el-radio>
                    <el-radio :label="true">全展开</el-radio>
                </el-radio-group>
            </el-form-item> -->
        </form-data>

        <el-row type="flex" class="container_h">
            <collapse>
                <el-col :xs="24" class="container_flex_overflow">
                    <div class="flex-row">
                        <el-input class="search-input" placeholder="输入关键字过滤" v-model="filterText" clearable>
                        </el-input>
                    </div>
                    <div class="head-container ov_head">
                        <el-tree class="drawer-tree" v-loading="treeLoading" node-key="id" :indent="0"
                            :data="dataOption" :props="defaultProps" :expand-on-click-node="false" ref="tree"
                            :highlight-current="true" :filter-node-method="filterNode" @node-click="handleNodeClick">
                            <span class="custom-tree-node" slot-scope="{ node, data }">
                                <span class="custom-tree-node-label">{{ data.matlCode }}{{ node.label }}</span>
                            </span>
                        </el-tree>
                    </div>
                </el-col>
            </collapse>
            <!--用户数据-->
            <el-col :span="18" :xs="24" class="container_flex">
                <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
                    :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
                    @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
                    @cleanClick="cleanClick"></right-toolbar>
                <table-index ref="tableIndex" :loading="loading" idName="uid" :tableIndexs="tableIndex"
                    :tableData="list" :defaultExpandAll="defaultExpandAll" :buttonDisable="handleButtonDisable"
                    :property="property" :numberShow="numberShow" :treeProps="treeProps" :showButton="handleShowButton"
                    @handleSelectionChange="handleSelectionChange" @handleButton="handleButton" @clickLink="clickLink"
                    lazy :loadTreeData="loadTreeData" @selectChange="selectChange" @emitAblFilter="emitAblFilter">
                    <template slot="status" slot-scope="scope" v-if="scope.value">
                        <icon-svg class="icon-size" :icon-class="iconClass(scope.value)" />{{ scope.value |
                            fieldFormat(scope.fieldFormatArr) }}
                    </template>
                </table-index>
                <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum"
                    :limit.sync="listQuery.pageSize" @pagination="() => { getList(); getTreeList() }" />
            </el-col>
        </el-row>
        <workFlowView :bill-data="selectedRow" :work-flow-view-visible.sync="workFlowViewVisible" />
        <bomHistory ref="bomHistory" :copyOperate="true"
            @createClick="(id) => { $router.push({ name: 'BOMAdministrationOperate', query: { type: 'create', copyHistoryCreate: '2', id } }) }">
        </bomHistory>
        <activiti-assignee ref="activitiAssignee" :multiple="false"
            @activitiAssigneeSelected="activitiAssigneeSelected"></activiti-assignee>
    </div>
</template>

<script>
import { bomList, bomBatchRemove, submit, bomImport, bomExport, bomBomWithoutLeaf } from '@/api/prodmgr-mm/bom';
import bomHistory from '@/views/components/bom-history';
import indexMixin from '@/views/mixins';
import activitiAssignee from '@/views/audit/components/activitiAssignee'
import { ACTIVITI_ASSUGNEE } from '@/utils/constant'
import workFlowView from '@/components/workFlowView'
import collapse from '@/components/Collapse'
import { minioDownload } from '@/api/minio'
export default {
    name: "BOMAdministration",
    mixins: [indexMixin],
    components: { bomHistory, activitiAssignee, workFlowView, collapse },
    data() {
        return {
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
            list: [],
            //列表选中数据
            selection: [],
            // 表格序号是否展示
            numberShow: true,
            // 页面属性
            property: {},
            total: 0,
            // 查询参数
            listQuery: {
                pageNum: 1,
                pageSize: 30,
            },
            // 表单参数
            formData: {
                exType: ''
            },
            formDataClick: {
                exType: ''
            },
            treeProps: {
                children: 'rawList',
                hasChildren: 'hasChildren'
            },
            workFlowViewVisible: false,
            selectedRow: null,

            treeLoading: false,
            filterText: "",
            dataOption: [],
            defaultProps: {
                children: "rawList",
                label: "matlName",
            },
            defaultExpandAll: false,
            treeCurrentKey: '',
        };

    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    created() {
        const query = this.$route.query || {}
        const queryData = Object.assign({}, this.formData, query)
        this.formData = JSON.parse(JSON.stringify(queryData))
        this.formDataClick = JSON.parse(JSON.stringify(queryData))
        this.menuProperty();
        this.getTreeList()
    },
    filters: {
    },
    methods: {
        handleShowButton(row) {
            return row.level == 0
        },
        filterNode(value, data) {
            if (!value) return true;
            return !!this.$py.match(data.matlCode + data.matlName, value);
        },
        menuProperty() {
            let id = this.$route.meta.id;
            this.$store.dispatch('menuProperty', id).then((data) => {
                this.listQuery.pageSize = data.defaultPageSize || 30
                const property = data;
                property.buttonTop = property.buttonTop.map(item => {
                    if (item.buttonCode === 'create') {
                        item.children = [
                            {
                                buttonCode: 'create',
                                buttonName: '自主手动新增',
                                buttonMode: '',
                            },
                            {
                                buttonCode: 'historyCreate',
                                buttonName: '参照历史版本',
                                buttonMode: ''
                            },
                        ]
                    }
                    return item
                })
                this.property = Object.freeze(property)
            });
        },
        handleTopButtonDisabled(button) {
            return this.selection.some(row => this.handleButtonDisable(button, row))
        },
        handleButtonDisable(button, row) {
            if (button.buttonCode === 'historyEdition') {
                return ['', 'V001'].includes(row.bomVersion)
            }
            if (['withdraw'].includes(button.buttonCode)) {
                return !['2'].includes(row.status)
            }
            if (['update', 'delete', 'submit'].includes(button.buttonCode) && !['0', '1'].includes(row.status)) {
                return true
            }
            if (['change'].includes(button.buttonCode) && !['3'].includes(row.status)) {
                return true
            }
            return false
        },
        // 节点单击事件
        handleNodeClick(data) {
            let row = {}
            if (data.id === this.treeCurrentKey) {
                // 再次点击当前节点取消选中,查询全部
                this.$refs.tree.setCurrentKey(null)
                this.treeCurrentKey = ''
                row = { bomId: null, bomCode: null, bomName: null, bomIdQuery: null }
            } else {
                this.treeCurrentKey = data.bomId
                row = { bomId: data.bomId, bomCode: data.bomCode, bomName: data.bomName, bomIdQuery: true }
            }
            this.handleQuery(row)
        },
        numberChange(val) {
            this.numberShow = val;
        },
        newButton(buttonCode, formId, buttonData) {
            this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
        },
        handleCheckAllChange(columns) {
            this.$refs.tableIndex.init(columns);
        },
        clickReset() {
            this.handleQuery();
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
        cleanClick(data) {
            for (const key of data) {
                if (key.indexOf('Start') != -1 || key.indexOf('End') != -1) {
                    this.$refs.formData.resetQueryDateRange(key);
                }
                this.formData[key] = null;
            }
            this.handleQuery();
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row);
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleSelectionChange(ids, single, multiple, selection) {
            this.ids = selection.map(item => item.id);
            this.single = single;
            this.multiple = multiple;
            this.selection = selection;
        },
        handleResetField() {
        },
        async handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            const ids = rowArr.map(item => item.id)
            if (buttonCode == 'change') {
                this.$router.push({ name: 'BOMAdministrationOperate', query: { type: buttonCode, id: ids[0] } });
            } else if (buttonCode == 'update') {
                this.$router.push({ name: 'BOMAdministrationOperate', query: { type: buttonCode, id: ids[0] } });
            } else if (buttonCode === 'delete') {
                this.handleDelete(ids)
            } else if (buttonCode === 'create') {
                this.$router.push({ name: 'BOMAdministrationOperate', query: { type: buttonCode } });
            } else if (buttonCode === 'historyCreate') {
                this.$router.push({ name: 'BOMAdministrationOperate', query: { type: 'create', copyHistoryCreate: '1' } });
            } else if (buttonCode === 'bomCopyCreate') {
                this.$router.push({ name: 'BOMAdministrationOperate', query: { type: 'create', copyHistoryCreate: '2', id: ids[0] } });
            } else if (buttonCode === 'submit') {
                this.ids = ids
                this.handleSubmit(ACTIVITI_ASSUGNEE.MM_BOM)
            } else if (buttonCode === 'flowSee') {
                this.workFlowViewVisible = true;
                this.selectedRow = { businessId: ids[0] };
            } else if (buttonCode == 'historyEditionTop') {
                this.$refs.bomHistory.init();
            } else if (buttonCode === 'historyEdition') {
                this.$refs.bomHistory.init(rowArr[0].bomCode, rowArr[0].bomVersion);
            } else if (buttonCode === 'download') {
                this.$download.fileUrl(`${minioDownload}?filePath=${encodeURI('templates/bom模板.xls')}&fileName=${encodeURI('bom模板.xls')}`, null, 'get');
            } else if (buttonCode === 'export') {
                const exportColumns = this.flattenExportColumns(this.$refs.tableIndex.propertyFields).filter(item => !item.isHides && item.isHide != 1).map(item => item.fieldCode)
                const param = { ...this.formData, exportColumns }
                await bomExport(param)
            } else if (buttonCode === 'withdraw') {
                this.handleWithdraw({ businessId: ids[0], businessType: ACTIVITI_ASSUGNEE.MM_BOM, })
            }

        },
        getTreeList() {
            this.treeLoading = true;
            bomBomWithoutLeaf(this.listQuery).then(({ data }) => {
                this.dataOption = data || [];
            }).finally(() => {
                this.treeLoading = false;
            })
        },
        async loadTreeData(tree, treeNode, resolve) {
            const { data: { list } } = await bomList({ parentBomId: tree.bomId, level: tree.level, exType: this.formData.exType })
            resolve([...list.map(item => ({ ...item, hasChildren: item.hasChildren == '1' }))])
        },
        /** 查询菜单列表 */
        getList() {
            this.loading = true;
            const param = Object.assign({}, this.listQuery, this.formData)
            if (param.exType == 'null') {
                param.exType = ''
            }
            bomList(param).then(({ data }) => {
                this.list = data.list.map(item => ({ ...item, hasChildren: item.hasChildren == '1' }));
                this.total = data.total;
            }).finally(() => {
                this.loading = false;
            })
        },
        handleDelete(ids) {
            this.$modal.confirm("是否确认删除?").then(function () {
                return bomBatchRemove({ ids });
            }).then(() => {
                if ((this.total - ids.length) % (this.listQuery.pageSize) == 0) {
                    this.listQuery.pageNum -= 1
                }
                this.getList();
                this.$modal.msgSuccess("删除成功");
            })
        },
        clickLink(row, fieldCode, linkText) {
            if (['bomCode', 'bomVersion'].includes(fieldCode)) {
                this.$router.push({ name: 'BOMAdministrationOperate', query: { type: 'view', id: !!row.level ? row.bomId : row.id } });
            } else if (fieldCode === 'matlCode') {
                this.$router.push({ name: 'materialArchivesOperate', query: { type: 'view', matlCode: row.matlCode, name: 'BOMAdministration' } });
            }
        },
        //提交
        submit(assignee = '') {
            this.loading = true;
            const param = { ids: this.ids, assignee: assignee }
            submit(param).then(({ success, data, message }) => {
                if (success) {
                    this.$modal.msgSuccess('提交成功')
                    this.getList()
                } else {
                    this.$modal.msgError(message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        uploadOnSuccess(code, data, message) {
            if (code === 0) {
                if (data.msg) {
                    this.$modal.msgError(data.msg)
                } else {
                    this.$modal.msgSuccess(message)
                }
                this.getList();
            } else {
                this.$modal.msgError(message)
            }
        },
        uploadOnError(err, file, fileList) {
            this.$modal.msgError('导入失败')
        },
        customUpload(option) {
            if (option.file) {
                this.$download.fileUpload(bomImport, { file: option.file }).then(({ code, data, message }) => {
                    this.uploadOnSuccess(code, data, message)
                })
            }
        },
    }
};
</script>
<style lang="scss" scoped>
.ov_head {
    flex: 1;
    height: 100%;
    overflow-y: scroll;
}
</style>