<template>
    <div class="home-container">
        <!--网格布局-->
        <div class="gird-container">

            <div class="grid-left">
                <!--左侧数据概览-->
                <div class="summary-container gird-item" >
                    <h3>你好，{{ username }}，欢迎回来！</h3>
                    <div style="border-top: 1px solid #F2F3F5;"></div>

                    <div class="title-item">
                        <div class="title-item-left">
                            <span>业务数据概览</span>
                        </div>
                        <div class="title-item-right">
                            <el-select size="mini" class="summary-select" v-model="summaryRange"
                                @change="handleSummaryRangeChange">
                                <el-option v-for="option in summaryRangeOptions" :key="option.value"
                                    :label="option.label" :value="option.value"></el-option>
                            </el-select>
                        </div>
                    </div>
                    <div class="summary-content" v-loading="summaryLoading">
                        <div class="summary-card" v-for="item in summaryStats" :key="item.key"
                            @click="handleSummaryNavigate(item)">
                            <p class="summary-label">{{ item.label }}</p>
                            <p class="summary-value">
                                <span>{{ item.value }}</span>
                                <em>{{ item.unit }}</em>
                            </p>
                        </div>
                    </div>
                </div>
           

                    <!--待办-->
                    <div class="wait-container" style="padding-bottom: 0;">
                        <div class="title-item-left" style="padding-bottom: 16px;">
                            <span>待办事项</span>
                        </div>
                        <ul>
                            <li :class="{ 'wait-item-active': activeWaitType === 'audit' }"
                                @click="handleWaitClick('audit')">
                                <img src="/static/icon-wait-examine.svg">
                                <div class="wait-content">
                                    <p>待审核</p>
                                    <p class="wait-examine-num"><span>{{ taskNum.auditNum || 0 }}</span>个</p>
                                </div>
                            </li>
                            <li :class="{ 'wait-item-active': activeWaitType === 'handle' }"
                                @click="handleWaitClick('handle')">
                                <img src="/static/icon-wait-handle.svg">
                                <div class="wait-content">
                                    <p>待处理</p>
                                    <p class="wait-handle-num"><span>{{ taskNum.handleNum || 0 }}</span>个</p>
                                </div>
                            </li>
                            <li :class="{ 'wait-item-active': activeWaitType === 'todoList' }"
                                @click="handleWaitClick('todoList')">
                                <img src="/static/icon-wait-launch.svg">
                                <div class="wait-content">
                                    <p>我的发起</p>
                                    <p class="wait-launch-num"><span>{{ taskNum.launchNum || 0 }}</span>个</p>
                                </div>
                            </li>
                            <li :class="{ 'wait-item-active': activeWaitType === 'toBeDeal' }"
                                @click="handleWaitClick('toBeDeal')">
                                <img src="/static/icon-over-examine.svg">
                                <div class="wait-content">
                                    <p>已审核</p>
                                    <p class="over-examine-num"><span>{{ taskNum.auditedNum || 0 }}</span>个</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <!--待办事项-->
                    <div class="calendar-container gird-item" style="margin-top: -16px;">
                        <!-- <div class="title-item" style="padding: 0 0 0 20px; height: 32px; ">
                            <div class="title-item-left">
                                <span>{{ activeComponentTitle }}</span>
                            </div>
                        </div> -->
                        <div :style="{
                            width: sideTheme === 'theme-top' ? '57.6vw' : '51.9vw',
                            height: 'calc(100% - 60px)'
                        }" :key="key">
                            <ChildAudit v-if="activeComponent === 'ChildAudit'"></ChildAudit>
                            <ChildToBeDeal v-if="activeComponent === 'ChildToBeDeal'"></ChildToBeDeal>
                            <ChildHandle v-if="activeComponent === 'ChildHandle'"></ChildHandle>
                            <ChildTodoList v-if="activeComponent === 'ChildTodoList'"></ChildTodoList>
                        </div>
                    </div>
            </div>
            <div class="grid-right">
                <!--数据概况-->
                <div class="data-overview-container gird-item">
                    <div class="title-item">
                        <div class="title-item-left">
                            <span>数据概况</span>
                        </div>

                        <div style="width: 50%;" class="title-item-right" @click="handleNoticeMore()">
                            <el-select style="width: 100%;" size="mini" clearable @change="onProjectChange" filterable
                                v-model="projectId" placeholder="建设项目筛选">
                                <el-option v-for="item in lineProjectOptions" :key="item.value" :label="item.label"
                                    :value="item.value"></el-option>
                            </el-select>
                        </div>
                    </div>
                    <div v-loading="projectLoading" class="overview-content">
                        <el-row :gutter="20">
                            <el-col :span="12" v-for="(item, index) in dataOverview" :key="index" class="overview-col">
                                <div class="overview-card" @click="handleOverviewClick(item)">
                                    <div class="card-details">
                                        <p class="card-title">{{ item.title }}</p>
                                        <p class="card-value">
                                            <span>{{ item.value }}</span>{{ item.unit }}
                                        </p>
                                    </div>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <!--通知信息-->
                <div class="notice-container gird-item">
                    <div class="title-item">
                        <div class="title-item-left click-menu" @click="handleNoticeMore()">
                            <span>系统提醒</span>
                        </div>
                        <div class="title-item-right" @click="handleNoticeMore()">
                            <span>查看更多</span>
                        </div>
                    </div>
                    <div class="notice-content" v-if="noticeOptions.length > 0">
                        <ul style="min-height: 205px;">
                            <li v-for="(item, index) in noticeOptions" :key="item.id" @click="handlerViewDetails(item)">
                                <el-tooltip class="item" effect="dark" :content="item.content" placement="top">
                                    <p class="notice-text">{{ (listQuery.pageNum - 1) * listQuery.pageSize + index + 1
                                        }}、{{
                                            item.content }}</p>
                                </el-tooltip>
                                <p class="notice-date">{{ parseTime(item.createDate, '{y}-{m}-{d}') }}</p>

                            </li>
                        </ul>
                        <div class="pagination-container">
                            <el-pagination :current-page.sync="listQuery.pageNum" :page-size="listQuery.pageSize"
                                layout="total, prev, pager, next" :total="total" @current-change="getMessageList" />
                        </div>
                    </div>
                    <div v-else class="notice-empty">
                        <img src="/static/icon-notice-empty.webp" />
                        <span>暂无信息</span>
                    </div>
                </div>
                <!--操作帮助-->
                <div class="help-container gird-item">
                    <div class="title-item">
                        <div class="title-item-left">
                            <span>操作帮助</span>
                        </div>
                    </div>
                    <div class="video-content" @click="handleVideoClick()">
                        <div class="video-title">
                            <a download href="/建设物资管理系统操作说明书-v1.0.docx" class="operation-manual-link">操作手册</a>
                            <!-- <span style="cursor: pointer;">操作手册</span> -->
                        </div>
                        <img class="video-image" src="/static/icon-video.svg" />
                    </div>
                    <div class="support-content">
                        <ul>
                            <li>
                                <!-- <img src="/static/icon-phone.webp" /> -->
                                <!-- <span>唐伟：13261263907</span> -->
                            </li>
                            <!-- <li>
                                <img src="/static/icon-phone.webp" />
                                <span>孙司楠：021-46443</span>
                            </li> -->
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!--公告弹框-->
        <notice-operate ref="noticeOperate" @noticeOperateClose="batchUpdateOwnMes"></notice-operate>
        <!--通知提醒弹框-->
        <notice ref="notice" @noticeClose="batchUpdateOwnMes"></notice>
    </div>
