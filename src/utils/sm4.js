const sm4 = require('sm-crypto').sm4

/**
 * 加密
 * @param {*} data 
 * @param {*} key 长度16位的字符出或字节数组
 * @returns 
 */
export function encrypt(data, key) {
    if (typeof data == "object") {
        data = JSON.stringify(data);
    }
    if (typeof key == 'string') {
        key = new TextEncoder().encode(key)
    }
    return sm4.encrypt(data, key)
}

/**
 * 解密
 * @param {*} data 
 * @param {*} key 
 * @returns 
 */
export function decrypt(data, key) {
    if (typeof key == 'string') {
        key = new TextEncoder().encode(key)
    }
    return sm4.decrypt(data, key)
}

// new TextDecoder('utf-8').decode(new Uint8Array([108, 112, 122, 110, 105, 53, 54, 108, 119, 57, 57, 54, 112, 49, 57, 120]))
// new TextEncoder().encode('lpzni56lw996p19x')