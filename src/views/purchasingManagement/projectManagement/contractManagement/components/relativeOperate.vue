<template>
    <Dialog class="flex-dialog max-height-dialog" :visible.sync="openDataScope" width="80%" 
        :close-on-click-modal="false" append-to-body>
        <div slot="title" class="el-dialog__title">
            选择相对方
            <div class="flex-dialog-button">
                <el-button plain round class="search-btn" type="primary" @click="handleQuery">查询</el-button>
                <el-button plain round class="search-btn" @click="handleReset">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="100px">
            <el-row>
                <el-col :span="6">
                    <el-radio-group v-model="type" @input="handleInput">
                        <el-radio label="1">按客户</el-radio>
                        <el-radio label="2">按供应商</el-radio>
                    </el-radio-group>
                </el-col>
                <el-col :span="6" v-if="type == '1'">
                    <el-form-item label="客户编号:" class="custom-form-item border-radius50">
                        <el-input size="small" placeholder="" clearable v-model="formData.cuCode" @keyup.enter.native="handleQuery"/>
                    </el-form-item>
                </el-col>
                <el-col :span="6" v-if="type == '1'">
                    <el-form-item label="客户名称:" class="custom-form-item border-radius50">
                        <el-input size="small" placeholder="" clearable v-model="formData.cuName" @keyup.enter.native="handleQuery"/>
                    </el-form-item>
                </el-col>
                 <el-col :span="6" v-if="type == '2'">
                    <el-form-item label="供应商名称:" class="custom-form-item">
                        <el-input size="small" placeholder="" clearable v-model="formData.suName" @keyup.enter.native="handleQuery"/>
                    </el-form-item>
                </el-col>
                <el-col :span="8" v-if="type == '2'">
                    <el-form-item label="统一社会信用代码" class="custom-form-item" label-width="130px">
                        <el-input size="small" placeholder="" clearable v-model="formData.suUnicode" @keyup.enter.native="handleQuery"/>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-table :key="tableKey" v-loading="loading" border :data="dataList" height="100%" @row-click="rowClick" @row-dblclick="dblclick" @sort-change="sortableColumnChange">
            <template v-if="type == '1'">
                <el-table-column fixed="left" align="center" width="50" key="radio">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.cuCode" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column label="序号" align="left" type="index" width="50"/>
                <el-table-column label="客户编号" align="left" prop="cuCode" min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small" @click="clickRouterInDialog($refs.detailDialogRef, {id: row.id, refName: 'customerProfileAdd'})">{{ row.cuCode }}</el-button>
                    </template> 
                </el-table-column>
                <el-table-column label="客户名称" align="left" prop="cuName" :show-overflow-tooltip="true" min-width="120"/>
                <el-table-column label="客户简称" sortable="custom" :filters="[]" :render-header="(h, obj) => renderSpecNameHeader(h, obj, {fieldType: 'String', fieldFormatArr: [], fieldFormat: ''})" align="left" prop="csName" :show-overflow-tooltip="true" min-width="150"/>
                <el-table-column label="统一社会信用代码" sortable="custom" :filters="[]" :render-header="(h, obj) => renderSpecNameHeader(h, obj, {fieldType: 'String', fieldFormatArr: [], fieldFormat: ''})" align="left" prop="socialCode" min-width="200"/>
                <el-table-column label="客户分类" align="left" sortable="custom" :filters="[]" :render-header="(h, obj) => renderSpecNameHeader(h, obj, {fieldType: 'dict', fieldFormatArr: dict.type.customerType, fieldFormat: ''})" prop="cuType" min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.cuType | orderTypeFilter(dict.type.customerType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" align="center" prop="createDate" min-width="200">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.createDate) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="修改时间" align="center" prop="updateDate" min-width="200">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.updateDate) }}</span>
                    </template>
                </el-table-column>
            </template>
            <template v-if="type == '2'">
                <el-table-column label="" align="center" width="50">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.suId" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column label="序号" align="left" type="index" width="50"/>
                <el-table-column label="供应商名称" align="left" prop="suName" min-width="150"/>
                <el-table-column label="供应商简称" align="left" prop="suSimpleName" :show-overflow-tooltip="true" min-width="120"/>
                <el-table-column label="统一社会信用代码" align="left" prop="suUnicode" :show-overflow-tooltip="true" min-width="200" />
                <el-table-column label="供应商类型" align="left" prop="suType" min-width="200">
                    <template slot-scope="{row}">
                        <span>{{ row.suType | orderTypeFilter(dict.type.supplierType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="是否限制" align="left" prop="banned" min-width="90">
                    <template slot-scope="{row}">
                        <span>{{ row.banned | orderTypeFilter(dict.type.YesNo) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="创建人" align="left" prop="createName" min-width="100"/>
                <el-table-column label="创建时间" align="center" prop="createDate" min-width="200">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.createDate,  '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
            </template>
        </el-table>
        <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList"/>
        <div slot="footer" class="dialog-footer">
            <el-button plain round type="primary" @click="submitDataScope">确 定</el-button>
            <el-button plain round @click.native="openDataScope = false">取 消</el-button>
        </div> 
        <detail-dialog ref="detailDialogRef"/>
    </Dialog>
</template>

<script>
import { getProfileList } from '@/api/saleManage/customerProfile'
import { PuSuList } from '@/api/purchasingManagement/supplier'
import indexMixin from '@/views/mixins';
import inMixin from '@/views/components/mixins'

export default {
    dicts: ['customerType','supplierType','YesNo'],
    mixins: [indexMixin, inMixin],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },

    data() {
        return {
            loading: false,
            openDataScope: false,
            title: '选择客户',
            type: '1',
            tableKey: 1,
            dataList: [],

            formData: {
                cuCode: '',
                cuName: '',
                status: '3',
                suName: '',
                suUnicode: ''
            },

            listQuery: {
                pageNum: 1,
                pageSize: 10
            },
            total: 0,

            selectDataRow: null,
        }
    },
    methods: {
        init() {
            this.openDataScope = true
            this.selectDataRow = null
            this.formData = this.$options.data().formData
            this.tableKey = 1;
            this.type = '1';
            this.getList()
        },
        getList() {
            this.loading = true
            let func = this.type == '1'? getProfileList:PuSuList;

            func(Object.assign({}, this.formData, this.listQuery)).then(({ data }) => {
                this.dataList = data.list
                this.total = data.total
            }).finally(() => {
                this.loading = false
            })
        },
        handleQuery() {
            this.listQuery.pageNum = 1
            this.getList()
        },
        submitDataScope() {
            if (this.selectDataRow == null) {
                this.$message.warning('请'+ this.title)
                return
            }
            let data = {};

            if(this.type == '1'){
                data = this.dataList.find(item => item.cuCode === this.selectDataRow)
            }else if(this.type == '2'){
                data = this.dataList.find(item => item.suId === this.selectDataRow)
            }
            this.$emit('relativeOperateSelected', data, this.type)
            this.openDataScope = false
        },
        rowClick(row) {
            if(this.type == '1'){
                this.selectDataRow = row.cuCode;
            }else if(this.type == '2'){
                this.selectDataRow = row.suId;
            }
        },
        dblclick(row) {
            this.$emit('relativeOperateSelected', row, this.type)
            this.openDataScope = false
        },
        handleReset() {
            this.formData = this.$options.data().formData
            this.listQuery.pageNum = 1
            this.getList()
        },
        emitAblFilter () {
            this.getList()
        },
        handleInput(){
            this.tableKey ++;
            this.formData = this.$options.data().formData
            this.listQuery.pageNum = 1
            this.getList()
        },
    }
}
</script>
<style scoped>
::v-deep .el-radio-group {
    margin-left: 10px;
    margin-top: 15px;
}
</style>
