<template>
  <!-- 添加或修改岗位对话框 -->
  <Dialog :title="title" :visible.sync="open" :close-on-click-modal="false" append-to-body >
    <el-form ref="form" :model="form" label-width="100px" v-loading="false">
      <el-row>
        <el-col :span="12">
          <el-form-item :label="searchFieldName['extendVar1']" prop="extendVar1" v-if="isAddField('extendVar1')">
            <el-input v-model="form['extendVar1']" :placeholder="'请输入'+searchFieldName['extendVar1']" maxlength="20"
            :disabled="isDisabledField('extendVar1')"
             />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="searchFieldName['extendVar2']" prop="extendVar2" v-if="isAddField('extendVar2')">
            <el-input v-model="form.extendVar2" :placeholder="'请输入'+searchFieldName['extendVar2']" maxlength="50"
              :disabled="isDisabledField('extendVar2')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="searchFieldName['extendVar3']" prop="extendVar3" v-if="isAddField('extendVar3')">
            <el-input v-model="form.extendVar3" :placeholder="'请输入'+searchFieldName['extendVar3']" maxlength="20"
              :disabled="isDisabledField('extendVar3')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="searchFieldName['extendNum1']" prop="extendNum1" v-if="isAddField('extendNum1')">
            <el-input v-model="form.extendNum1" :placeholder="'请输入'+searchFieldName['extendNum1']" maxlength="50"
              :disabled="isDisabledField('extendNum1')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="searchFieldName['extendNum2']" prop="extendNum2" v-if="isAddField('extendNum2')">
            <el-input v-model="form.extendNum2" :placeholder="'请输入'+searchFieldName['extendNum2']" maxlength="20"
              :disabled="isDisabledField('extendNum2')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="searchFieldName['extendDate1']" prop="extendDate1"  v-if="isAddField('extendDate1')">
            <el-date-picker size="small" v-model="form.extendDate1" style="width:100%" placeholder="选择日期" type="date" format="yyyy-MM-dd" @change="handleDate1">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="searchFieldName['extendDate2']" prop="extendDate2" v-if="isAddField('extendDate2')">
            <el-date-picker v-model="form.extendDate2" size="small" style="width:100%" placeholder="选择日期" type="date" format="yyyy-MM-dd" @change="handleDate2">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="searchFieldName['extendText1']" prop="extendText1" v-if="isAddField('extendText1')">
            <el-input v-model="form.extendText1" :placeholder="'请输入'+searchFieldName['extendText1']" maxlength="20"
              :disabled="isDisabledField('extendText1')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="searchFieldName['extendText2']" prop="extendText2" v-if="isAddField('extendText2')">
            <el-input v-model="form.extendText2" :placeholder="'请输入'+searchFieldName['extendText2']" maxlength="20"
              :disabled="isDisabledField('extendText2')" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </Dialog>
</template>
<script>
import { testListmodify, testListdetail, testListcreate } from '@/api/system/test'
import indexMixin from '@/views/mixins'
export default {
  mixins: [indexMixin],
  props: {
    property: Object,
  },
  data() {
    return {
      open: false,
      title: '',
      // 表单参数
      form: {
        extendVar1:'',
        extendVar2:'',
        extendVar3:'',
        extendNum1:'',
        extendNum2:'',
        extendDate1:'',
        extendDate2:'',
        extendText1:'',
        extendText2:''
      },
      searchFieldName:{},
    }
  },
  methods: {
    handleDate1(val){
      this.form.extendDate1 = this.parseTime(val)
    },
    handleDate2(val){
      this.form.extendDate2 = this.parseTime(val)
    },
    init(type, id) {
      this.open = true
      this.$nextTick(() => {
        this.$refs.form.resetFields();
        if (type == 'update') {
          this.title = '修改测试'
          testListdetail(id).then(response => {
            this.form = response.data
            this.form.extendDate1 = this.parseTime(response.data.extendDate1)
            this.form.extendDate2 = this.parseTime(response.data.extendDate2)
          })
        } else {
          this.title = '添加测试'
        }
      })
      this.property.fields.forEach(item=>{
        this.searchFieldName[item.fieldCode] = item.fieldName
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            testListmodify(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.$emit('menuSuccess')
            })
          } else {
            testListcreate(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.$emit('menuSuccess')
            })
          }
        }
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
    },
  }
}
</script>