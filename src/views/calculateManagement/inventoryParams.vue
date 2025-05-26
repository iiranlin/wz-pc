<template>
    <div class="app-container container_flex">
        <button-top :buttonTopData="buttonTop" @newButton="newButton"></button-top>
        <el-form class="mt" ref="form">
            <el-form-item class="form-item">
                <span class="type">
                    金额或单价单位精度保留小数点后
                </span>
                <div class="ml-150">
                    <el-input-number v-model="formData.value" controls-position="right" :precision="0" :min="0" :max="8"
                        style="width: 140px" @input="handleVal">
                    </el-input-number>
                    <span class="type">
                        位
                    </span>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import indexMixin from '@/views/mixins'
import { detail, save } from '@/api/calculateManagement/inventoryParams'

export default {
    mixins: [indexMixin],
    name: 'inventoryParams',
    data() {
        return {
            radio: undefined,
            id: undefined,
            buttonTop: [
                { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' }
            ],
            formData: {
                code: 'FA_AMOUNT_UNITPRICE_PRECISION',
                value: 2
            },
            dataArr: [
                {code: 'FA_AMOUNT_UNITPRICE_PRECISION', value: 2},
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
                const { data: {data} } = await detail('FA_AMOUNT_UNITPRICE_PRECISION');
                this.dataArr = Array.isArray(data)  && data.length ? data : this.dataArr
                this.formData = this.dataArr[0]
            } catch (err) {
                console.error(err)
            } finally {
                this.loading = false
            }
        },
        handleVal(v) {
            const {code} = this.formData
            for(let i=0; i< this.dataArr.length; i++) {
                if(this.dataArr[i]['code'] === code) {
                    this.$set(this.dataArr, i, {...this.dataArr[i], value: v})
                }
            }
        },
        handleInput(v) {
            const form = this.dataArr.filter(item => item.code == v)
            this.formData = form[0]
        },
        newButton(buttonCode) {
            if (buttonCode === 'save') {
                this.save()
            }
        },
        async save() {
            try {
                this.loading = true
                const param = this.dataArr
                await save(param)
                this.getParameter()
                this.$modal.msgSuccess('操作成功')

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

.form-item {

    ::v-deep .el-form-item__content {
        display: flex;
        flex-direction: row;
        width: 100%;
    }
}

.type {
    font-weight: bold;
    font-size: 16px;
}

.ml-150 {
    flex: 1;
}
</style>
