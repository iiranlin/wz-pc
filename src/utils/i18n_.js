import Vue from 'vue'
import VueI18n from 'vue-i18n'

// import enLocale from 'element-ui/lib/locale/lang/en'
// import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

Vue.use(VueI18n)

const messages = {}

const i18n = new VueI18n({
    silentTranslationWarn: true,
    locale: localStorage.getItem('language') || 'zh_CN',
    missing: () => { return "" },
    messages
})

export default i18n
