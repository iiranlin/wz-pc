import request from '@/utils/request'

let VUE_APP_BASE_API = process.env.VUE_APP_BASE_API;
let VUE_APP_BASE_SERVER = process.env.VUE_APP_BASE_SERVER;

// 上传
export const minioUpload = `${VUE_APP_BASE_SERVER}/minio/upload`;
// 上传图片转PDF
export const minioImageToPdf = `${VUE_APP_BASE_SERVER}/minio/imageToPdf`;
// 下载
export const minioDownload = `${VUE_APP_BASE_SERVER}/minio/download`;

/**
 * 获取阿里云OSS STS临时凭证
 * @returns {Promise}
 */
export function getOssStsToken() {
  return request({
    url: `${VUE_APP_BASE_SERVER}/oss/getCredentials`,
    method: 'get'
  })
}