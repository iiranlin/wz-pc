import tab from './tab'
import auth from './auth'
import cache from './cache'
import modal from './modal'
import download from './download'
import fmoney from './fmoney'
import msg from './message'
import dialog from './dialog'
import reviewerDialog from './reviewerDialog'
import textMethod from './textMethod'

export default {
  install(Vue) {
    // 页签操作
    Vue.prototype.$tab = tab
    // 认证对象
    Vue.prototype.$auth = auth
    // 缓存对象
    Vue.prototype.$cache = cache
    // 模态框对象
    Vue.prototype.$modal = modal
    // 下载文件
    Vue.prototype.$download = download
    
    Vue.prototype.$fmoney = fmoney
    
    Vue.prototype.$msg = msg
    
    Vue.prototype.$dialog = dialog

    Vue.prototype.$reviewerDialog = reviewerDialog
    //文本数据处理展示
    Vue.prototype.$textMethod = textMethod
  }
}
