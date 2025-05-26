<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton">
            <template>
                <el-dropdown @command="createSQL">
                    <el-button el-button type="primary" class="custom_button">
                        <icon-svg icon-class="State-Waiting" class="icon-State-Waiting" />
                        <span class="custom_button_text">生成SQL<i class="el-icon--right el-icon-caret-bottom"></i>
                        </span>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="geneInsertSQL"><icon-svg :icon-class="'Blue-Department'"
                                class="icon-State-dropdown" />Insert语句</el-dropdown-item>
                        <el-dropdown-item command="geneUpdateSQL"><icon-svg :icon-class="'Blue-Department'"
                                class="icon-State-dropdown" />Update语句</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </template>
        </button-top>
        <form-data ref="formData" :formData="formData" :showSearch="showSearch" :searchArr="property.search || []"
            @handleQuery="handleQuery" @handleResetField="handleResetField" />
        <right-toolbar ref="rightToolbar" :formData="formDataClick" :searchArr="property.search || []"
            :showSearch.sync="showSearch" :columns="property.fields" @queryTable="handleQuery"
            @handleCheckAllChange="handleCheckAllChange" @clickReset="clickReset" @numberChange="numberChange"
            @cleanClick="cleanClick"></right-toolbar>
        <table-index ref="tableIndex" :loading="loading" :tableData="dataList" :property="property"
            :numberShow="numberShow" @handleSelectionChange="handleSelectionChange" @handleButton="handleButton"
            @selectChange="selectChange" @emitAblFilter="emitAblFilter" />
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <operate ref="operate" @formSuccess="formSuccess" @handleOpenDesign="handleOpenDesign" />
        <el-dialog class="custom-dialog" top="0 !important" :visible.sync="openDataScope" v-if="openDataScope"
            :close-on-click-modal="false" width="auto" append-to-body>
            <design-copy ref="designCopy" />
        </el-dialog>
        <el-dialog title="SQL脚本" top="0 !important" :visible.sync="sqlDialogVisible" v-if="sqlDialogVisible"
            width="45%">
            <code-editor :mode="'sql'" :readonly="true" v-model="geneSql"></code-editor>
        </el-dialog>
    </div>
</template>

<script>
import { list, delForm, formPublish, geneUpdateSql } from '@/api/form/form'
import indexMixin from '@/views/mixins';
import operate from "./components/operate";
import designCopy from "@/views/form/components/designCopy";
import CodeEditor from "@/components/code-editor";
export default {
    name: "design",
    components: { operate, designCopy, CodeEditor },
    mixins: [indexMixin],
    data() {
        return {
            formDataClick: {},
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
            // 弹出层标题
            title: "",
            //列表显示字段
            property: {},
            // 查询参数
            formData: {
                parentId: '',
            },
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30,
            },
            openDataScope: false,
            dialogFull: true,
            sqlDialogVisible: false,
            geneSql: ""
        };
    },
    created() {
        let id = this.$route.meta.id;
        this.$store.dispatch('menuProperty', id).then((data) => {
            this.listQuery.pageSize = data.defaultPageSize || 30
            this.property = data;
        });
        this.getList();
    },
    mounted() { },
    methods: {
        // 展示序号
        numberChange(val) {
            this.numberShow = val;
        },
        // 跳转表单设计页面
        handleOpenDesign(id) {
            this.openDataScope = true
            this.$nextTick(() => {
                this.$refs.designCopy.init('form', id);
            })
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
        // 节点单击事件
        handleNodeClick(data) {
            this.formData.parentId = data.id;
            this.handleQuery();
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.resetForm("queryForm");
            for (let key in this.formData) {
                this.formData[key] = null
            }
            this.handleQuery();
        },
        emitAblFilter(listQuery) {
            this.listQuery = Object.assign({}, this.listQuery, listQuery)
            this.handleQuery();
        },
        handleQuery(row = {}) {
            this.listQuery.pageNum = 1
            this.formData = Object.assign({}, this.formData, row)
            this.formDataClick = Object.assign({}, this.formData, row);
            this.getList();
        },
        getList() {
            this.loading = true;
            list(Object.assign({ RULE_MENU_ID: this.$route.meta.id }, this.listQuery, this.formData)).then(({ data }) => {
                this.dataList = data.list;
                this.total = data.total;
                this.loading = false;
            })
        },
        handleSelectionChange(ids, single, multiple) {
            this.single = single
            this.multiple = multiple
        },
        handleButton(buttonCode, idArr, rowArr, { buttonData }) {
            this.proxyPrint(buttonCode, rowArr, buttonData)
            switch (buttonCode) {
                case 'update':
                    this.$refs.operate.init('update', idArr[0]);
                    break;
                case 'delete':
                    this.$modal.confirm('是否确认删除表单?').then(() => {
                        return delForm({ ids: idArr });
                    }).then(() => {
                        this.getList();
                        this.$modal.msgSuccess("删除成功");
                    }).catch(() => { });
                    break;
                case 'update':
                    this.$refs.operate.init('update', idArr[0]);
                    break;
                case 'create':
                    this.$refs.operate.init('create', this.formData.parentId);
                    break;
                case 'design':
                    this.openDataScope = true
                    this.$nextTick(() => {
                        this.$refs.designCopy.init('form', idArr[0]);
                    })
                    break;
                case 'publish':
                    this.$modal.confirm('是否确认发布表单?').then(() => {
                        return formPublish(idArr[0]);
                    }).then(({ message }) => {
                        this.getList();
                        this.$modal.msgSuccess(message);
                    }).catch(() => { });
                    break;
                case 'cpForm':
                    this.$refs.operate.init('cpForm', rowArr[0]);
                    break;
                case 'geneSql':
                    geneUpdateSql({ ids: idArr }).then(res => {
                        this.geneSql = res.data
                        this.sqlDialogVisible = true
                    })
                    break;
                case 'geneInsertSQL':
                    if (idArr.length > 0) {
                        geneUpdateSql({ ids: idArr, sqlType: 1 }).then(res => {
                            this.geneSql = res.data
                            this.sqlDialogVisible = true
                        })
                    } else {
                        this.$message.warning("请选择数据")
                    }
                    break;
                case 'geneUpdateSQL':
                    if (idArr.length > 0) {
                        geneUpdateSql({ ids: idArr, sqlType: 2 }).then(res => {
                            this.geneSql = res.data
                            this.sqlDialogVisible = true
                        })
                    } else {
                        this.$message.warning("请选择数据")
                    }
                    break;
                default:
                    break;
            }
        },
        formSuccess() {
            this.handleQuery();
        },
        clickReset() {
            this.handleQuery();
        },
        createSQL(command) {
            this.newButton(command)
        }
    }
};
</script>
<style lang="scss" scoped>
.custom-dialog {
    ::v-deep .el-dialog__body {
        padding: 0;
    }

    ::v-deep .el-dialog__headerbtn {
        top: 15px;
    }

    ::v-deep .el-dialog__header {
        padding: 0;
    }
}

.custom_button {
    transform: translateY(-1px);
    background: #ffffff !important;
    border-radius: 50px;
    font-size: 12px;
    text-align: right;
    height: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 5px 30px 5px 24px;
    position: relative;
    min-width: 100px;
    margin-right: 6px;
    border: 1px solid #1890ff;
    box-sizing: border-box;
    line-height: 22px;

    .custom_button_text {
        color: #1b1e22;
    }
}

.icon-State-Waiting {
    font-size: 16px;
    transform: translateY(2px);
}
</style>
