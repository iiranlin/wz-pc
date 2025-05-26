<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="buttonTop" @newButton="newButton"></button-top>
        <el-form class="mt" ref="form">
            <el-form-item>
                <span class="type">
                    生产领料是否需要由生产部先建领料单:
                </span>
                <div class="ml-150">
                    <div style="height: 20px;width: 100%;"></div>
                    <el-radio-group v-model="radio">
                        <el-radio :key="source[0].value" :label="source[0].value">{{ source[0].label
                            }}
                            <el-tooltip class="slotIcon-color" placement="top" effect="light">
                                <div slot="content" class="slotIcon-color-content">
                                    {{ source[0].desc }}
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-radio>
                        <br />
                        <div style="height: 20px;width: 100%;"></div>
                        <el-radio :key="source[1].value" :label="source[1].value">{{ source[1].label
                            }}
                            <el-tooltip class="slotIcon-color" placement="top" effect="light">
                                <div slot="content" class="slotIcon-color-content">
                                    {{ source[1].desc }}
                                </div>
                                <i class="el-icon-question"></i>
                            </el-tooltip>
                        </el-radio>
                    </el-radio-group>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { detail, save } from '@/api/projectManagement/productionParams'

export default {
    mixins: [indexMixin],
    name: 'productionParams',
    data() {
        return {
            radio: undefined,
            id: undefined,
            buttonTop: [
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' }
            ],
            source: [
                {
                    value: '1',
                    label: '是，生产部先建领料单，将领料单的数据推到仓储部的出库单，仓储部基于出库单做出库。',
                    desc: '一般适用于对领料要求比较严格的业务，需要由生产部先确定领料计划，即维护领料单。'
                },
                {
                    value: '0',
                    label: '否，不需要建领料单，根据生产订单下的备料需求直接推到仓储出库单，仓储部基于出库单做出库。',
                    desc: '不需要建领料单，可节省流程，由生产订单直接推领料。'
                }
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
                const { data } = await detail();
                this.radio = data.isCreatePicking
                this.id = data.id
            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false
            }
        },
        newButton(buttonCode) {
            if (buttonCode === 'save') {
                this.confirmSave()
            }
        },
        async confirmSave() {
            const res = await this.$modal.confirm('是否进行切换，请确定?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
            if (res == 'confirm') {
                this.save()
            }
        },
        async save() {
            try {
                this.loading = true
                const param = {
                    id: this.id,
                    isCreatePicking: this.radio
                }
                const { message } = await save(param)
                if (!!message) {
                    this.$modal.confirm(message, '提示', {
                        cancelButtonText: '取消',
                        type: 'warning',
                        showConfirmButton: false
                    })
                } else {
                    this.$modal.msgSuccess('操作成功')

                    this.getParameter()
                }

            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false
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