</template>
<script>
import ChildAudit from "../audit/childAudit.vue";
import ChildHandle from "../event/handle/childHandle.vue";
import ChildToBeDeal from "../examine/toDoList/toBeDeal/childToBeDeal.vue";
import ChildTodoList from "./childTodoList.vue";
import memoOperate from "./components/memoOperate.vue"
import noticeOperate from './components/noticeOperate.vue'
import notice from './notice.vue'
import { itemList, getLineProjectList } from '@/api/prodmgr-inv/project/dataCount.js'
import { wfTodoCount } from "@/api/system/workflow";
import { messagePage } from "@/api/system/message";
// import { getAllTaskByUser, funcRecentList } from "@/api/examine/to-be-reviewed"
// import { memoGetOneMonthMemo } from '@/api/system/dashboard.js';
import moment from 'moment';
import dayjs from 'dayjs';
// import { sysMsgSettingSelectOwnMesPage, sysMsgSettingBatchUpdateOwnMes } from "@/api/system/messageToDo";
import { mapGetters,mapState } from "vuex";

export default {
    name: 'Index',
    components: { memoOperate, noticeOperate, notice, ChildAudit, ChildHandle, ChildToBeDeal, ChildTodoList },

    data() {
        return {
            key: 0,
            //左侧概览相关
            summaryLoading: false,
            summaryRange: '1',
            summaryRangeOptions: [
                { label: '本周', value: '1' },
                { label: '本月', value: '2' },
                { label: '本年', value: '3' },
            ],
            summaryStats: [
                { key: 'planCount', label: '计划数', value: 0, unit: '条', route: { name: 'wzxqList',query:{statusList: ['2','3','4','5']} } },
                { key: 'shippingCount', label: '发货数', value: 0, unit: '次', route: { name: 'sendList' } },
                { key: 'takeCount', label: '收货数', value: 0, unit: '次', route: { name: 'receiveList' }},
                { key: 'inCount', label: '入库数', value: 0, unit: '次', route: { name: 'imList'  }},
                { key: 'outCount', label: '出库数', value: 0, unit: '次', route: { name: 'omList' }},
            ],
            needSummaryLoading:false,
            needProjectLoading:false,
            projectLoading: false,
            projectId: '',
            activeComponent: 'ChildAudit',
            activeWaitType: 'audit',
            // NOTE: The following data is hardcoded for demonstration.
            // It should be fetched from a relevant API endpoint.
            dataOverview: [
                { title: '建设项目', value: '0', unit: '个', onClickFun: () => { this.$router.push({ name: 'line' }) } },
                { title: '标段项目', value: '0', unit: '个', onClickFun: () => { this.$router.push({ name: 'section' }) } },
                { title: '供应商', value: '0', unit: '个', onClickFun: () => { this.$router.push({ name: 'supplierList' }) } },
                { title: '启用合同数量', value: '0', unit: '个', onClickFun: () => { this.$router.push({ name: 'contractList',query:{bigScreenFlag:'1'} }) } },
                { title: '物资总金额', value: '0', unit: '万元', onClickFun: () => { this.$router.push({ name: 'contractList',query:{bigScreenFlag:'1'} }) } },
                { title: '已收货金额', value: '0', unit: '万元', onClickFun: () => { this.$router.push({ name: 'receiveList', query:{statusList:['2','3','4'], bigScreenFlag:'1'} }) } },
                { title: '已入库金额', value: '0', unit: '万元', onClickFun: () => { this.$router.push({ name: 'imList',query:{bigScreenFlag:'1'} }) } },
                { title: '已出库金额', value: '0', unit: '万元', onClickFun: () => { this.$router.push({ name: 'omList',query:{bigScreenFlag:'1'} }) } },
            ],
            selectProjectId:'',
            selectType:'1',
            //待办数量对象
            taskNum: {},
            //通知信息
            noticeOptions: [],
            //数据概况数据
            recentList: [],
            //查询备忘录月份
            memoDate: '',
            //备忘录数据
            memoOptions: {},
            //分页参数
            listQuery: {
                pageNum: 1,
                pageSize: 5,
            },
            total: 0,
            lineProjectOptions: [],
        }
    },
    computed: {
        ...mapGetters([
            'userInfo',
        ]),
        ...mapState({
            theme: state => state.settings.theme,
            sideTheme: state => state.settings.sideTheme,
        }),
        username() {
            return `${this.userInfo.nickName}(${this.userInfo.username})`;
        },
        activeComponentTitle() {
            switch (this.activeComponent) {
                case 'ChildAudit':
                    return '待审核';
                case 'ChildHandle':
                    return '待处理';
                case 'ChildTodoList':
                    return '我的发起';
                case 'ChildToBeDeal':
                    return '已审核';
                default:
                    return '日历';
            }
        }
    },
    activated() {
        this.init()
        console.log('dashboard activated');
    },
    created() {
        this.init()
        console.log('dashboard mounted');
    },
    methods: {
        // 左侧数据概览周期切换
        handleSummaryRangeChange(range) {
            this.selectType = range
            this.needSummaryLoading = true
            this.fetchSummaryData(this.selectType);
        },
        // 汇总数据填充（保留模拟数据，方便后续替换成接口）
        fetchSummaryData(range) {
            this.getDataCount()
        },
        // 根据当前选中的时间范围计算日期区间
        getDateRange() {
            const now = dayjs();
            let startDate, endDate;
            switch (this.summaryRange) {
                case '1': // 本周
                    startDate = now.startOf('week').add(1, 'day').format('YYYY-MM-DD'); // 周一
                    endDate = now.startOf('week').add(7, 'day').format('YYYY-MM-DD');   // 周日
                    break;
                case '2': // 本月
                    startDate = now.startOf('month').format('YYYY-MM-DD');
                    endDate = now.endOf('month').format('YYYY-MM-DD');
                    break;
                case '3': // 本年
                    startDate = now.startOf('year').format('YYYY-MM-DD');
                    endDate = now.endOf('year').format('YYYY-MM-DD');
                    break;
                default:
                    startDate = now.startOf('week').add(1, 'day').format('YYYY-MM-DD');
                    endDate = now.startOf('week').add(7, 'day').format('YYYY-MM-DD');
            }
            return { startDate, endDate };
        },
        // 左侧概览点击跳转
        handleSummaryNavigate(item) {
            if (typeof item.onClick === 'function') {
                item.onClick();
                return;
            }
            if (item.route) {
                const { startDate, endDate } = this.getDateRange();
                const route = {
                    ...item.route,
                    query: {
                        ...(item.route.query || {}),
                        startDate,
                        endDate,
                    },
                };
                this.$router.push(route).catch(() => { });
                return;
            }
            this.$emit('summary-card-click', item);
        },
        handlerViewDetails(item) {
            if (item.businessType == 'HTJE') {
                // 合同金额超过10% businessId
                this.$router.push({ name: 'detailContract', query: { id: item.businessId, type: 'view' } })
            } else if (item.businessType == 'RKWZ') {
                // 入库物资临期提醒
                this.$router.push({ name: 'imPage', query: { id: item.businessId, type: 'view', storeStatus: 3 } })
            } else if (item.businessType == 'KCWZ') {
                // 库存详情临期提醒
                this.$router.push({ name: 'stockDetail', query: { id: item.businessId, type: 'view'} })
            } else if (item.businessType == 'HTBH') {
                // 合同保函日期提醒
                this.$router.push({ name: 'detailContract', query: { id: item.businessId, type: 'view' } })
            }else if(item.businessType == 'FHTIMEOUT_14'){
                this.$router.push({name:'addSendCy',query:{id:item.businessId,type:'view'}})
            }
        },
        handleOverviewClick(item) {
            if (item.onClickFun) {
                item.onClickFun()
            }
        },
        onProjectChange(val) {
            this.selectProjectId = val
            this.needProjectLoading = true
            this.needSummaryLoading = true
            this.getDataCount(this.selectProjectId)
        },
        async getOptions() {
            const res = await getLineProjectList();
            if (res.success) {
                this.lineProjectOptions = res.data.map(item => ({
                    label: item.projectName,
                    value: item.id
                }));
            }
        },
        init() {
            this.fetchSummaryData()
            this.getAllTaskNumByUser();
            this.getMessageList();
            this.getDailyList();
            this.getDataCount()
            this.getOptions()

            this.key += 1
        },
        getDataCount() {
            if(!this.needProjectLoading && !this.needSummaryLoading){
                this.projectLoading = true
                this.needSummaryLoading = true
            }
            if(this.needProjectLoading){
                this.projectLoading = true
            }
            if(this.needSummaryLoading ) {
                this.summaryLoading = true
            }
            itemList({ projectId:this.selectProjectId,type:this.selectType }).then(res => {
                console.log(res.data.contractTotal, 'res')
                this.dataOverview = [
                    { title: '建设项目', value: res.data.projectTotal || '0', unit: '个', onClickFun: () => { this.$router.push({ name: 'line' }) } },
                    { title: '标段项目', value: res.data.sectionProjectTotal || '0', unit: '个', onClickFun: () => { this.$router.push({ name: 'section' }) } },
                    { title: '供应商', value: res.data.sellerTotal || '0', unit: '个', onClickFun: () => { this.$router.push({ name: 'supplierList' }) } },
                    { title: '启用合同数量', value: res.data.contractTotal || '0', unit: '个', onClickFun: () => { this.$router.push({ name: 'contractList',query:{fromUrl:'largeScreen'} }) } },
                    { title: '物资总金额', value: (res.data.totalAmount / 10000).toFixed(2) || '0', unit: '万元', onClickFun: () => { this.$router.push({ name: 'contractList',query:{fromUrl:'largeScreen'} }) } },
                    { title: '已收货金额', value: ((res.data.PUTTOTAL || 0) / 10000).toFixed(2) || '0', unit: '万元', onClickFun: () => { this.$router.push({ name: 'receiveList', query:{statusList:['2','3','4'],fromUrl:'largeScreen'} }) } },
                    { title: '已入库金额', value: ((res.data.STORETOTAL || 0) / 10000).toFixed(2) || '0', unit: '万元', onClickFun: () => { this.$router.push({ name: 'imList',query:{statusList:['2','3','4'],fromUrl:'largeScreen'} }) } },
                    { title: '已出库金额', value: ((res.data.OUTTOTAL || 0) / 10000).toFixed(2) || '0', unit: '万元', onClickFun: () => { this.$router.push({ name: 'omList',query:{fromUrl:'largeScreen'} }) } },
                ]

                 this.summaryStats = [
                { key: 'planCount', label: '计划数', value: res.data.planCount || 0, unit: '条', route: { name: 'wzxqList',query:{statusList: ['2','3','4','5']} } },
                { key: 'shippingCount', label: '发货数', value: res.data.shippingCount || 0, unit: '次', route: { name: 'sendList' ,query: {statusList: ['2','3','8']}} },
                { key: 'takeCount', label: '收货数', value: res.data.takeCount || 0, unit: '次', route: { name: 'receiveList',query:{statusList:['2','3','4'],fromUrl:'largeScreen'} }},
                { key: 'inCount', label: '入库数', value:res.data.inCount || 0, unit: '次', route: { name: 'imList',query:{statusList:['2','3','4'],fromUrl:'largeScreen'} }},
                { key: 'outCount', label: '出库数', value: res.data.outCount || 0, unit: '次', route: { name: 'omList',query:{fromUrl:'largeScreen'} }},
            ]
            })
                .finally(() => {
                    this.projectLoading = false
                    this.summaryLoading = false

                    this.needProjectLoading = false
                    this.needSummaryLoading = false
                })
        },
        //获取待办数量
        getAllTaskNumByUser() {
            // const loading = this.$loading(this.$c.loadingCommonOptions);

            wfTodoCount().then((res) => {
                if (res.success) {
                    this.taskNum = res.data;
                } else {
                    this.$modal.msgError(res.message);
                }
            }).catch((err) => {

            }).finally(() => {
                // loading?.close();
            })
        },
        //获取系统提醒
        getMessageList() {
            // const loading = this.$loading(this.$c.loadingCommonOptions);

            let params = {
                flag: 1,
            }
            messagePage(Object.assign({}, this.listQuery, params)).then((res) => {
                if (res.success) {
                    this.noticeOptions = res.data.list;
                    this.total = res.data.total;
                } else {
                    this.$modal.msgError(res.message);
                }
            }).catch((err) => {
                // Handle error if needed
            }).finally(() => {
                loading?.close();
            })
        },
        //获取数据概况数据
        getDailyList() {
            // const loading = this.$loading(this.$c.loadingCommonOptions);

            // funcRecentList().then((res) => {
            //     if (res.success) {
            //         this.recentList = res.data || [];
            //         this.encapsulationList(6);
            //     } else {
            //         this.$modal.msgError(res.message);
            //     }
            // }).catch((err) => {

            // }).finally(() => {
            //     loading?.close();
            // })
        },
        //获取备忘录信息
        getMemoData() {
            // const loading = this.$loading(this.$c.loadingCommonOptions);

            // let params = {
            //     memoDate: this.parseTime(this.memoDate, '{y}-{m}'),
            // }
            // memoGetOneMonthMemo(params).then((res) => {
            //     if (res.success) {
            //         this.memoOptions = res.data;
            //     } else {
            //         this.$modal.msgError(res.message);
            //     }
            // }).catch((err) => {

            // }).finally(() => {
            //     loading?.close();
            // })
        },
        //封装数据概况数据
        encapsulationList(chunkSize) {
            if (this.recentList.length === 0) {
                return;
            }
            const chunkedArray = [];
            for (let i = 0; i < this.recentList.length; i += chunkSize) {
                chunkedArray.push(this.recentList.slice(i, i + chunkSize));
            }
            this.recentList = chunkedArray;
        },
        handleWaitClick(name) {
            this.activeWaitType = name;
            if (name === 'audit') {
                this.activeComponent = 'ChildAudit';
            } else if (name === 'handle') {
                this.activeComponent = 'ChildHandle';
            } else if (name === 'todoList') {
                this.activeComponent = 'ChildTodoList';
            } else if (name === 'toBeDeal') {
                this.activeComponent = 'ChildToBeDeal';
            }
        },

        //系统提醒点击更多
        handleNoticeMore() {
            this.$router.push({
                name: 'message',
                query: {

                },
            })
        },
        //常用菜单点击
        handleMenuClick(funcUrl) {
            this.$router.push({
                path: funcUrl.slice(1)
            })
        },
        //帮助中心点击
        handleVideoClick() {
            // this.$router.push({
            //     name: 'helpCenterDetail',
            //     query: {

            //     },
            // })

        },
    },

}
</script>
<style lang="scss" scoped>
h3 {
    color: #1d2129;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
}

