<template>
    <Dialog class="flex-dialog max-height-dialog" :title="title" :visible.sync="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" width="1200px">
        <div class="table-wrapper">
            <el-table :data="tableData" border height="100%">
                <el-table-column label="序号" align="left" width="50" type="index" />

                <el-table-column v-if="check" label="出/入库单号" prop="code" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.outInId, refName: row.type == 'in' ? 'createInventoryMaintenance' : 'outboundMaintenanceOperate' })">{{
                                row.code }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column v-else label="调拨单号" prop="allocateCode" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.id, refName: 'createTransferOutOrder' })">{{
                                row.allocateCode }}</el-button>
                    </template>
                </el-table-column>

                <el-table-column v-if="check" prop="type" label="单据类型" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        {{ { in: '入库', out: '出库' }[row.type] }}
                    </template>
                </el-table-column>
                <el-table-column min-width="150" v-else prop="inCode" label="入库单号" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.inId, refName: 'createInventoryMaintenance' })">{{
                                row.inCode }}</el-button>
                    </template>
                </el-table-column>

                <el-table-column v-if="check" label="来源单号" prop="sourceCode" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.inOutId, refName: 'createInventoryMaintenance' })">{{
                                row.sourceCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column v-else label="状态" prop="inStatus" align="center" :show-overflow-tooltip="true"
                    min-width="90">
                    <template slot-scope="{row}">
                        <span>{{ row.inStatus | orderTypeFilter(dict.type.allocateInStatus) }}</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="check" label="项目编码" prop="projectCode" align="left"
                    :show-overflow-tooltip="true" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.projectId, refName: 'projectManagementOperate' })">{{
                                row.projectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column v-else label="项目编码" prop="inProjectCode" align="left" :show-overflow-tooltip="true"
                    min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.inProjectId, refName: 'projectManagementOperate' })">{{
                                row.inProjectCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column v-if="check" prop="projectName" min-width="150" label="项目名称" align="left"
                    show-overflow-tooltip></el-table-column>
                <el-table-column v-else prop="inProjectName" min-width="150" label="项目名称" align="left"
                    show-overflow-tooltip></el-table-column>
                <el-table-column v-if="check" prop="createUserName" label="制单人" align="left"
                    show-overflow-tooltip></el-table-column>
                <el-table-column v-else prop="inCreateUserName" label="制单人" align="left"
                    show-overflow-tooltip></el-table-column>
                <el-table-column v-if="check" prop="createDate" label="制单时间" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.createDate) }}</span>
                    </template>
                </el-table-column>
                <el-table-column v-else prop="inCreateDate" label="制单时间" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.inCreateDate) }}</span>
                    </template>
                </el-table-column>

            </el-table>
        </div>
        <template #footer>
            <el-button v-if="check" plain round type="primary" @click="confirmClick">确定</el-button>
            <el-button plain round @click.native="visible = false">关闭</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
export default {
    mixins: [indexMixin],
    dicts: ['allocateInStatus'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    data() {
        return {
            visible: false,
            tableData: [],
            check: false,
            title: '提示'
        }
    },
    methods: {
        init(data) {
            this.visible = true;
            this.$nextTick(() => {
                this.check = data.check
                this.title = data.check ?
                 '目前存在如下待完成数据，请确定是否继续结转；建议先不结转，操作完出入库再结转；如果一定要结转，请在下个会计期间再去操作出入库完成，这样数据才会落到下个会计期间。' :
                  '目前调出单已经出库完成，调入单未入库完成，因调拨出、调拨入属于成对业务，暂不允许结转；请先操作完调拨入库完成。'
                this.tableData = data.check ? data.outInList : data.allocateOrderList;
            })
        },
        confirmClick() {
            this.$emit('confirm')
        }
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>