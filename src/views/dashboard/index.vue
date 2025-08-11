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
                            <span>日历</span>
                        </div>
                    </div>
                    <div>
                        <div class="calendar-select">
                            <el-date-picker v-model="memoDate" type="month" placeholder="选择月"
                                :clearable="false"></el-date-picker>
                            <el-button class="today-btn" @click="clickToday">今天</el-button>
                        </div>
                        <div class="calendar-list">
                            <el-calendar ref="calender" v-model="memoDate">
                                <template slot="dateCell" slot-scope="{ data }">
                                    <div @click="openDateCell(data)" class="custom-day">
                                        <span :class="{ 'memo-day': message(data.day) }">
                                            {{ data.day.split("-").pop() }}
                                        </span>
                                    </div>
                                </template>
                            </el-calendar>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid-right">
                <!--常用功能-->
                <div class="menu-container gird-item">
                    <div class="title-item">
                        <div class="title-item-left">
                            <span>常用功能</span>
                        </div>
                    </div>
                    <div class="menu-content">
                        <el-carousel trigger="click" :autoplay="false">
                            <el-carousel-item v-for="(carouselItem, carouselIndex) in recentList" :key="carouselIndex">
                                <ul>
                                    <li v-for="(item, index) in carouselItem" :key="index"
                                        @click="handleMenuClick(item.funcUrl)">
                                        <div><svg-icon class="recent-icon" :icon-class="item.funcIcon" /></div>
                                        <span>{{ item.funcName }}</span>
                                    </li>
                                </ul>
                            </el-carousel-item>
                        </el-carousel>
                    </div>
                </div>
                <!--通知信息-->
                <div class="notice-container gird-item">
                    <div class="title-item">
                        <div class="title-item-left click-menu" @click="handleNoticeMore()">
                            <span>通知消息</span>
                        </div>
                        <div class="title-item-right" @click="handleNoticeMore()">
                            <span>查看更多</span>
                        </div>
                    </div>
                    <div class="notice-content" v-if="noticeOptions.length > 0">
                        <ul>
                            <li v-for="(item, index) in noticeOptions" :key="index" @click="handleNoticeClick(item)">
                                <span :style="checkNoticeType(item.mesStats)">{{ item.mesStatsName }}</span>
                                <p class="notice-text">{{ item.mesTitle }}</p>
                                <p class="notice-date">{{ parseTime(item.sendDate, '{y}-{m}-{d}') }}</p>
                            </li>
                        </ul>
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
        <!--备忘录弹框-->
        <memo-operate ref="memoOperate" @memoOperateSuccess="memoOperateSuccess"></memo-operate>
        <!--公告弹框-->
        <notice-operate ref="noticeOperate" @noticeOperateClose="batchUpdateOwnMes"></notice-operate>
        <!--通知提醒弹框-->
        <notice ref="notice" @noticeClose="batchUpdateOwnMes"></notice>
    </div>
</template>
<script>
import memoOperate from "./components/memoOperate.vue"
import noticeOperate from './components/noticeOperate.vue'
import notice from './notice.vue'
import { wfTodoCount } from "@/api/system/workflow";
// import { getAllTaskByUser, funcRecentList } from "@/api/examine/to-be-reviewed"
// import { memoGetOneMonthMemo } from '@/api/system/dashboard.js';
import moment from 'moment';
// import { sysMsgSettingSelectOwnMesPage, sysMsgSettingBatchUpdateOwnMes } from "@/api/system/messageToDo";
import { mapGetters } from "vuex";

export default {
    name: 'Index',
    components: { memoOperate, noticeOperate, notice },

    data() {
        return {
            //待办数量对象
            taskNum: {},
            //通知信息
            noticeOptions: [],
            //常用功能数据
            recentList: [],
            //查询备忘录月份
            memoDate: '',
            //备忘录数据
            memoOptions: {},
            //分页参数
            listQuery: {
                pageNum: 1,
                pageSize: 10,
            }
        }
    },
    computed: {
        ...mapGetters([
            'userInfo'
        ]),
        username() {
            return `${this.userInfo.nickName}(${this.userInfo.username})`;
        }
    },
    watch: {
        memoDate(val, oldVal) {
            if (
                val &&
                this.parseTime(val, "{y}-{m}") != this.parseTime(oldVal, "{y}-{m}")
            ) {
                this.memoDate = moment(val).format("YYYY-MM-DD");
                this.getMemoData();
            }
        },
    },
    created() {
        this.memoDate = this.parseTime(new Date().getTime(), "{y}-{m}-{d}");
        this.getAllTaskNumByUser();
        this.getMessageList();
        this.getDailyList();
    },
    methods: {
        clickToday() {
            this.memoDate = this.parseTime(new Date().getTime(), "{y}-{m}-{d}")
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
        //获取通知消息
        getMessageList() {
            // const loading = this.$loading(this.$c.loadingCommonOptions);

            // let params = {
            //     flag: 1,
            // }
            // sysMsgSettingSelectOwnMesPage(Object.assign({}, this.listQuery, params)).then((res) => {
            //     if (res.success) {
            //         this.noticeOptions = res.data.list.slice(0, 6);
            //     } else {
            //         this.$modal.msgError(res.message);
            //     }
            // }).catch((err) => {

            // }).finally(() => {
            //     loading?.close();
            // })
        },
        //获取常用功能数据
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
        //封装常用功能数据
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
        //日历单元格点击
        openDateCell(data) {
            this.$refs.memoOperate.init(data.day, this.message(data.day));
        },
        //添加备忘录回调
        memoOperateSuccess() {
            this.memoDate = moment(this.memoDate).format("YYYY-MM-DD");
            this.getMemoData();
        },
        //匹配备忘录
        message(date) {
            if (Object.keys(this.memoOptions).length === 0) {
                return ''
            } else {
                for (let key in this.memoOptions) {
                    if (date == key) {
                        return this.memoOptions[key];
                    }
                }
            }
        },
        handleWaitClick(name) {
            if(name){
                this.$router.push({ name })
            }
        },
        //通知公告点击
        handleNoticeClick(item) {
            if (item.mesStats == 'TZ' || item.mesStats == 'TX') {
                this.$refs.notice.init(item)
            } else {
                this.$refs.noticeOperate.init(item)
            }
        },
        //标记已读
        batchUpdateOwnMes(id) {
            // const loading = this.$loading(this.$c.loadingCommonOptions);

            // let ids = [];
            // ids.push(id);

            // sysMsgSettingBatchUpdateOwnMes({ ids: ids }).then((res) => {
            //     if (res.success) {
            //         this.getMessageList();
            //     }
            // }).catch((err) => {

            // }).finally(() => {
            //     loading?.close();
            // })
        },
        //判断通知信息类型
        checkNoticeType(mesStats) {
            switch (mesStats) {
                case 'TZ':
                    return {
                        background: '#E8F3FF',
                        color: '#165DFF',
                    }
                case 'GG':
                    return {
                        background: '#E8FFFB',
                        color: '#0FC6C2',
                    }
                case 'TX':
                    return {
                        background: '#fff0db',
                        color: '#dd2a00',
                    }
                default:
                    break;
            }
        },
        //通知消息点击更多
        handleNoticeMore() {
            // this.$router.push({
            //     name: 'myMessage',
            //     query: {

            //     },
            // })
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
        grid-template-rows: repeat(3, 33.33%);
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
                        margin-bottom: 10px;
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
</style>