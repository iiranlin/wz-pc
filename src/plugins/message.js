import { Message } from 'element-ui'
import i18n from '@/utils/i18n_'

const msg = (res) => {
    if (res != null && typeof res == 'object') {
        if (res.success) {
            Message.success(i18n.t(`message.${res.code}`) || res.message)
        } else {
            Message.error(i18n.t(`message.${res.code}`) || res.message)
        }
    } else {
        Message.success(res)
    }
}

['success', 'warning', 'info', 'error'].forEach(item => {
    msg[item] = (res, options) => {
        if (res != null && typeof res == 'object') {
            Message({
                type: item,
                message: i18n.t(`message.${res.code}`) || res.message,
                ...options
            })
        } else {
            Message({
                type: item,
                message: res,
                ...options
            })
        }
    }
})

export default msg