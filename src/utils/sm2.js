const sm2 = require('sm-crypto').sm2

/**
 * 加密
 * @param publicKey 公钥
 * @param {*} data 需加密的数据 Object|String
 * @param cipherMode 模式
 * @returns 
 */
export function encrypt(data, publicKey, cipherMode = 1) {
    if (typeof data == "object") {
        data = JSON.stringify(data);
    }
    return '04' + sm2.doEncrypt(data, publicKey, cipherMode)
}


/**
 * 解密
 * @param privateKey 私钥
 * @param {*} data 需解密的数据
 * @param cipherMode 模式
 * @returns 
 */
export function decrypt(data, privateKey, cipherMode = 1) {
    return sm2.doDecrypt(data, privateKey, cipherMode)
}