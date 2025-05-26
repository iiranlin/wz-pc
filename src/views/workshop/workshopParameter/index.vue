<template>
    <div class="app-container container_flex" v-loading="loading">
        <button-top :buttonTopData="buttonTop" @newButton="newButton"></button-top>
        <el-form class="mt" ref="elForm">
            <el-form-item label="末序报工是否自动推送完工报告：">
                <el-radio-group v-model="isPush">
                    <el-radio v-for="item in dict.type.YesNo" :key="item.value" :label="item.value">
                        {{ item.label }}
                        <tooltip
                        v-if="item.value == '1'" 
                        content="对于存在工艺路线，即生成了工序扭转卡的生产订单，比如一个生产订单生产数是1000，有工艺路线，车间1生产500，车间2生产500；车间1和车间2会根据各自生产最后一道序的数据自动推送完工报告。所以，生产订单完工报告数据是由车间1和车间2的生产汇总而来。" 
                        class="slotIcon-color" 
                        />
                    </el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { parameterDetail, parameterSave } from "@/api/prodmgr-mm/workshop"
export default {
    name: 'workshopParameter',
    dicts: ['YesNo'],
    components: {
        tooltip: () => import('@/components/tooltip') 
    },
    data() {
        return {
            loading: false,
            isPush: null,
            buttonTop: [
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' }
            ]
        }
    },
    created() {
        this.parameterDetail()
    },
    methods: {
        async parameterDetail() {
            try {
                this.loading = true
                const { data } = await parameterDetail()
                this.isPush = data && data.isPush;
            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false
            }
        },
        newButton(buttonCode) {
            if (buttonCode === 'save') {
                this.loading = true
                const isPush = this.isPush
                parameterSave({isPush}).then(({ message }) => {
                    this.$modal.msgSuccess(message)
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
</style>