.operation-manual-link {
    text-decoration: none;
    color: #165DFF;
    font-size: 14px;

    &:hover {
        color: #1F98FF;
    }
}

.home-container {
    margin: 0 20px 20px 20px;
    height: 100%;
    overflow: auto;
    font-family: 'Microsoft YaHei UI', 'Microsoft YaHei';
    // background: linear-gradient(to bottom,#fff,#f3f3f3);
    background: #F7F8FA;

    .grid-left {
        display: grid;
        grid-template-rows: auto auto 1fr;
        grid-row-gap: 16px;
        margin-right: 16px;
    }

    .grid-right {
        display: grid;
        grid-template-rows: 43.33% 33.33% 23.33%;
        grid-row-gap: 16px;
    }

    .summary-container {
        padding-bottom: 8px;

        .summary-select {
            width: 120px;
        }

        .summary-content {
            padding: 0 20px 20px 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            grid-gap: 12px;
        }

        .summary-card {
            background: #F7F8FA;
            border-radius: 6px;
            padding: 14px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;

            &:hover {
                border: 1px solid #165DFF;
                box-shadow: 0 8px 16px rgba(16, 30, 115, 0.08);

                .summary-label,
                .summary-value,
                .summary-value span,
                .summary-value em {
                    color: #165DFF;
                }
            }

            .summary-label {
                font-size: 14px;
                color: #4E5969;
                margin-bottom: 8px;
                transition: color 0.2s ease;
            }

            .summary-value {
                font-size: 22px;
                font-weight: 600;
                color: #1D2129;
                display: flex;
                align-items: flex-end;
                transition: color 0.2s ease;

                span {
                    line-height: 1;
                    transition: color 0.2s ease;
                }

                em {
                    font-style: normal;
                    font-size: 12px;
                    color: #86909C;
                    margin-left: 4px;
                    line-height: 1.2;
                    transition: color 0.2s ease;
                }
            }
        }
    }

    .wait-container {
        border-radius: 4px;
        background: #FFF;
        padding: 20px;
        display: flex;
        flex-direction: column;
        font-size: 16px;
        color: #1d2129;
        font-weight: 700;



            ul {
                margin: 0px;
                padding: 0px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 100%;
                position: relative;
                // padding: 23px 0;
                // border-top: 1px solid #F2F3F5;
                border-bottom: 1px solid #F2F3F5;

                li {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    background: #ffffff;
                    position: relative;
                    border-right: 1px solid #F2F3F5;
                    height: 100%;
                    transition: background 0.2s ease, box-shadow 0.2s ease;

                    &:last-child {
                        border-right: 0;
                    }

                    &.wait-item-active {
                        background: #f2f6ff;
                        box-shadow: 0 8px 16px rgba(22, 93, 255, 0.12);

                        .wait-content {
                            & p:nth-child(1) {
                                color: #165dff;
                            }

                            & p:nth-child(2) {
                                color: #165dff;

                                span {
                                    color: #165dff;
                                }
                            }
                        }
                    }

                    .wait-content {
                        margin-left: 12px;
                        display: flex;
                    align-items: center;
                    flex-direction: column;
                    justify-content: flex-start;
                    flex-grow: 1;

                    & p:nth-child(1) {
                        color: #1d2129;
                        font-size: 14px;
                        font-weight: 700;
                        margin-bottom: 8px;
                        width: 100%;
                    }

                    & p:nth-child(2) {
                        font-size: 12px;
                        font-weight: 400;
                        color: #4e5969;
                        width: 100%;
                        display: flex;
                        align-items: center;

                        span {
                            font-size: 22px;
                            font-weight: 700;
                            color: #1d2129;
                            margin-right: 6px;
                        }
                    }
                }

                img {
                    width: 54px;
                    height: 54px;
                    margin-left: 17px;
                }

                &:hover {
                    cursor: pointer;

                    img {
                        transform: scale(1.1);
                    }
                }
            }

            & li:nth-child(4) {
                margin-right: 0px;
            }
        }
    }

    .gird-container {
        width: 100%;
        /* 必须有 */
        overflow: hidden;
        /* 防止子内容撑破 */
        display: grid;
        grid-template-columns: 60% 40%;

        // grid-column-gap: 16px;
        .gird-item {
            background: #ffffff;
            border-radius: 7px;
        }

        .title-item {
            width: 100%;
            height: 48px;
            padding: 20px 20px 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .title-item-left {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 16px;
                color: #1d2129;
                font-weight: 700;

                img {
                    width: 32px;
                    height: 32px;
                }

                span {
                    margin-left: 5px;
                    color: #0a1027;
                    font-size: 16px;
                }
            }

            .click-menu:hover {
                cursor: pointer;
            }

            .title-item-right {
                // line-height: 32px;
                padding: 0px 5px;
                font-size: 14px;
                color: #165DFF;
                // width: 50%;

                & :hover {
                    cursor: pointer;
                    color: #1F98FF;
                }
            }
        }

        .notice-container {
            width: var(--rightWidth);

            .notice-content {
                height: calc(100% - 48px);
                overflow: auto;
                padding-top: 16px;

                ul {

                    li {
                        // line-height: 22px;
                        // margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        max-width: 693px;

                        span {
                            width: 56px;
                            height: 20px;
                            line-height: 20px;
                            border-radius: 2px;
                            margin-right: 4px;
                            text-align: center;
                            font-size: 12px;
                            font-weight: 700;
                        }

                        .notice-text {
                            margin-top: 0;
                            font-size: 14px;
                            color: #4e5969;
                            width: calc(100% - 100px);
                            margin-right: -30px;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            margin-bottom: 14px;
                        }

                        .notice-date {
                            width: 130px;
                            font-size: 12px;
                            color: #4e5969;
                            padding-right: 20px;
                            text-align: right;
                            margin:12px 0;
                        }

                        &:hover {
                            cursor: pointer;

                            & span:nth-child(1) {
                                color: #1655d5;
                                text-decoration: underline;
                            }
                        }
                    }
                }
            }

            .notice-empty {
                height: calc(100% - 48px);
                text-align: center;

                img {
                    width: 280px;
                    height: 178px;
                    margin-top: 28px;
                    margin-bottom: 5px;
                }

                span {
                    font-size: 14px;
                    color: #a1aecb;
                    display: block;
                }
            }
        }

        .menu-container {

            .menu-content {
                height: calc(100% - 48px);

                ul {
                    margin-top: 20px;
                    padding: 0 50px;

                    li {
                        width: 31.5%;
                        float: left;
                        text-align: center;
                        margin-right: 2.5%;
                        margin-bottom: 24px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        div {
                            border-radius: 6px;
                            background: #F2F3F5;
                            padding: 8px;
                            margin-bottom: 5px;
                            font-size: 14px;

                            .recent-icon.svg-icon {
                                color: #4E5969;
                            }
                        }

                        // img {
                        //   width: 36px;
                        //   height: 36px;
                        //   margin-top: 5px;
                        // }
                        span {
                            display: block;
                            font-size: 14px;
                            color: #1d2129;
                            // line-height: 20px;
                            font-weight: 400;
                        }

                        &:hover {
                            cursor: pointer;

                            span {
                                color: #1655d5;
                            }

                            .recent-icon.svg-icon {
                                color: #165DFF;
                            }
                        }
                    }

                    & li:nth-child(3n) {
                        margin-right: 0px;
                    }
                }
            }
        }

        .calendar-container {
            .calendar-select {
                padding: 24px 0 27px 24px;
                margin: 0 20px 0 12px;
                border: 1px solid #EBEEF5;
                border-bottom: 0;
            }

            .today-btn {
                margin-left: 32px;

                &.el-button {
                    background: #F2F3F5;
                    border: 1px solid #F2F3F5;
                    color: #4E5969;
                }
            }

            .custom-day {
                width: 100%;
                height: 45px;
                padding: 8px;
            }

            .memo-day {
                display: inline-block;
                width: 32px;
                height: 32px;
                border-radius: 16px;
                background-color: #165DFF;
                color: #ffffff;
                line-height: 32px;
                font-weight: 600;
            }
        }

        .help-container {
            text-align: center;
            position: relative;
            width: var(--rightWidth);

            .video-content {

                .video-title {
                    position: absolute;
                    top: 20px;
                    right: 20px;

                    span {
                        font-size: 14px;
                        color: #165dff;
                        font-weight: 400;
                    }

                    & img:nth-child(1) {
                        width: 25px;
                        height: 24px;
                        margin-right: 15px;
                    }

                    & img:nth-child(3) {
                        width: 9px;
                        height: 17px;
                        margin-left: 15px;
                    }
                }

                .video-image {
                    width: 320px;
                    height: 189px;
                    transition: all 0.3s ease-in-out 0s;
                }

                &:hover {
                    cursor: pointer;

                    .video-title {

                        span {
                            color: #1655d5;
                        }
                    }

                    .video-image {
                        transform: scale(1.08);
                    }
                }
            }

            .support-content {
                margin-top: 10px;
                margin-bottom: 13px;
                display: flex;
                justify-content: center;

                ul {
                    padding: 0;
                    color: #4e5969;
                    font-size: 12px;
                    display: flex;

                    li {
                        margin-right: 20px;
                        display: flex;
                        align-items: center;

                        &:last-child {
                            margin-right: 0;
                        }

                        img {
                            width: 20px;
                            height: 20px;
                            margin-right: 5px;
                        }

                        span {
                            font-size: 12px;
                            color: #4E5969;
                        }
                    }
                }
            }
        }
    }

    @media screen and (max-width: 1600px) {
        .wait-container ul li .wait-content {
            margin-left: 12px;
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: flex-start;
            flex-grow: 1;

            & p:nth-child(1) {
                color: #1d2129;
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 8px;
                width: 100%;
            }

            & p:nth-child(2) {
                font-size: 12px;
                font-weight: 400;
                color: #4e5969;
                width: 100%;
                display: flex;
                align-items: center;

                span {
                    font-size: 22px;
                    font-weight: 700;
                    color: #1d2129;
                    margin-right: 6px;
                }
            }
        }

        .gird-container .menu-container .menu-content ul {
            padding: 0 20px;
        }
    }
}

