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
    width="850px"
  >
    <div style="display: flex; gap: 20px">
      <el-upload
        class="upload-demo"
        drag
        action=""
        :http-request="handleUpload"
        :before-upload="beforeUpload"
        :show-file-list="false"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div
        class="el-upload__tip"
        style="display: flex; align-items: center"
        slot="tip"
      >
        <div>
          1、每次上传一个excel格式文件，不超过100MB。<br />
          2、请严格按模板格式上传。 <br />
          3、<a style="color: #409eff; cursor: pointer" href="/">模板下载</a>
        </div>
      </div>
    </div>

    <el-table :data="fileList" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="fileName" label="文件名" />
      <el-table-column prop="number" label="物资条数" />
      <el-table-column prop="totalAmount" label="到站合作总金额" />
      <el-table-column prop="fileSize" label="文件大小" />
      <el-table-column prop="status" label="状态" />
    </el-table>

    <el-alert
      v-if="fileList.length > 0 && fileList[0].reason"
      title="提示"
      type="warning"
      style="margin-top: 16px"
      :closable="false"
    >
      <template>
        <ol>
          <li :key="idx" v-for="(item, idx) of fileList[0].reason">
            {{ `  ${item}` }}
          </li>
        </ol>
      </template>
    </el-alert>

    <div slot="footer" class="dialog-footer">
      <el-button round @click="visible = false">取消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { batchImport } from '@/api/prodmgr-inv/project/contractItem.js'

export default {
  name: "batchDialog",
  data () {
    return {
      loading: false,
      title: '批量导入',
      visible: false,
      tableData: [],
      fileList: [],

    }
  },
  methods: {
    open () {
      this.visible = true;


    },
    //取消
    handleCancel () {
      this.visible = false;
    },
    beforeUpload (file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      const isLt100M = file.size / 1024 / 1024 < 100
      if (!isExcel) {
        this.$message.error('只能上传 Excel 文件')
      }
      if (!isLt100M) {
        this.$message.error('文件大小不能超过 100MB')
      }
      return isExcel && isLt100M
    },
    handleUpload ({ file }) {
      const projectId = this.$store.state.project.projectId || this.$route.query.projectId
      if (!projectId) {
        this.$message.warning('请先选择归属线路项目')
        return
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId ', projectId);

      batchImport(formData).then(res => {
        this.fileList = [res.data]
      })

    }
  }
}
</script>

<style lang="scss" scoped>
.el-upload__text em {
  color: #409eff;
  cursor: pointer;
}
.slotIcon-color-content {
  color: red;
}

.slotIcon-color {
  color: #1890ff;
}

.ml-20 {
  margin-left: 20px !important;
}

.mt-20 {
  margin-top: 20px !important;
}
</style>