/**
 * OSS URL 工具函数
 * 用于处理OSS文件URL的拼接和验证
 */

/**
 * 拼接OSS文件访问URL
 * @param {string} bucket - OSS存储桶名称
 * @param {string} endpoint - OSS访问端点
 * @param {string} ossKey - OSS文件Key
 * @returns {string} 完整的OSS文件访问URL
 */
export function buildOssFileUrl(bucket, endpoint, ossKey) {
  // 移除endpoint中的https://前缀（如果存在）
  const cleanEndpoint = endpoint.replace('https://', '').replace('http://', '');
  
  // 拼接完整的OSS URL
  return `https://${bucket}.${cleanEndpoint}/${ossKey}`;
}

/**
 * 验证OSS URL格式是否正确
 * @param {string} url - 要验证的URL
 * @param {string} bucket - 预期的存储桶名称
 * @param {string} region - 预期的区域
 * @returns {boolean} 验证结果
 */
export function validateOssUrl(url, bucket = 'yc-mat', region = 'cn-beijing') {
  const expectedPattern = new RegExp(`^https://${bucket}\\.oss-${region}\\.aliyuncs\\.com/.+`);
  return expectedPattern.test(url);
}

/**
 * 从OSS URL中提取OSS Key
 * @param {string} url - OSS文件URL
 * @param {string} bucket - 存储桶名称
 * @param {string} region - 区域
 * @returns {string|null} OSS Key，如果URL格式不正确则返回null
 */
export function extractOssKeyFromUrl(url, bucket = 'yc-mat', region = 'cn-beijing') {
  const prefix = `https://${bucket}.oss-${region}.aliyuncs.com/`;
  if (url.startsWith(prefix)) {
    return url.substring(prefix.length);
  }
  return null;
}

/**
 * 生成OSS Key
 * @param {string} businessType - 业务类型
 * @param {string} fileName - 文件名
 * @returns {string} 生成的OSS Key
 */
export function generateOssKey(businessType, fileName) {
  const timestamp = Date.now();
  return `${businessType}/${timestamp}_${fileName}`;
}

/**
 * 检查文件是否为OSS文件
 * @param {Object} file - 文件对象
 * @returns {boolean} 是否为OSS文件
 */
export function isOssFile(file) {
  return file.uploadType === 'oss' || 
         (file.filePath && file.filePath.includes('oss-cn-')) ||
         !!file.ossKey;
}

/**
 * 获取文件的显示URL（用于预览和下载）
 * @param {Object} file - 文件对象
 * @returns {string} 文件访问URL
 */
export function getFileDisplayUrl(file) {
  if (isOssFile(file)) {
    return file.filePath; // OSS文件直接返回拼接好的URL
  } else {
    // MinIO文件需要通过后端接口访问
    const baseUrl = process.env.VUE_APP_BASE_SERVER || '';
    return `${baseUrl}/minio/download?filePath=${encodeURI(file.filePath)}&fileName=${encodeURI(file.fileName)}`;
  }
}

// 默认配置
export const DEFAULT_OSS_CONFIG = {
  bucket: 'yc-mat',
  region: 'cn-beijing',
  endpoint: 'https://oss-cn-beijing.aliyuncs.com'
};

// 导出所有工具函数
export default {
  buildOssFileUrl,
  validateOssUrl,
  extractOssKeyFromUrl,
  generateOssKey,
  isOssFile,
  getFileDisplayUrl,
  DEFAULT_OSS_CONFIG
};