//轮播图样式
::v-deep .el-carousel__container {
    height: 260px;
}

//轮播图指示器样式 未进入此页面的样式
::v-deep .el-carousel__button {
    width: 8px;
    height: 8px;
    background: #e5e5e5;
    border-radius: 4px;
    opacity: 1;
}

//滚动到此页面的样式
::v-deep .is-active .el-carousel__button {
    width: 8px;
    height: 8px;
    background: #1d8eff;
    border-radius: 4px;
    opacity: 1;
}

//日历样式
::v-deep .el-calendar__body {
    padding: 0px 20px 10px 12px;
}

::v-deep .el-calendar-table {
    font-size: 14px;
    border-right: 1px solid #EBEEF5;
    border-left: 1px solid #EBEEF5;
}

//日历header样式
::v-deep .el-calendar__header {
    display: none;
    border: none;
    position: relative;
    padding: 10px 20px 20px;
}

::v-deep .el-calendar-table thead {
    position: relative;
    top: -10px;
}

::v-deep .el-calendar__header .el-calendar__title {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    font-size: 18px;
    font-weight: 600;
    color: #2a2e33;
}

::v-deep .el-calendar__button-group {
    width: 100%;
}

::v-deep .el-button-group {
    display: flex;
    justify-content: space-between;
}

