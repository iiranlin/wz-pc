<template>
  <div class="upload-file" style="width: 100%;">
    <el-upload v-if="!preview" action="#" :http-request="customUpload" :before-upload="handleBeforeUpload" :file-list="fileList"
      :limit="limit" :on-error="handleUploadError" :on-exceed="handleExceed"
      :on-success="handleUploadSuccess" :show-file-list="false" class="upload-file-uploader"
      ref="upload">
      <!-- 上传按钮 -->
      <el-button v-if="isShowButton" size="mini" type="primary">选取文件</el-button>
      <!-- 上传提示 -->
      <div class="el-upload__tip" slot="tip" v-if="showTip">
        请上传
        <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
        <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
        的文件
      </div>
    </el-upload>

    <!-- 文件列表 -->
    <div class="fileList" :style="{width: !preview ? 'calc(100% - 100px)': '100%'}">
      <div :key="index" class="el-upload-list__item fileItem" v-for="(file, index) in fileList">
        <div class="fileNames">
          <el-tooltip :content="file.fileName" placement="top">
            <fileView ref="fileView" :icon="true" :file="file">
              {{ file.fileName }}
            </fileView>
          </el-tooltip>
        </div>
        <div class="fileAction" >
          <i class="el-icon-view file-a-icon" @click="handlePreview(index)"></i>
          <i class="el-icon-download file-a-icon" @click="handleDownload(index)"></i>
          <i v-if="!preview" class="el-icon-delete file-a-icon" @click="handleDelete(index)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
import { minioUpload } from '@/api/minio'

export default {
  name: "FileUpload",
  components: {
    fileView: () => import('@/components/fileView')
  },
  props: {
    isShowButton: {
      type: Boolean,
      default: true
    },
    businessType: {
      type: String,
      default: '01'
    },
    preview: {
      type: Boolean,
      default: false
    },
    // 值
    value: [String, Object, Array],
    // 数量限制
    limit: {
      type: Number,
      default: 5,
    },
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ["docx", "xls", "pptx", "xlsx", "pdf", "png", "jpg", "jpeg", "gif", 'GIF'],
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      fileSize: process.env.VUE_APP_FILE_SIZE,
      baseUrl: process.env.VUE_APP_BASE_API,
      fileList: [],
      formData: {
        businessType: '',
        key: ''
      },
    };
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          let temp = 1;
          // 首先将值转为数组
          const list = Array.isArray(val) ? val.filter(v => !!v.fileName) : [];
          // 然后将数组转为对象数组
          this.fileList = list.map(item => {
            item = { ...item, uid: item.uid || new Date().getTime() + temp++ };
            return item;
          });
        } else {
          this.fileList = [];
          return [];
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    // 是否显示提示
    showTip() {
      return this.isShowTip && (this.fileType || this.fileSize);
    },
  },
  methods: {
    handlePreview(index) {
      this.$refs[`fileView`][index].handlePreview()
    },
    handleDownload(index) {
      this.$refs[`fileView`][index].handleDownload()
    },
    customUpload (option) {
      if(option.file){
        this.$download.fileUpload(minioUpload, {...this.formData,minioType:this.formData.businessType, file: option.file}).then((data) => {
          this.handleUploadSuccess(data)
        })
      }
    },
    // 上传前校检格式和大小
    handleBeforeUpload(file) {
      // 校检文件类型
      if (this.fileType) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        this.formData.businessType = this.businessType
        this.formData.key = file.name
        const isTypeOk = this.fileType.some((type) => {
          if (file.type.indexOf(type) > -1) return true;
          if (fileExtension && fileExtension.indexOf(type) > -1) return true;
          return false;
        });
        if (!isTypeOk) {
          this.$message.error(`文件格式不正确, 请上传${this.fileType.join("/")}格式文件!`);
          return false;
        }
      }
      // 校检文件大小
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$message.error(`上传文件大小不能超过 ${this.fileSize} MB!`);
          return false;
        }
      }
      return true;
    },
    // 文件个数超出
    handleExceed() {
      this.$message.error(`上传文件数量不能超过 ${this.limit} 个!`);
    },
    // 上传失败
    handleUploadError(err) {
      this.$message.error("上传失败, 请重试");
    },
    // 上传成功回调
    handleUploadSuccess(res, file) {
      if (res.success) {
        this.$message.success("上传成功");
        this.fileList.push({ fileName: res.data.fileName, filePath: res.data.filePath });
        this.$emit("input", this.fileList);
      } else {
        this.$message.error(res.message);
      }

    },
    // 删除文件
    handleDelete(index) {
      this.fileList.splice(index, 1);
      this.$emit("input", this.fileList);
    },
  }
};
</script>

<style scoped lang="scss">
.upload-file {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
}
.upload-file-uploader {
  margin-bottom: 5px;
}
.el-upload-list__item {
  width: auto;
  margin-top: 0;
}
.el-upload-list__item:first-child {
  margin-top: 0;
}
.fileList {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: calc(100% - 100px);
  .fileItem {
      display: inline-flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
    .fileNames {
      max-width: calc(100% - 90px);
      display: inline-block;
    }

    .fileAction {
      width: 90px;
      font-size: 16px;
      padding: 0 7px;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      display: inline-flex;
      .file-a-icon {
        padding: 3px 4px;
      }
      i:hover {
        cursor: pointer;
        color: #1890ff;
      }
      i {
        color: #1890ff;
        line-height: 20px;
      }
    }
    
  }

}
</style>