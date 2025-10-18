<template>
    <div class="home-container">
        <!--网格布局-->
        <div class="gird-container">
            <div class="grid-left">
                <!--待办-->
                <div class="wait-container">
                    <h3>你好，{{ username }}，欢迎回来！</h3>
                    <ul>
                        <li @click="handleWaitClick('audit')">
                            <img src="/static/icon-wait-examine.svg">
                            <div class="wait-content">
                                <p>待审核</p>
                                <p class="wait-examine-num"><span>{{ taskNum.auditNum || 0 }}</span>个</p>
                            </div>
                        </li>
                        <li @click="handleWaitClick('handle')">
                            <img src="/static/icon-wait-handle.svg">
                            <div class="wait-content">
                                <p>待处理</p>
                                <p class="wait-handle-num"><span>{{ taskNum.handleNum || 0 }}</span>个</p>
                            </div>
                        </li>
                        <li @click="handleWaitClick('todoList')">
                            <img src="/static/icon-wait-launch.svg">
                            <div class="wait-content">
                                <p>我的发起</p>
                                <p class="wait-launch-num"><span>{{ taskNum.launchNum || 0 }}</span>个</p>
                            </div>
                        </li>
                        <li @click="handleWaitClick('toBeDeal')">
                            <img src="/static/icon-over-examine.svg">
                            <div class="wait-content">
                                <p>已审核</p>
                                <p class="over-examine-num"><span>{{ taskNum.auditedNum || 0 }}</span>个</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <!--日历-->
                <div class="calendar-container gird-item">
                    <div class="title-item">
                        <div class="title-item-left">
                            <span>{{ activeComponentTitle }}</span>
                        </div>
                    </div>
                    <div style="width: 50.2vw;height: calc(100% - 60px);">
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
                    </div>
                    <div class="overview-content">
                        <el-row :gutter="20">
                            <el-col :span="12" v-for="(item, index) in dataOverview" :key="index" class="overview-col">
                                <div class="overview-card">
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
                            <li v-for="(item, index) in noticeOptions" :key="item.id">
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
import { itemList } from '@/api/prodmgr-inv/project/dataCount.js'
import { wfTodoCount } from "@/api/system/workflow";
import { messagePage } from "@/api/system/message";
// import { getAllTaskByUser, funcRecentList } from "@/api/examine/to-be-reviewed"
// import { memoGetOneMonthMemo } from '@/api/system/dashboard.js';
import moment from 'moment';
// import { sysMsgSettingSelectOwnMesPage, sysMsgSettingBatchUpdateOwnMes } from "@/api/system/messageToDo";
import { mapGetters } from "vuex";

export default {
    name: 'Index',
    components: { memoOperate, noticeOperate, notice, ChildAudit, ChildHandle, ChildToBeDeal, ChildTodoList },

    data() {
        return {
            activeComponent: 'ChildAudit',
            // NOTE: The following data is hardcoded for demonstration.
            // It should be fetched from a relevant API endpoint.
            dataOverview: [
                { title: '建设项目', value: '0', unit: '个' },
                { title: '标段项目', value: '0', unit: '个', },
                { title: '供应商', value: '0', unit: '个' },
                { title: '合同数量', value: '0', unit: '个', },
                { title: '物资总金额', value: '0', unit: '万元' },
                { title: '已收货金额', value: '0', unit: '万元' },
                { title: '已入库金额', value: '0', unit: '万元' },
                { title: '已出库金额', value: '0', unit: '万元' },
            ],
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
        }
    },
    computed: {
        ...mapGetters([
            'userInfo'
        ]),
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
        init() {
            this.getAllTaskNumByUser();
            this.getMessageList();
            this.getDailyList();
            this.getDataCount()
        },
        getDataCount() {
            itemList().then(res => {
                console.log(res.data.contractTotal, 'res')
                this.dataOverview = [
                    { title: '建设项目', value: res.data.projectTotal || '0', unit: '个' },
                    { title: '标段项目', value: res.data.sectionProjectTotal || '0', unit: '个', },
                    { title: '供应商', value: res.data.sellerTotal || '0', unit: '个' },
                    { title: '合同数量', value: res.data.contractTotal || '0', unit: '个', },
                    { title: '物资总金额', value: (res.data.totalAmount / 10000).toFixed(2) || '0', unit: '万元' }, 
                    { title: '已收货金额', value: ((res.data.PUTTOTAL|| 0) / 10000).toFixed(2) || '0', unit: '万元' },
                    { title: '已入库金额', value: ((res.data.STORETOTAL||0) / 10000).toFixed(2) || '0', unit: '万元' },
                    { title: '已出库金额', value: ((res.data.OUTTOTAL||0) / 10000).toFixed(2) || '0', unit: '万元' },
                ]
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
        grid-template-rows: 27% 75%;
        grid-row-gap: 16px;
        margin-right: 16px;
    }

    .grid-right {
        display: grid;
        grid-template-rows: 43.33% 33.33% 23.33%;
        grid-row-gap: 16px;
    }

    .wait-container {
        border-radius: 4px;
        background: #FFF;
        padding: 20px;
        display: flex;
        flex-direction: column;

        h3 {
            color: #1d2129;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 20px;
        }

        ul {
            margin: 0px;
            padding: 0px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 100%;
            position: relative;
            padding: 23px 0;
            border-top: 1px solid #F2F3F5;
            border-bottom: 1px solid #F2F3F5;

            li {
                display: flex;
                align-items: center;
                flex: 1;
                background: #ffffff;
                position: relative;
                border-right: 1px solid #F2F3F5;
                height: 100%;

                &:last-child {
                    border-right: 0;
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

                & :hover {
                    cursor: pointer;
                    color: #1F98FF;
                }
            }
        }

        .notice-container {

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
                            width: calc(100% - 190px);
                            margin-right: 40px;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                        }

                        .notice-date {
                            width: 130px;
                            font-size: 12px;
                            color: #4e5969;
                            padding-right: 20px;
                            text-align: right;
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
}

.card-value span {
    font-size: 20px;
    font-weight: bold;
    margin-right: 4px;
}
</style>