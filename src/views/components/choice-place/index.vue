<template>
    <Dialog tabindex='1' class="flex-dialog max-height-dialog" title="选择货位" :visible.sync="visible"
        :close-on-click-modal="false" append-to-body width="1300px">
        <div slot="title" class="el-dialog__title">
            选择货位
            <div class="flex-dialog-button">
                <el-button plain round type="primary" icon="el-icon-search" @click="searchData">查询</el-button>
                <el-button plain round type="info" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
            </div>
        </div>
        <el-form ref="elForm" :model="formData" label-width="110px">
            <el-row>
                <el-col :span="6">
                    <el-form-item label="货位编码" prop="placeCode" class="border-radius50">
                        <el-input v-model="formData.placeCode" placeholder="请输入货位编码" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="货位名称" prop="placeName" class="border-radius50">
                        <el-input v-model="formData.placeName" placeholder="请输入货位名称" clearable
                            @keyup.enter.native="searchData" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="货位类型" prop="placeType" class="border-radius50">
                        <el-select v-model="formData.placeType" placeholder="请选择货位类型" clearable style="width: 100%">
                            <el-option v-for="item in dict.type.placeType" :key="item.value" :label="item.label"
                                :value="item.value" @keyup.enter.native="searchData" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="table-wrapper">
            <el-table ref="tableRef" :data="tableData" border row-key="quotationId" v-loading="loading"
                @row-click="rowClick" height="100%" @row-dblclick="dbClick" @sort-change="sortableColumnChange">
                <el-table-column align="center" width="50">
                    <template v-slot="{ row }">
                        <el-radio v-model="selectDataRow" :label="row.id" class="table-radio"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column label="序号" align="left" type="index" :index="tableIndex" width="60" />
                <el-table-column prop="placeCode" label="货位编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="handleDetail('placeOperateRef', row.id)">{{
                            row.placeCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="placeName" label="货位名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="placeType" label="货位类型" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.placeType | orderTypeFilter(dict.type.placeType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="frameCode" label="货架编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="handleDetail('frameOperateRef', row.frameId)">{{
                            row.frameCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="frameName" label="货架名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="frameType" label="货架类型" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.frameType | orderTypeFilter(dict.type.frameType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="passageCode" label="通道编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="handleDetail('passagewayOperateRef', row.passageId)">{{
                            row.passageCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="storageCode" label="储区编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="handleDetail('storageAreaOperateRef', row.storageId)">{{
                            row.storageCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="storageType" label="储区类型" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.storageType | orderTypeFilter(dict.type.storageType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="warehouseCode" label="仓库编码" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <el-button type="text" size="small"
                            @click="handleDetail('warehouseOperateRef', row.warehouseId, 'warehouse')">{{
                            row.warehouseCode }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="warehouseName" label="仓库名称" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="warehouseType" label="仓库类型" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.warehouseType | orderTypeFilter(dict.type.warehouseType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="areaName" label="地区" align="left" show-overflow-tooltip min-width="150" />
                <el-table-column prop="status" label="启用状态" align="left" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ row.status | orderTypeFilter(dict.type.enableStauts) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createDate" label="创建时间" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.createDate, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="updateDate" label="修改时间" align="center" show-overflow-tooltip min-width="150">
                    <template slot-scope="{row}">
                        <span>{{ parseTime(row.updateDate, '{y}-{m}-{d}') }}</span>
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

        <placeOperate ref="placeOperateRef" />
        <frameOperate ref="frameOperateRef" />
        <warehouseOperate ref="warehouseOperateRef" />
        <passagewayOperate ref="passagewayOperateRef" />
        <storageAreaOperate ref="storageAreaOperateRef" />
    </Dialog>
</template>
<script>
import indexMixin from '@/views/mixins'
import inMixin from '@/views/components/mixins'
import {invMatlStorageRelReferencePlaceList} from '@/api/warehouseManage/materialStorage'
import warehouseOperate from '@/views/warehouseManage/warehousFundamentals/warehouse/warehouseOperate';
import passagewayOperate from '@/views/warehouseManage/warehousFundamentals/passageway/components/operate';
import storageAreaOperate from '@/views/warehouseManage/warehousFundamentals/storageArea/components/operate';
import frameOperate from '@/views/warehouseManage/warehousFundamentals/frame/components/operate';
import placeOperate from '@/views/warehouseManage/warehousFundamentals/goodsPosition/components/operate';

export default {
    mixins: [indexMixin, inMixin],
    dicts: ['placeType','frameType','storageType','enableStauts','warehouseType'],

    components: {
        DetailDialog: () => import('@/views/components/DetailDialog'),
        frameOperate,
        warehouseOperate,
        passagewayOperate,
        storageAreaOperate,
        placeOperate
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
                placeCode: '',
                placeName: '',
                placeType: '',
                status: '0',
            },
            loading: false,
            tableData: [],
            total: 0,
            selectDataRow: null,
        }
    },
    methods: {
        handleDetail(ref, id, type = '') {
            if (type == 'warehouse') {
                this.$refs[ref].init('view', 'warehouseOperate', id)
            } else {
                this.$refs[ref].init('view', { id: id })
            }
        },
        init(placeId = null) {
            this.visible = true;
            this.selectDataRow = placeId

            this.$nextTick(() => {
                this.$refs.elForm.resetFields();
    
                this.tableData = []
                this.listQuery.pageNum = 1
                this.listQuery.pageSize = 30
                this.getList()
            })
        },
        getList() {
            this.loading = true

            invMatlStorageRelReferencePlaceList(Object.assign({}, this.formData, this.listQuery, this.propsFormData)).then(({ data }) => {
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
            this.selectDataRow = row.id;
        },
        dbClick(row) {
            this.$emit('selections', row)
            this.visible = false
        },
        saveSelection() {
            if (!this.selectDataRow) {
                this.$message.warning('请选择货位')
                return
            }
            let row = this.tableData.find((item) => {
                return item.id == this.selectDataRow;
            })
            this.$emit('selections', row);
            this.visible = false
        },
        resetSearch() {
            this.$refs.elForm.resetFields();
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