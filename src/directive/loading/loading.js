import Vue from 'vue'
import Loading from '../../components/loading/index.vue'
/**
 * Vue.extend 接受参数并返回一个构造器，new 该构造器可以返回一个组件实例
 * 当我们 new Mask() 的时候，把该组件实例挂载到一个 div 上
 **/
const loadDirective = {
   
    //所在组件的 VNode 更新时调用
    update(el, binding, vnode) {
        //当值改变
        if (binding.value.loading !== binding.oldValue.loading) {
            if (binding.value.loading) { //v-loading true
                const loadingCo = Vue.extend(Loading)
                const loadingComp = new loadingCo().$mount()
                loadingComp.id = binding.value.lottieId
                // 组件实例 挂到el元素上
                el.loadingInstance = loadingComp
                el.appendChild(loadingComp.$el)
                el.appendChild(el.loadingInstance.$el)
            } else { //v-loading false 删除节点
                // el.loadingInstance.$destroy()
                el.loadingInstance && el.removeChild(el.loadingInstance.$el)
            }

        }
    }
}
export default loadDirective