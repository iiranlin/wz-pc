<template>
  <div class="material-list">
    <div class="material-list__header">
      <span class="material-list__title">物资明细</span>
      <el-button v-if="!readonly" type="primary" size="small" icon="el-icon-plus" @click="openCreate">
        新增物资
      </el-button>
    </div>

    <el-table :data="value" border style="width: 100%">
      <el-table-column type="index" label="序号" width="70" align="center" />
      <el-table-column prop="materialName" label="物资名称" min-width="180" align="center" show-overflow-tooltip />
      <el-table-column prop="specModel" label="规格型号" min-width="180" align="center" show-overflow-tooltip />
      <el-table-column prop="unit" label="计量单位" min-width="120" align="center" show-overflow-tooltip />
      <el-table-column prop="receiptQty" label="数量" min-width="120" align="center" show-overflow-tooltip />
      <template v-if="isSteel">
        <el-table-column label="质量证明书" min-width="180" align="center">
          <template #default="scope"><file-upload :value="getFiles(scope.row, 'zlzms')" preview /></template>
        </el-table-column>
        <el-table-column label="铭牌" min-width="180" align="center">
          <template #default="scope"><file-upload :value="getFiles(scope.row, 'mp')" preview /></template>
        </el-table-column>
      </template>
      <template v-else-if="materialType">
        <el-table-column prop="batchNo" label="批号" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column label="出厂合格证" min-width="180" align="center">
          <template #default="scope"><file-upload :value="getFiles(scope.row, 'cchgz')" preview /></template>
        </el-table-column>
        <el-table-column label="出厂检测报告" min-width="180" align="center">
          <template #default="scope"><file-upload :value="getFiles(scope.row, 'ccjcbg')" preview /></template>
        </el-table-column>
        <el-table-column label="7天出厂检测报告" min-width="180" align="center">
          <template #default="scope"><file-upload :value="getFiles(scope.row, 'jcbg7')" preview /></template>
        </el-table-column>
        <el-table-column label="28天出厂检测报告" min-width="180" align="center">
          <template #default="scope"><file-upload :value="getFiles(scope.row, 'jcbg28')" preview /></template>
        </el-table-column>
      </template>
      <el-table-column v-if="materialType" prop="remark" label="备注" min-width="180" align="center" show-overflow-tooltip />
      <el-table-column v-if="!readonly" label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button type="text" @click="openEdit(scope.row, scope.$index)">修改</el-button>
          <el-button type="text" class="delete-button" @click="removeRow(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="650px"
      append-to-body :close-on-click-modal="false" @closed="resetDialog">
      <el-form ref="materialForm" :model="materialForm" :rules="rules" label-width="120px">
        <el-form-item label="物资名称" prop="materialName">
          <el-input v-model.trim="materialForm.materialName" maxlength="200"
            show-word-limit placeholder="请输入物资名称" />
        </el-form-item>
        <el-form-item label="规格型号" prop="specModel">
          <el-input v-model.trim="materialForm.specModel" maxlength="100" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="计量单位" prop="unit">
          <el-select v-model="materialForm.unit" filterable clearable placeholder="请选择计量单位" style="width: 100%">
            <el-option v-for="item in dict.type.MeasureUnit" :key="item.value"
              :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="receiptQty">
          <el-input-number v-model="materialForm.receiptQty" :min="0.01" :precision="4"
            :controls="false" placeholder="请输入数量" style="width: 100%" />
        </el-form-item>
        <template v-if="isSteel">
          <el-form-item label="质量证明书" class="attachment-required">
            <file-upload v-model="materialFiles.zlzms" :limit="9999" :fileSize="500"
              :fileType="attachmentFileTypes" :isShowTip="false" />
          </el-form-item>
          <el-form-item label="铭牌" class="attachment-required">
            <file-upload v-model="materialFiles.mp" :limit="9999" :fileSize="500"
              :fileType="attachmentFileTypes" :isShowTip="false" />
          </el-form-item>
        </template>
        <template v-else-if="materialType">
          <el-form-item label="批号" prop="batchNo">
            <el-input v-model.trim="materialForm.batchNo" maxlength="100" placeholder="请输入批号" />
          </el-form-item>
          <el-form-item label="出厂合格证" class="attachment-required">
            <file-upload v-model="materialFiles.cchgz" :limit="9999" :fileSize="500"
              :fileType="attachmentFileTypes" :isShowTip="false" />
          </el-form-item>
          <el-form-item label="出厂检测报告" class="attachment-required">
            <file-upload v-model="materialFiles.ccjcbg" :limit="9999" :fileSize="500"
              :fileType="attachmentFileTypes" :isShowTip="false" />
          </el-form-item>
          <el-form-item label="7天检测报告">
            <file-upload v-model="materialFiles.jcbg7" :limit="9999" :fileSize="500"
              :fileType="attachmentFileTypes" :isShowTip="false" />
          </el-form-item>
          <el-form-item label="28天检测报告">
            <file-upload v-model="materialFiles.jcbg28" :limit="9999" :fileSize="500"
              :fileType="attachmentFileTypes" :isShowTip="false" />
          </el-form-item>
        </template>
        <el-form-item v-if="materialType" label="备注" prop="remark">
          <el-input v-model.trim="materialForm.remark" type="textarea" :rows="3" maxlength="500"
            show-word-limit placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button style="margin-right: 20px;" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMaterial">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import fileUpload from '@/components/upload'

