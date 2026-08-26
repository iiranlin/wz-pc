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
      <el-table-column v-if="!readonly" label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button type="text" @click="openEdit(scope.row, scope.$index)">修改</el-button>
          <el-button type="text" class="delete-button" @click="removeRow(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px"
      append-to-body :close-on-click-modal="false" @closed="resetDialog">
      <el-form ref="materialForm" :model="materialForm" :rules="rules" label-width="100px">
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
      </el-form>
      <template #footer>
        <el-button style="margin-right: 20px;" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMaterial">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
const EMPTY_MATERIAL = {
  materialName: '',
  specModel: '',
  unit: '',
  receiptQty: undefined
}

export default {
  name: 'StrategicProcurementMaterialList',
  dicts: ['MeasureUnit'],
  props: {
    value: {
      type: Array,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
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
      rules: {
        materialName: [{ required: true, message: '请输入物资名称', trigger: 'blur' }],
        specModel: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
        unit: [{ required: true, message: '请选择计量单位', trigger: 'change' }],
        receiptQty: [{ required: true, validator: validateReceiptQty, trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.editIndex === -1 ? '新增物资' : '修改物资'
    }
  },
  methods: {
    openCreate() {
      this.editIndex = -1
      this.materialForm = { ...EMPTY_MATERIAL }
      this.dialogVisible = true
    },
    openEdit(row, index) {
      this.editIndex = index
      this.materialForm = { ...row }
      this.dialogVisible = true
    },
    confirmMaterial() {
      this.$refs.materialForm.validate(valid => {
        if (!valid) return
        const list = this.value.map(item => ({ ...item }))
        const material = { ...this.materialForm, receiptQty: Number(this.materialForm.receiptQty) }
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
      this.$nextTick(() => {
        if (this.$refs.materialForm) this.$refs.materialForm.clearValidate()
      })
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
</style>
