<template>
  <div class="app-container container_flex">
    <button-top :buttonTopData="property.buttonTop" :multiple="multiple" :single="single" @newButton="newButton"></button-top>
    <form-data
      :showSearch="showSearch"
      :searchArr="property.search || []"
      @handleQuery="handleQuery"
    />
    <right-toolbar
      ref="rightToolbar"
      :formData="formData"
      :searchArr="property.search || []"
      :showSearch.sync="showSearch"
      :columns="property.fields"
      @queryTable="handleQuery"
      @handleCheckAllChange="handleCheckAllChange"
      @clickReset="clickReset"
      @numberChange="numberChange"
    ></right-toolbar>
    <table-index
      ref="tableIndex"
      :loading="loading"
      :tableData="dataList"
      :property="property"
      :numberShow="numberShow"
      @handleSelectionChange="handleSelectionChange"
      @handleButton="handleButton"
      @selectChange="selectChange"
      @emitAblFilter="emitAblFilter"
    >
    </table-index>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />

    <Dialog :title="isNew ? '新增业务类型' : '修改业务类型'" :visible.sync="visible" width="1300px" append-to-body :close-on-click-modal="false" >
      <el-form ref="businessType" :model="businessType" :rules="rules" label-suffix="：" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="编号" prop="code">
              <el-input class="border-radius50" v-model="businessType.code" maxlength="50" clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input class="border-radius50" v-model="businessType.name" maxlength="50" clearable/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="类路径" prop="classPath">
              <el-input class="border-radius50" v-model="businessType.classPath" maxlength="200" clearable @change="getFields"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="条件字段" prop="fields">
              <el-select clearable v-model="businessType.fields" multiple style="width:100%" :loading="fieldsLoading" @change="fieldChange">
                <el-option v-for="item in fields" :key="item.fieldName" :value="item.fieldName" :label="`${item.fieldName} ( ${item.fieldTitle} )`"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table border :data="tableData" height="45vh">
        <el-table-column label="序号" align="left" width="50" type="index">
        </el-table-column>
        <el-table-column label="字段名称" prop="fieldName" align="left">
        </el-table-column>
        <el-table-column label="字段标题" prop="fieldTitle" align="left">
          <template v-slot="{row}">
            <el-input maxlength="200" v-model="row.fieldTitle" placeholder=""/>
          </template>
        </el-table-column>
        <el-table-column label="是否单据编号" prop="isBillCode" align="left">
          <template v-slot="{row}">
            <el-checkbox v-model="row.isBillCode" :true-label="1" :false-label="0"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="是否字典" prop="isDict" align="left">
          <template v-slot="{row}">
            <el-checkbox v-model="row.isDict" :true-label="1" :false-label="0"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="字典" align="left">
          <template v-slot="scope">
            <treeselect :appendToBody="true" z-index="9999" @select="selectDict($event,scope.$index)" :disabled="scope.row.isDict !== 1"
                        :value="scope.row.dictId" :options="commonTreeList" :normalizer="normalizer" placeholder="请选择字典"
            />
          </template>
        </el-table-column>
        <el-table-column label="数据类型" prop="dataType" align="left">
          <template v-slot="{row}">
            <el-radio v-model="row.dataType" label="text">文本</el-radio>
            <el-radio v-model="row.dataType" label="number">数字</el-radio>
          </template>
        </el-table-column>
      </el-table>
      <template v-slot:footer class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="btnLoading">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script>
