<template>
    <!-- 分配角色数据权限对话框 -->
    <Dialog class="flex-dialog max-height-dialog" :title="title" :visible.sync="openDataScope" append-to-body :close-on-click-modal="false" >
        <div class="noticeMessage" v-html="data"></div>
        <div slot="footer" class="dialog-footer">
            <el-button @click="openDataScope = false">关 闭</el-button>
        </div>
    </Dialog>
</template>

<script>
export default {
    data() {
        return {
            title: '通知内容',
            openDataScope: false,
            data: ''
        }
    },
    methods: {
        init(data = '') {
            this.data = data;
            this.openDataScope = true;
        },
    }
};
</script>
<style lang="scss" scoped>
.noticeMessage{
    height: 100%;
    overflow-y: auto;
}
</style>
