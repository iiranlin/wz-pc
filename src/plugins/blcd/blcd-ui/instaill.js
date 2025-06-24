import Element from 'element-ui'
import Fragment from 'vue-fragment'
// 自定义组件
import buttonTop from './package/buttonTop'
import tableIndex from './package/tableIndex'
import formData from './package/formData'
import Pagination from './package/Pagination'
import RightToolbar from './package/RightToolbar'
import fileView from './package/fileView'

// 自定义指令
import directive from './package/directive'

const components = {
    tableIndex, formData, buttonTop, Pagination, RightToolbar, fileView
}

const install = function (Vue, opt) {
  const {IDB} = opt
  Vue.prototype.$IDB =  IDB
  Vue.use(Fragment.Plugin) 
  Vue.use(directive)
  Vue.use(Element)
    for (const name in components) {
    // 将组件绑定到Vue上
      Vue.component(name, components[name])
    }
  }
  
export default {
    install,
    ...components
}