const EMPTY_MATERIAL = {
  materialName: '',
  specModel: '',
  unit: '',
  receiptQty: undefined,
  batchNo: '',
  remark: ''
}

// 附件字段：中文拼音首字母缩写（小写）
const EMPTY_FILES = {
  zlzms: [], // 质量证明书
  mp: [], // 铭牌
  cchgz: [], // 出厂合格证
  ccjcbg: [], // 出厂检测报告
  jcbg7: [], // 7天检测报告
  jcbg28: [] // 28天检测报告
}

export default {
  name: 'StrategicProcurementMaterialList',
  components: { fileUpload },
  dicts: ['MeasureUnit'],
  props: {
    value: {
      type: Array,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    },
    materialType: {
      type: String,
      default: ''
    }
  },
  data() {
    const validateReceiptQty = (rule, value, callback) => {
      if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
        callback(new Error('数量必须大于0'))
        return
      }
      callback()
    }
    return {
      dialogVisible: false,
      editIndex: -1,
      materialForm: { ...EMPTY_MATERIAL },
      materialFiles: this.createEmptyFiles(),
      attachmentFileTypes: ['pdf', 'jpg', 'png', 'jpeg', 'doc', 'docx', 'xls', 'xlsx'],
      rules: {
        materialName: [{ required: true, message: '请输入物资名称', trigger: 'blur' }],
        specModel: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
        unit: [{ required: true, message: '请选择计量单位', trigger: 'change' }],
        receiptQty: [{ required: true, validator: validateReceiptQty, trigger: 'blur' }],
        batchNo: [{ required: true, message: '请输入批号', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isSteel() {
      return this.materialType === '钢材'
    },
    dialogTitle() {
      return this.editIndex === -1 ? '新增物资' : '修改物资'
    }
  },
  methods: {
    openCreate() {
      if (!this.materialType) return this.$message.warning('请先选择物资类型')
      this.editIndex = -1
      this.materialForm = { ...EMPTY_MATERIAL }
      this.materialFiles = this.createEmptyFiles()
      this.dialogVisible = true
    },
    openEdit(row, index) {
      this.editIndex = index
      this.materialForm = { ...row }
      this.materialFiles = this.parseFileList(row.fileList)
      this.dialogVisible = true
    },
    confirmMaterial() {
      this.$refs.materialForm.validate(valid => {
        if (!valid) return
        if (!this.validateFiles()) return
        const list = this.value.map(item => ({ ...item }))
        const material = {
          ...this.materialForm,
          receiptQty: Number(this.materialForm.receiptQty),
          fileList: JSON.stringify(this.materialFiles)
        }
        if (this.editIndex === -1) list.push(material)
        else list.splice(this.editIndex, 1, material)
        this.$emit('input', list)
        this.dialogVisible = false
      })
    },
    removeRow(index) {
      this.$confirm('是否确认删除该物资？', '提示', { type: 'warning' }).then(() => {
        const list = this.value.slice()
        list.splice(index, 1)
        this.$emit('input', list)
      }).catch(() => {})
    },
    resetDialog() {
      this.editIndex = -1
      this.materialForm = { ...EMPTY_MATERIAL }
      this.materialFiles = this.createEmptyFiles()
      this.$nextTick(() => {
        if (this.$refs.materialForm) this.$refs.materialForm.clearValidate()
      })
    },
    createEmptyFiles() {
      return Object.keys(EMPTY_FILES).reduce((result, key) => {
        result[key] = []
        return result
      }, {})
    },
    parseFileList(value) {
      let parsed = value
      if (typeof value === 'string') {
        try { parsed = JSON.parse(value) } catch (error) { parsed = {} }
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) parsed = {}
      return Object.keys(EMPTY_FILES).reduce((result, key) => {
        result[key] = Array.isArray(parsed[key]) ? parsed[key] : []
        return result
      }, {})
    },
    getFiles(row, key) {
      return this.parseFileList(row.fileList)[key]
    },
    validateFiles() {
      const requiredFiles = this.isSteel
        ? [['zlzms', '请上传质量证明书'], ['mp', '请上传铭牌']]
        : [['cchgz', '请上传出厂合格证'], ['ccjcbg', '请上传出厂检测报告']]
      const missing = requiredFiles.find(([key]) => !this.materialFiles[key].length)
      if (!missing) return true
      this.$message.warning(missing[1])
      return false
    },
    validateList() {
      const invalidIndex = this.value.findIndex(item => {
        const files = this.parseFileList(item.fileList)
        if (this.isSteel) return !files.zlzms.length || !files.mp.length
        return !item.batchNo || !files.cchgz.length || !files.ccjcbg.length
      })
      if (invalidIndex === -1) return true
      this.$message.warning(`第${invalidIndex + 1}条物资的必填信息不完整，请修改后保存`)
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.material-list {
  width: 100%;
}

.material-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.material-list__title {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.delete-button {
  color: #f56c6c;
}

::v-deep .attachment-required .el-form-item__label::before {
  margin-right: 4px;
  color: #f56c6c;
  content: '*';
}
</style>
