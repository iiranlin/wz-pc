<template>
    <el-dialog class="custom-print-dialog" top="0 !important" :title="title" :visible.sync="openDataScope"
        v-if="openDataScope" :close-on-click-modal="false" width="auto" append-to-body>
        <div class="print-content">
            <printPreview ref="printPreview" />
        </div>
        <div slot="footer" class="dialog-footer">
        </div>
    </el-dialog>

</template>

<script>
import Vue from 'vue'
import { detailById } from "@/api/system/print";
import blcdHiprint from 'blcd-hiprint'
import request from '@/utils/request'
import 'blcd-hiprint/dist/blcd-hiprint.css'
Vue.use(blcdHiprint, {request})
export default {
    components: {
    },
    data() {
        return {
            loading: false,
            title: "预览",
            openDataScope: false,
            formData: {
                templateCode: "",
                templateName: "",
                templateContent: '',
                id: ''
            },
        };
    },
    created() {
    },
    methods: {
        /** 提交按钮（数据权限） */
        init(id) {
            this.openDataScope = true;
            this.formData = {
                templateCode: "",
                templateName: "",
                templateContent: '',
                id: ''
            }
            this.detail(id);
        },
        detail(id) {
            detailById(id).then(({ data }) => {
                this.formData = data
                const t = JSON.parse(data.templateContent)
                this.$refs.printPreview.preview(t, {})
            });
        },
    },
};
</script>
<style>
.custom-print-dialog {
    overflow: hidden !important;
}

.custom-print-dialog .el-dialog .el-dialog__footer {
    padding: 0 !important;
}

.custom-print-dialog .el-dialog .el-dialog__body {
    height: calc(100vh - 100px);
    overflow: auto;
    padding: 20px;
    box-sizing: border-box;
}
</style>
<style lang="scss" scoped>
.dialog-footer {
    height: 56px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
}
</style>