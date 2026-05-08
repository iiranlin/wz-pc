<template>
    <div class='work-flow-view'>
        <Dialog title="审批历史" :visible.sync="visible" :close-on-click-modal="false" append-to-body width="1200px"
            height="80%" >
            <div class="work-flow-view-content">
                <el-table class="work-flow-view-history-table" ref="workFlowViewTableRef" max-height="500"
                    :data="workFlowViewTableData" border>
                    <el-table-column label="节点" align="left" prop="actName" />
                    <el-table-column label="单位" align="left" show-overflow-tooltip prop="orgName" />
                    <el-table-column label="操作人" align="left" prop="assigneeName" />
                    <el-table-column label="操作时间" align="center" prop="endTime" />
                    <el-table-column label="意见" align="left" prop="status">
                        <template slot-scope="{ row }">
                            <span>
                                {{ suggestionFormat(row.status, dict.type.flowTaskStatus)?`${suggestionFormat(row.status, dict.type.flowTaskStatus)}：`:'' }} {{ row.message }}
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
                <div v-if="hasWorkflow === 1">
                    <h3 class="process-title">审核流程图</h3>
                    <div class="color-tips">
                        <span v-for="item in colorTips" :key="item.text"
                            :style="`border: 1px solid ${item.backColor}; backgroundColor: ${item.color};`">
                            {{ item.text }}
                        </span>
                    </div>
                    <process-viewer :key="`designer-${loadIndex}`" :style="`height:${height};`" :xml="xmlData"
                        :isShowCommentList="true" :allCommentList="allCommentList" :finishedInfo="finishedInfo" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script>
import ProcessViewer from '@/components/ProcessViewer'
import { workFlowHistoryList, workFlowProcessViewer } from '@/api/workflow/audit'
export default {
    name: 'workFlowView',
    dicts: [ 'flowTaskStatus' ],
    components: {
        ProcessViewer
    },
    filters: {

    },
    props: {
        workFlowViewVisible: {
            type: Boolean,
            default() {
                return false
            }
        },
        billData: {
            type: Object,
            default() {
                return {}
            }
        },
    },
    data() {
        return {
            loading: false,
            visible: this.workFlowViewVisible,
            workFlowViewTableData: [],
            tabRefname: 'workFlowViewTableRef',
            // height: document.documentElement.clientHeight - 205 + 'px;',
            height: 400 + 'px;',
            // 模型xml数据
            loadIndex: 0,
            xmlData: undefined,
            finishedInfo: {
                finishedSequenceFlowSet: [],
                finishedTaskSet: [],
                unfinishedTaskSet: [],
                rejectedTaskSet: []
            },
            colorTips: [
                {
                    text: '已通过',
                    color: '#e5f4dd',
                    backColor: '#4eb819'
                },
                {
                    text: '审核中',
                    color: '#e0eefc',
                    backColor: '#409eff',
                },
                {
                    text: '待审核',
                    color: '#fff',
                    backColor: '#000'
                },
                {
                    text: '撤回',
                    color: '#efeff0',
                    backColor: '#909399'
                },
                {
                    text: '不通过',
                    color: '#fee9e9',
                    backColor: '#f56c6c'
                },
            ],
            // 是否展示 流程图
            hasWorkflow: false,
            allCommentList: []
        };
    },
    computed: {

    },
    watch: {
        workFlowViewVisible: {
            async handler(val) {
                // this.setColumns()
                this.xmlData = '';
                this.finishedInfo = {
                    finishedSequenceFlowSet: [],
                    finishedTaskSet: [],
                    unfinishedTaskSet: [],
                    rejectedTaskSet: [],
                    stopTaskSet: []
                }
                this.visible = val;
                const { businessId = '' } = this.billData;
                if (val) {
                    await this.getWorkFlowHistoryList(businessId);
                    if (this.hasWorkflow === 1) {

                        this.getWorkFlowProcessViewer(businessId);
                    }
                }
            }
        },
        visible: {
            handler(val) {
                if (!val) {
                    this.updateWorkFlowViewVisible()
                }
            }
        }
    },
    created() {
    },
    mounted() {
    },
    methods: {
        // 处理意见显示状态
        suggestionFormat(val, code) {
            for (let key of code) {
                if (key.value == val) {
                    return key.label
                }
            }
        },
        // 获取审批记录
        async getWorkFlowHistoryList(businessId = '') {
            try {
                if (!businessId) {
                    return;
                }
                return new Promise((resolve, reject) => {
                    workFlowHistoryList(businessId).then(res => {
                        if (res?.success) {
                            this.workFlowViewTableData = res?.data?.recordList || [];
                            this.hasWorkflow = res?.data?.hasWorkflow || false;
                            this.allCommentList = res?.data?.nodeList?.filter(i => i.assigneeId) || [];
                        } else {
                            this.$modal.msgError(res.message);
                        }
                        resolve(true)
                    }).catch(err => {
                        reject(err)
                    })
                })
            } catch (e) {
                console.error('e', e);
            }
        },
        // 查看流程进程
        async getWorkFlowProcessViewer(modeId = '') {
            try {
                workFlowProcessViewer(modeId).then(res => {
                    if (res?.success) {
                        let data = res.data;
                        if (data) {
                            this.xmlData = data.bpmnXml;
                            this.finishedInfo.finishedTaskSet = data.finishedTaskSet;
                            this.finishedInfo.unfinishedTaskSet = data.unfinishedTaskSet;
                            this.finishedInfo.rejectedTaskSet = data.rejectedTaskSet;
                            this.finishedInfo.finishedSequenceFlowSet = data.finishedSequenceFlowSet;
                            this.finishedInfo.stopTaskSet = data.stopTaskSet;
                            this.loadIndex = modeId;
                        }
                    } else {
                        this.loadIndex = 0
                        this.$modal.msgError(res.message);
                    }
                })
            } catch (e) {
                console.error('e', e);
            }
        },
        // 关闭弹窗
        closeDialog() {
            this.visible = false;
            this.updateWorkFlowViewVisible();
        },
        // 更新父组件的值
        updateWorkFlowViewVisible() {
            this.$emit('update:workFlowViewVisible', this.visible);
        },
        // 表头设置
        setColumns() {
            this.$nextTick(() => {
                this.$refs['tableIndex'].setColumns(this.tabColumns)
            })
        },
    },
};
</script>

<style scoped lang="scss">
.work-flow-view-content {
    min-height: 300px;
    height: calc(100vh - 200px);
    overflow-y: auto;

    .work-flow-view-history-table {
        margin-bottom: 20px;
    }

    .process-title {
        text-align: center;
        margin-bottom: 10px;
    }

    .color-tips {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;

        span {
            height: 30px;
            width: 80px;
            color: #000;
            text-align: center;
            line-height: 30px;
            border-radius: 3px;
            margin-right: 10px;
        }
    }
}

::v-deep {
    .el-dialog__body {
        padding-top: 0px;
    }
}
::v-deep .el-table--border .el-table__cell:first-child .cell{
    padding-left: 10px !important;
    padding-right: 10px !important;
}
</style>
