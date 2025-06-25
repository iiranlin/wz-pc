import axios from 'axios'
import { Message } from 'element-ui'
import { saveAs } from 'file-saver'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { blobValidate } from "@/utils/publicMethods";
import request from '@/utils/request'

const baseURL = process.env.VUE_APP_BASE_API

export default {
    name(name, isDelete = true) {
        var url = baseURL + "/common/download?fileName=" + encodeURI(name) + "&delete=" + isDelete
        axios({
            method: 'get',
            url: url,
            responseType: 'blob',
            headers: { 'Authorization': getToken() }
        }).then(async (res) => {
            const isLogin = await blobValidate(res.data);
            if (isLogin) {
                const blob = new Blob([res.data])
                this.saveAs(blob, decodeURI(res.headers['download-filename']))
            } else {
                this.printErrMsg(res.data);
            }
        })
    },
    resource(resource) {
        var url = baseURL + "/common/download/resource?resource=" + encodeURI(resource);
        axios({
            method: 'get',
            url: url,
            responseType: 'blob',
            headers: { 'Authorization': getToken() }
        }).then(async (res) => {
            const isLogin = await blobValidate(res.data);
            if (isLogin) {
                const blob = new Blob([res.data])
                this.saveAs(blob, decodeURI(res.headers['download-filename']))
            } else {
                this.printErrMsg(res.data);
            }
        })
    },
    zip(url, name) {
        var url = baseURL + url
        axios({
            method: 'get',
            url: url,
            responseType: 'blob',
            headers: { 'Authorization': getToken() }
        }).then(async (res) => {
            const isLogin = await blobValidate(res.data);
            if (isLogin) {
                const blob = new Blob([res.data], { type: 'application/zip' })
                this.saveAs(blob, name)
            } else {
                this.printErrMsg(res.data);
            }
        })
    },
    saveAs(text, name, opts) {
        saveAs(text, name, opts);
    },
    async printErrMsg(data) {
        const resText = await data.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
        Message.error(errMsg);
    },
    fileUrl(url, type, method = 'post') {
        // url = baseURL + url;
        return new Promise((resolve) => {
            request({
                method: method,
                url: url,
                responseType: 'blob',
                // headers: { 'Authorization': getToken() }
            }).then(async (res) => {
                if (type === 'img') {
                    resolve(res.data)
                    return
                }
                const isLogin = await blobValidate(res.data);
                if (isLogin) {
                    const blob = new Blob([res.data])
                    const header = res.headers['content-disposition'] || res.headers['Content-Disposition']
                    this.saveAs(blob, decodeURI(header.split('filename=')[1]))
                } else {
                    this.printErrMsg(res.data);
                }
            })
        })
    },
    fileSource(url, method = 'get') {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await request({
                    method: method,
                    url: url,
                    responseType: 'blob',
                })
                resolve(res)
            } catch (err) {
                reject(err)
            }
        })
    },
    fileUpload(url, data) {
      return new Promise((resolve,reject) => {
        const formData = new FormData();
        for (const key in data) {
          formData.append(key, data[key])
        }
        request({
          method: 'post',
          url: url,
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        }).then(async (res) => {
          resolve(res)
        }).catch(async (err)=>{
            reject(err)
        })
      })
    },
}

