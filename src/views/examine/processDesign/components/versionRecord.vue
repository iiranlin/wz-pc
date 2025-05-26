<template>
    <div class="version-record">
        <Dialog class="pop-dialog" :visible.sync="visible" width="1200px" append-to-body
            :close-on-click-modal="false" @close="cancelOpenVersionRecord()" >
            <div slot="title" class="dialog-title" v-if="visible === true">
                <span class="title">版本记录</span>
            </div>
            <el-table class="version-record-table" ref="versionRecordTableRef" :sort="true"
                :data="versionRecordTableData" :indexMethod="indexMethod" :height="height">
                <el-table-column v-for="item in tabColumns" :key="item.prop" :label="item.label"
                    :prop="item.prop">
                    <template slot-scope="{row}">
                        <span v-if="item.date">{{ parseTime(row[item.prop], '{y}-{m}-{d}') }}</span>
                        <el-link type="primary" v-else-if="item.link" @click="linkClick(row)">{{ row[item.prop] }}</el-link>
                        <span v-else>{{ row[item.prop] }}</span>
                    </template>
                </el-table-column>
            </el-table>

            <div slot="footer" class="dialog-footer">
                <el-pagination :pages="pages" @sizeChange="sizeChange" @indexChange="indexChange"></el-pagination>
                <div class="pop-btn-box">
                    <el-button @click="cancelOpenVersionRecord()">返 回</el-button>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script>
import { getVersionRecord } from '@/api/workflow/category'

export default {
    name: 'versionRecord',
    components: {},
    filters: {},
    props: {
        processKey: {
            type: String,
            default() {
                return ''
            },
        },
        openVersionRecord: {
            type: Boolean,
            default() {
                return false
            },
        },
    },
    data() {
        return {
            visible: false,
            // 版本记录查询参数
            pages: {
                pageNum: 1,
                pageSizes: [30, 50, 100, 200, 300],
                pageSize: 30,
                total: 0,
            },
            total: 0,
            versionRecordTableData: [],
            tabColumns: [
                { prop: 'processName', label: '流程名称' },
                { prop: 'version', label: '流程版本', link: true },
                { prop: 'createUserName', label: '最后修改人' },
                { prop: 'createDate', label: '最后修改时间', date: true },
            ],
        }
    },
    computed: {
        height() {
            return '50vh'
        },
    },
    watch: {
        openVersionRecord: {
            async handler(val) {
                // this.setColumns()
                this.total = 0
                this.versionRecordTableData = []
                this.visible = val
                if (val) {
                    await this.getList()
                }
            },
        },
        visible: {
            handler(val) {
                if (!val) {
                    this.updateOpenVersionRecord()
                }
            },
        },
    },
    created() { },
    mounted() { },
    methods: {
        // 获取版本记录
        async getList() {
            const loading = this.$loading({ lock: true, text: '加载中...', })
            try {
                const params = {
                    pageNum: this.pages.pageNum,
                    pageSize: this.pages.pageSize,
                    processKey: this.processKey,
                }
                this.versionRecordTableData = []
                getVersionRecord(params).then(res => {
                    if (res?.success) {
                        this.pages.total = res?.data?.total
                        this.versionRecordTableData = res?.data?.list || []
                        this.openVersionRecord = true
                    } else {
                        this.$modal.msgError(res?.message)
                    }
                })
            } catch (e) {
                console.error('versionRecord', e)
            } finally {
                loading?.close()
            }
        },
        sizeChange(v) {
            this.pages.pageSize = v
            this.getList()
        },
        indexChange(v) {
            this.pages.pageNum = v
            this.getList()
        },
        // 关闭弹窗
        cancelOpenVersionRecord() {
            this.visible = false
            this.updateOpenVersionRecord()
        },
        // 更新父组件的值
        updateOpenVersionRecord() {
            this.$emit('update:openVersionRecord', this.visible)
        },
        // 表头设置
        setColumns() {
            this.$nextTick(() => {
                this.$refs.versionRecordTableRef?.setColumns(this.tabColumns)
            })
        },
        // 序号函数
        indexMethod(index) {
            let { pageNum, pageSize } = this.pages
            return (pageNum - 1) * pageSize + (index + 1)
        },
        linkClick (row) {
            this.$emit('linkClick', row)
        }
    },
}
</script>

<style scoped lang="scss">
.hz-pagination {
    padding: 0;
}

.dialog-footer {
    justify-content: space-between;
    margin-left: 7px;
}
</style>
