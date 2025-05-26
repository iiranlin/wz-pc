<template>
    <Dialog class="dealt-dialog" :title="title" :visible.sync="openDataScope" v-if="openDataScope"
        :close-on-click-modal="false" destroy-on-close width="1000px" append-to-body>
        <el-table :data="tableList" v-loading="loading">
            <el-table-column type="index" width="50" align="left" label="序号" />
            <el-table-column prop="billTypeText" label="单据类型" :show-overflow-tooltip="true" min-width="100"
                align="left">
            </el-table-column>
            <el-table-column prop="billCode" label="单据编码" :show-overflow-tooltip="true" min-width="100" align="left">
                <template v-slot="{ row }">
                    <el-link type="primary" @click="handleJump(row)">{{
                        row.billCode
                        }}</el-link>
                </template>
            </el-table-column>
            <el-table-column prop="orgName" label="提交部门" :show-overflow-tooltip="true" min-width="100" align="left">
            </el-table-column>
            <el-table-column prop="startUserName" label="提交人" :show-overflow-tooltip="true" min-width="100"
                align="left">
            </el-table-column>
            <el-table-column prop="startTime" :show-overflow-tooltip="true" label="提交时间" width="200" align="center">
            </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <div slot="footer" class="dialog-footer">
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
        <budgetApplyOperate ref="budgetApply"></budgetApplyOperate>
        <budgetChangeOperate ref="budgetChange"></budgetChangeOperate>
    </Dialog>
</template>
<script>
// import { getTaskDetailByUser } from "@/api/examine/to-be-reviewed";

// import { typeGoToRouter } from "@/views/examine/const/const";
// import budgetApplyOperate from '@/views/budgetApply/components/operate'
// import budgetChangeOperate from '@/views/budgetChange/components/operate'
export default {
    components: {
        budgetApplyOperate,
        budgetChangeOperate
    },
    data() {
        return {
            title: "",
            type: "",
            openDataScope: false,
            total: 0,
            tableList: [],
            listQuery: {
                pageNum: 1,
                pageSize: 10,
            },
            loading: false,
        };
    },
    provide() {
        return {
            fatherMethod: this.getList,
        };
    },
    methods: {
        async init(type) {
            this.type = type;
            this.listQuery.pageNum = 1;
            this.openDataScope = true;
            if (type == "toDoNum") {
                this.title = "我的待办明细";
            } else if (type == "doNum") {
                this.title = "我的已办明细";
            } else {
                this.title = "我的发起明细";
            }
            this.getTaskDetailByUser();
        },
        getTaskDetailByUser() {
            this.loading = true;
            const params = {
                ...this.listQuery,
                type: this.type,
            };
            getTaskDetailByUser(params).then((res) => {
                if (res.success) {
                    this.tableList = res.data.list;
                    this.total = res.data.total;
                    this.loading = false;
                }
            });
        },
        // 分页
        getList() {
            this.getTaskDetailByUser();
        },
        handleJump(row) {
            try {
                const {
                    billId,
                    billType,
                    taskId = "",
                    procInstId = "",
                    billCode = "",
                    orgId = "",
                    orgName = "",
                    startUserId = "",
                    startUserName = "",
                    masterFlag = "",
                    function: { field = [], isFuction = false } = {},
                    source = "1",
                } = row;
                if (billType == 'YSSQ') {
                    if (this.type == "toDoNum") {
                        this.$refs.budgetApply.init('examine', row)
                    } else {
                        this.$refs.budgetApply.init('view', row)
                    }
                    return
                }
                if (billType == 'YSBG') {
                    if (this.type == "toDoNum") {
                        this.$refs.budgetChange.init('examine', row)
                    } else {
                        this.$refs.budgetChange.init('view', row)
                    }
                    return
                }
                let query = {};
                let routerName = "";
                if (!typeGoToRouter[billType]) {
                    throw new Error("跳转失败！");
                }
                routerName = typeGoToRouter[billType]?.routerName;
                query = typeGoToRouter[billType]?.query;
                if (Object.keys(query).includes("id")) {
                    query.id = billId;
                }
                if (Object.keys(query).includes("source")) {
                    query.source = source;
                }
                if (billType === "JHBG") {
                    // 进度计划变更详情
                    query.change = "1";
                }
                if (["startNum", "doNum"].includes(this.type)) {
                    // 发起 已办
                    this.$router.push({
                        name: routerName,
                        query: {
                            ...query,
                            type: "view",
                        },
                    });
                    this.openDataScope = false;
                    return;
                }
                this.$router.push({
                    name: routerName,
                    query: {
                        ...query,
                        routerToPage: "flowDetail",
                        taskId,
                        billId,
                        billType,
                        procInstId,
                        billCode,
                        orgId,
                        orgName,
                        startUserId,
                        startUserName,
                        type: "view",
                        isFuction,
                        ...(field?.length && { field: field.join(",") }),
                        // 项目立项是否为主项目
                        ...(billType === "XMLX" && { masterFlag: masterFlag }),
                    },
                });
                this.openDataScope = false;
            } catch (e) {
                this.$modal.msgError(e.message);
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.dealt-dialog ::v-deep .el-dialog {
    height: calc(100% - 13vh);
    display: flex;
    flex-direction: column;
}

.dealt-dialog ::v-deep .el-dialog__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
    padding: 10px 10px;

    .el-table {
        height: 100%;
        flex: 1;
        overflow-y: scroll;
    }
}

.tag-row {
    margin-bottom: 10px;
    margin-left: 12px;
}
</style>
