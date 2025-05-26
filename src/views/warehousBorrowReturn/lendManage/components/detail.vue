<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton"></button-top>
        <div class="container_flex_form">
            <VFormRender ref="vFormRef" :form-data="formData" :global-dsv="globalDsv">
                <template slot="detail">
                    <div style="height: 500px;display: flex;flex-direction: column;">
                        <table-index numberShow
                            :styles="{ width: '100%', height: '454px', margin: '0', 'overflow-y': 'auto' }"
                            ref="tableIndex" :visibleAction="false" :tableData="detailList" :property="datailProperty"
                            @handleButton="newTableButton">
                            <template slot="lendNum" slot-scope="scope">
                                <el-input-number v-if="queryType != 'view'" style="width: 100%;" :value="scope.data.lendNum"
                                    @change="(currentValue, oldValue) => lendNumChange(currentValue, oldValue, scope)"
                                    controls-position="right" :min="0" :max="scope.data.inventoryNum"></el-input-number>
                                    <span v-else>{{ scope.data.lendNum }}</span>
                            </template>
                        </table-index>
                    </div>
                </template>
            </VFormRender>
        </div>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins';
import { formFillInPage } from '@/api/form/form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { getUserInfo } from '@/utils/user-info'
import {
    saveDetail,
    getDetailView,
} from '@/api/warehouseManage/lendManage'
import VFormRender from '@/components/form-render/index'
import { menuConfig } from '@/utils'

export default {
    name: 'detail',
    components: {
        VFormRender
    },
    mixins: [indexMixin],
    data() {
        return {
            loading: false,
            type: '',
            queryIds: [],
            queryName: '',
            queryType: '',
            formJson: {},
            formData: {},
            // 菜单按钮、字段等数据
            buttonTop: [
                { buttonName: '取消', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update' },
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
                { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Goback', type: 'view' },
                { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: '' },
                { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: '' },
                { buttonName: '编辑', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
                { buttonName: '提交', buttonCode: 'submit', buttonIcon: 'Blue-Submit', type: 'view, update' }
            ],
            queryAuditArr: null,
            globalDsv: {
                VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
                VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
                Authorization: getToken(),
                businessType: '01'
            },
            userInfo: getUserInfo(),
            datailProperty: {},
            detailList: []
        }
    },
    computed: {
        ...mapGetters(['infoData'])
    },
    async created() {
        this.init()
    },
    methods: {
        async menuProperty() {
            this.datailProperty = await this.$store.dispatch('menuProperty', menuConfig.MENU_LEND_DETAIL)
            this.datailProperty.fields.forEach((field) => {
                if (field.fieldCode === 'lendNum') {
                    field.listSlot = true
                    field.required = true
                }
            })
            this.$nextTick(() => {
                this.$refs['tableIndex'].init(this.datailProperty.fields)
            })
        },
        buttonShow(item) {
            if (['submit', 'edit'].includes(item.buttonCode) && !['0', '1'].includes(this.formData.status)) {
                return false
            }
            if (['submit', 'edit'].includes(item.buttonCode) && this.queryName == 'toBeDeal') {
                return false
            }
            if (item.type.indexOf(this.queryType) != -1 || (this.queryAuditArr && ['pass', 'reject'].includes(item.buttonCode))) {
                return true
            } else {
                return false
            }
        },
        async init() {
            let { type, name, ids='' } = this.$route.query
            this.queryType = type || 'create'
            this.queryIds = ids.split(',') || []
            this.queryName = name
            this.$nextTick(async () => {
                this.$refs['vFormRef'].resetForm()
                await this.formFillInPage()
                this.menuProperty();
                if (['update', 'view'].includes(this.queryType)) {
                    this.getOperateDetail(this.queryIds)
                }
            })
        },
        formFillInPage() {
            return new Promise((resolve) => {
                formFillInPage('lendOrderDetailOperate').then(res => {
                    this.$refs['vFormRef'].setFormJson(res.data)
                    resolve(true)
                })
            })
        },

        lendNumChange(cur, old, row) {
            row.data.lendNum = cur
        },
        async getOperateDetail(ids) {
            try {
                this.loading = true
                const { data } = await getDetailView({ ids: ids })
                this.detailList = data
            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false
            }
        },
        newTableButton(buttonCode, _1, _2, _3, row) {
            if (buttonCode === 'delete') {
                this.detailList = this.detailList.filter(item => item.matlId != row.matlId)
            }
        },

        newButton(buttonCode) {
            switch (buttonCode) {
                case 'cancel':
                    this.cancel()
                    break;
                case 'save':
                    this.save()
                    break;
                default:
            }
        },
        cancel() {
            this.$tab.closeOpenPage({ name: this.queryName })
        },
        async save() {
            try {
                if (!this.detailList.length) {
                    this.$modal.msgError('明细信息不能为空')
                    return
                }
                let flag = false
                for (let i = 0; i < this.detailList.length; i++) {
                    const { lendNum } = this.detailList[i]
                    if (!lendNum || lendNum == 0) {
                        flag = true
                        break
                    }
                }
                if (flag) {
                    this.$modal.msgError('借出数据不能为空或为0')
                    return
                }
                this.loading = true
                const res = await saveDetail(this.detailList)
                res.success && this.$modal.msgSuccess(`${res.message}`)
                this.cancel()
            } catch (err) {
                this.$modal.msgError(`${err.message}`)
                console.error(err)
            } finally {
                this.loading = false
            }
        },
    }
}
</script>
<style lang="scss" scoped>
.container_flex_form {
    position: relative;

    .checkbox {
        position: absolute;
        z-index: 1000;
        left: 160px;
        color: #fff;
        top: 16px
    }

    ::v-deep .el-checkbox__input.is-checked+.el-checkbox__label {
        color: #fff
    }
}

.slotIcon-color-content {
    color: red
}

.slotIcon-color {
    color: #1890ff;
}
</style>