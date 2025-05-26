<template>
    <el-dialog class="custom-print-dialog" top="0 !important" :title="title" :visible.sync="openDataScope"
        v-if="openDataScope" :close-on-click-modal="false" width="auto" append-to-body>
        <div class="print-content">
            <printCustom ref="printCustom" />
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleOpen">导入JSON
            </el-button>
            <el-button type="primary" @click="handleCopy">复制JSON
            </el-button>
            <el-button type="primary" @click="submitDataScope" :loading="loading">确定
            </el-button>
            <el-button @click="openDataScope = false">取 消</el-button>
        </div>
        <el-dialog class="custom-print-dialog2" title="模板JSON" :visible.sync="jsonDataScope" v-if="jsonDataScope"
            :close-on-click-modal="false" width="60%" append-to-body>
            <div class="print-content">
                <el-input type="textarea" :autosize="{ minRows: 20 }" placeholder="请输入模板JSON" v-model="jsonText">
                </el-input>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="confirmCopyJson">确定
                </el-button>
                <el-button @click="jsonDataScope = false">取 消</el-button>
            </div>
        </el-dialog>
    </el-dialog>

</template>

<script>
import Vue from 'vue'
import request from '@/utils/request'
import { save, detailById } from "@/api/system/print";
import blcdHiprint from 'blcd-hiprint'
import 'blcd-hiprint/dist/blcd-hiprint.css'
Vue.use(blcdHiprint, { request })
export default {
    components: {
    },
    data() {
        return {
            jsonDataScope: false,
            loading: false,
            title: "模板设计",
            jsonText: '',
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
        async confirmCopyJson() {
            const param = { ...this.formData }
            param.templateContent =this.jsonText
            await save(param)
            this.detail(this._id);
            this.jsonDataScope = false
        },
        handleOpen() {
            this.jsonDataScope = true
        },
        /** 提交按钮（数据权限） */
        init(id) {
            this._id = id
            this.openDataScope = true;
            this.jsonText = ''
            this.formData = {
                templateCode: "",
                templateName: "",
                templateContent: '',
                menuId: '',
                id: ''
            }
            this.detail(id);
        },
        loadMenu(id) {
            return new Promise(async (resolve) => {
                const res = await this.$store.dispatch('menuProperty', id);
                resolve(res)
            })

        },
        async detail(id) {
            const { data } = await detailById(id)
            this.formData = data
            const menus = data.menuId.split(',')
            const reqArr = []
            for (let i = 0; i < menus.length; i++) {
                reqArr.push(this.loadMenu(menus[i]))
            }
            const resArr = await Promise.all(reqArr)
            const t = !!data.templateContent ? JSON.parse(data.templateContent) : {}
            this.$refs.printCustom.init(t, resArr)
        },
        handleCopy() {
            const json = this.$refs.printCustom.template.getJson()
            try {
                const input = document.createElement('input');
                input.value = JSON.stringify(json);
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                this.$modal.msgSuccess('复制成功');
            } catch (err) {
                this.$modal.msgError('复制失败');
            }
        },
        submitDataScope() {
            const json = this.$refs.printCustom.template.getJson()
            const param = { ...this.formData, templateContent: JSON.stringify(json) }
            save(param).then(({ success, message, data }) => {
                if (success) {
                    this.$modal.msgSuccess(message);
                    this.openDataScope = false;
                    this.loading = false;
                    this.$emit("formSuccess");
                } else {
                    this.$modal.msgError(message);
                }
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

.custom-print-dialog2 .el-dialog__body .print-content {
    height: 60vh;
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