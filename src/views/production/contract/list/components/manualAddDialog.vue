<template>
  <Dialog
    :title="title"
    :visible.sync="visible"
    v-if="visible"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    :destroy-on-close="true"
    width="1200px"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="165px" class="manual-add-form">
      <el-row :gutter="16">
        <el-col :span="12" v-for="item in fieldList" :key="item.prop">
          <el-form-item :label="item.label" :prop="item.prop">
            <el-select
              v-if="item.prop === 'unit'"
              v-model="formData[item.prop]"
              :placeholder="`请选择${item.label}`"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="dictItem in dict.type.MeasureUnit"
                :key="dictItem.value"
                :label="dictItem.label"
                :value="dictItem.label"
              />
            </el-select>
            <el-input v-else v-model.trim="formData[item.prop]" :placeholder="`请输入${item.label}`"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-alert
      v-if="errorReasons.length > 0"
      title="提示"
      type="warning"
      style="margin-top: 16px; max-height: 300px; overflow-y: auto"
      :closable="false"
    >
      <template>
        <ol style="max-height: 250px;">
          <li v-for="(item, idx) in errorReasons" :key="idx">
            {{ item }}
          </li>
        </ol>
      </template>
    </el-alert>

    <div slot="footer" class="dialog-footer">
      <el-button round type="primary" :loading="loading" :disabled="!canSave" @click="handleSave">保存</el-button>
      <el-button round @click="visible = false">关闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import { verifyAllocation } from '@/api/prodmgr-inv/project/contractItem.js'

const createDefaultFormData = () => ({
  sort: '',
  sectionName: '',
  speciesName: '',
  categoriesName: '',
  providedDetailName: '',
  materialName: '',
  specModel: '',
  standardCode: '',
  unit: '',
  amount: '',
  price: '',
  vatRate: '',
  taxPrice: '',
  totalAmount: '',
  deliveryLocation: '',
  receiver: '',
  deliveryStatus: '',
  materialNumber: '',
  sellerName: '',
  deliveryTerms: '',
  deliveryDate: ''
})

export default {
  name: 'ManualAddDialog',
  dicts: ['MeasureUnit'],
  data() {
    return {
      title: '新增物资',
      visible: false,
      loading: false,
      formData: createDefaultFormData(),
      errorReasons: [],
      fieldList: [
        { label: '序号', prop: 'sort' },
        { label: '标段项目名称', prop: 'sectionName' },
        { label: '物资大类', prop: 'speciesName' },
        { label: '物资种类', prop: 'categoriesName' },
        { label: '细目', prop: 'providedDetailName' },
        { label: '物资名称', prop: 'materialName' },
        { label: '规格型号', prop: 'specModel' },
        { label: '标准或图号', prop: 'standardCode' },
        { label: '计量单位', prop: 'unit' },
        { label: '数量', prop: 'amount' },
        { label: '到站不含税单价（元）', prop: 'price' },
        { label: '物资增值税率%', prop: 'vatRate' },
        { label: '到站含税单价（元）', prop: 'taxPrice' },
        { label: '到站合价含税（元）', prop: 'totalAmount' },
        { label: '交货地点', prop: 'deliveryLocation' },
        { label: '收货人', prop: 'receiver' },
        { label: '交货状态', prop: 'deliveryStatus' },
        { label: '交货条件', prop: 'deliveryTerms' },
        { label: '交货期', prop: 'deliveryDate' }
      ],
      formRules: {}
    }
  },
  computed: {
    projectId() {
      return this.$store.state.project.projectId || this.$route.query.projectId || ''
    },
    canSave() {
      return this.fieldList.every(item => {
        const value = this.formData[item.prop]
        return value !== undefined && value !== null && String(value).trim() !== ''
      })
    }
  },
  created() {
    this.formRules = this.fieldList.reduce((rules, item) => {
      rules[item.prop] = [{
        required: true,
        message: item.prop === 'unit' ? `请选择${item.label}` : `请输入${item.label}`,
        trigger: item.prop === 'unit' ? 'change' : 'blur'
      }]
      return rules
    }, {})
  },
  methods: {
    open() {
      this.visible = true
      this.loading = false
      this.errorReasons = []
      this.formData = createDefaultFormData()
    },
    normalizeErrorReasons(payload) {
      const reason = payload?.reason || payload?.data?.reason || payload?.errors
      if (Array.isArray(reason)) {
        return reason.filter(Boolean)
      }
      if (typeof reason === 'string' && reason) {
        return [reason]
      }
      if (payload?.message) {
        return [payload.message]
      }
      return ['校验失败，请检查录入内容']
    },
    buildSubmitData() {
      return {
        projectId: this.projectId,
        ...this.formData
      }
    },
    async handleSave() {
      if (!this.projectId) {
        this.$message.warning('请先选择归属建设项目')
        return
      }

      const valid = await new Promise(resolve => {
        this.$refs.formRef.validate(result => resolve(result))
      })
      if (!valid) {
        return
      }

      this.loading = true
      this.errorReasons = []

      try {
        const payload = await verifyAllocation(this.buildSubmitData())
        const reasonList = Array.isArray(payload?.data?.reason) ? payload.data.reason.filter(Boolean) : []

        if (reasonList.length > 0) {
          this.errorReasons = reasonList
          return
        }

        const rowData = payload?.data?.list?.[0] || payload?.data || payload
        this.$emit('success', rowData)
        this.visible = false
      } catch (error) {
        const payload = typeof error === 'string' ? { message: error } : (error?.response?.data || error || {})
        this.errorReasons = this.normalizeErrorReasons(payload)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.manual-add-form {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 8px;
}
</style>
