<template>
  <Dialog title="系统帮助" :visible.sync="dialogVisible" width="50%">
    <el-descriptions :column="1" :colon="false">
      <el-descriptions-item :label="item.fileName" v-for="(item, index) in helpListData" :key="index"
        label-class-name="docName">
        <el-button type="text" @click="minioDownload(item)">
          <span class="docNameLabel">下载</span>
        </el-button>
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script>
import { minioDownload } from '@/api/minio'
export default {
  data() {
    return {
      dialogVisible: false,
      helpListData: [{
        filePath: 'templates/生产制造标准产品操作说明书v1.0.docx',
        fileName: '生产制造标准产品操作说明书v1.0.docx'
      }],
    }
  },
  methods: {
    init () {
      this.dialogVisible = true
    },
    minioDownload(row) {
      this.$download.fileUrl(`${minioDownload}?filePath=${encodeURI(row.filePath)}&fileName=${encodeURI(row.fileName)}`, null, 'get');
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep .docNameLabel {
  font-weight: 600;
  border-bottom: 1px solid;
}

::v-deep .docName {
  display: inline-block;
  width: 335px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

::v-deep .el-descriptions-item__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

::v-deep .el-dialog__body {
  max-height: 350px;
  overflow: auto;
  padding-left: 30px;
  padding-right: 40px;
}
</style>