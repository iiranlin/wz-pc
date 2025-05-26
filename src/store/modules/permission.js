import Vue from 'vue'
import { constantRoutes } from '@/router'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import { getUserMenu } from '@/api/system/menu'
import { useQiankun } from '@/qiankun'

const permission = {
    state: {
        routes: [],
        addRoutes: [],
        defaultRoutes: [],
        topbarRouters: [],
        sidebarRouters: [],
        sidebarRoutersHidden: []
    },
    mutations: {
        SET_ROUTES: (state, routes) => {
            state.addRoutes = routes
            state.routes = constantRoutes.concat(routes)
        },
        SET_DEFAULT_ROUTES: (state, routes) => {
            state.defaultRoutes = constantRoutes.concat(routes)
        },
        SET_TOPBAR_ROUTES: (state, routes) => {
            // 顶部导航菜单默认添加统计报表栏指向首页
            const index = [{
                path: 'index',
                meta: { title: '工作台', icon: 'gongzuotai', menuCode:"dashboard" }
            }]
            state.topbarRouters = index.concat(routes);
        },
        SET_SIDEBAR_ROUTERS: (state, routes) => {
            state.sidebarRouters = routes
        },
        SET_SIDEBAR_ROUTERS_HIDDEN: (state, routes) => {
            state.sidebarRoutersHidden = routes
        },
    },
    actions: {
        // 生成路由
        GenerateRoutes({ commit }) {
            return new Promise(async resolve => {
                // 向后端请求路由数据
                const menuList1 = await getUserMenu();
                useQiankun(menuList1.data, Vue.prototype)
                let menuList = filterAsyncRoutes(menuList1.data, true);
                const sdata = JSON.parse(JSON.stringify(menuList))
                const rdata = JSON.parse(JSON.stringify(menuList))
                const sidebarRoutes = filterAsyncRouter(sdata)
                const rewriteRoutes = filterAsyncRouter(rdata, false, false)
                rewriteRoutes.push({ path: '*', redirect: '/404', hidden: true })
                commit('SET_ROUTES', rewriteRoutes)
                let routesArr = constantRoutes.concat(sidebarRoutes), sidebarRoutersHidden = [];
                commit('SET_SIDEBAR_ROUTERS', routesArr)
                routesArr.forEach(item => {
                    if (!item.hidden) {
                        sidebarRoutersHidden.push(item);
                    }
                });
                commit('SET_SIDEBAR_ROUTERS_HIDDEN', sidebarRoutersHidden)
                commit('SET_DEFAULT_ROUTES', sidebarRoutes)
                commit('SET_TOPBAR_ROUTES', sidebarRoutes)
                resolve(rewriteRoutes)
            })
        }
    }
}


export function filterAsyncRoutes(menuList, flag) {
    let res = [];
    menuList.forEach(item => {
      let pathUrl = ''
      if(item.serviceCode){
        pathUrl = `/${item.serviceCode}/${item.component === 'Layout' || item.component === 'ParentView'?`${item.menuUrl}/`:item.component}`
      }else if(flag){
        pathUrl = `/${item.menuUrl}`
      }else{
        pathUrl = item.menuUrl.split(":")[0]
      }
        let params = {
            alwaysShow: item.children.length != 0 ? true : false,
            name: item.menuUrl,
            path: pathUrl,
            component: item.serviceCode?'Layout':item.component,
            hidden: item.isHide == 1 ? true : false,
            meta: {
                id: item.id,
                menuCode: item.menuCode,
                title: item.menuName,
                icon: item.menuIcon || 'system',
                noCache: item.isCache == 1 ? false : true,
                link: null,
                menuType: item.menuType || '1',
                componentUrl: item.component,
                busCode: item['menuUrl'].split(":")[1] || '',
                hidden: item.isHide == 1 ? true : false,
                menuLevel: item.menuLevel,
                isQiankun: !!item.serviceCode
            }
        }
        if (flag && item.component != 'Layout' && item.component.indexOf('http') === -1 && !item.serviceCode) {
            params = {
                path: '',
                component: 'Layout',
                redirect: item.menuUrl,
                hidden: item.isHide == 1 ? true : false,
                children: [params],
                meta: {
                    id: item.id,
                    menuCode: item.menuCode,
                    title: item.menuName,
                    icon: item.menuIcon || 'system',
                    noCache: item.isCache == 1 ? false : true,
                    link: null,
                    menuType: item.menuType || '1',
                    componentUrl: item.component,
                    busCode: item['menuUrl'].split(":")[1] || '',
                    hidden: item.isHide == 1 ? true : false,
                    menuLevel: item.menuLevel,
                    isQiankun: !!item.serviceCode
                }
            }
        }
        if (item.children && item.children.length) {
            params.redirect = 'noRedirect'
            params.children = filterAsyncRoutes(item.children, false);
        };
        res.push(params);
    });
    return res;
}


// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
    let reg = new RegExp(/^(http|https):\/\/\S*/)
    return asyncRouterMap.filter(route => {
        if (type && route.children) {
            route.children = filterChildren(route.children)
        }
        if (route.component) {
            // Layout ParentView 组件特殊处理
            if (route.component === 'Layout') {
                route.component = Layout
            } else if (route.component === 'ParentView') {
                route.component = ParentView
            } else {
                if (reg.test(route.meta.componentUrl)) {
                    route.component = loadView("iframe")
                } else {
                    route.component = loadView(route.component)
                }
            }
        }
        if (!!route.children && route.children.length) {
            route.children = filterAsyncRouter(route.children, route, type)
        } else {
            delete route['children']
            delete route['redirect']
        }
        return true
    })
}

function filterChildren(childrenMap, lastRouter = false) {
    var children = []
    childrenMap.forEach((el, index) => {
        if (el.children && el.children.length) {
            if (el.component === 'ParentView' && !lastRouter) {
                el.children.forEach(c => {
                    c.path = el.path + '/' + c.path
                    if (c.children && c.children.length) {
                        children = children.concat(filterChildren(c.children, c))
                        return
                    }
                    children.push(c)
                })
                return
            }
        }
        if (lastRouter) {
            el.path = lastRouter.path + '/' + el.path
        }
        children = children.concat(el)
    })
    return children
}

export const loadView = (view) => {
    // return (resolve) => require([`@/views/${view}`], resolve)
    if (process.env.NODE_ENV === 'development') {
      return (resolve) => require([`@/views/${view}`], resolve)
    } else {
      // 使用 import 实现生产环境的路由懒加载
      return () => import(`@/views/${view}`)
    }
}

export default permission