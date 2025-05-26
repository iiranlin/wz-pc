<template>
    <div class="app-container container_flex" ref="printPage">
        <button-top :buttonTopData="buttonTop" :buttonShow="() => true" @newButton="newButton"></button-top>
        <div class="printPreview">
            <printPreview ref="printPreview" />
        </div>

    </div>
</template>
<script>
import Vue from 'vue'
import request from '@/utils/request'
import indexMixin from '@/views/mixins';
import { detailById } from '@/api/system/print'
import blcdHiprint from 'blcd-hiprint'
import { IDB } from '@/utils'
import 'blcd-hiprint/dist/blcd-hiprint.css'
Vue.use(blcdHiprint, { request })
export default {
    name: "print",
    mixins: [indexMixin],
    components: {
    },
    data() {
        return {
            printData: {},
            panel: {},
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel' },
                { buttonName: '打印', buttonCode: 'print', buttonIcon: 'Blue-Save' },
            ],
        }
    },
    async created() {
        let { id } = this.$route.query
        this._id = id
        this.loadTmpl(id)
    },
    methods: {
        async loadTmpl(id) {
            const params = await IDB.getObjectStore('printArgs', id)
            const { data } = await detailById(id)
            const t = JSON.parse(data.templateContent)
            const width = this.$refs.printPage.clientWidth
            this.panel = t
            const args = Array.isArray(params.arr) ? params.arr : []
            this.$refs.printPreview.preview(this.panel, args, width)
        },
        async autoClearPrintArgs() {
            await IDB.removeObjectStore('printArgs', this._id)
        },
        async newButton(code) {
            if (code === 'cancel') {
                this.$tab.closeOpenPage({ name: 'print' })
            } else if (code === 'print') {
                this.$refs.printPreview.print()
            }
        }
    },
    async beforeDestroy() {
        await this.autoClearPrintArgs()
    }
}
</script>
<style scoped lang="scss">
.printPreview {
    padding: 20px;
    box-sizing: border-box;
    overflow: auto;
}
</style>