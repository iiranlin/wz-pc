import router from './router'
import store from './store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { setToken, getToken } from '@/utils/auth'
import { loginByTicket, loginByRails } from '@/api/login'
import { menuRecordFunc } from '@/api/system/menu'
import { IDB } from '@/utils'
NProgress.configure({ showSpinner: false })

const whiteList = ['/login']

function loginAuth(snapTicket) {
    return new Promise((resolve) => {
        loginByTicket(snapTicket).then(res => {
            if (res.success) {
                resolve(res.data)
            } else {
                resolve()
            }
        })
    })
}

const loginByRailsAuth = (id_token) => {
    return new Promise((resolve) => {
        loginByRails({ jwtToken: id_token }).then(res => {
            if (res.success) {
                resolve(res.data)
            } else {
                Message.error(res.message)
                resolve()
            }
        })
    })
}

const versionCheck = async () => {
  if (process.env.NODE_ENV == "development") return
  const response = await fetch(`/version.json?t=${Date.now()}`)
  const data = await response.json()
  // eslint-disable-next-line no-undef
  if (process.env.VUE_APP_VERSION !== data.version) {
    await IDB.clearDB()
    window.location.reload()
  }
}

