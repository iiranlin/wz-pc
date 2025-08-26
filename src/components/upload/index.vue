<template>
  <div class="upload-file" style="width: 100%">
    <el-upload
      v-if="!preview && fileList.length < limit"
      action="#"
      :http-request="customUpload"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      class="upload-file-uploader"
      ref="upload"
      :disabled="isUploading"
    >
      <!-- 上传按钮 -->
      <el-button
        v-if="isShowButton"
        size="mini"
        type="primary"
        :loading="isUploading"
        :disabled="isUploading"
      >
        {{ getUploadButtonText() }}
      </el-button>
      <!-- 上传提示 -->
      <div class="el-upload__tip" slot="tip" v-if="showTip">
        请上传
        <template v-if="fileSize">
          不超过 <b style="color: #f56c6c">{{ fileSize }}MB </b>
        </template>
        <template v-if="fileType">
           <b style="color: #f56c6c"> {{ fileType.join('/') }}</b>
        </template>
        格式文件
      </div>
    </el-upload>

    <!-- 文件列表 -->
    <div
      class="fileList"
      :style="{ width: !preview ? 'calc(100% - 0px)' : '100%' }"
    >
      <div
        :key="index"
        class="el-upload-list__item fileItem"
        v-for="(file, index) in fileList"
      >
        <div class="fileNames">
          <el-tooltip :content="file.fileName" placement="top">
            <fileView ref="fileView" :icon="true" :file="file">
              {{ file.fileName }}
            </fileView>
          </el-tooltip>
        </div>
        <div class="fileAction">
          <i class="el-icon-view file-a-icon" @click="handlePreview(index)"></i>
          <i
            class="el-icon-download file-a-icon"
            @click="handleDownload(index)"
          ></i>
          <i
            v-if="!preview"
            class="el-icon-delete file-a-icon"
            @click="handleDelete(index)"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 实际使用单附件上传
