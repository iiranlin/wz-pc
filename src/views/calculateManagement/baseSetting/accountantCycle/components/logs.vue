<template>
    <Dialog class="flex-dialog max-height-dialog" title="查看" :visible.sync="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" width="600px">
        <div class="table-wrapper">
            <el-table :data="tableData" border height="100%" v-loading="loading">
                <el-table-column label="序号" align="left" width="50" type="index" />
                <el-table-column prop="updateDate" label="时间" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.updateDate) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="updateContent" label="内容" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="createUserName" label="操作人" align="left" show-overflow-tooltip></el-table-column>
            </el-table>
        </div>
        <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <template #footer>
            <el-button plain round @click.native="visible = false">关闭</el-button>
        </template>
    </Dialog>
</template>

<script>
import { getLogList } from '@/api/calculateManagement/accounting'
import indexMixin from '@/views/mixins'
export default {
    mixins: [indexMixin],
    components: {
    },
    data() {
        return {
            visible: false,
            loading: false,
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            tableData: [],
        }
    },
    methods: {


        init(id) {
            this.visible = true;
            this._id = id
            this.$nextTick(() => {
                this.tableData = [];
                this.getList();
            })
        },
        // 查询物资
        getList() {
            let formData = {
                ...this.listQuery
            }
            if (this._id) {
                formData.updateId = this._id
            }
            this.loading = true;
            getLogList(formData).then(({ data }) => {
                this.tableData = data.list || [];
                this.total = data.total || 0;
            }).finally(() => {
                this.loading = false;
            })
        },
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>