import Vue from 'vue'

import Cookies from 'js-cookie'

import Element from 'element-ui'
import BlcdUi from 'blcd-ui'
import './assets/styles/element-variables.scss'
import './assets/styles/global.scss'
import '@/assets/styles/index.scss' // global css
import 'blcd-icons'
import App from './App'
import store from './store'
import router from './router'
import i18n from './utils/i18n_'
import directive from './directive' // directive
import plugins from './plugins' // plugins
import { download } from '@/utils/request'
import Ellipsis from '@/components/common/Ellipsis'
import WDialog from '@/components/common/WDialog'
import Tip from '@/components/common/Tip'

import {loadExtension} from '@/extension/extension-loader'
import './assets/icons' // icon
import './permission' // permission control
import {db, IDB} from '@/utils'
import PrintTemplateDialog from "@/views/print/activitiyTmpl";
import VueAMap from 'vue-amap';
Vue.use(VueAMap);
VueAMap.initAMapApiLoader({
  key: '06541558d151d51375463a6fcb9192c2', // 替换为你的API Key
  plugin: ['AMap.Geolocation'], // 根据需要添加插件
});
Vue.use(PrintTemplateDialog);
Vue.prototype.$db = db.initDb()
import { parseTime, resetForm, addDateRange, selectDictLabel, selectDictLabels, handleTree } from "@/utils/publicMethods";
//列表公共组件
Vue.use(BlcdUi, {IDB})
IDB.clearObjectStore('formData')

// 头部标签组件
import VueMeta from 'vue-meta'
// 字典数据组件
import DictData from '@/components/DictData'
// iconfont图标组件
Vue.component('IconSvg', () => import('@/components/iconComponent'))

// moneyInput金额组件
Vue.component('moneyInput', () => import('@/components/moneyInput'))
Vue.component('Dialog', () => import('@/components/Dialog'))
import * as py from 'pinyin-pro';

Vue.prototype.$py = py

// 全局方法挂载
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree
Vue.prototype.$isNotEmpty = function (obj) {
  return obj !== undefined && obj !== null && obj !== '' && obj !== 'null'
}
Vue.prototype.$deepCopy = function (obj) {
  return JSON.parse(JSON.stringify(obj))
}

loadExtension()

Vue.use(directive)
Vue.use(plugins)
Vue.use(VueMeta)
Vue.use(Ellipsis)
Vue.use(WDialog)
Vue.use(Tip)
DictData.install()

import SearchBar from 'search-bar-vue2'
Vue.use(SearchBar)

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

Vue.config.productionTip = false
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})