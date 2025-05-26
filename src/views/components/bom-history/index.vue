<template>
    <Dialog class="flex-dialog max-height-dialog" title="历史版本" :visible.sync="visible" :close-on-click-modal="false"
        :close-on-press-escape="false" width="1300px" append-to-body destroy-on-close>
        <div slot="title" class="el-dialog__title">
            历史版本
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="110px">
            <el-row>
                <el-col :span="24">
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="BOM编码" prop="bomCode" class="border-radius50">
                                <el-input :disabled="rowDetail" v-model="formData.bomCode" placeholder="请输入BOM编码"
                                    clearable @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="BOM名称" prop="bomName" class="border-radius50">
                                <el-input v-model="formData.bomName" placeholder="请输入BOM名称" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="物料编码" prop="matlCode" class="border-radius50">
                                <el-input v-model="formData.matlCode" placeholder="输入物料编码" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="物料名称" prop="matlName" class="border-radius50">
                                <el-input v-model="formData.matlName" placeholder="输入物料名称" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="规格型号" prop="matlType" class="border-radius50">
                                <el-input v-model="formData.matlType" placeholder="输入规格型号" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="版本号" prop="bomVersion" class="border-radius50">
                                <el-input v-model="formData.bomVersion" placeholder="输入版本号" clearable
                                    @keyup.enter.native="searchData" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table :data="tableData"  @row-click="rowClick" ref="tableIndexRef" row-key="bomVersion" @row-dblclick="dbClick" border height="100%" v-loading="loading">
                <el-table-column align="center" width="50" v-if="singleMode" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.bomVersion" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column label="序号" align="center" width="50" type="index" />
                <el-table-column prop="bomCode" label="BOM编码" align="left" show-overflow-tooltip width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'bomAdministrationOperate' })">{{
                            row.bomCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="bomName" label="BOM名称" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="matlCode" label="物料编码" align="left" show-overflow-tooltip width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { matlCode: row.matlCode, refName: 'materialArchivesOperate' })">{{
                            row.matlCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="matlName" label="物料名称" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="matlType" label="规格型号" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="useBy" label="BOM用途" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <span>{{ row.useBy | orderTypeFilter(dict.type.bomPurpose) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="matlUnit" label="计量单位" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <span>{{ row.matlUnit | orderTypeFilter(dict.type.MeasureUnit) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="changeNote" label="变更原因" align="left" show-overflow-tooltip></el-table-column>
                <el-table-column prop="bomVersion" label="版本号" align="left" show-overflow-tooltip>
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'BOMAdministrationOperate' })">{{
                            row.bomVersion }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" fixed="right"  width="170">
                    <template slot-scope="scope">
                        <!-- <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.bomId, refName: 'BOMAdministrationOperate' })" style="margin-right: 10px;">历史版本</el-button> -->
                        <el-button v-if="copyOperate" size="mini" type="text" @click.stop="createClick(scope)">复制并新增</el-button>
                    </template>
                </el-table-column>
            </el-table>

        </div>
        <pagination :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <template #footer>
            <el-button v-if="singleMode" plain round type="primary" @click="saveSelection" v-preventReClick>确定</el-button>
            <el-button plain round @click.native="visible = false">关闭</el-button>
            
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import { bomHistory } from '@/api/prodmgr-mm/bom';
import indexMixin from '@/views/mixins'
export default {
    mixins: [indexMixin],
    dicts: ['MeasureUnit', 'bomPurpose'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        copyOperate: {
            type: Boolean,
            default: false
        },
        singleMode: {
            type: Boolean,
            required: false,
            default: false
        },
    },
    data() {
        return {
            dialogParam: {},
            visible: false,
            loading: false,
            rowDetail: false,
            selectDataRow: null,
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30
            },
            formData: {
                bomCode: '',
                bomName: '',
                matlCode: "",
                matlName: '',
                matlType: '',
                bomVersion: ''
            },
            tableData: [],
        }
    },
    methods: {
        saveSelection() {
            if (this.selectDataRow == null) {
                    this.$message.warning('请选择BOM')
                    return
                }
                const data = this.tableData.find(item => item.bomVersion === this.selectDataRow)
                this.$emit('confirm', data)

            this.visible = false
        },
        rowClick(row) {
            this.selectDataRow = row.bomVersion
        },
        dbClick(row) {
            this.$emit('confirm', row)
            this.visible = false
        },
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        resetSearch() {
            this.$refs.elForm.resetFields()
            this.getList()
        },
        init(bomCode, queryVersion) {
            this.visible = true;
            this.rowDetail = false
            this.formData.bomCode = ''
            this.selectDataRow = null
            this._queryVersion = queryVersion || ''
            if (!!bomCode) {
                this.rowDetail = true
                this.formData.bomCode = bomCode
            }
            
            this.$nextTick(() => {
                this.tableData = [];
                this.getList();
            })
        },
        // 查询物资
        getList() {
            let formData = {
                ...this.formData,
                ...this.listQuery
            }
            if (this._queryVersion) {
                formData.queryVersion = this._queryVersion
            }
            this.loading = true;
            bomHistory(formData).then(({ data }) => {
                this.tableData = data.list || [];
                this.total = data.total || 0;
            }).finally(() => {

                this.loading = false;
                this.$refs.tableIndexRef.doLayout()
            })
        },
        createClick(scope) {
            this.$emit('createClick', scope.row.id)
            this.visible = false
        }
    }
}
</script>

<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>