::v-deep .el-button-group::after {
    display: none;
}

::v-deep .el-button-group::before {
    display: none;
}

::v-deep .el-button-group>.el-button:not(:first-child):not(:last-child) {
    display: none;
}

::v-deep .el-button-group>.el-button:first-child {
    border: none;

    &::before {
        content: '<';
    }
}

::v-deep .el-button-group>.el-button:last-child {
    border: none;

    &::before {
        content: '>';
    }
}

::v-deep .el-button-group>.el-button:first-child span {
    display: none;
}

::v-deep .el-button-group>.el-button:last-child span {
    display: none;
}

//日历单元格样式
::v-deep .el-calendar-table__row td {
    .el-calendar-day {
        height: 45px;
        line-height: 30px;
        text-align: center;
        padding: 0px;
    }
}

//日历当天单元格样式
::v-deep .el-calendar-table td.is-today {
    span {
        display: inline-block;
        width: 32px;
        height: 32px;
        border: 1px solid #165DFF;
        border-radius: 16px;
        font-weight: 600;
        background: #ffffff !important;
        color: #1D2129;
    }
}

//日历鼠标选中单元格样式
::v-deep .el-calendar-table td.is-selected {
    background-color: #ffffff;
    color: #ffffff;

    span {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 16px;
        background-color: #165DFF;
        font-weight: 600;
    }
}

.pagination-container {
    text-align: right;
    padding: 10px 0;
}

/* --- 数据概况新样式 (v2) --- */
.data-overview-container .overview-content {
    padding: 10px 20px;
}

.data-overview-container {
    width: var(--rightWidth);
}

.overview-col {
    margin-bottom: 10px;
}

.overview-card {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    transition: all 0.3s;
    background: #F7F8FA;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
}

.overview-card:hover .card-title,
.overview-card:hover .card-value,
.overview-card:hover .card-value span,
.overview-card:hover .card-icon .svg-icon {
    color: #165DFF;
}

.card-icon {
    margin-right: 10px;
    flex-shrink: 0;
}

.card-icon .svg-icon {
    font-size: 32px;
    /* Larger icon */
    color: #4E5969;
    /* Default icon color */
    transition: color 0.3s;
}

.card-details {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.card-title {
    font-size: 14px;
    color: #606266;
    margin: 0 0 4px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s;
}

.card-value {
    font-size: 14px;
    color: #303133;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s;
}

.card-value span {
    font-size: 20px;
    font-weight: bold;
    margin-right: 4px;
    transition: color 0.3s;
}
</style>
