<template>
  <div class="app-container container_flex" v-loading="loading">
    <button-top :buttonTopData="buttonTop" :buttonShow="buttonShow" @newButton="newButton" />
    <div :class="{ container_flex_form: isFormReadonly }">
      <VFormRender ref="vFormRef" :form-json="formJson" :form-data="formData"
        :option-data="optionData" :global-dsv="globalDsv" :class="{ formRender_view: isFormReadonly }">
        <template #sectionNameSlot="{ formModel }">
          <el-form-item prop="sectionName" label="标段项目" class="label-right-align">
            <el-tooltip :content="formModel.sectionName || ''" effect="light" placement="top">
              <span class="readonly-mode-field">{{ formModel.sectionName }}</span>
            </el-tooltip>
          </el-form-item>
        </template>

        <template #supplierNameSlot="{ formModel }">
          <el-form-item prop="supplierName" label="生产厂家" class="label-right-align"
            :rules="[{ required: true, message: '请选择生产厂家', trigger: 'change' }]">
            <el-select v-if="!isFormReadonly" v-model="formModel.supplierName" filterable clearable
              :disabled="!formModel.materialName" :loading="factoryLoading" placeholder="请选择生产厂家"
              style="width: 100%" @change="value => handleFactoryChange(value, formModel)">
              <el-option v-for="item in factoryOptions" :key="item.id" :label="item.factoryName"
                :value="item.factoryName" />
            </el-select>
            <span v-else class="readonly-mode-field">{{ formModel.supplierName }}</span>
          </el-form-item>
        </template>

        <template #sellerNameSlot="{ formModel }">
          <el-form-item prop="sellerName" label="供应商" class="label-right-align"
            :rules="[{ required: true, message: '请输入供应商', trigger: 'blur' }]">
            <el-input v-if="!isFormReadonly" v-model.trim="formModel.sellerName" placeholder="请输入供应商" />
            <span v-else class="readonly-mode-field">{{ formModel.sellerName }}</span>
          </el-form-item>
        </template>

        <template #materialNameSlot="{ formModel }">
          <el-form-item prop="materialName" label="物资类型" class="label-right-align"
            :rules="[{ required: true, message: '请选择物资类型', trigger: 'change' }]">
            <el-select v-if="!isFormReadonly" v-model="formModel.materialName" clearable placeholder="请选择物资类型"
              style="width: 100%" @change="value => handleMaterialChange(value, formModel)">
              <el-option v-for="item in materialOptions" :key="item" :label="item" :value="item" />
            </el-select>
            <span v-else class="readonly-mode-field">{{ formModel.materialName }}</span>
          </el-form-item>
        </template>

        <template #carNumSlot="{ formModel }">
          <el-form-item prop="carNum" label="车牌号" class="label-right-align"
            :rules="[{ required: true, message: '请输入车牌号', trigger: 'blur' }]">
            <el-input v-if="!isFormReadonly" v-model.trim="formModel.carNum" maxlength="30" placeholder="请输入车牌号" />
            <span v-else class="readonly-mode-field">{{ formModel.carNum }}</span>
          </el-form-item>
        </template>

        <template #specModelSlot="{ formModel }">
          <el-form-item prop="specModel" label="规格型号" class="label-right-align"
            :rules="[{ required: true, message: '请输入规格型号', trigger: 'blur' }]">
            <el-input v-if="!isFormReadonly" v-model="formModel.specModel" placeholder="请输入规格型号" />
            <span v-else class="readonly-mode-field">{{ formModel.specModel }}</span>
          </el-form-item>
        </template>

        <template #unitSlot="{ formModel }">
          <el-form-item prop="unit" label="计量单位" class="label-right-align"
            :rules="[{ required: true, message: '请选择计量单位', trigger: 'change' }]">
            <el-select v-if="!isFormReadonly" v-model="formModel.unit" filterable allow-create clearable
              placeholder="请选择" style="width: 100%">
              <el-option v-for="item in dict.type.MeasureUnit" :key="item.value"
                :label="item.label" :value="item.label" />
            </el-select>
            <span v-else class="readonly-mode-field">{{ formModel.unit }}</span>
          </el-form-item>
        </template>

        <template #receiptQtySlot="{ formModel }">
          <el-form-item prop="receiptQty" label="收货数量" class="label-right-align"
            :rules="[{ required: true, message: '请输入收货数量', trigger: 'blur' }]">
            <el-input-number v-if="!isFormReadonly" v-model="formModel.receiptQty" :min="0.00"
              :precision="4" :controls="false" placeholder="请输入收货数量" style="width: 100%" />
            <span v-else class="readonly-mode-field">{{ formModel.receiptQty }}</span>
          </el-form-item>
        </template>

        <template #receiptDateSlot="{ formModel }">
          <el-form-item prop="receiptDate" label="收货日期" class="label-right-align"
            :rules="[{ required: true, message: '请选择收货日期', trigger: 'change' }]">
            <el-date-picker v-if="!isFormReadonly" v-model="formModel.receiptDate" type="date"
              value-format="yyyy-MM-dd HH:mm:ss" format="yyyy-MM-dd" placeholder="请选择"
              style="width: 100%" />
            <span v-else class="readonly-mode-field">{{ formatDate(formModel.receiptDate) }}</span>
          </el-form-item>
        </template>

        <template #receiverSlot="{ formModel }">
          <el-form-item prop="receiver" label="收货人" class="label-right-align"
            :rules="[{ required: true, message: '请输入收货人', trigger: 'blur' }]">
            <el-input v-if="!isFormReadonly" v-model="formModel.receiver" placeholder="请输入收货人" />
            <span v-else class="readonly-mode-field">{{ formModel.receiver }}</span>
          </el-form-item>
        </template>

        <template #jhdSlot>
          <el-form-item label="交货单附件" class="label-right-align no-border-item" required>
            <file-upload v-model="proofFiles.jhd" :limit="9999" :fileSize="500"
              :fileType="['pdf', 'jpg', 'png', 'jpeg', 'doc', 'docx', 'xls', 'xlsx']"
              :preview="isFormReadonly" :isShowTip="false" />
          </el-form-item>
        </template>

        <template #dhzpSlot>
          <el-form-item label="到货照片" class="label-right-align no-border-item" required>
            <file-upload v-model="proofFiles.dhzp" :limit="9999" :fileSize="500"
              :fileType="['pdf', 'jpg', 'png', 'jpeg']" :preview="isFormReadonly" :isShowTip="false" />
          </el-form-item>
        </template>

        <template #qtSlot>
          <el-form-item label="其他材料" class="label-right-align no-border-item">
            <file-upload v-model="proofFiles.qt" :limit="9999" :fileSize="500"
              :fileType="['pdf', 'jpg', 'png', 'jpeg', 'doc', 'docx', 'xls', 'xlsx']"
              :preview="isFormReadonly" :isShowTip="false" />
          </el-form-item>
        </template>

        <template #remarkSlot="{ formModel }">
          <el-form-item prop="remark" label="备注" class="label-right-align">
            <el-input v-if="!isFormReadonly" v-model="formModel.remark" type="textarea" :rows="3"
              maxlength="500" show-word-limit placeholder="请输入备注" />
            <span v-else class="readonly-mode-field readonly-mode-field--wrap">{{ formModel.remark }}</span>
          </el-form-item>
        </template>

        <template #materialListSlot>
          <material-list ref="materialList" v-model="materialList"
            :material-type="currentMaterialType" :readonly="isView || isUpdateBlocked"
            :supplement-mode="isAttachmentSupplement" />
        </template>
      </VFormRender>
    </div>
    <to-be-reviewed ref="toBereview" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import VFormRender from '@/components/form-render/index'
