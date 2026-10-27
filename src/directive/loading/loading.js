import Vue from 'vue'
import Loading from '../../components/loading/index.vue'

function removeLoading(el) {
    const instance = el.loadingInstance
    if (!instance) return
    if (instance.$el.parentNode) {
        instance.$el.parentNode.removeChild(instance.$el)
    }
    instance.$destroy()
    delete el.loadingInstance
}

function updateLoading(el, binding) {
    if (!binding.value.loading) {
        removeLoading(el)
        return
    }
    if (el.loadingInstance) return
    const LoadingComponent = Vue.extend(Loading)
    const instance = new LoadingComponent({
        propsData: { id: binding.value.lottieId }
    }).$mount()
    el.loadingInstance = instance
    el.appendChild(instance.$el)
}

export default {
    inserted: updateLoading,
    update: updateLoading,
    unbind: removeLoading
}
