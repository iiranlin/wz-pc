<template>
    <Dialog class="flex-dialog max-height-dialog" title="历史版本"  append-to-body :visible.sync="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" width="1300px">
        <div slot="title" class="el-dialog__title">
            历史版本
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click.stop="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click.stop="resetQuery">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="90px">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="工艺编号" prop="pathCode" class="border-radius50">
                        <el-input :disabled="disabled" v-model="formData.pathCode" placeholder="请输入工艺编号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="工艺名称" prop="pathName" class="border-radius50">
                        <el-input :disabled="disabled" v-model="formData.pathName" placeholder="请输入工艺名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="适用产品" prop="matlName" class="border-radius50">
                        <el-input :disabled="disabled" v-model="formData.matlName" placeholder="请输入适用产品" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="适用BOM" prop="bomName" class="border-radius50">
                        <el-input :disabled="disabled" v-model="formData.bomName" placeholder="请输入适用BOM" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <el-form-item label="版本" prop="version" class="border-radius50">
                        <el-input v-model="formData.version" placeholder="请输入版本" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table :data="tableData" border height="100%" v-loading="loading" row-key="pathId"
                @row-dblclick="dbClick" @row-click="rowClick">
                <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.pathId" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column label="序号" align="center" width="50" type="index" />
                <el-table-column prop="pathCode" label="工艺编号" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.pathId, refName: 'processRouteOperate' })">{{
                                row.pathCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="pathName" label="工艺名称" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="processDesc" label="工艺描述" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="matlName" label="适用产品" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                                row.matlName }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="bomName" label="适用BOM" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'bomAdministrationOperate' })">{{
                                row.bomName }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="version" label="版本" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.pathId, refName: 'processRouteOperate' })">{{
                                row.version }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" fixed="right" width="80">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.pathId, refName: 'processRouteOperate' })">历史版本</el-button>
                    </template>
                </el-table-column>
            </el-table>

        </div>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <template #footer>
            <el-button v-if="singleMode" plain round type="primary"   @click.native="handleConfirm">确定</el-button>
            <el-button plain round @click.native="visible = false">关闭</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
import { history } from '@/api/prodmgr-mm/processRoute'

export default {
    mixins: [indexMixin],
    props: {
        singleMode: {
            type: Boolean,
            default: false
        }
    },
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    data() {
        return {
            selectDataRow: null,
            dialogParam: {},
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30,
            },
            visible: false,
            loading: false,
            tableData: [],
            disabled: false,
            formData: {
                pathCode: '',
                pathName: '',
                matlName: '',
                bomName: '',
                version: '',
            },
        }
    },
    methods: {
        rowClick(row) {
            this.selectDataRow = row.pathId
        },
        dbClick(row) {
            this.$emit('confirm', row)
            this.visible = false
        },
        handleConfirm() {
            if (this.selectDataRow == null) {
                return this.$message.warning('请选择工艺版本')
            }
            const data = this.tableData.find(item => item.pathId === this.selectDataRow)
            this.$emit('confirm', data)
            this.visible = false
        },
        resetQuery() {
            this.formData = {
                pathCode: '',
                pathName: '',
                matlName: '',
                bomName: '',
                version: '',
            }
            this.listQuery.pageNum = 1
            this.getList()
        },
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        init(row = undefined) {
            this.disabled = false
            this.visible = true;
            this._queryVersion = undefined
            this.formData = {
                pathCode: '',
                pathName: '',
                matlName: '',
                bomName: '',
                version: '',
            }
            if (row) {
                this.disabled = true
                this._queryVersion = row.version
                this.formData = {
                    pathCode: row.pathCode,
                    pathName: row.pathName,
                    matlName: row.matlName,
                    bomName: row.bomName,
                    version: '',
                }
            }
            this.$nextTick(() => {
                this.tableData = [];
                // this._pathCode = pathCode
                this.getList();
            })
        },
        // 查询物资
        getList() {
            this.loading = true;
            const param = {
                ...this.listQuery,
                ...this.formData,

            }
            if (this._queryVersion) {
                param.queryVersion = this._queryVersion
            }
            history(param).then(({ data }) => {
                this.tableData = data.list || [];
                this.total = data.total
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