
import { getI18nMessage } from '@/api/system/i18n'
import i18n from '../../utils/i18n_'

const user = {
    state: {
        i18nMessages: {},
    },
    mutations: {
        SET_I18N_MESSAGES: (state, messages) => {
            state.i18nMessages = messages
        }
    },
    actions: {
        GetI18nMessages() {
            getI18nMessage().then(({ data }) => {
                for (let key in data) {
                    i18n.mergeLocaleMessage(key, data[key])
                }
            }).catch(err => {
                console.error("获取i18n数据异常：", err)
            })
        },
    }
}

export default user
