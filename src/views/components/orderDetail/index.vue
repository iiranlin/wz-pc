<template>
    <Dialog class="flex-dialog max-height-dialog" :title="title" v-if="visible" :visible="true"
        :close-on-click-modal="false" @close="handleClose" append-to-body destroy-on-close
        :close-on-press-escape="false" width="1300px">
        <div class="table-wrapper">
            <el-table :data="tableData" border height="100%" v-loading="loading" :row-key="rowKey">
                <el-table-column label="序号" align="center" width="50" type="index" />
                <el-table-column v-for="(header, i) in tableHeaders" :prop="header.prop" :label="header.label"
                    :align="header.align" show-overflow-tooltip :key="i">
                    <template slot="header">
                        {{ header.label }}
                        <el-tooltip v-if="header.tooltip" class="slotIcon-color" placement="top" effect="light">
                            <div slot="content" class="slotIcon-color-content">
                                {{ header.tooltip }}
                            </div>
                            <i class="el-icon-question"></i>
                        </el-tooltip>
                    </template>
                    <template slot-scope="{row}">
                        <el-button v-if="header.link" type="text" size="small"
                            @click="clickRouterInDialog($refs.detailDialogRef, { id: row[header.link], refName: header.refName })">{{
                                row[header.prop] }}</el-button>
                        <span v-else-if="header.dict">{{ row[header.prop] | orderTypeFilter(dict.type[header.dict])
                            }}</span>
                        <span v-else :style="!!header.sye ? header.sye : {}">{{ row[header.prop] }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <pagination v-if="showPagination" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize"
            @pagination="getList" />
        <template #footer>
            <el-button plain round @click="handleClose">关闭</el-button>
        </template>
        <detail-dialog ref="detailDialogRef" />
    </Dialog>
</template>

<script>
import indexMixin from '@/views/mixins'
import { generateUUID } from '@/utils'
import { configByType } from './config'

export default {
    mixins: [indexMixin],
    dicts: ['flowStatus', 'PickingBizStatus', 'outboundOrderStatus'],
    components: {
        DetailDialog: () => import('@/views/components/DetailDialog')
    },
    data() {
        return {
            showPagination: true,
            title: '查看',
            visible: false,
            loading: false,
            tableHeaders: [],
            tableData: [],
            rowKey: 'id',
            total: 0,
            listQuery: {
                pageNum: 1,
                pageSize: 30
            }
        }
    },
    methods: {
        init(param = {}, type) {

            this._query = param
            this.visible = true;
            const { key, headers, req } = configByType(type)
            this.tableHeaders = headers
            this.rowKey = key
            this.req = req
            this.tableData = [];
            this.getList()
        },
        // 查询物资
        async getList() {
            this.loading = true;
            const param = { ...this.listQuery, ...this._query }
            const res = await this.req(param)
            if (Array.isArray(res.data)) {
                this.tableData = res.data.map(item => ({ ...item, uId: generateUUID() })) || [];
                this.showPagination = false
            } else {
                const { data: { list, total } } = res
                this.tableData = list.map(item => ({ ...item, uId: generateUUID() })) || [];
                this.total = total || 0
            }
            this.loading = false;
        },
        handleClose() {
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