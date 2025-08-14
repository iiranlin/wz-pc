let VUE_APP_BASE_API = process.env.VUE_APP_BASE_API;
let VUE_APP_BASE_SERVER = process.env.VUE_APP_BASE_SERVER;

// 上传
export const minioUpload = `${VUE_APP_BASE_SERVER}/minio/upload`;
// 上传图片转PDF
export const minioImageToPdf = `${VUE_APP_BASE_SERVER}/minio/imageToPdf`;
// 下载
export const minioDownload = `${VUE_APP_BASE_SERVER}/minio/download`;