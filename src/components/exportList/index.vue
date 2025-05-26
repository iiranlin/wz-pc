<template>
  <div class='work-flow-view'>
    <Dialog title="导出"  :visible.sync="dialogVisible" destroy-on-close :close-on-click-modal="false" append-to-body width="600px"
                 >
      <div class="work-flow-view-content">
        <p style="color: #ff5454;font-size: 18px;font-weight: 700">提示：单次导出条数最大为10000条</p>
        <el-tabs v-model="formData.exportType" type="border-card">
          <el-tab-pane label="当前页" name="0"></el-tab-pane>
          <el-tab-pane label="所有" name="1"></el-tab-pane>
          <el-tab-pane label="指定范围页" name="2">
            <div>
            <el-form :model="formData" :rules="rules" ref="formData" :inline="true">
              <el-form-item label="" prop="startPageNum"  class="form-input">
                <el-input v-model="formData.startPageNum" v-number-input placeholder="请输入开始页数" width="100%"></el-input>
              </el-form-item>
            <span style="line-height: 36px">—— </span>  <el-form-item label="" prop="endPageNum"  class="form-input">
              <el-input v-model="formData.endPageNum" v-number-input placeholder="请输入结束页数"
                        width="100%"
              />
            </el-form-item>
            </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div slot="footer" class="dialog-button">
        <el-button type="primary" @click="exportList">导出</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </div>
    </Dialog>
  </div>
</template>

<script>

export default {
  name: 'exportList',
  props:{
    maxNum:{
      required:true,
      default:1
    }
  },
  data() {
    return {
      dialogVisible: false,

      activeName: '0',
      formData:{
        startPageNum:null,
        endPageNum:null,
        exportType:'0'
      },
      rules:{
        startPageNum: [
          {required: true, message: "请输入开始页数", trigger: "blur"},
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              const maxNum = this.maxNum
              const endPageNum = this.formData.endPageNum
              if (Number(value) > maxNum) {
                callback(new Error('开始页数不能超过最大页码数'));
              } else if (Number(value) <= 0) {
                callback(new Error('开始页数必须大于0'));
              }else if (endPageNum && Number(value) > Number(endPageNum)) {
                callback(new Error('开始页数必须小于等于结束页数'));
              }else {
                callback();
              }
            }
          },

        ],
        endPageNum: [
          {required: true, message: "请输入结束页数", trigger: "blur"},
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              const maxNum = this.maxNum
              const startPageNum = this.formData.startPageNum

              if (Number(value) > maxNum) {
                callback(new Error('结束页数不能超过最大页码数'));
              } else if (Number(value) <= 0) {
                callback(new Error('结束页数必须大于0'));
              }else if (startPageNum && Number(value) < Number(startPageNum)) {
                callback(new Error('开始页数必须小于等于结束页数'));
              }else {
                callback();
              }
            }
          },

        ]
      }
    };
  },

  methods: {
    init(){
      this.dialogVisible = true;
      this.formData.startPageNum = null
      this.formData.endPageNum = null
      this.formData.exportType = '0'
    },
    // 关闭弹窗
    closeDialog() {
      this.dialogVisible = false;
    },
    // 更新父组件的值
    exportList() {
      if(this.formData.exportType=='3'){
        this.$refs.formData.validate((valid) => {
          if (valid) {
            this.dialogVisible = false;
            this.$emit('exportList',this.formData);
          } else {
            return false;
          }
        });
      }else{
        this.dialogVisible = false;
        this.$emit('exportList',this.formData);
      }

    },

  },
};
</script>

<style scoped lang="scss">
.work-flow-view-content {
  overflow-y: auto;
}
::v-deep {
  .el-dialog__body {
    padding-top: 0px;
  }
  .el-input{
    width: 100%;
  }
}
</style>
