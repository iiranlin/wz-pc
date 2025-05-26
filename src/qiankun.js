import {
  registerMicroApps,
  start
} from 'qiankun'
import store from '@/store'
import i18n from './utils/i18n_'
import router from './router'

export const useQiankun = (data, prototype) => {
  const appData = arrayFlat(JSON.parse(JSON.stringify(data)))
  const uniqueArr = uniqueByField(appData, 'serviceCode')
  let apps = []
  uniqueArr.forEach( item => {
    let finalData = appData.filter(val => val.serviceCode === item.serviceCode)
    apps.push(
      {
        name: item.serviceCode, // 必选，微应用的名称，微应用之间必须确保唯一
        entry: item.serviceAddress, // - 必选，微应用的入口
        container: '#appContainer', // -必选，微应用的容器节点的选择器或者 Element 实例
        activeRule: `/${item.serviceCode}`, // - 必选，微
        sanbox: true, //解决css冲突
        props: {
          store,
          appData: finalData,
          host_i18n: i18n,
          parentRouter: router
        } // - 可选，主应用需要传递给微应用的数据。
      }
    )
  })

  registerMicroApps(apps, {
    beforeLoad: [
      app => {
        // console.log(`${app.name}的beforeLoad阶段`)
      }
    ],
    beforeMount: [
      app => {
        // console.log(`${app.name}的beforeMount阶段`)
      }
    ],
    afterMount: [
      app => {
        // console.log(`${app.name}的afterMount阶段`)
      }
    ],
    beforeUnmount: [
      app => {
        // console.log(`${app.name}的beforeUnmount阶段`)
      }
    ],
    afterUnmount: [
      app => {
        // console.log(`${app.name}的afterUnmount阶段`)
      }
    ]
  })

  start({ experimentalStyleIsolation: true, prefetch: false })
}

function arrayFlat(arr, flatKey = 'children') {
  let res = []
  arr.forEach(item => {
    let obj = JSON.parse(JSON.stringify(item))
    if (item[flatKey]) delete obj[flatKey]
    if(item.serviceCode) res.push(obj)
    if (Array.isArray(item[flatKey]) && item[flatKey].length) res.push(...arrayFlat(item[flatKey]))
  })
  return res
}
function uniqueByField(array, field) {
  const seen = new Set()
  return array.filter((item) => {
    const key = item[field]
    return seen.has(key) ? false : seen.add(key)
  })
}