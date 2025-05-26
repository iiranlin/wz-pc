<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择预投单" :visible.sync="visible"
        :close-on-click-modal="false" append-to-body width="1300px">
        <div slot="title" class="el-dialog__title">
            选择预投单
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="110px">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="预投单号" prop="preOrderCode" class="border-radius50">
                        <el-input v-model="formData.preOrderCode" placeholder="请输入预投单号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="预投名称" prop="theme" class="border-radius50">
                        <el-input v-model="formData.theme" placeholder="请输入预投名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="预投类型" prop="preOrderType" class="border-radius50">
                        <el-select v-model="formData.preOrderType" placeholder="请选择付预投类型" clearable
                            style="width: 100%;">
                            <el-option v-for="item in dict.type.preType" :key="item.value" :label="item.label"
                                :value="item.value" @keyup.enter.native="searchData" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="期望到货日期" class="border-radius50">
                        <el-date-picker v-model="arrivalDateRange" type="daterange" value-format="yyyy-MM-dd"
                            range-separator="-" style="width: 100%;" start-placeholder="开始日期" end-placeholder="结束日期" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="申请人" prop="preInformantName" class="border-radius50">
                        <el-input v-model="formData.preInformantName" placeholder="请输入申请人" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="报价单号" prop="quotationCode" class="border-radius50">
                        <el-input v-model="formData.quotationCode" placeholder="请输入报价单号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="报价名称" prop="quotationName" class="border-radius50">
                        <el-input v-model="formData.quotationName" placeholder="请输入报价名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="客户编码" prop="cuCode" class="border-radius50">
                        <el-input v-model="formData.cuCode" placeholder="请输入客户编码" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="客户名称" prop="cuName" class="border-radius50">
                        <el-input v-model="formData.cuName" placeholder="请输入客户名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="客户联系人" prop="contacts" class="border-radius50">
                        <el-input v-model="formData.contacts" placeholder="请输入客户联系人" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="创建日期" class="border-radius50">
                        <el-date-picker v-model="preApplyDateRange" type="daterange" value-format="yyyy-MM-dd"
                            range-separator="-" style="width: 100%;" start-placeholder="开始日期" end-placeholder="结束日期" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" :data="tableData" border row-key="preOrderId" v-loading="loading"
                @row-click="rowClick" height="100%" @row-dblclick="dbClick" @sort-change="sortableColumnChange">
                <el-table-column align="center" width="50">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.preOrderId" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="preOrderCode" label="预投单号" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.preOrderId, refName: 'preOperate' })">{{
                            row.preOrderCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="theme" label="预投名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="preOrderType" label="预投类型" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.preOrderType | orderTypeFilter(dict.type.preType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="arrivalDate" label="期望到货日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.arrivalDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="quotationCode" label="报价单号" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.quotationId, refName: 'quotationOperate' })">{{
                            row.quotationCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="quotationName" label="报价名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="cuCode" label="客户编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                            row.cuCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="cuName" label="客户名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="industry" label="所属行业" align="center" show-overflow-tooltip min-width="150" />
                <el-table-column prop="customerValue" label="客户价值" align="center" show-overflow-tooltip min-width="150" />
                <el-table-column prop="creditRate" label="信用等级" align="center" show-overflow-tooltip min-width="150" />
                <el-table-column prop="contacts" label="客户联系人" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="phone" label="联系方式" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="informantName" label="申请人" align="left" show-overflow-tooltip
                    min-width="150" />
                <el-table-column prop="createDate" label="创建日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.createDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <pagination v-if="visible" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <template #footer>
            <el-button plain round type="primary" @click="saveSelection" v-preventReClick>确定</el-button>
            <el-button plain round @click.native="visible = false">取消</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>
<script>
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import { preOrderQueryListByUnit } from '@/api/saleManage/preOrder'

export default {
    mixins: [indexMixin, inMixin],
    dicts: ['preType'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    props: {
        propsFormData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            dialogParam: {},
            visible: false,
            formData: {
                preOrderCode: '',
                quotationCode: '',
                theme: '',
                preOrderType: '',
                arrivalDateStart: '',
                arrivalDateEnd: '',
                preInformantName: '',
                quotationCode: '',
                quotationName: '',
                cuCode: '',
                cuName: '',
                contacts: '',
                preApplyDateStart: '',
                preApplyDateEnd: '',
            },
            arrivalDateRange: [],
            preApplyDateRange: [],
            loading: false,
            tableData: [],
            total: 0,
            selectDataRow: null,
        }
    },
    methods: {
        init(preOrderId = null) {
            this.visible = true;
            this.selectDataRow = preOrderId

            this.$nextTick(() => {
                this.$refs.elForm.resetFields();
                this.formData.arrivalDateStart = '';
                this.formData.arrivalDateEnd = '';
                this.formData.preApplyDateStart = '';
                this.formData.preApplyDateEnd = '';
                this.arrivalDateRange = [];
                this.preApplyDateRange = [];
                this.tableData = []
                this.listQuery.pageNum = 1
                this.listQuery.pageSize = 30
                this.getList()
            })
        },
        getList() {
            this.loading = true

            if (!!this.arrivalDateRange.length) {
                this.formData.arrivalDateStart = this.arrivalDateRange[0]
                this.formData.arrivalDateEnd = this.arrivalDateRange[1]
            }
            if (!!this.preApplyDateRange.length) {
                this.formData.preApplyDateStart = this.preApplyDateRange[0]
                this.formData.preApplyDateEnd = this.preApplyDateRange[1]
            }
            preOrderQueryListByUnit(Object.assign({}, this.formData, this.listQuery, this.propsFormData)).then(({ data }) => {
                this.tableData = data?.list || []
                this.total = data?.total || 0
            }).finally(() => {
                this.loading = false
            })
        },
        searchData() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        rowClick(row) {
            this.selectDataRow = row.preOrderId;
        },
        dbClick(row) {
            this.$emit('selections', row)
            this.visible = false
        },
        saveSelection() {
            if (!this.selectDataRow) {
                this.$message.warning('请选择预投单')
                return
            }
            let row = this.tableData.find((item) => {
                return item.preOrderId == this.selectDataRow;
            })
            this.$emit('selections', row);
            this.visible = false
        },
        resetSearch() {
            this.$refs.elForm.resetFields();
            this.formData.arrivalDateStart = '';
            this.formData.arrivalDateEnd = '';
            this.formData.preApplyDateStart = '';
            this.formData.preApplyDateEnd = '';
            this.arrivalDateRange = [];
            this.preApplyDateRange = [];
            this.getList()
        },
    }
}
</script>
<style scoped lang="scss">
.table-wrapper {
    flex: 1;
}
</style>