import fileUpload from '@/components/upload'
import MaterialList from './materialList.vue'
import { formFillInPage } from '@/api/form/form'
import { getCurrentSection } from '@/api/prodmgr-inv/project/section.js'
import * as Api from '@/api/prodmgr-inv/project/strategicProcurementGoodsReceipt.js'
import * as ProductFactoryApi from '@/api/prodmgr-inv/project/productFactory.js'
import { getToken } from '@/utils/auth'
import toBeReviewed from '@/views/audit/components/toBeReviewed'

export default {
  name: 'addGoodsReceipt',
  components: { VFormRender, fileUpload, MaterialList, toBeReviewed },
  data() {
    return {
      loading: false,
      formJson: {},
      formData: {},
      optionData: {},
      materialList: [],
      materialOptions: ['钢材', '水泥', '粉煤灰', '外加剂'],
      factoryOptions: [],
      factoryLoading: false,
      proofFiles: {
        jhd: [],
        dhzp: [],
        qt: []
      },
      globalDsv: {
        VUE_APP_BASE_API: process.env.VUE_APP_BASE_API,
        VUE_APP_BASE_SERVER: process.env.VUE_APP_BASE_SERVER,
        Authorization: getToken(),
        businessType: 'materialFirstReceipt'
      },
      buttonTop: [
        { buttonName: '返回', buttonCode: 'cancel', buttonIcon: 'Blue-Cancel', type: 'create, update, view' },
        { buttonName: '保存', buttonCode: 'save', buttonIcon: 'Blue-Save', type: 'create, update' },
        { buttonName: '修改', buttonCode: 'edit', buttonIcon: 'Blue-Edit', type: 'view' },
        { buttonName: '通过', buttonCode: 'pass', buttonIcon: 'Blue-AddSon', type: 'view' },
        { buttonName: '驳回', buttonCode: 'reject', buttonIcon: 'Blue-EditCard', type: 'view' }
      ]
    }
  },
  computed: {
    type() { return this.$route.query.type || 'create' },
    id() { return this.$route.query.id || '' },
    name() { return this.$route.query.name || '' },
    queryAuditArr() {
      try {
        return JSON.parse(this.$route.query.auditArr || '[]')
      } catch (error) {
        return []
      }
    },
    isView() { return this.type === 'view' },
    isListEntry() { return this.$route.query.from === 'list' },
    isAttachmentSupplement() {
      return this.type === 'update' && this.isListEntry &&
        ['0', '2', '3'].includes(String(this.$route.query.status))
    },
    isNormalUpdate() {
      return this.type === 'update' && this.isListEntry && String(this.$route.query.status) === '1'
    },
    isUpdateBlocked() {
      return this.type === 'update' && !this.isNormalUpdate && !this.isAttachmentSupplement
    },
    isFormReadonly() { return this.isView || this.isAttachmentSupplement || this.isUpdateBlocked },
    isAudit() { return this.isView && this.name === 'audit' },
    currentMaterialType() {
      return this.formData.materialName || ''
    }
  },
  mounted() {
    this.initPage()
  },
  methods: {
    async initPage() {
      this.loading = true
      try {
        await this.loadFormJson()
        if (this.id) await this.loadDetail()
        else await this.loadCurrentSection()
        if (this.isFormReadonly) this.$refs.vFormRef.setReadMode(true)
      } finally {
        this.loading = false
      }
    },
    async loadFormJson() {
      const { data } = await formFillInPage('strategicProcurementGoodsReceipt')
    //   this.formJson = data
      this.$refs.vFormRef.setFormJson(data)
    },
    async loadCurrentSection() {
      const { data } = await getCurrentSection()
      if (!data) return
      this.$refs.vFormRef.setFormData({
        projectId: data.projectId,
        projectName: data.projectName,
        sectionId: data.id || data.sectionId,
        sectionName: data.projectShortName
      })
    },
    async loadDetail() {
      const { data } = await Api.detail(this.id)
      this.proofFiles = this.parseProofFiles(data.proofFileList)
      const detail = {
        ...data,
        receiptDate: data.receiptDate ? dayjs(data.receiptDate).format('YYYY-MM-DD HH:mm:ss') : ''
      }
      this.materialList = (data.materialFirstReceiptDetailsDTOList || []).map(item => ({ ...item }))
      this.formData = detail
      this.$refs.vFormRef.setFormData(detail)
      await this.loadFactoryOptions(detail.materialName)
    },
    parseProofFiles(value) {
      const emptyFiles = { jhd: [], dhzp: [], qt: [] }
      if (!value) return emptyFiles
      try {
        const result = typeof value === 'string' ? JSON.parse(value) : value
        if (Array.isArray(result)) return { ...emptyFiles, jhd: result }
        if (!result || typeof result !== 'object') return emptyFiles
        return {
          jhd: Array.isArray(result.jhd) ? result.jhd : [],
          dhzp: Array.isArray(result.dhzp) ? result.dhzp : [],
          qt: Array.isArray(result.qt) ? result.qt : []
        }
      } catch (error) {
        return emptyFiles
      }
    },
    formatDate(value) { return value ? dayjs(value).format('YYYY-MM-DD') : '' },
    async handleMaterialChange(value, formModel) {
      const previousValue = this.formData.materialName || ''
      if (previousValue && previousValue !== value && this.materialList.length) {
        try {
          await this.$confirm('切换物资类型将清空已添加的物资明细，是否继续？', '提示', { type: 'warning' })
          this.materialList = []
        } catch (error) {
          formModel.materialName = previousValue
          return
        }
      }
      formModel.materialName = value
      if (previousValue !== value) {
        formModel.supplierId = ''
        formModel.supplierName = ''
      }
      this.formData = {
        ...this.formData,
        materialName: value,
        ...(previousValue !== value ? { supplierId: '', supplierName: '' } : {})
      }
      await this.loadFactoryOptions(value)
    },
    async loadFactoryOptions(factoryType) {
      if (!factoryType) {
        this.factoryOptions = []
        return
      }
      this.factoryOptions = []
      this.factoryLoading = true
      try {
        const { data } = await ProductFactoryApi.list({ pageNum: 1, pageSize: -1, factoryType })
        this.factoryOptions = data.list || []
      } finally {
        this.factoryLoading = false
      }
    },
    handleFactoryChange(value, formModel) {
      const factory = this.factoryOptions.find(item => item.factoryName === value)
      formModel.supplierId = factory ? factory.id : ''
      this.formData = {
        ...this.formData,
        supplierId: formModel.supplierId,
        supplierName: value || ''
      }
    },
    buttonShow(button) {
      if (['pass', 'reject'].includes(button.buttonCode)) return this.isAudit
      if (button.buttonCode === 'edit') return false
      if (button.buttonCode === 'save') return !this.isView && !this.isUpdateBlocked
      return true
    },
    newButton(buttonCode) {
      if (buttonCode === 'cancel') this.cancel()
      if (buttonCode === 'save') this.submitForm()
      if (buttonCode === 'edit') this.toUpdatePage()
      if (buttonCode === 'pass') this.handleAudit('pass')
      if (buttonCode === 'reject') this.handleAudit('reject')
    },
    handleAudit(type) {
      if (!this.queryAuditArr.length) return this.$modal.msgWarning('未获取到审核任务信息')
      this.$refs.toBereview.init(type, this.queryAuditArr, this.name)
    },
    toUpdatePage() {
      this.$router.push({
        name: 'addGoodsReceipt',
        query: { type: 'update', id: this.id }
      }).then(() => {
        this.$nextTick(() => this.$refs.vFormRef.setReadMode(false))
      })
    },
    submitForm() {
      if (this.isAttachmentSupplement) return this.saveForm()
      this.$refs.vFormRef.validateForm(valid => {
        if (!valid) return this.$message.warning('请完善必填信息')
        this.saveForm()
      })
    },
    async saveForm() {
      this.loading = true
      try {
        const formData = await this.$refs.vFormRef.getFormData()
        if (!this.materialList.length) {
          this.$message.warning('至少添加一条物资')
          return
        }
        if (!this.isAttachmentSupplement && !this.$refs.materialList.validateList()) return
        if (!this.isAttachmentSupplement && !this.proofFiles.jhd.length) {
          this.$message.warning('请上传交货单附件')
          return
        }
        if (!this.isAttachmentSupplement && !this.proofFiles.dhzp.length) {
          this.$message.warning('请上传到货照片')
          return
        }
        const data = {
          ...formData,
          ...(this.id ? { id: this.id } : {}),
          supplierId: formData.supplierId || formData.supplierName || '',
          receiptDate: formData.receiptDate ? dayjs(formData.receiptDate).toISOString() : null,
          proofFileList: JSON.stringify(this.proofFiles),
          materialFirstReceiptDetailsModifyParamList: this.materialList.map(item => ({
            ...item,
            receiptQty: Number(item.receiptQty),
            fileList: typeof item.fileList === 'string' ? item.fileList : JSON.stringify(item.fileList || {})
          }))
        }
        const response = await (this.type === 'update' ? Api.edit(data) : Api.save(data))
        this.$modal.msgSuccess(response.message || '保存成功')
        if (this.type === 'update') await this.returnToList()
        else this.cancel()
      } finally {
        this.loading = false
      }
    },
    returnToList() {
      return this.$tab.closePage(this.$route).then(() => {
        return this.$router.replace({ name: 'zcsh' })
      })
    },
    cancel() { this.$tab.closeOpenPage(true) }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .label-right-align .el-form-item__label { text-align: right; }
::v-deep .readonly-mode-field {
  display: inline-block; max-width: 100%; overflow: hidden; color: #606266;
  line-height: 32px; text-overflow: ellipsis; vertical-align: middle; white-space: nowrap;
}
::v-deep .readonly-mode-field--wrap { white-space: pre-wrap; word-break: break-all; }
</style>
