<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="buttonTop" @newButton="newButton"></button-top>
        <el-form class="mt" ref="form" v-if="dict.type.qiSource.length">
            <el-form-item>
                <span class="type">
                    需要质检的单据类型:
                    <tooltip content='如果不勾选该单据类型，默认不质检；如果勾选该单据类型，且物料档案的质检信息"是否质检"=是的物料均需质检' />
                </span>
                <div class="ml-150">
                    <el-checkbox-group v-model="checkboxData">
                        <el-checkbox v-for="item in dict.type.qiSource" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
                    </el-checkbox-group>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { qiParameter, qiSaveQiParameter } from '@/api/prodmgr-inv/qi'

export default {
    mixins: [indexMixin],
    name: 'qualityParams',
    dicts: ['qiSource'],
    components: {
        tooltip: () => import('@/components/tooltip')
    },
    data() {
        return {
            checkboxData: [],
            buttonTop: [
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' }
            ],
            parameterData: []
        }
    },
    created() {
        this.getParameter()
    },
    methods: {
        async getParameter() {
            try {
                this.loading = true
                const { data } = await qiParameter();
                this.parameterData = data;
                this.checkboxData = data.filter((a) => a.isQi == '1').map( (item) => item.code);
            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false
            }
        },
        newButton(buttonCode) {
            if (buttonCode === 'save') {
                this.loading = true
                let data = this.parameterData.map(item => {
                    return {
                        code: item.code,
                        isQi: this.checkboxData.includes(item.code)? '1':'0'
                    }
                })
                qiSaveQiParameter(data).then(({ message }) => {
                    this.$modal.msgSuccess(message)
                    this.getParameter()
                }).finally(() => {
                    this.loading = false
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.mt {
    margin-top: 50px;
    margin-left: 50px;
}

.slotIcon-color-content {
    color: red
}

.slotIcon-color {
    color: #1890ff;
}

.type {
    font-weight: bold;
    font-size: 16px;
}

.ml-150 {
    margin-left: 180px;
}
</style>