import { minioUpload, minioImageToPdf, getOssStsToken } from '@/api/minio'
import OSS from "ali-oss";
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
    fileSize:{
      type: Number,
      default: 500
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    },
   // 🔹 新增阿里云参数
    useOss: { type: Boolean, default: false },
    isImgToPdf:{
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      fileList: [],
      formData: {
        businessType: '',
        key: ''
      },
      // 上传状态
      isUploading: false,
      // 上传进度
      uploadProgress: 0,
      // OSS客户端实例
      ossClient: null,
      // STS临时凭证缓存
      stsCredentials: null,
      // STS凭证过期时间
      stsExpiration: null,
      // OSS配置
      ossConfig: {
        bucket: "yc-mat",
        region: 'cn-beijing',
        secure: true,
        endpoint: 'https://oss-cn-beijing.aliyuncs.com'
      }
    };
  },
  watch: {
    value: {
      handler (val) {
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
    showTip () {
      return this.isShowTip && this.fileList.length === 0 && (this.fileType || this.fileSize);
    }
  },
  methods: {
    handlePreview (index) {
      this.$refs[`fileView`][index].handlePreview()
    },
    handleDownload (index) {
      const file = this.fileList[index];
      if (!file || !file.filePath) {
        this.$message.warning('文件路径不存在');
        return;
      }

      // 判断是否为OSS文件
      if (file.uploadType === 'oss' || (file.filePath && file.filePath.includes('oss-cn-'))) {
        // OSS文件：使用多种方式确保立即下载
        this.downloadOssFileImmediate(file.filePath, file.fileName);
      } else {
        // MinIO文件：使用fileView组件的下载方法
        this.$refs[`fileView`][index].handleDownload();
      }
    },

    /**
     * OSS文件立即下载
     * @param {string} url - 文件URL
     * @param {string} fileName - 文件名
     */
    downloadOssFileImmediate(url, fileName) {
      // 方案1: 直接使用window.location.href进行跳转下载
      // 这是最直接的方法，浏览器会立即开始处理
      try {
        // 先尝试在新窗口打开
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.location.href = url;
          this.$message.success('已开始下载文件');
        } else {
          // 如果弹窗被阻止，直接跳转
          window.location.href = url;
        }
      } catch (error) {
        // 如果上述方法失败，使用最简单的方法
        window.location.href = url;
      }
    },

    /**
     * 获取或刷新STS临时凭证
     * @returns {Promise<Object>} STS凭证对象
     */
    async getStsCredentials() {
      try {
        // 从后端API获取STS凭证
        const response = await getOssStsToken();
        if (!response.success) {
          throw new Error(response.message || '获取STS凭证失败');
        }
        const credentials = JSON.parse( response.data);

        // 缓存凭证和过期时间（STS凭证通常有效期为1小时）
        this.stsCredentials = credentials
        return this.stsCredentials;
      } catch (error) {
        console.error('获取STS凭证失败:', error);
        throw new Error('获取OSS上传凭证失败，请重试');
      }
    },

    /**
     * 创建或更新OSS客户端
     * @returns {Promise<OSS>} OSS客户端实例
     */
    async getOssClient() {
      try {
        const credentials = await this.getStsCredentials();
        console.log(credentials,'credentials');

        // 创建新的OSS客户端实例
        this.ossClient = new OSS({
          ...this.ossConfig,
          accessKeyId: credentials.accessKeyId,
          accessKeySecret: credentials.secretAccessKey,
          stsToken: credentials.securityToken
        });

        return this.ossClient;
      } catch (error) {
        console.error('创建OSS客户端失败:', error);
        throw error;
      }
    },
    /**
     * 自定义上传方法
     * @param {Object} option - 上传选项
     */
     async customUpload(option) {
      if (!option.file) return;
      if (this.isUploading) {
        this.$message.warning("正在上传中，请稍候...");
        return;
      }
      this.isUploading = true;
      this.uploadProgress = 0; // 重置进度

      try {
        if (this.useOss) {
          // 🔹 走 OSS STS 上传逻辑
          const ossClient = await this.getOssClient();
          // 生成OSS Key
          const ossKey = `${this.businessType}/${Date.now()}_${option.file.name}`;

          // 使用分片上传，支持大文件和断点续传
          await ossClient.multipartUpload(ossKey, option.file, {
            progress: (p) => {
              // 更新上传进度
              this.uploadProgress = Math.floor(p * 100);
            },
            partSize: 1024 * 1024, // 1MB分片大小
            parallel: 4, // 并发上传数
            meta: {
              businessType: this.businessType,
              uploadTime: new Date().toISOString()
            }
          });

          // 构造与MinIO兼容的数据结构
          // 手动拼接OSS文件URL地址（OSS上传成功后不返回完整URL，需要手动拼接）
          const ossFileUrl = `https://${this.ossConfig.bucket}.${this.ossConfig.endpoint.replace('https://', '')}/${ossKey}`;

          this.handleUploadSuccess(
            {
              success: true,
              data: {
                fileName: option.file.name,
                filePath: ossFileUrl, // 使用工具函数拼接的OSS URL，保持与MinIO数据结构一致
                ossKey: ossKey,
                uploadType: 'oss' // 标识上传类型，便于后续区分处理
              },
            },
            option.file
          );
        } else {
          // 🔹 走 MinIO 上传逻辑
          const ext = option.file.name.split(".").pop().toLowerCase();
          const isImage = ["png", "jpg", "jpeg", "gif"].includes(ext);

          const url = isImage ? minioImageToPdf : minioUpload;

          // 使用await等待MinIO上传完成，确保loading状态正确
          try {
            const data = await this.$download.fileUpload(url, { ...this.formData, file: option.file });
            this.handleUploadSuccess(data, option.file);
          } catch (err) {
            this.handleUploadError(err, option.file);
          }
        }
      } catch (err) {
        console.error('文件上传失败:', err);
        this.handleUploadError(err, option.file);
      } finally {
        this.isUploading = false;
        this.uploadProgress = 0; // 重置进度
      }
    },
    // 上传前校检格式和大小
    handleBeforeUpload (file) {
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
    handleExceed (files, fileList) {
      this.$message.error(`上传文件数量不能超过 ${this.limit} 个!`);
    },
    // 上传失败
    handleUploadError (err, file, fileList) {
      this.$message.error("上传失败, 请重试");
          // 确保失败的文件被完全清理
      this.$nextTick(() => {
        const uploadFiles = this.$refs.upload.uploadFiles;
        const failedFileIndex = uploadFiles.findIndex(uploadFile => uploadFile.uid === file.uid);
        if (failedFileIndex > -1) {
          uploadFiles.splice(failedFileIndex, 1);
        }
      });
    },
    // 上传成功回调
    handleUploadSuccess (res, file) {
      if (res.success) {
        this.$message.success("上传成功");
        this.fileList.push({...res.data, fileName: res.data.fileName, filePath: res.data.filePath });
        this.$emit("input", this.fileList);
      } else {
        this.$message.error(res.message);
      }

    },
    // 删除文件
    handleDelete (index) {
      this.fileList.splice(index, 1);
      this.$emit("input", this.fileList);
    },

    // 获取上传按钮文本
    getUploadButtonText() {
      if (!this.isUploading) {
        return '选取文件';
      }

      if (this.useOss && this.uploadProgress > 0) {
        return `上传中 ${this.uploadProgress}%`;
      }

      return '上传中';
    },
  }
};
</script>

<style scoped lang="scss">
.upload-file {
  display: flex;
  flex-direction: column; // ← 从 row 改为 column
  align-items: flex-start; // ← 防止居中
  width: 100%;
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
    height: 36px;
    .fileNames {
      max-width: calc(100% - 90px);
      display: inline-block;
    }

    .fileAction {
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