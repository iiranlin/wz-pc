import axios from 'axios'
import { Notification, MessageBox, Message, Loading } from 'element-ui'
import store from '@/store'
import { getToken, setToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from "@/utils/publicMethods";
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'

let downloadLoadingInstance;
// 是否显示重新登录
let isReloginShow;

const isCloudLoginScene = () => {
    return window.location.pathname === '/cloudLogin' ||
        sessionStorage.getItem('loginType') === 'cloud' ||
        sessionStorage.getItem('cloudLoginFlag')
}

const isCloudLoginPage = () => {
    return window.location.pathname === '/cloudLogin'
}

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
    // axios中请求配置有baseURL选项，表示请求URL公共部分
    baseURL: process.env.VUE_APP_BASE_API,
    // 超时
    timeout: 100000
})

// request拦截器
service.interceptors.request.use(config => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
    if (getToken() && !isToken) {
        config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
        config.headers['myrediskey'] = getToken()
    }
    // 添加 Client-Type 请求头
    config.headers['Client-Type'] = 'PC'
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
        let url = config.url + '?' + tansParams(config.params);
        url = url.slice(0, -1);
        config.params = {};
        config.url = url;
    }
    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
        const requestObj = {
            url: config.url,
            data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
            time: new Date().getTime()
        }
        const sessionObj = cache.session.getJSON('sessionObj')
        if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
            cache.session.setJSON('sessionObj', requestObj)
        } else {
            const s_url = sessionObj.url;                  // 请求地址
            const s_data = sessionObj.data;                // 请求数据
            const s_time = sessionObj.time;                // 请求时间
            const interval = 1000;                         // 间隔时间(ms)，小于此时间视为重复提交
            if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
                const message = '数据正在处理，请勿重复提交';
                console.warn(`[${s_url}]: ` + message)
                return Promise.reject({message: message})
            } else {
                cache.session.setJSON('sessionObj', requestObj)
            }
        }
    }
    return config
}, error => {
    Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    const success = res.data.success;
    // 获取错误信息
    const msg = errorCode[code] || res.data.message || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
        return res
    }

    if (code === 401 || code === -10006) {
        if (isCloudLoginScene()) {
            if (!isCloudLoginPage()) {
                store.dispatch('LogOut')
            }
            return Promise.reject('无效的会话，请重新登录。')
        }
        if (!isReloginShow) {
            isReloginShow = true;
            MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
                confirmButtonText: '重新登录',
                cancelButtonText: '取消',
                type: 'warning'
            }
            ).then(() => {
                isReloginShow = false;
                store.dispatch('LogOut')
            }).catch(() => {
                isReloginShow = false;
            });
        }
        return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    } else if (code === 500) {
        Message({
            message: msg,
            type: 'error'
        })
        return Promise.reject(new Error(msg))
    } else if (code === 10000) {
        cache.session.remove('sessionObj')
        setToken(res.data.data)
        var backoff = new Promise(resolve => {
            resolve();
        });
        return backoff.then(r => {
            return service(res.config);
        });
    } else if (code === 10003) {
        Message({
            message: '服务调用异常',
            type: 'error'
        })
        return Promise.reject(new Error('服务调用异常'))
    } else if (!success && code === 1) {
        if (msg.indexOf('\n') != -1) {
            let returnMsgList = msg.split('\n')
            let list = []
            let array
            for (let index in returnMsgList) {
                if (index != returnMsgList.length - 1) {
                    list.push(returnMsgList[index] + '<br/>')
                    array = list.join('')
                }
            }
            MessageBox.alert(array, '提示', {
                dangerouslyUseHTMLString: true
            })
        } else {
            Message({
                message: msg,
                type: 'error'
            })
        }
        return Promise.reject(msg)
    } else if (code === 10001 || code == 10002) {
        return res.data
    } else if (success === false) {
        // 当返回success为false时为接口异常,报错提示
        Message({ message: msg, type: 'error' })
        return Promise.reject(msg)
    } else {
        return res.data
    }
},
    error => {
        let { message } = error;
        if (message == "Network Error") {
            message = "后端接口连接异常";
        } else if (message.includes("timeout")) {
            message = "系统接口请求超时";
        } else if (message.includes("Request failed with status code")) {
            message = "系统异常，请稍后再试"
        } else if(message.includes("数据正在处理")) {

        }else {
            message = "系统异常，请稍后再试"
        }
        if(!message.includes("数据正在处理")) {
            Message({
                message: message,
                type: 'error',
                duration: 5 * 1000
            })
        }
       
        return Promise.reject(error)
    }
)

// 通用下载方法
export function download(url, params, method = 'post') {
    downloadLoadingInstance = Loading.service({ text: "正在下载数据，请稍候", spinner: "el-icon-loading", background: "rgba(0, 0, 0, 0.7)", })
    return service({method: method, [method == 'post'?'data':'params']: params, url: url, responseType: 'blob'}).then(async (data) => {
        const isLogin = await blobValidate(data.data);
        if (isLogin) {
            const blob = new Blob([data.data])
            const header = data.headers['content-disposition'] || data.headers['Content-Disposition']
            saveAs(blob, decodeURI(header.split('filename=')[1]))
        } else {
            const resText = await data.data.text();
            const rspObj = JSON.parse(resText);
            const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
            Message.error(errMsg);
        }
        downloadLoadingInstance.close();
    }).catch((r) => {
        console.error(r)
        Message.error('下载文件出现错误，请联系管理员！')
        downloadLoadingInstance.close();
    })
}

export default service
