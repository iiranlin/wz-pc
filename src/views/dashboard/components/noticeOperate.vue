<template>
    <Dialog class="pop-dialog" :visible.sync="visible" width="1200px" :close-on-click-modal="false" append-to-body
        v-loading="loading" custom-class="notice-dialog" @close="handleDialogClose()" >
        <div slot="title" class="dialog-title">
            <span class="title">{{ title }}</span>
        </div>
        <!-- <span>{{noticeData.noticeTitle}}</span>
                   <span>{{noticeData.noticeMessage}}</span> -->
        <div class="content-container">
            <div class="content-title">
                <h3>{{ noticeData.mesTitle }}</h3>
            </div>

            <v-form-render ref="vFormRef" :form-json="formJson" :form-data="vFormData">
            </v-form-render>
            <div class="content-des" v-if="false">
                <!-- <p>{{noticeData.noticeContext}}</p> -->
                <pre v-html="noticeData.noticeContext">
                    <!-- <p v-html="noticeData.noticeContext"></p> -->
                </pre>
            </div>

        </div>
        <div slot="footer" class="dialog-footer">
            <div class="pop-btn-box">
                <el-button class="pop-button sure" @click="handleConfirm" v-if="false">确 定</el-button>
                <el-button class="pop-button" @click="visible = false">关 闭</el-button>
            </div>
        </div>
    </Dialog>
</template>
<script>
// import { formFillInPage } from "@/api/form/form";
export default {
    data() {
        return {
            //是否显示
            visible: false,
            //表格loading
            loading: false,
            //弹框标题
            title: '通知公告',
            //通知公告数据
            noticeData: {},
            formJson: {},
            vFormData: {},
        }
    },
    methods: {
        async init(item) {
            this.visible = true;
            this.noticeData = item;
            let formJson = await this.getFixedFields();
            let { widgetList: baseWidgetList = [] } = formJson || {};

            if (formJson && Array.isArray(baseWidgetList) && baseWidgetList.length) {
                this.$refs["vFormRef"].setFormJson(formJson);
            }
            this.$nextTick(() => {
                this.$refs["vFormRef"].setFormData({
                    noticeMessage: item.noticeContext
                });
            })
        },
        // 获取表单配置
        getFixedFields() {
            this.loading = true;
            return new Promise((resolve, reject) => {
                formFillInPage("notificationView")
                    .then(({ data }) => {
                        resolve(JSON.parse(data));
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            });
        },
        handleDialogClose() {
            this.$emit('noticeOperateClose', this.noticeData.id);
        },
    },
}
</script>
<style lang="scss" scoped>
.content-container {
    border-top: 1px solid #f3f5f7;
    border-bottom: 1px solid #f3f5f7;
    padding: 20px;
    min-height: 300px;

    .content-title {
        text-align: center;
    }

    .content-des {
        padding: 20px;
    }
}

.dialog-footer {
    display: block;
}

::v-deep .quillWrapper {
    width: 100%;
}

::v-deep .ql-editor {
    overflow: auto;
    max-height: 500px;
}

::v-deep .el-form-item__label::after {
    content: none !important;
}

::v-deep .ql-toolbar.ql-snow {
    display: none;
}

::v-deep .ql-editor {
    // pointer-events:none;
}

::v-deep #quill-container {
    border: 0;
}

::v-deep .notice-dialog {
    height: auto !important;
}
</style>
