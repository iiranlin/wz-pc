<template>
  <div>
    <el-form ref="baseInfo" :model="baseInfo" :rules="baseInfoRule" label-width="90px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="表名称">
            <el-input v-model="baseInfo.tableName" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="表描述" prop="tableComment">
            <el-input v-model="baseInfo.tableComment" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类名称" prop="className">
            <el-input v-model="baseInfo.className" placeholder="请输入类名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模块名称" prop="moduleName">
            <el-input v-model="baseInfo.moduleName" placeholder="请输入模块名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务名称" prop="businessName">
            <el-input v-model="baseInfo.businessName" placeholder="请输入业务名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="功能名称" prop="functionName">
            <el-input v-model="baseInfo.functionName" placeholder="请输入功能名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="作者" prop="functionAuthor">
            <el-input v-model="baseInfo.functionAuthor" placeholder="请输入作者"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="包路径" prop="packageName">
            <el-input v-model="baseInfo.packageName" placeholder="请输入包路径"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form ref="onlFormInfo" :model="onlFormInfo" label-width="90px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="表单编号" prop="formCode">
            <el-input v-model="onlFormInfo.formCode" placeholder="请输入表单编号" :disabled="onlFormInfo.id && onlFormInfo.id.length > 0"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="表单名称" prop="formName">
            <el-input v-model="onlFormInfo.formName" placeholder="请输入表单名称"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { checkOnlFormCode } from '@/api/tool/gen'

export default {
  props: {
    baseInfo: Object,
    onlFormInfo: Object
  },
  data() {
    return {
      //基础信息校验
      baseInfoRule: {
        className: [
          { required: true, message: '类名称不能为空', trigger: 'blur' },
          { pattern: /^[a-zA-Z][\w]*$/, message: '类名称不符合规则', trigger: 'blur' }
        ],
        packageName: [
          { required: true, message: '包路径不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    validForm() {
      return new Promise((resolve, reject) => {
        this.$refs.baseInfo.validate(valid => {
          if (valid && this.onlFormInfo.formCode) {
            //验证表单编号是否已存在
            checkOnlFormCode(this.onlFormInfo).then(({ success }) => {
              if (!success) {
                this.$modal.msgError('表单编号已存在')
                resolve(false)
              }
            })
          }
          resolve(true)
        })
      })
    }
  }
}
</script>