import { deleteBusinessType, getBusinessTypeByPage, getBusinessTypeDetail, getClassFieldsByPath, saveBusinessType } from '@/api/workflow/businessType'
import mixins from '@/views/mixins'
import { commonTree } from '@/api/system/dict'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: 'role',
  mixins: [mixins],
  components: {Treeselect},
  data() {
    return {
      isNew: true,
      btnLoading: false,
      //是否展示序号
      numberShow: false,
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 表格数据
      dataList: [],
      // 弹出层标题
      title: '',
      //列表显示字段
      property: {},
      // 查询参数
      formData: {},
      total: 0,
      metaId: this.$route.meta.id,
      // 勾选的数据
      selected: [],
      currentRow: {},
      visible: false,
      businessType: {
        id: '',
        code: '',
        name: '',
        classPath: '',
        fields: []
      },
      // 表单校验
      rules: {
        code: [
          { required: true, message: '请输入编号', trigger: 'blur' },
          { message: '只能包含数字和字母下划线, 必须以字母或下划线开头', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, trigger: 'blur' }
        ],
        name: { required: true, message: '请输入名称', trigger: 'blur' },
        classPath: { required: true, message: '请输入类路径', trigger: 'blur' },
        fields: { required: true, message: '请选择条件字段', trigger: 'blur' }
      },
      fields: [],
      fieldsLoading: false,
      tableData: [],
      commonTreeList: []
    }
  },
  computed: {
    tableDataCopy() {
      return JSON.parse(JSON.stringify(this.tableData))
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$refs.businessType.resetFields()
        this.businessType = {
          id: '',
          code: '',
          name: '',
          classPath: '',
          fields: []
        }
        this.fields = []
        this.tableData = []
      }
    },
    tableDataCopy: {
      handler: function(val, oldVal) {
        if (val.length === oldVal.length) {
          const oldField = oldVal.filter(item => item.isBillCode === 1)
          const newField = val.filter(item => item.isBillCode === 1)
          if (oldField.length === 1 && newField.length > 1) {
            const result = newField.filter(item => item.fieldName !== oldField[0].fieldName)
            val.forEach(item => {
              if (item.fieldName === result[0].fieldName) {
                item.isBillCode = 1
              } else {
                item.isBillCode = 0
              }
            })
            this.tableData = val
          }
        }
      },
      deep: true
    }
  },
  created() {
    this.menuProperty()
    this.commonTree()
  },
  methods: {
    // 弹窗中字段选择变更
    fieldChange(val) {
      let list = this.fields.filter(item => val.indexOf(item.fieldName) !== -1)
      list.forEach(item => {
        const flag = this.tableData.some(data => data.fieldName === item.fieldName)
        if (!flag) {
          if (item.dictId === '') {
            item.dictId = null
          }
          this.tableData.push({ ...item })
        }
      })
      this.tableData.forEach((item, index) => {
        const flag = list.some(data => data.fieldName === item.fieldName)
        if (!flag) {
          this.tableData.splice(index, 1)
        }
      })
    },
    /** 转换字段数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    },
    commonTree() {
      commonTree().then(({ data }) => {
        this.commonTreeList = data
      })
    },
    selectDict(row, index) {
      this.tableData[index].dictId = row.id
    },
    // 监听类路径变更获取字段
    getFields(classPath) {
      if (classPath) {
        this.fieldsLoading = true
        getClassFieldsByPath({ classPath }).then(({ data }) => {
          this.fields = data
        }).finally(() => this.fieldsLoading = false)
      }
    },
    menuProperty() {
      let id = this.$route.meta.id
      this.$store.dispatch('menuProperty', id).then((data) => {
        
        this.property = data
      })
    },
    numberChange(val) {
      this.numberShow = val
    },
    newButton(buttonCode, formId, buttonData) {
      this.$refs.tableIndex.newButton(buttonCode, {}, formId, buttonData)
    },
    handleCheckAllChange(columns) {
      this.$refs.tableIndex.init(columns)
    },
    //选择框回调
    selectChange(row) {
      let { formData, isWatch } = row
      if (!isWatch) {
        this.handleQuery(formData)
      } else {
        this.formData = Object.assign({}, this.formData, formData)
      }
    },
    emitAblFilter(listQuery) {
      this.listQuery = Object.assign({}, this.listQuery, listQuery)
      this.handleQuery()
    },
    /** 搜索按钮操作 */
    handleQuery(row = {}) {
      this.listQuery.pageNum = 1
      this.formData = Object.assign({}, this.formData, row)
      this.getList()
    },
    handleSelectionChange(ids, single, multiple, selected) {
      this.ids = ids
      this.single = single
      this.multiple = multiple
      this.selected = selected
    },
    handleButton(buttonCode, idArr, rowArr, { buttonData }) {
      this.proxyPrint(buttonCode, rowArr, buttonData)
      switch (buttonCode) {
        case 'create':
          this.handleAdd()
          break
        case 'update':
          this.handleUpdate(idArr[0])
          break
        case 'delete':
          this.handleDelete(idArr)
          break
      }
    },
    // 提交业务类型
    submitForm() {
      this.$refs.businessType.validate((valid) => {
        if (valid) {
          // 检验条件字段表格
          for (let i = 0; i < this.tableData.length; i++) {
            const item = this.tableData[i]
            if (item.fieldTitle === '') {
              return this.$modal.msgError(`请在第${i + 1}行输入字段标题`)
            } else if (item.isDict === 1 && item.dictId == null) {
              return this.$modal.msgError(`请在第${i + 1}行选择字典`)
            }
          }
          this.btnLoading = true
          let obj = { ...this.businessType }
          obj.fields = this.tableData
          saveBusinessType(obj).then(({ success, message }) => {
            if (success) {
              this.visible = false
              this.getList()
            } else {
              this.$modal.msgError(message)
            }
          }).finally(() => {
            this.btnLoading = false
          })
        }
      })
    },
    clickReset() {
      this.menuProperty()
      this.handleQuery()
    },
    handleAdd() {
      this.isNew = true
      this.visible = true
    },
    // 删除
    async handleDelete(ids) {
      let loading = null
      try {
        await this.$modal.confirm('确定删除所选项吗?')
        loading = this.$loading({ lock: true, text: '加载中...' })
        deleteBusinessType({ ids }).then(({ success, message }) => {
          if (success) {
            this.handleQuery()
          } else {
            this.$modal.msgError(message)
          }
        })
      } finally {
        loading?.close()
      }
    },
    /** 修改按钮操作 */
    handleUpdate(id) {
      getBusinessTypeDetail(id).then(({ data }) => {
        Object.keys(this.businessType).forEach(key => {
          if (key === 'fields') {
            this.businessType.fields = data.fields.map(item => item.fieldName)
          } else {
            this.businessType[key] = data[key]
          }
        })
        this.getFields(data.classPath)
        data.fields.forEach(item => {
          if (item.dictId === '') {
            item.dictId = null
          }
        })
        this.tableData = [...data.fields]
        this.isNew = false
        this.visible = true
      })
    },
    // 获取流程列表数据
    getList() {
      getBusinessTypeByPage({
        ...this.listQuery,
        ...this.formData
      }).then(({ success, data }) => {
        if (success && Array.isArray(data.list)) {
          let { list, total } = data
          this.dataList = list
          this.total = total
        } else {
          this.dataList = []
          this.total = 0
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table-wrapper {

  ::v-deep .el-table {
    margin: 0;
  }
}
</style>
