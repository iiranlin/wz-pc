let VUE_APP_BASE_API = process.env.VUE_APP_BASE_API;
let VUE_APP_BASE_SERVER = process.env.VUE_APP_BASE_SERVER;

// 上传
export const minioUpload = `${VUE_APP_BASE_SERVER}/minio/upload`;
// 下载
export const minioDownload = `${VUE_APP_BASE_SERVER}/minio/download`;