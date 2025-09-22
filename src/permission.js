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

router.beforeEach(async (to, from, next) => {
    NProgress.start()
      console.log(to,"111")
    if(to.path=='/login'){
        const loginType = process.env.VUE_APP_LOGIN_TYPE || 'old'
        if (loginType === 'old') {
            document.title = "建设物资管理系统";
            const link = document.querySelector('[rel="icon"]');
            link.href ="./iconLogo.png";
        } else {
            document.title = "物资管理信息化平台";
            const link = document.querySelector('[rel="icon"]');
            link.href ="./Logo.png";
        }
    }
    else if(to.path=="/portal") {
        document.title = "物资管理信息化平台";
        const link = document.querySelector('[rel="icon"]');
        link.href ="./Logo.png";
    }else{
        document.title = "建设物资管理系统";
        const link = document.querySelector('[rel="icon"]');
        link.href ="./iconLogo.png";
    }

    if (to.matched && to.matched.length > 2) {
        to.matched.splice(1, to.matched.length - 2)
    }

    // 如果url参数中包含snapTicket参数时
    const snapTicket = to.query.snapTicket;
    if (snapTicket) {
        const data = await loginAuth(snapTicket);
        if (data) {
            setToken(data.token)
            next(to.path)
            return;
        }
    }

    const id_token = to.query.id_token;
    if (id_token) {
        const data = await loginByRailsAuth(id_token);
        if (data) {
            setToken(data.token)
            next(to.path)
            return;
        }
    }

    const hasToken = getToken()
    if (hasToken) {
        to.meta.title && store.dispatch('settings/setTitle', to.meta.title)
        /* has token*/
        // if (to.path === '/login') {
        //     next({ path: '/' })
        //     NProgress.done()
        // } else {
        const roles = store.getters.roles;   // 是否有菜单权限
        if (roles) {        // 动态路由状态请求状态
            if (!to.meta.hidden) {
                menuRecordFunc({ "funcIcon": to.meta.icon, "funcName": to.meta.title, "funcUrl": to.path })
            }
            next()
            NProgress.done()
        } else {
            store.dispatch('GetI18nMessages')

            await store.dispatch('getSysConfig')
            try {
                store.dispatch('GetInfo').then(() => {
                    store.dispatch('GenerateRoutes').then(accessRoutes => {
                        router.addRoutes(accessRoutes) // 动态添加可访问路由表
                        next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
                    })
                }).catch(err => {
                    // store.dispatch('LogOut').then(() => {
                    //   Message.error(err)
                    //   // next({ path: '/' })
                    // })
                })
            } catch (error) {
                next(`/`)
                NProgress.done()
            }
            next();
        }
        // }
    } else {
        // 没有token
        if (whiteList.indexOf(to.path) !== -1) {
            // 在免登录白名单，直接进入
            next()
        } else {
            if (sessionStorage.getItem('logoutMode') == 1) {
                let returnUrl = sessionStorage.getItem('logoutReturnUrl')
                if (returnUrl) {
                    location.href = returnUrl
                }
            } else {
                // const redirect = location.href
                next(`/login`) // 移除redirect参数，否则全部重定向到登录页
            }
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    NProgress.done()
    // versionCheck()
})
