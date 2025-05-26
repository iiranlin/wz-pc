<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择报价单" :visible.sync="visible"
        :close-on-click-modal="false" append-to-body width="1300px">
        <div slot="title" class="el-dialog__title">
            选择报价单
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="110px">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="报价单号" prop="quotationCode" class="border-radius50">
                        <el-input v-model="formData.quotationCode" placeholder="请输入报价单号" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="报价名称" prop="theme" class="border-radius50">
                        <el-input v-model="formData.theme" placeholder="请输入报价名称" clearable
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
                    <el-form-item label="付款方式" prop="payMethod" class="border-radius50">
                        <el-select v-model="formData.payMethod" placeholder="请选择付款方式" clearable style="width: 100%">
                            <el-option v-for="item in dict.type.payMethod" :key="item.value" :label="item.label"
                                :value="item.value" @keyup.enter.native="searchData" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="交货方式" prop="deliveryMethod" class="border-radius50">
                        <el-select v-model="formData.deliveryMethod" placeholder="请选择交货方式" clearable
                            style="width: 100%">
                            <el-option v-for="item in dict.type.consignmentMethod" :key="item.value" :label="item.label"
                                :value="item.value" @keyup.enter.native="searchData" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="客户联系人" prop="contacts" class="border-radius50">
                        <el-input v-model="formData.contacts" placeholder="请输入客户联系人" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="截止日期" class="border-radius50">
                        <el-date-picker v-model="expiryDateRange" type="daterange" value-format="yyyy-MM-dd"
                            range-separator="-" style="width: 100%" start-placeholder="开始日期" end-placeholder="结束日期" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="创建日期" class="border-radius50">
                        <el-date-picker v-model="createDateRange" type="daterange" value-format="yyyy-MM-dd"
                            range-separator="-" style="width: 100%" start-placeholder="开始日期" end-placeholder="结束日期" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="报价负责人" prop="bidderName" class="border-radius50">
                        <el-input v-model="formData.bidderName" placeholder="请输入报价负责人" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" :data="tableData" border row-key="quotationId" v-loading="loading"
                @row-click="rowClick" height="100%" @row-dblclick="dbClick" @sort-change="sortableColumnChange">
                <el-table-column align="center" width="50">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.quotationId" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="quotationCode" label="报价单号" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.quotationId, refName: 'quotationOperate' })">{{
                            row.quotationCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="theme" label="报价名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="expiryDate" label="截止日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.expiryDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="cuCode" label="客户编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row.cuId, refName: 'customerProfileAdd' })">{{
                            row.cuCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="cuName" label="客户名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="industry" label="所属行业" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="customerValue" label="客户价值" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="creditRate" label="信用等级" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="contacts" label="客户联系人" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="phone" label="联系方式" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="payMethod" label="付款方式" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.payMethod | orderTypeFilter(dict.type.payMethod) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="payDate" label="付款账期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.payDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="deliveryMethod" label="交货方式" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.deliveryMethod | orderTypeFilter(dict.type.consignmentMethod) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="deliveryDate" label="交货日期" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.deliveryDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="deptName" label="报价部门" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="bidderName" label="报价负责人" align="left" show-overflow-tooltip min-width="150" />
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
import { quotationList } from '@/api/saleManage/quotation'

export default {
    mixins: [indexMixin, inMixin],
    dicts: ['payMethod', 'consignmentMethod'],
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
                quotationCode: '',
                theme: '',
                cuCode: '',
                cuName: '',
                payMethod: '',
                deliveryMethod: '',
                contacts: '',
                bidderName: '',
                createDateStart: '',
                createDateEnd: '',
                expiryDateStart: '',
                expiryDateEnd: '',
                isComplete: '0',
            },
            expiryDateRange: [],
            createDateRange: [],
            loading: false,
            tableData: [],
            total: 0,
            selectDataRow: null,
        }
    },
    methods: {
        init(quotationId = null) {
            this.visible = true;
            this.selectDataRow = quotationId

            this.$nextTick(() => {
                this.$refs.elForm.resetFields();
                this.formData.createDateStart = '';
                this.formData.createDateEnd = '';
                this.formData.expiryDateStart = '';
                this.formData.expiryDateEnd = '';
                this.expiryDateRange = [];
                this.createDateRange = [];
                this.tableData = []
                this.listQuery.pageNum = 1
                this.listQuery.pageSize = 30
                this.getList()
            })
        },
        getList() {
            this.loading = true

            if (!!this.createDateRange.length) {
                this.formData.createDateStart = this.createDateRange[0]
                this.formData.createDateEnd = this.createDateRange[1]
            }
            if (!!this.expiryDateRange.length) {
                this.formData.expiryDateStart = this.expiryDateRange[0]
                this.formData.expiryDateEnd = this.expiryDateRange[1]
            }
            quotationList(Object.assign({}, this.formData, this.listQuery, this.propsFormData)).then(({ data }) => {
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
            this.selectDataRow = row.quotationId;
        },
        dbClick(row) {
            this.$emit('selections', row)
            this.visible = false
        },
        saveSelection() {
            if (!this.selectDataRow) {
                this.$message.warning('请选择报价单')
                return
            }
            let row = this.tableData.find((item) => {
                return item.quotationId == this.selectDataRow;
            })
            this.$emit('selections', row);
            this.visible = false
        },
        resetSearch() {
            this.$refs.elForm.resetFields();
            this.formData.createDateStart = '';
            this.formData.createDateEnd = '';
            this.formData.expiryDateStart = '';
            this.formData.expiryDateEnd = '';
            this.expiryDateRange = [];
            this.createDateRange = [];
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