<template>
    <Dialog class="pop-dialog" destroy-on-close :visible.sync="openDataScope" title="消息详情" :close-on-click-modal="false" width="600px"
        append-to-body @close="handleDialogClose()" >
        <div class="notice-info">
            <ul>
                <li>
                    <h3 style="color: black">{{ detailObj.mesTitle }}</h3>
                </li>
                <li class="notice-time">{{ detailObj.sendDate }}</li>
                <li class="uspan">
                    <span class="notice-content">{{ detailObj.noticeContext }}</span>
                    <u style="color: #3674ff">
                        <span @click="clickRouter()" v-show="detailObj.internetUrl !== '' || detailObj.modeId !== ''">{{
        "查看 >" }}</span>
                    </u>
                </li>
            </ul>
        </div>

        <div slot="footer" class="dialog-footer">
            <div class="pagination-container">
                <span></span>
                <div class="pop-btn-box">
                    <!-- <el-button class="pop-button sure" @click="clickRouter()">立即处理</el-button> -->
                    <el-button class="pop-button" @click="openDataScope = false">关 闭</el-button>
                </div>
            </div>
        </div>
    </Dialog>
</template>
<script>
export default {
    data() {
        return {
            openDataScope: false,
            noticeContent: null,
            detailObj: {},
            title: ''
        }
    },
    methods: {
        init(row) {
            this.title = row.noticeTitle
            this.openDataScope = true
            this.detailObj = row
            this.noticeContent = row.noticeContent
        },
        clickRouter() {
            let internetUrl = this.detailObj.internetUrl
            let path = '';
            let paramsObj = new Object();

            if (internetUrl.indexOf("?") != -1) {
                let urlArr = internetUrl.split('?');
                path = urlArr[0];

                if (internetUrl.indexOf("?") != -1) {
                    let str = urlArr[1];
                    str = str.split("&");
                    for (let i = 0; i < str.length; i++) {
                        paramsObj[str[i].split("=")[0]] = decodeURI(str[i].split("=")[1]);
                    }
                }
            } else {
                path = internetUrl;
            }
            this.$router.push({
                path: '/' + path,
                query: paramsObj,
            })
        },
        handleDialogClose() {
            this.$emit('noticeClose', this.detailObj.id);
        }
    },
}
</script>
<style lang="scss" scoped>
::v-deep.el-dialog__wrapper.pop-dialog>div.el-dialog {
    min-height: 320px !important;
}

::v-deep .el-dialog {
    height: 320px !important;
}

.notice-info {
    padding: 10px;

    h3 {
        font-size: 24px;
        font-weight: 600;
        color: #12244d;
    }

    ul li {
        text-align: center;
        margin-top: 32px;

        .notice-time {
            font-size: 12px;
            margin-top: 5px;
            color: #cdced2;
        }

        .notice-content {
            color: #12244d;
            font-size: 14px;
        }

        u {
            text-decoration: none;
        }

        .uspan u:hover {
            span {
                cursor: pointer;
            }
        }
    }
}

::v-deep .el-dialog:not(.is-fullscreen) {
    margin-top: 20vh !important;

    .el-dialog__title {
        margin-left: 20px;
    }
}

.pagination-container {
    justify-content: flex-end;
}
</style>
