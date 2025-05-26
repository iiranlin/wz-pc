<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="buttonTop" @newButton="newButton"></button-top>
    <el-form class="mt" ref="form" v-if="dict.type.YesNo.length">
      <el-form-item>
        <span class="type">
          是否需要确认采购计划:
        </span>
        <div class="ml-150">
          <el-radio-group v-model="radioData">
            <el-radio v-for="item in dict.type.YesNo" :key="item.value" :label="item.value">
              {{ item.label }}
              <tooltip v-if="item.value == '1'" content="采购计划生成后，需要采购员确认和主管复核" />
            </el-radio>
          </el-radio-group>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { puParameterDetail, puParameterSave } from '@/api/prodmgr-pu/puParameter'

export default {
  name: 'purchaseParameter',
  dicts: ['YesNo'],
  components: {
    tooltip: () => import('@/components/tooltip')
  },
  data() {
    return {
      radioData: '',
      buttonTop: [
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' }
      ],
      parameterData: {}
    }
  },
  created() {
    this.getParameter()
  },
  methods: {
    async getParameter() {
      try {
        this.loading = true
        const { data } = await puParameterDetail('PURCHASE_CONFIRM')
        this.parameterData = data
        this.radioData = data.value
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    newButton(buttonCode) {
      if (buttonCode === 'save') {
        this.loading = true
        const data = Object.assign({}, this.parameterData, {value: this.radioData})
        puParameterSave(data).then(({ message }) => {
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
